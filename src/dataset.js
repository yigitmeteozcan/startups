const fs = require('fs');
const path = require('path');
const { buildWorkbook } = require('./excel');
const { renderReadme } = require('./readme');
const { finalizeCompanies, slugify } = require('./finalize');

// jsDelivr refuses to serve files larger than 20 MB, so all.json is written
// compactly (no indentation — identical JSON content) and every file is checked
// against this limit after writing.
const CDN_FILE_LIMIT = 20 * 1024 * 1024;
const SIZE_WARN_AT = 19 * 1024 * 1024;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data, { compact = false } = {}) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, compact ? JSON.stringify(data) : JSON.stringify(data, null, 2));
}

function readJsonIfExists(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return null;
  }
}

// Spreadsheet apps execute cells that start with = + - @ (and tab / CR) as
// formulas ("CSV injection"). The data comes from third-party sites, so such
// cells are prefixed with an apostrophe, the standard neutralizer. A lone "-"
// placeholder is left alone. JSON output is never modified.
function csvSafe(v) {
  const s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-+$/.test(s.trim())) return `'${s}`;
  return s;
}

function csvCell(v) {
  const s = csvSafe(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// RFC-4180 CSV. The first 22 columns are unchanged from earlier versions (only
// `country` is now normalized); new columns are appended at the end so
// positional readers keep working.
const CSV_COLUMNS = [
  ['source', (c) => c.source || ''],
  ['name', (c) => c.name],
  ['description', (c) => c.description],
  ['website', (c) => c.website],
  ['city', (c) => c.extra?.city || ''],
  ['state', (c) => c.extra?.state_province || ''],
  ['country', (c) => c.country || c.extra?.country || ''],
  ['region', (c) => c.region],
  ['subregion', (c) => c.subregion],
  ['tags', (c) => (c.tags || []).join('; ')],
  ['year', (c) => c.year],
  ['program', (c) => c.program],
  ['founders', (c) => (c.founders || []).map((f) => f.name).filter(Boolean).join('; ')],
  ['isExit', (c) => c.isExit],
  ['isUnicorn', (c) => c.isUnicorn],
  ['isBCorp', (c) => c.isBCorp],
  ['isCurrentSession', (c) => c.isCurrentSession],
  ['linkedin', (c) => c.social?.linkedin || ''],
  ['twitter', (c) => c.social?.twitter || ''],
  ['facebook', (c) => c.social?.facebook || ''],
  ['crunchbase', (c) => c.social?.crunchbase || ''],
  ['logo', (c) => c.logo],
  // --- appended columns ---
  ['id', (c) => c.id || ''],
  ['location', (c) => c.location || ''],
  // Aligned with `founders`: the n-th entry belongs to the n-th founder.
  ['founder_roles', (c) => (c.founders || []).filter((f) => f.name).map((f) => f.role || '').join('; ')],
  ['founder_linkedins', (c) => (c.founders || []).filter((f) => f.name).map((f) => f.linkedin || '').join('; ')],
  ['investor', (c) => c.extra?.investor || ''],
  ['also_in', (c) => (c.alsoIn || []).join('; ')],
  ['listed', (c) => c.listed !== false],
  ['delisted_at', (c) => (c.listed === false ? c.delistedAt || '' : '')],
  ['former_names', (c) => (c.formerNames || []).join('; ')],
  // Aligned with `founders`, like founder_roles / founder_linkedins.
  ['founder_twitters', (c) => (c.founders || []).filter((f) => f.name).map((f) => f.twitter || '').join('; ')],
  ['founder_githubs', (c) => (c.founders || []).filter((f) => f.name).map((f) => f.github || '').join('; ')],
  ['founder_websites', (c) => (c.founders || []).filter((f) => f.name).map((f) => f.website || '').join('; ')],
  ['source_url', (c) => c.sourceUrl || ''],
];

function toCsv(companies) {
  const lines = [CSV_COLUMNS.map((c) => c[0]).join(',')];
  for (const c of companies) lines.push(CSV_COLUMNS.map(([, f]) => csvCell(f(c))).join(','));
  return lines.join('\n');
}

function countBy(companies, keyFn) {
  const map = new Map();
  for (const c of companies) {
    for (const k of [].concat(keyFn(c)).filter((x) => x !== '' && x != null)) {
      map.set(k, (map.get(k) || 0) + 1);
    }
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function computeStats(companies) {
  return {
    generatedAt: new Date().toISOString(),
    total: companies.length,
    bySource: Object.fromEntries(countBy(companies, (c) => c.source)),
    unicorns: companies.filter((c) => c.isUnicorn).length,
    exits: companies.filter((c) => c.isExit).length,
    bCorps: companies.filter((c) => c.isBCorp).length,
    currentSession: companies.filter((c) => c.isCurrentSession).length,
    delisted: companies.filter((c) => c.listed === false).length,
    founders: companies.reduce((n, c) => n + (c.founders || []).length, 0),
    byYear: Object.fromEntries(countBy(companies, (c) => c.year).sort((a, b) => a[0] - b[0])),
    topCountries: countBy(companies, (c) => c.country || c.extra?.country).slice(0, 15),
    topCities: countBy(companies, (c) => c.extra?.city).slice(0, 15),
    byRegion: countBy(companies, (c) => c.region),
    topPrograms: countBy(companies, (c) => c.program).slice(0, 15),
    topIndustries: countBy(companies, (c) => c.tags).slice(0, 20),
  };
}

function bar(n, max, width = 28) {
  const filled = max > 0 ? Math.round((n / max) * width) : 0;
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function renderStatsMarkdown(stats) {
  const yearEntries = Object.entries(stats.byYear);
  const maxYear = Math.max(...yearEntries.map(([, n]) => n), 1);
  const yearChart = yearEntries
    .map(([y, n]) => `${y}  ${bar(n, maxYear)} ${n}`)
    .join('\n');

  const list = (rows) =>
    rows.map(([k, n], i) => `${i + 1}. **${k}** — ${n}`).join('\n');

  const sourceRows = Object.entries(stats.bySource || {}).sort((a, b) => b[1] - a[1]);
  const sourceTable = sourceRows.length
    ? '\n\n## By source\n\n| Source | Companies |\n|---|---|\n' +
      sourceRows.map(([k, n]) => `| ${k} | ${n.toLocaleString()} |`).join('\n')
    : '';

  return `# Startup Portfolios — by the numbers

_Auto-generated from the dataset on ${stats.generatedAt.slice(0, 10)}._

| Metric | Count |
|---|---|
| Total companies | **${stats.total.toLocaleString()}** |
| 🦄 Unicorns ($1B+) | **${stats.unicorns}** |
| 💰 Exits | **${stats.exits}** |
| 🌱 B Corps | **${stats.bCorps}** |
| 👤 Founder profiles | **${(stats.founders || 0).toLocaleString()}** |
| Current session | **${stats.currentSession}** |${sourceTable}

## Companies by first session year

\`\`\`
${yearChart}
\`\`\`

## Top countries
${list(stats.topCountries)}

## Top cities
${list(stats.topCities)}

## Top programs
${list(stats.topPrograms)}

## Top industries
${list(stats.topIndustries)}

## By region
${list(stats.byRegion)}
`;
}

const CDN_BASE =
  process.env.CDN_BASE ||
  'https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data';
// raw.githubusercontent.com has no per-file size limit (and also sends CORS
// headers), so files too big for jsDelivr are served from here instead.
const RAW_BASE =
  process.env.RAW_BASE ||
  'https://raw.githubusercontent.com/yigitmeteozcan/startups/main/data';
// Files above this size are routed to RAW_BASE in meta.json / README.
const CDN_SAFE_BYTES = 19.5 * 1024 * 1024;

// Per-source freshness for meta.json. `lastLiveFetch` is the last time the
// source was fetched live; it carries over from the previous meta.json while a
// source is being served from committed data.
function buildSourceStatus(bySource, sourceStatus, prevMeta, generatedAt) {
  const prev = new Map(((prevMeta && prevMeta.sources) || []).map((s) => [s.name, s]));
  const out = {};
  for (const name of Object.keys(bySource)) {
    const st = (sourceStatus && sourceStatus[name]) || null;
    const p = prev.get(name) || {};
    const live = st && st.status === 'live';
    out[name] = {
      status: st ? st.status : p.status || 'cached',
      lastLiveFetch: live ? generatedAt : (st && st.lastLiveFetch) || p.lastLiveFetch || null,
      note: st ? st.reason || '' : p.note || '',
    };
  }
  return out;
}

// Write the full sliced dataset to disk.
//   sourceStatus: per-source { status, reason } from gatherAll (optional)
//   prune:        delete slice files no longer referenced by an index
//                 (off by default — nothing is ever deleted unless asked;
//                 enable with PRUNE_STALE_SLICES=1)
function writeDataset(
  companies,
  { outDir = 'data', rootDir = '.', sourceStatus = null, prune = process.env.PRUNE_STALE_SLICES === '1' } = {}
) {
  const base = path.resolve(rootDir, outDir);
  ensureDir(base);
  const prevMeta = readJsonIfExists(path.join(base, 'meta.json'));

  // Repair + enrich every record (see src/finalize.js). Never drops a record.
  companies = finalizeCompanies(companies);

  // Full dataset (JSON + CSV; XLSX is written separately).
  writeJson(path.join(base, 'all.json'), companies, { compact: true });
  fs.writeFileSync(path.join(base, 'all.csv'), toCsv(companies));

  // Boolean slices.
  const unicorns = companies.filter((c) => c.isUnicorn);
  const exits = companies.filter((c) => c.isExit);
  const bCorps = companies.filter((c) => c.isBCorp);
  const current = companies.filter((c) => c.isCurrentSession);
  writeJson(path.join(base, 'unicorns.json'), unicorns);
  writeJson(path.join(base, 'exits.json'), exits);
  writeJson(path.join(base, 'b-corps.json'), bCorps);
  writeJson(path.join(base, 'current.json'), current);

  // Grouped slices. Keys that slugify to the same file name are merged into one
  // slice (previously they silently overwrote each other on disk).
  const groupIndexes = {};
  const pruned = [];
  const groupWrite = (subdir, keyFn) => {
    const groups = new Map(); // slug -> { names: Map(name -> count), list, members }
    for (const c of companies) {
      for (const k of [].concat(keyFn(c)).filter((x) => x !== '' && x != null)) {
        const slug = slugify(k);
        if (!groups.has(slug)) groups.set(slug, { names: new Map(), list: [], members: new Set() });
        const g = groups.get(slug);
        g.names.set(k, (g.names.get(k) || 0) + 1);
        if (!g.members.has(c)) {
          g.members.add(c);
          g.list.push(c);
        }
      }
    }
    const index = {};
    for (const [slug, g] of groups) {
      const name = [...g.names.entries()].sort((a, b) => b[1] - a[1])[0][0];
      writeJson(path.join(base, subdir, `${slug}.json`), g.list);
      index[name] = { slug, count: g.list.length, file: `${subdir}/${slug}.json` };
    }
    writeJson(path.join(base, subdir, 'index.json'), index);
    groupIndexes[subdir] = index;

    if (prune) {
      const live = new Set(Object.values(index).map((v) => `${v.slug}.json`).concat('index.json'));
      for (const f of fs.readdirSync(path.join(base, subdir))) {
        if (f.endsWith('.json') && !live.has(f)) {
          fs.unlinkSync(path.join(base, subdir, f));
          pruned.push(`${subdir}/${f}`);
        }
      }
    }
  };

  groupWrite('by-source', (c) => c.source);
  groupWrite('by-year', (c) => c.year);
  groupWrite('by-program', (c) => c.program);
  groupWrite('by-region', (c) => c.region);
  groupWrite('by-country', (c) => c.country);
  groupWrite('by-industry', (c) => c.tags);

  // Stats (JSON + Markdown).
  const stats = computeStats(companies);
  writeJson(path.join(base, 'stats.json'), stats);
  fs.writeFileSync(path.resolve(rootDir, 'STATS.md'), renderStatsMarkdown(stats));

  // Meta — the catalog of every endpoint (like yc-oss/api meta.json).
  const counts = {
    all: companies.length,
    unicorns: unicorns.length,
    exits: exits.length,
    bCorps: bCorps.length,
    current: current.length,
  };
  const status = buildSourceStatus(stats.bySource, sourceStatus, prevMeta, stats.generatedAt);
  const meta = buildMeta({
    counts,
    groupIndexes,
    generatedAt: stats.generatedAt,
    bySource: stats.bySource,
    status,
    dataDir: base,
  });
  writeJson(path.join(base, 'meta.json'), meta);

  // Keep README counts/tables in sync with the data.
  fs.writeFileSync(path.resolve(rootDir, 'README.md'), renderReadme(meta, stats));

  // Size guard for the CDN.
  const warnings = [];
  for (const f of ['all.json', 'all.csv', 'all.xlsx', 'exits.json']) {
    const p = path.join(base, f);
    if (!fs.existsSync(p)) continue;
    const size = fs.statSync(p).size;
    if (size > SIZE_WARN_AT) {
      warnings.push(
        `${f} is ${(size / 1048576).toFixed(1)} MB — jsDelivr will not serve files over ` +
          `${CDN_FILE_LIMIT / 1048576} MB (raw.githubusercontent.com still works).`
      );
    }
  }

  return { ...stats, warnings, pruned, sources: meta.sources };
}

// Build the endpoint catalog. Every entry carries a ready-to-use CDN URL.
const SOURCE_SITES = {
  techstars: 'https://www.techstars.com/portfolio',
  yc: 'https://www.ycombinator.com/companies',
  antler: 'https://www.antler.co/portfolio',
  500: 'https://500.co/portfolio',
  ef: 'https://www.joinef.com/portfolio/',
  alchemist: 'https://www.alchemistaccelerator.com/portfolio',
  plugandplay: 'https://www.plugandplaytechcenter.com/innovation-services/startups/our-startups',
};

const SOURCE_LABELS = {
  techstars: 'Techstars',
  yc: 'Y Combinator',
  antler: 'Antler',
  500: '500 Global',
  ef: 'Entrepreneur First',
  alchemist: 'Alchemist',
  plugandplay: 'Plug and Play',
};

function buildMeta({ counts, groupIndexes, generatedAt, bySource = {}, status = {}, dataDir = null }) {
  // jsDelivr refuses files over 20 MB; route those to raw GitHub instead.
  const tooBigForCdn = (p) => {
    if (!dataDir) return false;
    try {
      return fs.statSync(path.join(dataDir, p)).size > CDN_SAFE_BYTES;
    } catch (_) {
      return false;
    }
  };
  const url = (p) => `${tooBigForCdn(p) ? RAW_BASE : CDN_BASE}/${p}`;
  const collection = (subdir) =>
    Object.entries(groupIndexes[subdir] || {})
      .map(([name, info]) => ({
        name,
        slug: info.slug,
        count: info.count,
        api: url(info.file),
      }))
      .sort((a, b) => b.count - a.count);

  return {
    generatedAt,
    sources: Object.keys(bySource).map((name) => ({
      name,
      label: SOURCE_LABELS[name] || name,
      site: SOURCE_SITES[name] || '',
      count: bySource[name],
      ...(status[name] || {}),
    })),
    cdn: CDN_BASE,
    raw: RAW_BASE,
    total: counts.all,
    endpoints: {
      all: { count: counts.all, api: url('all.json'), csv: url('all.csv'), xlsx: url('all.xlsx') },
      unicorns: { count: counts.unicorns, api: url('unicorns.json') },
      exits: { count: counts.exits, api: url('exits.json') },
      bCorps: { count: counts.bCorps, api: url('b-corps.json') },
      current: { count: counts.current, api: url('current.json') },
      stats: { api: url('stats.json') },
    },
    collections: {
      'by-source': collection('by-source'),
      'by-year': collection('by-year'),
      'by-program': collection('by-program'),
      'by-region': collection('by-region'),
      'by-country': collection('by-country'),
      'by-industry': collection('by-industry'),
    },
  };
}

// XLSX is written separately (async). finalizeCompanies is idempotent, so it is
// safe to pass either raw or already-finalized companies here.
async function writeXlsx(companies, file) {
  ensureDir(path.dirname(file));
  await buildWorkbook(finalizeCompanies(companies)).xlsx.writeFile(file);
}

module.exports = {
  writeDataset,
  writeXlsx,
  computeStats,
  renderStatsMarkdown,
  toCsv,
  csvSafe,
  buildMeta,
  SOURCE_LABELS,
  CDN_FILE_LIMIT,
};
