// İTÜ Çekirdek — Istanbul Technical University's startup incubator (Turkey).
// Its startup directory (girisimler.itucekirdek.com) is server-rendered HTML,
// 12 cards a page, each with name, description, sector, logo and website.
// Email addresses on the cards are deliberately not collected.

const { addHttps, collapseSpaces } = require('../normalize');
const { decodeHtml, htmlText } = require('../html');
const { fetchWithTimeout } = require('../http');

const BASE_URL = process.env.ITU_CEKIRDEK_URL || 'https://girisimler.itucekirdek.com/';
const MAX_PAGES = 80;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
};

const CARD_START = /<div class="rounded-lg shadow-lg overflow-hidden relative group/;

function linkKind(url) {
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    } catch (_) {
      return '';
    }
  })();
  if (!host) return '';
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 'linkedin';
  if (host === 'twitter.com' || host === 'x.com') return 'twitter';
  if (host === 'facebook.com') return 'facebook';
  if (host === 'instagram.com' || host === 'youtube.com' || host.endsWith('itucekirdek.com')) return 'other';
  return 'website';
}

// One directory page -> raw card objects.
function parseCards(html) {
  return String(html)
    .split(CARD_START)
    .slice(1)
    .map((chunk) => {
      // The last card runs into the pager / footer; stop there.
      const body = chunk.split(/<nav\b|<footer\b/)[0];
      const name = htmlText((body.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1]);
      const description = htmlText((body.match(/<p[^>]*>([\s\S]*?)<\/p>/) || [])[1]);
      const logo = decodeHtml((body.match(/<img[^>]+src="([^"]+)"/) || [])[1] || '');
      const afterSector = body.split(/Sector<\/div>|Sektör<\/div>/)[1] || '';
      const sectorBlock = afterSector.split(/<div class="flex items-center justify-center space-x-6/)[0];
      const sectors = [...sectorBlock.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map((m) => htmlText(m[1])).filter(Boolean);
      const links = { website: '', linkedin: '', twitter: '', facebook: '' };
      for (const m of body.matchAll(/<a\s+href="(https?:\/\/[^"]+)"/g)) {
        const url = decodeHtml(m[1]);
        const kind = linkKind(url);
        if (links[kind] === '') links[kind] = url;
      }
      return { name, description, logo, sectors, ...links };
    })
    .filter((c) => c.name);
}

function normalizeItu(card) {
  return {
    source: 'itucekirdek',
    name: collapseSpaces(card.name),
    description: card.description || '',
    logo: card.logo || '',
    website: addHttps(card.website || ''),
    location: '',
    region: '',
    subregion: '',
    tags: [...new Set(card.sectors || [])],
    year: '',
    program: 'İTÜ Çekirdek',
    programSlugs: ['itucekirdek'],
    isExit: false,
    isUnicorn: false,
    isBCorp: false,
    isCurrentSession: false,
    founders: [],
    social: { linkedin: card.linkedin || '', twitter: card.twitter || '', facebook: card.facebook || '', crunchbase: '' },
    extra: { country: 'Turkey' },
  };
}

async function fetchItuCekirdek({ baseUrl = BASE_URL, maxPages = MAX_PAGES, fetchFn = fetchWithTimeout } = {}) {
  const all = [];
  const seen = new Set();
  for (let page = 1; page <= maxPages; page++) {
    const url = `${baseUrl}?lang=en&page=${page}`;
    const res = await fetchFn(url, { headers: HEADERS });
    if (!res.ok) {
      if (page === 1) throw new Error(`HTTP ${res.status} from ${url}`);
      break;
    }
    const cards = parseCards(await res.text());
    const fresh = cards.filter((c) => !seen.has(c.name.toLowerCase()));
    // Past the last page the site repeats a page or shows none.
    if (fresh.length === 0) break;
    for (const c of fresh) {
      seen.add(c.name.toLowerCase());
      all.push(normalizeItu(c));
    }
  }
  if (!all.length) throw new Error('İTÜ Çekirdek directory returned no startups');
  return all;
}

module.exports = { fetchItuCekirdek, parseCards, normalizeItu, BASE_URL };
