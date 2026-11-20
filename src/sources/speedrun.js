// a16z speedrun — Andreessen Horowitz's accelerator. speedrun.a16z.com is a
// Next.js site: /companies?cohort=SR00N embeds a whole cohort as JSON
// (__NEXT_DATA__), and each /companies/<slug> page adds the website, founded
// year, social links and founders.

const { addHttps, collapseSpaces, toArray } = require('../normalize');
const { fetchWithTimeout } = require('../http');

const BASE = process.env.SPEEDRUN_URL || 'https://speedrun.a16z.com';
const DETAIL_CONCURRENCY = 4;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function nextData(html) {
  const m = String(html).match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('no __NEXT_DATA__ on the page');
  return JSON.parse(m[1]);
}

async function getPage(path, fetchFn) {
  const res = await fetchFn(`${BASE}${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${BASE}${path}`);
  return nextData(await res.text()).props.pageProps;
}

function normalizeSpeedrun(list, detail = null) {
  const d = { ...list, ...(detail || {}) };
  const founders = toArray(detail && detail.founders).length
    ? detail.founders.map((f) => ({
        name: collapseSpaces(f.name),
        role: collapseSpaces(f.title),
        linkedin: addHttps(f.linkedinUrl || ''),
        ...(f.photoUrl ? { avatar: f.photoUrl } : {}),
      }))
    : toArray(list.faces).map((f) => ({ name: collapseSpaces(f.name), role: '', linkedin: '', ...(f.photoUrl ? { avatar: f.photoUrl } : {}) }));
  const year = Number(d.foundedYear);
  const teamSize = Number(d.teamSize);
  return {
    source: 'speedrun',
    name: collapseSpaces(d.name),
    description: d.oneLiner || toArray(d.description).join(' ') || '',
    logo: d.logoUrl || '',
    website: addHttps(d.websiteUrl || ''),
    sourceUrl: d.slug ? `${BASE}/companies/${d.slug}` : '',
    location: d.location || '',
    region: '',
    subregion: '',
    tags: [...new Set(toArray(d.industries))],
    year: year >= 1990 && year <= 2100 ? year : '',
    program: d.cohort ? `a16z speedrun ${d.cohort}` : 'a16z speedrun',
    programSlugs: ['a16z-speedrun'],
    isExit: false,
    isUnicorn: false,
    isBCorp: false,
    isCurrentSession: false,
    teamSize: teamSize > 0 ? teamSize : null,
    founders: founders.filter((f) => f.name),
    social: { linkedin: addHttps(d.linkedinUrl || ''), twitter: addHttps(d.xUrl || ''), facebook: '', crunchbase: '' },
    extra: {},
  };
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

async function fetchSpeedrun({ fetchFn = fetchWithTimeout, details = true } = {}) {
  const first = await getPage('/companies', fetchFn);
  const cohorts = toArray(first.options && first.options.cohorts);
  if (!cohorts.length) throw new Error('speedrun page lists no cohorts');
  const listed = [];
  const seen = new Set();
  for (const cohort of cohorts) {
    const page = await getPage(`/companies?cohort=${encodeURIComponent(cohort)}`, fetchFn);
    for (const c of toArray(page.list && page.list.companies)) {
      if (!c || !c.slug || seen.has(c.slug)) continue;
      seen.add(c.slug);
      listed.push(c);
    }
  }
  if (!listed.length) throw new Error('speedrun returned no companies');
  // Detail pages are best-effort: a failed one keeps the list data.
  const detailsBySlug = details
    ? await mapLimit(listed, DETAIL_CONCURRENCY, (c) =>
        getPage(`/companies/${encodeURIComponent(c.slug)}`, fetchFn).then((p) => p.company || null, () => null)
      )
    : [];
  return listed.map((c, i) => normalizeSpeedrun(c, detailsBySlug[i]));
}

module.exports = { fetchSpeedrun, normalizeSpeedrun, nextData, BASE };
