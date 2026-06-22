// 500 Global (500.co). The portfolio page is backed by a public JSON API
// (https://500.co/api/startups), so we fetch it directly — no browser needed.
// If that ever fails (e.g. Cloudflare blocks the request), fall back to the
// shared stealth-browser scraper.

const { normalizeRecord, findCompanyArray, makeBrowserSource } = require('./browser-portfolio');

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

async function fetch500() {
  try {
    const res = await fetch(API_URL, { headers: HEADERS });
    if (res.ok) {
      const json = await res.json();
      // The array may be the body itself or nested under a key.
      const arr =
        findCompanyArray(json) ||
        (Array.isArray(json) ? json : json.startups || json.companies || json.data || json.results);
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.map((d) => normalizeRecord(d, { source: '500', program: '500 Global' }));
      }
    }
  } catch (_) {
    // fall through to the browser scraper
  }
  return browser.fetch();
}

module.exports = { fetch500, scrape500: browser.scrape, API_URL };
