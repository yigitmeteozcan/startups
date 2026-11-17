// Multi-source registry. Each source returns companies in the shared shape
// (see src/normalize.js) tagged with a `source` field. `gatherAll` fetches the
// requested sources, isolates failures per-source (one source being
// unreachable never kills the whole build), and returns the merged list.
//
// Safety rails (so a broken scrape can never silently wipe a source again):
//   1. Junk filter   — records without a name + at least one real attribute are
//                      dropped (isPlausibleCompany).
//   2. Shrink guard  — if a source suddenly returns far fewer companies than
//                      are already committed (default: < 80%), the live result
//                      is treated as a broken scrape and the committed records
//                      are kept instead. Tune with SOURCE_MIN_RATIO.
//   3. Fallback      — any failing source (Techstars included) keeps its
//                      previously committed records.
// Every source reports a status ("live" | "cached" | "failed") with a reason,
// which the build prints, writes to meta.json, and uses to alert.

const fs = require('fs');
const path = require('path');
const { fetchAllCompanies } = require('../typesense');
const { fetchYc } = require('./yc');
const { fetchAntler } = require('./antler');
const { fetch500 } = require('./fivehundred');
const { fetchEf } = require('./ef');
const { fetchAlchemist } = require('./alchemist');
const { fetchPlugAndPlay } = require('./plugandplay');
const { isPlausibleCompany } = require('../normalize');
const { withTimeout } = require('../http');

const DEFAULT_COMMITTED_FILE = path.resolve(__dirname, '../../data/all.json');
const MIN_RATIO = Number(process.env.SOURCE_MIN_RATIO || 0.8);
const SOURCE_TIMEOUT_MS = Number(process.env.SOURCE_TIMEOUT_MS) || 8 * 60 * 1000;

// Techstars: query its Typesense index directly when TYPESENSE_API_KEY is set.
// Without a key, load the portfolio page in a headless browser, which captures
// the public search key and replays the same query. (Set TECHSTARS_BROWSER=0 to
// skip the browser.) If both fail, gatherAll keeps the committed records.
async function fetchTechstars() {
  if (process.env.TYPESENSE_API_KEY) {
    return fetchAllCompanies();
  }
  if (process.env.TECHSTARS_BROWSER === '0') {
    throw new Error('TYPESENSE_API_KEY is not set (and TECHSTARS_BROWSER=0)');
  }
  // Lazily required: only this path needs Playwright.
  const { scrapePortfolio } = require('../scraper');
  const data = await scrapePortfolio();
  return data.companies;
}

const SOURCES = {
  techstars: fetchTechstars,
  yc: fetchYc,
  antler: fetchAntler,
  500: fetch500,
  ef: fetchEf,
  alchemist: fetchAlchemist,
  plugandplay: fetchPlugAndPlay,
};

const DEFAULT_SOURCES = ['techstars', 'yc', 'antler', '500', 'ef', 'alchemist', 'plugandplay'];

function readCommitted(file) {
  try {
    if (!fs.existsSync(file)) return [];
    const arr = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    return [];
  }
}

// Previously committed records for one source (junk filtered out).
function committedFor(name, committed = readCommitted(DEFAULT_COMMITTED_FILE)) {
  return committed.filter((c) => c.source === name && isPlausibleCompany(c));
}

// Decide whether a live result can replace the committed records.
function vetLiveResult(name, fetched, prior, { minRatio = MIN_RATIO } = {}) {
  const tagged = (Array.isArray(fetched) ? fetched : []).map((c) => ({ ...c, source: name }));
  const valid = tagged.filter(isPlausibleCompany);
  const junk = tagged.length - valid.length;
  if (valid.length === 0) {
    return {
      ok: false,
      reason: `returned no usable companies${junk ? ` (${junk} junk records rejected)` : ''}`,
    };
  }
  if (prior.length >= 20 && valid.length < prior.length * minRatio) {
    return {
      ok: false,
      reason:
        `returned only ${valid.length} companies vs ${prior.length} committed ` +
        `(below ${Math.round(minRatio * 100)}%) — looks like a broken scrape`,
    };
  }
  return { ok: true, companies: valid, junk };
}

async function gatherAll({
  sources = DEFAULT_SOURCES,
  onLog = console.log,
  offline = false,
  // Sources to fetch live; every other requested source keeps its committed
  // records. null = fetch all of them live.
  live = null,
  committedFile = DEFAULT_COMMITTED_FILE,
  fetchers = SOURCES,
  minRatio = MIN_RATIO,
  sourceTimeoutMs = SOURCE_TIMEOUT_MS,
} = {}) {
  const committed = readCommitted(committedFile);
  const all = [];
  const summary = {};
  const statuses = {};

  for (const name of sources) {
    const fetcher = fetchers[name];
    if (!fetcher) {
      onLog(`  ⚠️  Unknown source "${name}" — skipping.`);
      continue;
    }
    const prior = committedFor(name, committed);
    let companies = null;
    let status;

    if (offline || (live && !live.includes(name))) {
      companies = prior;
      status = {
        status: 'cached',
        reason: offline ? 'offline rebuild from committed data' : 'not fetched in this run',
      };
    } else {
      try {
        onLog(`  → Fetching ${name}...`);
        const fetched = await withTimeout(Promise.resolve().then(fetcher), sourceTimeoutMs, name);
        const vet = vetLiveResult(name, fetched, prior, { minRatio });
        if (!vet.ok) throw new Error(vet.reason);
        companies = vet.companies;
        status = { status: 'live', reason: vet.junk ? `${vet.junk} junk records rejected` : '' };
      } catch (err) {
        // First line only: e.g. Playwright errors append a multi-line banner.
        const reason = String((err && err.message) || err).split('\n')[0].trim().slice(0, 300);
        if (prior.length > 0) {
          companies = prior;
          status = { status: 'cached', reason };
        } else {
          companies = [];
          status = { status: 'failed', reason };
        }
      }
    }

    summary[name] = companies.length;
    statuses[name] = { ...status, count: companies.length, previous: prior.length };
    all.push(...companies);

    if (status.status === 'live') {
      onLog(`    ✓ ${name}: ${companies.length} companies (live)${status.reason ? ` — ${status.reason}` : ''}`);
    } else if (status.status === 'cached') {
      onLog(`    ⚠️  ${name}: kept ${companies.length} committed companies — ${status.reason}`);
    } else {
      onLog(`    ✗ ${name}: failed and nothing committed to fall back to — ${status.reason}`);
    }
  }
  return { companies: all, summary, statuses };
}

module.exports = {
  gatherAll,
  fetchTechstars,
  committedFor,
  vetLiveResult,
  readCommitted,
  SOURCES,
  DEFAULT_SOURCES,
};
