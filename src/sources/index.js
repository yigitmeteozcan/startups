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
const { isPlausibleCompany, collapseSpaces } = require('../normalize');
const { withTimeout } = require('../http');
const { domainOf } = require('../data/unicorns');
const { SHARED_HOSTS } = require('../finalize');

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

// Nothing is ever deleted: a company that was in the dataset but is missing
// from today's live fetch (the source took it off its portfolio page, or
// renamed it) is kept, flagged `listed: false` with the date it was first
// missed. A record counts as still present when a live record has the same
// name or the same (non-shared) website domain. If it reappears, the live
// record replaces it and it is listed again.
// Pair live records with committed ones, one-to-one, in priority order:
//   1. same name and same website (or both without a website)
//   2. same website, different name   -> a rename
//   3. same name, different website   -> a website change
// One-to-one matters: sources list some companies twice (Plug and Play has
// two "folio" entries), and duplicates must not borrow each other's data.
function matchPrior(prior, live) {
  const norm = (s) => collapseSpaces(s).toLowerCase();
  const dom = (c) => {
    const d = domainOf(c.website);
    return d && !SHARED_HOSTS.has(d) ? d : '';
  };
  const used = new Set();
  const pairs = new Array(live.length).fill(null);
  const index = (keyFn) => {
    const m = new Map();
    prior.forEach((p, i) => {
      const k = keyFn(p);
      if (!k) return;
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(i);
    });
    return m;
  };
  const tiers = [
    [index((p) => `${norm(p.name)}|${dom(p)}`), (c) => `${norm(c.name)}|${dom(c)}`],
    [index((p) => dom(p)), (c) => dom(c)],
    [index((p) => norm(p.name)), (c) => norm(c.name)],
  ];
  for (const [map, keyOf] of tiers) {
    live.forEach((c, li) => {
      if (pairs[li]) return;
      const k = keyOf(c);
      if (!k) return;
      const i = (map.get(k) || []).find((j) => !used.has(j));
      if (i === undefined) return;
      used.add(i);
      pairs[li] = prior[i];
    });
  }
  return { pairs, unmatched: prior.filter((_, i) => !used.has(i)) };
}

// Records in `prior` with no counterpart in `live`.
function missingFrom(prior, live) {
  return matchPrior(prior, live).unmatched;
}

// Merge each live record with its committed counterpart (matched by website
// first, then by name) so no known information is lost:
//  - name history: a rename ("TawkitAI" -> "CopilotKit") adds the old name to
//    `formerNames`; existing former names are carried forward.
//  - blanked fields: if the source now returns an empty value for something we
//    already knew (Techstars blanked 127 websites in one day), the known value
//    is kept. Non-empty live values always win, so real updates still apply.
//  - tags: earlier categories are kept alongside the source's new ones.
//  - founders: people missing from the live record are kept.
//  - exit / unicorn flags, once set, stay set.
const BACKFILL_FIELDS = ['description', 'website', 'logo', 'location', 'region', 'subregion', 'year', 'program'];
const SOCIAL_FIELDS = ['linkedin', 'twitter', 'facebook', 'crunchbase'];
const EXTRA_FIELDS = ['city', 'state_province', 'country', 'investor'];
const empty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0);

// Merge one committed record (`match`) into one live record (`c`).
function mergeRecord(c, match) {
  const norm = (s) => collapseSpaces(s).toLowerCase();
  const out = { ...c };

  const names = new Set([...(c.formerNames || []), ...(match.formerNames || [])]);
  if (norm(match.name) !== norm(c.name)) names.add(collapseSpaces(match.name));
  names.delete(collapseSpaces(c.name));
  if (names.size) out.formerNames = [...names];

  for (const f of BACKFILL_FIELDS) if (empty(out[f]) && !empty(match[f])) out[f] = match[f];
  // Tags: keep earlier categories too (sources re-categorise over time).
  if (!empty(match.tags)) {
    const seen = new Set((out.tags || []).map((t) => String(t).toLowerCase()));
    out.tags = [...(out.tags || []), ...match.tags.filter((t) => !seen.has(String(t).toLowerCase()))];
  }
  if (match.social) {
    out.social = { ...(c.social || {}) };
    for (const f of SOCIAL_FIELDS) if (empty(out.social[f]) && !empty(match.social[f])) out.social[f] = match.social[f];
  }
  if (match.extra) {
    out.extra = { ...(c.extra || {}) };
    for (const f of EXTRA_FIELDS) if (empty(out.extra[f]) && !empty(match.extra[f])) out.extra[f] = match.extra[f];
  }
  const liveFounders = Array.isArray(c.founders) ? c.founders : [];
  const have = new Set(liveFounders.map((f) => norm(f && f.name)));
  const keptFounders = (match.founders || []).filter((f) => f && f.name && !have.has(norm(f.name)));
  if (keptFounders.length) out.founders = [...liveFounders, ...keptFounders];
  for (const flag of ['isExit', 'isUnicorn']) if (match[flag] && !out[flag]) out[flag] = true;
  return out;
}

function mergeWithPrior(prior, live) {
  const { pairs } = matchPrior(prior, live);
  return live.map((c, li) => (pairs[li] ? mergeRecord(c, pairs[li]) : c));
}

// Full merge of a live result with the committed records for one source:
// paired records are merged, extra committed copies of a company that is
// still listed (sources list some companies twice) are folded into it, and
// companies that are really gone are kept as listed:false.
function mergeLiveWithCommitted(prior, live, now = new Date()) {
  const norm = (s) => collapseSpaces(s).toLowerCase();
  const twinKey = (c) => {
    const d = domainOf(c.website);
    return `${norm(c.name)}|${d && !SHARED_HOSTS.has(d) ? d : ''}`;
  };
  const { pairs, unmatched } = matchPrior(prior, live);
  const merged = live.map((c, li) => (pairs[li] ? mergeRecord(c, pairs[li]) : c));
  const byKey = new Map();
  merged.forEach((c, i) => {
    if (!byKey.has(twinKey(c))) byKey.set(twinKey(c), i);
  });
  const today = now.toISOString().slice(0, 10);
  const delisted = [];
  for (const p of unmatched) {
    const i = byKey.get(twinKey(p));
    if (i !== undefined) merged[i] = mergeRecord(merged[i], p);
    else delisted.push({ ...p, listed: false, delistedAt: p.delistedAt || today });
  }
  return { companies: [...merged, ...delisted], delisted: delisted.length, folded: unmatched.length - delisted.length };
}

// Backwards-compatible name.
const carryOverHistory = mergeWithPrior;

function carryOverDelisted(prior, live, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return missingFrom(prior, live).map((p) => ({ ...p, listed: false, delistedAt: p.delistedAt || today }));
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
        // The shrink guard compares against companies still listed upstream.
        const vet = vetLiveResult(name, fetched, prior.filter((c) => c.listed !== false), { minRatio });
        if (!vet.ok) throw new Error(vet.reason);
        const m = mergeLiveWithCommitted(prior, vet.companies);
        companies = m.companies;
        const notes = [];
        if (vet.junk) notes.push(`${vet.junk} junk records rejected`);
        if (m.delisted) notes.push(`${m.delisted} no longer listed upstream (kept, flagged listed:false)`);
        status = { status: 'live', reason: notes.join('; ') };
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
  carryOverDelisted,
  carryOverHistory,
  mergeWithPrior,
  mergeLiveWithCommitted,
  matchPrior,
  missingFrom,
  readCommitted,
  SOURCES,
  DEFAULT_SOURCES,
};
