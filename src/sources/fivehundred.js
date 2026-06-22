// 500 Global (500.co). Backed by a public JSON API (https://500.co/api/startups)
// shaped as { res: [ { oneLiner, organization:{...}, stage, industries, batches,
// investments } ] }. We fetch it directly and map each record; the company's
// real fields live under `organization`. Falls back to the browser scraper if
// the API is blocked.

const { addHttps, toArray } = require('../normalize');
const { makeBrowserSource } = require('./browser-portfolio');

const API_URL = process.env.FIVEHUNDRED_API_URL || 'https://500.co/api/startups';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

const browser = makeBrowserSource({
  source: '500',
  url: process.env.FIVEHUNDRED_PORTFOLIO_URL || 'https://500.co/portfolio',
  program: '500 Global',
});

// Earliest investment year, used as a rough "year" for the company.
function earliestYear(investments) {
  const years = toArray(investments)
    .map((i) => i && i.initialInvestDate && new Date(i.initialInvestDate).getFullYear())
    .filter((y) => y >= 1990 && y <= 2100);
  return years.length ? Math.min(...years) : '';
}

function normalize500(d) {
  const org = d.organization || {};
  const country = org.countryOfOperation && org.countryOfOperation.name;
  const region = org.regionOfOperation && org.regionOfOperation.name;
  const tags = [
    ...toArray(d.industries).map((i) => i && i.name),
    d.businessModel && d.businessModel.name,
  ].filter(Boolean);
  const program =
    toArray(d.batches).map((b) => b && b.brandName).filter(Boolean).join(', ') || '500 Global';
  // Prefer the capitalised alternative name, then the brand/legal name.
  const name =
    (org.alternativeName || '').split(';')[0].trim() ||
    org.businessName ||
    org.name ||
    '';

  return {
    source: '500',
    name,
    description: d.oneLiner || '',
    logo: org.imageUrl || '',
    website: addHttps(org.companyUrl || ''),
    location: country || '',
    region: region || '',
    subregion: '',
    tags: [...new Set(tags)],
    year: earliestYear(d.investments),
    program,
    programSlugs: ['500'],
    isExit: String(d.stage && d.stage.name).toLowerCase() === 'exited',
    isUnicorn: false,
    isBCorp: false,
    isCurrentSession: false,
    social: {
      linkedin: addHttps(org.companyLinkedIn || ''),
      twitter: '',
      facebook: '',
      crunchbase: '',
    },
    extra: { country: country || '' },
  };
}

async function fetch500() {
  try {
    const res = await fetch(API_URL, { headers: HEADERS });
    if (res.ok) {
      const json = await res.json();
      const arr = Array.isArray(json) ? json : json.res || json.startups || json.data || [];
      const companies = arr.map(normalize500).filter((c) => c.name);
      if (companies.length > 0) return companies;
    }
  } catch (_) {
    // fall through to the browser scraper
  }
  return browser.fetch();
}

module.exports = { fetch500, normalize500, scrape500: browser.scrape, API_URL };
