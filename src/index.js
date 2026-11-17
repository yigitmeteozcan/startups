// REST API over the full multi-source dataset (Techstars, YC, Antler, 500,
// EF, Alchemist, Plug and Play).
//
// Read endpoints are public, CORS-enabled and cheap: they serve data/all.json
// from memory (see src/store.js) instead of scraping on every request.
// Endpoints that change server state require ADMIN_TOKEN (or, when no token is
// configured, a request from localhost).

const crypto = require('crypto');
const path = require('path');
const express = require('express');
const { DataStore } = require('./store');
const { buildWorkbook } = require('./excel');
const { toCsv } = require('./dataset');
const q = require('./query');

const ROOT = path.resolve(__dirname, '..');
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

function sameSecret(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// Default rebuild: the same safe multi-source build as `npm run fetch:data`.
async function defaultRebuild() {
  const { gatherAll } = require('./sources');
  const { writeDataset, writeXlsx } = require('./dataset');
  const { companies, statuses } = await gatherAll();
  if (companies.length === 0) throw new Error('No companies fetched — dataset left unchanged.');
  const stats = writeDataset(companies, { rootDir: ROOT, sourceStatus: statuses });
  await writeXlsx(companies, path.join(ROOT, 'data', 'all.xlsx'));
  return { total: stats.total, sources: statuses };
}

function createApp({
  store = new DataStore(),
  adminToken = process.env.ADMIN_TOKEN || '',
  rebuild = defaultRebuild,
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('query parser', 'simple'); // flat key=value params only

  const rebuildState = { running: false, startedAt: null, finishedAt: null, result: null, error: null };
  let xlsxBusy = 0;

  // ── Security headers + CORS (read-only endpoints only) ──────────────────────
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

  function requireAdmin(req, res, next) {
    if (adminToken) {
      const header = String(req.get('authorization') || '');
      const token = header.startsWith('Bearer ') ? header.slice(7) : '';
      if (token && sameSecret(token, adminToken)) return next();
      return res.status(401).json({ status: 'unauthorized', message: 'Send Authorization: Bearer <ADMIN_TOKEN>.' });
    }
    // Without a token, only direct local requests are allowed. A request that
    // came through a reverse proxy carries forwarding headers and is refused,
    // because behind a same-host proxy every client would look like localhost.
    const proxied = req.get('x-forwarded-for') || req.get('forwarded') || req.get('x-real-ip');
    if (!proxied && LOOPBACK.has(req.socket.remoteAddress)) return next();
    return res.status(403).json({
      status: 'forbidden',
      message: 'Admin endpoints are localhost-only unless ADMIN_TOKEN is set.',
    });
  }

  async function load(req) {
    const refresh = q.str(req.query.refresh) === 'true';
    return store.get({ refresh });
  }

  function select(data, query) {
    const filters = q.parseFilters(query);
    const filtered = q.filterCompanies(data.companies, filters, data.haystacks);
    return { filters, companies: q.sortCompanies(filtered, filters.sort) };
  }

  function appliedFilters(filters) {
    const out = {};
    for (const [k, v] of Object.entries(filters)) {
      if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
      out[k] = v;
    }
    return out;
  }

  // ── Read endpoints ──────────────────────────────────────────────────────────
  app.get('/', (req, res) => {
    res.json({
      name: 'Startup Portfolios API',
      endpoints: {
        'GET /portfolio': 'companies (paginated, filterable)',
        'GET /portfolio.csv': 'filtered companies as CSV',
        'GET /portfolio.xlsx': 'filtered companies as Excel',
        'GET /portfolio/:idOrName': 'one company by id or name',
        'GET /facets': 'every filter value with counts',
        'GET /stats': 'aggregate stats',
        'GET /meta': 'endpoint catalog (static files)',
        'GET /sources': 'per-source counts and freshness',
        'GET /health': 'health check',
        'DELETE /cache': 'admin: drop the in-memory copy',
        'POST /admin/rebuild': 'admin: fetch every source live and rewrite data/',
      },
      filters: [
        'search', 'source', 'industry', 'tag', 'country', 'region', 'location', 'program', 'year',
        'yearFrom', 'yearTo', 'unicorn', 'exit', 'bcorp', 'current', 'hasFounders', 'sort',
        'page', 'limit',
      ],
    });
  });

  app.get('/portfolio', wrap(async (req, res) => {
    const { data, cached } = await load(req);
    const { filters, companies } = select(data, req.query);
    const { pagination, items } = q.paginate(companies, req.query);
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({
      status: 'ok',
      source: 'dataset',
      cached,
      cacheExpiresAt: store.info().expiresAt,
      dataGeneratedAt: data.generatedAt,
      pagination,
      filters: appliedFilters(filters),
      companies: items,
    });
  }));

  app.get('/portfolio.csv', wrap(async (req, res) => {
    const { data } = await load(req);
    const { companies } = select(data, req.query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="startup-portfolios.csv"');
    res.send(toCsv(companies));
  }));

  app.get('/portfolio.xlsx', wrap(async (req, res) => {
    // Building a workbook is CPU-heavy; allow two at a time.
    if (xlsxBusy >= 2) {
      res.setHeader('Retry-After', '10');
      return res.status(429).json({ status: 'busy', message: 'Excel export in progress, retry shortly.' });
    }
    xlsxBusy++;
    try {
      const { data } = await load(req);
      const { companies } = select(data, req.query);
      const workbook = buildWorkbook(companies);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="startup-portfolios.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
    } finally {
      xlsxBusy--;
    }
  }));

  app.get('/portfolio/:name', wrap(async (req, res) => {
    const { data } = await load(req);
    const source = q.str(req.query.source).toLowerCase() || undefined;
    const { company, matches } = q.findCompany(data.companies, req.params.name, { source });
    if (!company) return res.status(404).json({ status: 'not_found', name: q.str(req.params.name) });
    res.json({
      status: 'ok',
      company,
      otherMatches: matches.slice(1, 11).map((c) => ({ id: c.id, name: c.name, source: c.source })),
    });
  }));

  app.get('/facets', wrap(async (req, res) => {
    const { data } = await load(req);
    res.json({ status: 'ok', facets: data.facets });
  }));

  app.get('/stats', wrap(async (req, res) => {
    const { data } = await load(req);
    res.json({ status: 'ok', stats: data.stats });
  }));

  app.get('/meta', wrap(async (req, res) => {
    const { data } = await load(req);
    res.json({ status: 'ok', meta: data.meta });
  }));

  app.get('/sources', wrap(async (req, res) => {
    const { data } = await load(req);
    res.json({ status: 'ok', sources: (data.meta && data.meta.sources) || [] });
  }));

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      data: store.info(),
      rebuild: { ...rebuildState, result: undefined },
    });
  });

  // ── Admin endpoints ─────────────────────────────────────────────────────────
  app.delete('/cache', requireAdmin, (req, res) => {
    store.invalidate();
    res.json({ status: 'ok', message: 'Cache cleared; data reloads on the next request.' });
  });

  app.post('/admin/rebuild', requireAdmin, (req, res) => {
    if (store.mode !== 'file') {
      return res.status(409).json({ status: 'error', message: 'Rebuild only works with local data (DATA_URL is set).' });
    }
    if (rebuildState.running) {
      return res.status(409).json({ status: 'in_progress', startedAt: rebuildState.startedAt });
    }
    Object.assign(rebuildState, { running: true, startedAt: new Date().toISOString(), error: null });
    Promise.resolve()
      .then(rebuild)
      .then((result) => {
        rebuildState.result = result;
        store.invalidate();
      })
      .catch((err) => {
        rebuildState.error = String((err && err.message) || err);
        console.error('[rebuild] failed:', err);
      })
      .finally(() => {
        rebuildState.running = false;
        rebuildState.finishedAt = new Date().toISOString();
      });
    res.status(202).json({ status: 'started', startedAt: rebuildState.startedAt });
  });

  app.get('/admin/rebuild', requireAdmin, (req, res) => {
    res.json({ status: 'ok', rebuild: rebuildState });
  });

  // ── Fallbacks ───────────────────────────────────────────────────────────────
  app.use((req, res) => res.status(404).json({ status: 'not_found', path: req.path }));

  // Never leak internals (paths, upstream errors) to clients.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(`[${req.method} ${req.path}]`, err);
    if (res.headersSent) return res.end();
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  });

  return app;
}

if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || undefined; // all interfaces, as before
  const store = new DataStore();
  const app = createApp({ store });
  store
    .get()
    .catch((err) => console.error('Initial data load failed:', err.message))
    .finally(() => {
      app.listen(PORT, HOST, () => {
        const info = store.info();
        console.log(`Startup Portfolios API on http://${HOST || 'localhost'}:${PORT} — ${info.companies} companies (${info.mode})`);
        console.log('  GET /portfolio · /portfolio.csv · /portfolio.xlsx · /portfolio/:idOrName');
        console.log('  GET /facets · /stats · /meta · /sources · /health');
        console.log(`  Admin (DELETE /cache, POST /admin/rebuild): ${process.env.ADMIN_TOKEN ? 'token required' : 'localhost only'}`);
      });
    });
}

module.exports = { createApp };
