// Founder profiles for Y Combinator companies.
//
// The YC company directory mirror we use (yc-oss/api) has no founder data, but
// every company page on ycombinator.com lists its founders with their title,
// bio and links (LinkedIn, X, GitHub, personal site). This module visits those
// pages incrementally — a few hundred per daily run, never-checked companies
// first (newest batches first), then refreshes the oldest — and merges the
// founders into the company records. Founders are only ever added or updated,
// never removed.
//
// Progress is kept in data/_state/yc-founders.json ({ slug: { checkedAt, found } }).
// Tunables: YC_FOUNDERS=0 (skip), YC_FOUNDER_BATCH, YC_FOUNDER_CONCURRENCY,
// YC_FOUNDER_BUDGET_MS, YC_FOUNDER_REFRESH_DAYS.

const fs = require('fs');
const path = require('path');
const { fetchWithTimeout } = require('../http');
const { addHttps, collapseSpaces, stripUrlSignature } = require('../normalize');

const BATCH = Number(process.env.YC_FOUNDER_BATCH || 800);
const CONCURRENCY = Number(process.env.YC_FOUNDER_CONCURRENCY || 3);
const BUDGET_MS = Number(process.env.YC_FOUNDER_BUDGET_MS || 6 * 60 * 1000);
const REFRESH_DAYS = Number(process.env.YC_FOUNDER_REFRESH_DAYS || 60);

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (compatible; startup-portfolios-api/1.0; +https://github.com/yigitmeteozcan/startups)',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

function decodeEntities(s) {
  return String(s)
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#x27;/gi, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/gi, '/')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
}

// Every JSON blob a page might carry its data in.
function jsonBlobs(html) {
  const out = [];
  const tryParse = (s) => {
    try {
      out.push(JSON.parse(s));
    } catch (_) {}
  };
  for (const m of html.matchAll(/data-page="([^"]*)"/g)) tryParse(decodeEntities(m[1])); // Inertia
  for (const m of html.matchAll(/<script[^>]*type="application\/(?:ld\+)?json"[^>]*>([\s\S]*?)<\/script>/g)) {
    tryParse(m[1].trim()); // Next.js __NEXT_DATA__, schema.org LD+JSON
  }
  return out;
}

const NAME_KEYS = ['full_name', 'fullName', 'name'];
const FOUNDER_HINTS = [
  'linkedin_url', 'linkedinUrl', 'twitter_url', 'twitterUrl', 'founder_bio', 'bio', 'title',
  'avatar_thumb_url', 'avatar_url', 'sameAs', 'github_url',
];

function looksLikePerson(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
  const hasName = NAME_KEYS.some((k) => typeof o[k] === 'string' && o[k].trim());
  return hasName && FOUNDER_HINTS.some((k) => o[k] != null && o[k] !== '');
}

// Depth-first search for the best "list of founders" in a JSON blob. Arrays
// under a key containing "founder" win over other person-like arrays.
function findFounderArrays(value, keyName = '', depth = 0, out = []) {
  if (depth > 12 || value == null || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    const people = value.filter(looksLikePerson);
    if (people.length && people.length >= value.length / 2) {
      out.push({ score: /founder/i.test(keyName) ? 2 : /team|people|person/i.test(keyName) ? 1 : 0, people });
    }
    for (const v of value) findFounderArrays(v, keyName, depth + 1, out);
    return out;
  }
  for (const [k, v] of Object.entries(value)) {
    // schema.org: { "@type": "Organization", "founder": { ... } | [ ... ] }
    if (/^founders?$/i.test(k) && looksLikePerson(v)) out.push({ score: 2, people: [v] });
    findFounderArrays(v, k, depth + 1, out);
  }
  return out;
}

function str(v) {
  return typeof v === 'string' ? collapseSpaces(v) : '';
}

function socialUrl(v, host) {
  const s = str(v);
  if (!s) return '';
  if (/^@?[A-Za-z0-9_.-]+$/.test(s) && !s.includes('.')) return `https://${host}/${s.replace(/^@/, '')}`;
  return addHttps(s);
}

function toFounder(o) {
  const pick = (...keys) => keys.map((k) => str(o[k])).find(Boolean) || '';
  const links = [].concat(o.sameAs || []).filter((u) => typeof u === 'string');
  const linkFor = (re) => links.find((u) => re.test(u)) || '';
  const f = {
    name: pick('full_name', 'fullName', 'name'),
    role: pick('title', 'role', 'position', 'jobTitle'),
    linkedin: addHttps(pick('linkedin_url', 'linkedinUrl', 'linkedin') || linkFor(/linkedin\.com/i)),
  };
  const twitter = socialUrl(pick('twitter_url', 'twitterUrl', 'twitter', 'x_url') || linkFor(/(?:twitter|x)\.com/i), 'x.com');
  const github = socialUrl(pick('github_url', 'githubUrl', 'github') || linkFor(/github\.com/i), 'github.com');
  const website = addHttps(pick('personal_url', 'personalUrl', 'website_url', 'websiteUrl', 'website', 'homepage'));
  const bio = pick('founder_bio', 'bio', 'description');
  const avatar = stripUrlSignature(addHttps(pick('avatar_thumb_url', 'avatar_url', 'avatarUrl', 'image')));
  if (twitter) f.twitter = twitter;
  if (github) f.github = github;
  if (website) f.website = website;
  if (bio) f.bio = bio.slice(0, 600);
  if (avatar) f.avatar = avatar;
  // YC lists people who have left the company as former founders.
  if (o.is_active === false) f.active = false;
  return f;
}

// Field names (never values) of the founder objects on a page — logged once
// per run so it is visible which profile details the source offers.
function founderFieldNames(html) {
  const candidates = [];
  for (const blob of jsonBlobs(String(html || ''))) findFounderArrays(blob, '', 0, candidates);
  if (!candidates.length) return [];
  candidates.sort((a, b) => b.score - a.score || b.people.length - a.people.length);
  return [...new Set(candidates[0].people.flatMap((p) => Object.keys(p)))].sort();
}

// Parse a YC company page into founder objects (empty array if none found).
function extractFounders(html) {
  const candidates = [];
  for (const blob of jsonBlobs(String(html || ''))) findFounderArrays(blob, '', 0, candidates);
  if (!candidates.length) return [];
  candidates.sort((a, b) => b.score - a.score || b.people.length - a.people.length);
  const seen = new Set();
  return candidates[0].people
    .map(toFounder)
    .filter((f) => f.name && !seen.has(f.name.toLowerCase()) && seen.add(f.name.toLowerCase()));
}

// What the page offered, for the CI log when nothing could be extracted.
function describePage(html) {
  const blobs = jsonBlobs(String(html || ''));
  const keys = blobs.map((b) => Object.keys(b || {}).slice(0, 8).join(','));
  return `${blobs.length} JSON blob(s)${keys.length ? `: [${keys.join('] [')}]` : ''}; ${String(html || '').length} bytes`;
}

// Merge freshly scraped founders into existing ones without losing anything:
// scraped values win, blanks are filled from the existing entry, and founders
// no longer on the page are kept.
function mergeFounders(existing, scraped) {
  const norm = (s) => collapseSpaces(s).toLowerCase();
  const old = new Map((existing || []).filter((f) => f && f.name).map((f) => [norm(f.name), f]));
  const out = scraped.map((f) => {
    const prev = old.get(norm(f.name)) || {};
    const merged = { ...prev, ...f };
    for (const [k, v] of Object.entries(prev)) if ((merged[k] == null || merged[k] === '') && v) merged[k] = v;
    if (!('active' in f)) delete merged.active; // listed as active again
    return merged;
  });
  const have = new Set(out.map((f) => norm(f.name)));
  for (const f of existing || []) if (f && f.name && !have.has(norm(f.name))) out.push(f);
  return out;
}

const slugOf = (c) => {
  const m = String(c.sourceUrl || '').match(/ycombinator\.com\/companies\/([^/?#]+)/i);
  return m ? m[1].toLowerCase() : '';
};

function readState(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return {};
  }
}

// Pick the next companies to visit: never checked (newest first), then the
// ones checked longest ago, if older than REFRESH_DAYS.
function pickBatch(companies, state, { batch = BATCH, refreshDays = REFRESH_DAYS, now = Date.now() } = {}) {
  const yc = companies.filter((c) => c.source === 'yc' && c.listed !== false && slugOf(c));
  const never = yc.filter((c) => !state[slugOf(c)]).sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
  const stale = yc
    .filter((c) => state[slugOf(c)] && now - Date.parse(state[slugOf(c)].checkedAt) > refreshDays * 86400000)
    .sort((a, b) => Date.parse(state[slugOf(a)].checkedAt) - Date.parse(state[slugOf(b)].checkedAt));
  return [...never, ...stale].slice(0, batch);
}

async function enrichYcFounders(
  companies,
  {
    rootDir = path.resolve(__dirname, '../..'),
    onLog = console.log,
    fetchFn = (url) => fetchWithTimeout(url, { headers: HEADERS }, 30000),
    batch = BATCH,
    concurrency = CONCURRENCY,
    budgetMs = BUDGET_MS,
    delayMs = 250,
    now = new Date(),
  } = {}
) {
  const stateFile = path.join(rootDir, 'data', '_state', 'yc-founders.json');
  const state = readState(stateFile);
  const todo = pickBatch(companies, state, { batch, now: now.getTime() });
  const stats = { checked: 0, withFounders: 0, founders: 0, failed: 0, statuses: {}, empty: [] };
  if (!todo.length) {
    onLog('  → YC founder profiles: nothing to refresh today.');
    return stats;
  }
  onLog(`  → YC founder profiles: visiting ${todo.length} company pages...`);
  const deadline = Date.now() + budgetMs;
  const today = now.toISOString().slice(0, 10);
  let next = 0;
  let consecutiveFailures = 0;

  async function worker() {
    while (next < todo.length && Date.now() < deadline && consecutiveFailures < 25) {
      const c = todo[next++];
      const slug = slugOf(c);
      try {
        const res = await fetchFn(`https://www.ycombinator.com/companies/${slug}`);
        stats.statuses[res.status] = (stats.statuses[res.status] || 0) + 1;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        const founders = extractFounders(html);
        if (founders.length && !stats.fields) stats.fields = founderFieldNames(html);
        stats.checked++;
        consecutiveFailures = 0;
        if (founders.length) {
          c.founders = mergeFounders(c.founders, founders);
          stats.withFounders++;
          stats.founders += founders.length;
        } else if (stats.empty.length < 3) {
          stats.empty.push(`${slug}: ${describePage(html)}`);
        }
        state[slug] = { checkedAt: today, found: founders.length };
      } catch (err) {
        stats.failed++;
        consecutiveFailures++;
      }
      if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));

  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  const sorted = Object.fromEntries(Object.entries(state).sort(([a], [b]) => (a < b ? -1 : 1)));
  fs.writeFileSync(stateFile, JSON.stringify(sorted, null, 1));

  const done = Object.keys(state).length;
  const total = companies.filter((c) => c.source === 'yc' && slugOf(c)).length;
  onLog(
    `    ✓ YC founders: ${stats.checked} pages read, ${stats.withFounders} with founders (${stats.founders} profiles), ` +
      `${stats.failed} failed; HTTP ${JSON.stringify(stats.statuses)}; progress ${done}/${total} companies`
  );
  if (consecutiveFailures >= 25) onLog('    ⚠️  stopped early after 25 failures in a row (blocked or site change?)');
  for (const e of stats.empty) onLog(`    ↳ no founders found on ${e}`);
  if (stats.fields) onLog(`    ↳ founder fields offered by YC: ${stats.fields.join(', ')}`);
  return stats;
}

module.exports = { enrichYcFounders, extractFounders, founderFieldNames, mergeFounders, pickBatch, describePage, slugOf };
