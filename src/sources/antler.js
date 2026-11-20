// Antler (antler.co/portfolio). The portfolio is a Webflow CMS list rendered
// on the server, 52 companies a page (?<collection>_page=N), and every card
// carries name, description, location, sector, year, website and logo — so it
// is read as plain HTML. The stealth-browser scrape (browser-portfolio.js)
// stays as a fallback if the page layout changes.

const { makeBrowserSource } = require('./browser-portfolio');
const { addHttps, collapseSpaces } = require('../normalize');
const { decodeHtml, htmlText } = require('../html');
const { normalizeCountry } = require('../data/countries');
const { fetchWithTimeout } = require('../http');

const config = {
  source: 'antler',
  url: process.env.ANTLER_PORTFOLIO_URL || 'https://www.antler.co/portfolio',
  program: 'Antler',
};

const src = makeBrowserSource(config);
const MAX_PAGES = 80;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// One portfolio page -> raw cards.
function parseAntlerPage(html) {
  return String(html)
    .split(/class="portco_card"/)
    .slice(1)
    .map((chunk) => {
      const body = chunk.split(/class="portco_card"|role="listitem"/)[0];
      const field = (f) => htmlText((body.match(new RegExp(`<p fs-cmsfilter-field="${f}"[^>]*>([\\s\\S]*?)</p>`)) || [])[1]);
      const tags = { location: '', sector: '', year: '' };
      for (const m of body.matchAll(/<div fs-cmsfilter-field="([^"]*)" class="tag_small_wrap"><div[^>]*class="tag_small_text">([\s\S]*?)<\/div>/g)) {
        const kind = m[1] === 'sector' || m[1] === 'year' ? m[1] : 'location';
        if (!tags[kind]) tags[kind] = htmlText(m[2]);
      }
      return {
        name: field('name'),
        description: field('description'),
        website: decodeHtml((body.match(/<a[^>]+href="([^"]+)"[^>]*class="clickable_link/) || [])[1] || ''),
        logo: decodeHtml((body.match(/<img[^>]+src="([^"]+)"/) || [])[1] || ''),
        ...tags,
      };
    })
    .filter((c) => c.name);
}

function normalizeAntler(card) {
  const country = normalizeCountry(card.location);
  const year = Number(card.year);
  return {
    source: 'antler',
    name: collapseSpaces(card.name),
    description: card.description || '',
    logo: card.logo || '',
    website: /^https?:\/\/(www\.)?antler\.co(\/|$)/i.test(card.website) ? '' : addHttps(card.website || ''),
    location: country || card.location || '',
    region: '',
    subregion: '',
    tags: card.sector ? [card.sector] : [],
    year: year >= 1990 && year <= 2100 ? year : '',
    program: 'Antler',
    programSlugs: ['antler'],
    isExit: false,
    isUnicorn: false,
    isBCorp: false,
    isCurrentSession: false,
    founders: [],
    social: { linkedin: '', twitter: '', facebook: '', crunchbase: '' },
    extra: { country: country || card.location || '' },
  };
}

async function fetchAntlerHtml({ url = config.url, fetchFn = fetchWithTimeout, maxPages = MAX_PAGES } = {}) {
  const get = async (u) => {
    const res = await fetchFn(u, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${u}`);
    return res.text();
  };
  const first = await get(url);
  // Webflow names the page parameter after the collection, e.g. ?0b933bfd_page=2.
  const key = (first.match(/\?([a-z0-9]+)_page=\d+/) || [])[1];
  const all = [];
  const seen = new Set();
  const take = (html) => {
    let added = 0;
    for (const c of parseAntlerPage(html)) {
      const k = `${c.name.toLowerCase()}|${c.website}`;
      if (seen.has(k)) continue;
      seen.add(k);
      all.push(normalizeAntler(c));
      added++;
    }
    return added;
  };
  take(first);
  if (key) {
    for (let page = 2; page <= maxPages; page++) {
      if (!take(await get(`${url}?${key}_page=${page}`))) break;
    }
  }
  return all;
}

async function fetchAntler() {
  try {
    const companies = await fetchAntlerHtml();
    if (companies.length) return companies;
    throw new Error('no companies on the portfolio pages');
  } catch (err) {
    console.log(`    ↳ Antler HTML pages unavailable (${err.message}) — trying the browser scraper`);
  }
  return src.fetch();
}

module.exports = {
  fetchAntler,
  fetchAntlerHtml,
  parseAntlerPage,
  normalizeAntler,
  scrapeAntler: src.scrape,
  PORTFOLIO_URL: config.url,
};
