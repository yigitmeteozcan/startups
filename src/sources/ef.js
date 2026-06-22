// Entrepreneur First (joinef.com). The portfolio is a WordPress site that
// renders company tiles server-side, paginated via ?pagenum=N. So we fetch the
// HTML pages directly and parse the tiles — no browser needed. Falls back to the
// shared stealth-browser scraper if the HTML fetch is blocked.

const { normalizeRecord, makeBrowserSource } = require('./browser-portfolio');

const BASE_URL = process.env.EF_PORTFOLIO_URL || 'https://www.joinef.com/portfolio/';
const MAX_PAGES = Number(process.env.EF_MAX_PAGES || 40);

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const browser = makeBrowserSource({
  source: 'ef',
  url: BASE_URL,
  program: 'Entrepreneur First',
});

function decodeEntities(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Parse the `.tile--company` blocks out of a portfolio page's HTML.
function parseTiles(html) {
  const out = [];
  // Each company tile starts with this class (featured tiles add more classes).
  const blocks = html.split('class="tile tile--company');
  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i];
    const name = (b.match(/data-companyname="([^"]*)"/) || [])[1];
    if (!name) continue;
    const slug = (b.match(/data-companyslug="([^"]*)"/) || [])[1] || '';
    const description =
      (b.match(/tile__description[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '';
    const location =
      (b.match(/locationtag[^>]*>\s*<span class="linkline">([\s\S]*?)<\/span>/) || [])[1] || '';
    const industries = [
      ...b.matchAll(/categorytag[^>]*>\s*<span class="linkline">([\s\S]*?)<\/span>/g),
    ].map((m) => decodeEntities(m[1]));
    // Year sits in a meta row immediately after the "Founded" label.
    const yearMatch = b.match(/Founded<\/div>[\s\S]*?meta__row__name[^>]*>\s*(\d{4})\s*</);
    const year = yearMatch ? Number(yearMatch[1]) : '';
    const isExit = /Exited to<\/div>/.test(b);

    out.push({
      name: decodeEntities(name),
      slug,
      description: decodeEntities(description),
      location: decodeEntities(location),
      industries,
      year,
      is_exit: isExit,
    });
  }
  return out;
}

async function fetchEf({ base = BASE_URL, maxPages = MAX_PAGES } = {}) {
  const all = [];
  const seen = new Set();
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? base : `${base}${base.includes('?') ? '&' : '?'}pagenum=${page}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) break;
    const html = await res.text();
    const tiles = parseTiles(html);
    if (tiles.length === 0) break;
    let added = 0;
    for (const t of tiles) {
      const key = t.slug || t.name;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push(t);
      added++;
    }
    if (added === 0) break; // no new companies -> reached the end
  }

  if (all.length === 0) return browser.fetch(); // HTML blocked -> try the browser
  return all.map((d) => normalizeRecord(d, { source: 'ef', program: 'Entrepreneur First' }));
}

module.exports = { fetchEf, scrapeEf: browser.scrape, parseTiles, BASE_URL };
