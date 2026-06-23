// Plug and Play (plugandplaytechcenter.com). The "our startups" directory is
// JS-rendered behind Cloudflare, but it's backed by a public Magnolia DXP
// delivery API at public.dxp.playbook.vc that we can replay browserless. The
// full company set (~2,400) is paged via offset/limit; each record exposes its
// fields under `startup*` keys (no founder data). We fetch it directly and fall
// back to the stealth-browser scraper if the API is blocked.

const { makeBrowserSource } = require('./browser-portfolio');
const { addHttps } = require('../normalize');

// The delivery endpoint that serves the unfiltered startup list (offset/limit
// paginated, total ~2,400). Overridable in case the node path changes.
const API =
  process.env.PLUGANDPLAY_API_URL ||
  'https://public.dxp.playbook.vc/.rest/delivery/startups/v1';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  Origin: 'https://www.plugandplaytechcenter.com',
  Referer: 'https://www.plugandplaytechcenter.com/',
};

const browser = makeBrowserSource({
  source: 'plugandplay',
  url:
    process.env.PLUGANDPLAY_PORTFOLIO_URL ||
    'https://www.plugandplaytechcenter.com/innovation-services/startups/our-startups',
  program: 'Plug and Play',
});

// Japanese (and other CJK) companies come back under their localized legal name
// (e.g. "株式会社モノクローム"), which is unreadable in the explorer. The English
// one-liner reliably leads with the brand ("Monochrome is creating…"), so when
// the title is non-Latin we recover the brand from the start of the description.
const CJK = /[　-鿿가-힯＀-￯]/;
const LEAD_VERB =
  /^(.*?)\s+(is|are|was|were|has|have|provides?|develops?|engages?|offers?|specializ\w+|operates?|builds?|creates?|makes?|enables?|helps?|delivers?|produces?|designs?|manufactur\w+|focus\w+|aims?|works?|runs?|sells?|connects?|allows?|combines?|leverages?|uses?|brings?|transform\w+|empowers?|supports?|promotes?|provid\w+|develop\w+)\b/i;

function capitalizedWord(w) {
  return /^[0-9]/.test(w) || /^[A-Z]/.test(w) || w === w.toUpperCase();
}

function displayName(title, description) {
  if (!title || !CJK.test(title) || !description) return title;
  let d = String(description).trim();
  if (/^At\s+/i.test(d)) d = d.replace(/^At\s+/i, '').split(',')[0];
  const m = d.match(LEAD_VERB);
  const brand = (m ? m[1] : d.split(/[.,]/)[0]).trim().replace(/[.,;:]+$/, '');
  if (!/^[A-Za-z0-9]/.test(brand)) return title;
  const words = brand.split(/\s+/);
  // Reject generic lowercase phrases ("Internet media management"); a real brand
  // reads as capitalized/all-caps tokens.
  if (brand.length > 40 || words.length > 5 || !words.every(capitalizedWord)) return title;
  return brand;
}

function buildUrl(offset, limit) {
  const u = new URL(API);
  u.searchParams.set('offset', String(offset));
  u.searchParams.set('limit', String(limit));
  return u.toString();
}

// Pull the industry tags from the main industry plus the nested industries list.
function tagsOf(item) {
  const tags = [];
  const main = item.startupMainIndustry && item.startupMainIndustry.industryTitle;
  if (main) tags.push(main);
  const list = item.startupIndustriesList || item.startupIndustries || [];
  for (const entry of Array.isArray(list) ? list : []) {
    const t = entry && entry.startupIndustry && entry.startupIndustry.industryTitle;
    if (t) tags.push(t);
  }
  return tags;
}

function normalizePlugAndPlay(item) {
  const country = item.startupCountry || {};
  const loc = item.startupLocation || {};
  // Prefer the company's own country; the office city (loc) is usually a Plug
  // and Play location (e.g. Sunnyvale) rather than the startup's.
  const cityParts = [loc.locationCity, loc.locationState].filter(Boolean);
  return {
    source: 'plugandplay',
    name: displayName(item.startupTitle || '', item.startupOneLiner || item.startupDescription || ''),
    description: item.startupOneLiner || item.startupDescription || '',
    logo: item.startupLogo || '',
    website: addHttps(item.startupWebsite || ''),
    location: country.countryName || cityParts.join(', ') || '',
    region: country.countryRegion || country.countryContinent || '',
    subregion: '',
    tags: tagsOf(item),
    year: '',
    program: 'Plug and Play',
    programSlugs: ['plugandplay'],
    isExit: !!item.startupExit,
    isUnicorn: !!item.startupUnicorn,
    isBCorp: false,
    isCurrentSession: false,
    founders: [],
    social: { linkedin: '', twitter: '', facebook: '', crunchbase: '' },
    extra: {
      city: loc.locationCity || '',
      state_province: loc.locationState || '',
      country: country.countryName || '',
    },
  };
}

async function fetchPlugAndPlay({ limit = 1000, maxPages = 20 } = {}) {
  try {
    const all = [];
    let total = Infinity;
    for (let page = 0; page < maxPages; page++) {
      const offset = page * limit;
      if (offset >= total) break;
      const res = await fetch(buildUrl(offset, limit), { headers: HEADERS });
      if (!res.ok) break;
      const json = await res.json();
      const results = json.results || [];
      if (results.length === 0) break;
      for (const item of results) all.push(normalizePlugAndPlay(item));
      if (typeof json.total === 'number') total = json.total;
      if (results.length < limit) break;
    }
    const companies = all.filter((c) => c.name);
    if (companies.length > 0) return companies;
  } catch (_) {
    // fall through to the browser scraper
  }
  return browser.fetch();
}

module.exports = {
  fetchPlugAndPlay,
  normalizePlugAndPlay,
  scrapePlugAndPlay: browser.scrape,
  API,
};
