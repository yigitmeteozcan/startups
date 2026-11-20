// SOSV — the deep-tech VC behind HAX (hardware), IndieBio (biotech),
// Chinaccelerator, dlab and other programs. Its portfolio is a WordPress
// custom post type with a public REST API: /wp-json/wp/v2/company, plus
// taxonomy endpoints that name the cohort / category / stage / location ids.

const { addHttps, collapseSpaces, toArray } = require('../normalize');
const { htmlText } = require('../html');
const { normalizeCountry } = require('../data/countries');
const { fetchWithTimeout } = require('../http');

const API = process.env.SOSV_API_URL || 'https://sosv.com/wp-json/wp/v2/';
const PER_PAGE = 100;
const MAX_PAGES = 40;
const FIELDS = 'id,slug,link,title,excerpt,acf,tx_cohort,tx_category,tx_stage,tx_location,tx_program';
const TAXONOMIES = ['tx_cohort', 'tx_category', 'tx_stage', 'tx_location', 'tx_program'];

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json',
};

async function getAllPages(path, fetchFn) {
  const out = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetchFn(`${API}${path}${sep}per_page=${PER_PAGE}&page=${page}`, { headers: HEADERS });
    // WordPress answers 400 for a page past the end.
    if (res.status === 400 && page > 1) break;
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${API}${path}`);
    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) break;
    out.push(...items);
    const totalPages = Number(res.headers.get('x-wp-totalpages')) || 0;
    if (totalPages && page >= totalPages) break;
    if (items.length < PER_PAGE) break;
  }
  return out;
}

// { tx_cohort: Map(id -> name), ... }
async function fetchTerms(fetchFn) {
  const names = {};
  for (const tax of TAXONOMIES) {
    const terms = await getAllPages(`${tax}?_fields=id,name`, fetchFn).catch(() => []);
    names[tax] = new Map(terms.map((t) => [t.id, htmlText(t.name)]));
  }
  return names;
}

function normalizeSosv(d, names = {}) {
  const acf = d.acf || {};
  const termNames = (tax) => toArray(d[tax]).map((id) => names[tax] && names[tax].get(id)).filter(Boolean);
  const cohorts = termNames('tx_cohort');
  const programs = termNames('tx_program');
  const stages = termNames('tx_stage').filter((s) => s !== 'Accelerator');
  const places = termNames('tx_location');
  const countries = places.filter((p) => normalizeCountry(p));
  const others = places.filter((p) => !normalizeCountry(p));
  // "Ottawa, Canada" + "Canada" -> "Ottawa, Canada"; two countries -> "A; B".
  const location =
    countries.length || others.length
      ? [[...others, countries[0]].filter(Boolean).join(', '), ...countries.slice(1)].join('; ')
      : htmlText(acf.demo_day_headquarters);
  const cohortYear = cohorts.map((c) => (String(c).match(/\b(?:19|20)\d{2}\b/) || [])[0]).filter(Boolean).map(Number);
  const founded = Number(acf.founded_year);
  const raised = Number(acf.total_capital_raised);
  const description =
    htmlText(acf.tagline) ||
    htmlText(d.excerpt && d.excerpt.rendered).replace(/\s*\[(?:…|&hellip;|\.\.\.)\]\s*$/, '');

  return {
    source: 'sosv',
    name: collapseSpaces(htmlText(d.title && d.title.rendered)),
    description,
    logo: acf.logo_url || '',
    website: addHttps(acf.website || ''),
    sourceUrl: d.link || '',
    location,
    region: '',
    subregion: '',
    tags: [...new Set(termNames('tx_category'))],
    year: cohortYear.length ? Math.min(...cohortYear) : founded >= 1990 && founded <= 2100 ? founded : '',
    program: cohorts.join(', ') || programs.join(', ') || 'SOSV',
    programSlugs: ['sosv'],
    isExit: stages.includes('Exit'),
    isUnicorn: false,
    isBCorp: false,
    isCurrentSession: false,
    stage: stages[0] || '',
    teamSizeRange: collapseSpaces(acf.employee_count_range),
    totalRaised: Number.isFinite(raised) && raised >= 1000 ? raised : null,
    founders: [],
    social: {
      linkedin: addHttps(acf.linked_in || ''),
      twitter: addHttps(acf.twitter || ''),
      facebook: addHttps(acf.facebook || ''),
      crunchbase: addHttps(acf.crunchbase || ''),
    },
    extra: { country: countries[0] || '' },
  };
}

async function fetchSosv({ fetchFn = fetchWithTimeout } = {}) {
  const names = await fetchTerms(fetchFn);
  const items = await getAllPages(`company?_fields=${FIELDS}`, fetchFn);
  const companies = items.map((d) => normalizeSosv(d, names)).filter((c) => c.name);
  if (!companies.length) throw new Error('SOSV API returned no companies');
  return companies;
}

module.exports = { fetchSosv, normalizeSosv, API };
