// SparkLabs — Korea's leading accelerator (sparklabs.co.kr). The English
// portfolio is server-rendered, 12 companies a page (?page=N); each company
// page adds category, status (Exit), founded year, location, CEO, batch,
// website and social links.

const { addHttps, collapseSpaces } = require('../normalize');
const { decodeHtml, htmlText } = require('../html');
const { fetchWithTimeout } = require('../http');

const BASE = process.env.SPARKLABS_URL || 'https://www.sparklabs.co.kr/en/portfolio';
const MAX_PAGES = 60;
const DETAIL_CONCURRENCY = 4;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const DETAIL_RE = /https:\/\/(?:www\.)?sparklabs\.co\.kr\/en\/portfolio\/([a-z0-9-]+)\/?/;

// One portfolio page -> [{ slug, url, name, logo, tag, description }]
function parseList(html) {
  return String(html)
    .split(/<li class="list-item/)
    .slice(1)
    .map((chunk) => {
      const m = chunk.match(DETAIL_RE);
      if (!m) return null;
      return {
        slug: m[1],
        url: `https://www.sparklabs.co.kr/en/portfolio/${m[1]}/`,
        name: htmlText((chunk.match(/<h6[^>]*>([\s\S]*?)<\/h6>/) || [])[1]),
        logo: decodeHtml((chunk.match(/<img[^>]+src="([^"]+)"/) || [])[1] || ''),
        tag: htmlText((chunk.match(/<span class="colored-span"[^>]*>([\s\S]*?)<\/span>/) || [])[1]),
        description: htmlText((chunk.match(/<p[^>]*>([\s\S]*?)<\/p>/) || [])[1]).replace(/…$/, '').trim(),
      };
    })
    .filter((c) => c && c.name);
}

// Company page -> { Category, Status, Founded, Location, CEO, Batch, description, links }
function parseDetail(html) {
  const s = String(html);
  const fields = {};
  for (const m of s.matchAll(/<div class="category_title">\s*([\s\S]*?)\s*<\/div>[\s\S]*?<div class="col-\d+">\s*<div[^>]*>([\s\S]*?)<\/div>/g)) {
    fields[htmlText(m[1])] = htmlText(m[2]);
  }
  const links = {};
  for (const m of s.matchAll(/<a class="([a-z]+)" href="(https?:\/\/[^"]+)"[^>]*target="_blank"/g)) {
    // The site reuses the "tumblr" class for the homepage icon.
    const kind = m[1] === 'tumblr' ? 'website' : m[1];
    if (!links[kind]) links[kind] = decodeHtml(m[2]);
  }
  // The list cuts descriptions off mid-word; the page's meta description has it all.
  const description = htmlText((s.match(/<meta name="description" content="([^"]*)"/) || [])[1]);
  return { ...fields, description, links };
}

function normalizeSparkLabs(item, detail = null) {
  const d = detail || {};
  const links = d.links || {};
  const founded = Number(d.Founded);
  const batch = String(d.Batch || '').trim();
  const status = String(d.Status || '').trim();
  const ceo = collapseSpaces(d.CEO);
  return {
    source: 'sparklabs',
    name: collapseSpaces(item.name),
    description: (d.description && d.description.length >= (item.description || '').length ? d.description : item.description) || '',
    logo: item.logo || '',
    website: addHttps(links.website || ''),
    sourceUrl: item.url || '',
    location: d.Location || '',
    region: '',
    subregion: '',
    tags: [...new Set([d.Category, item.tag].filter(Boolean))],
    year: founded >= 1990 && founded <= 2100 ? founded : '',
    program: /^\d+$/.test(batch) ? `SparkLabs Batch ${batch}` : 'SparkLabs',
    programSlugs: ['sparklabs'],
    isExit: /^exit/i.test(status),
    isUnicorn: false,
    isBCorp: false,
    isCurrentSession: false,
    founders: ceo ? [{ name: ceo, role: 'CEO', linkedin: '' }] : [],
    social: { linkedin: addHttps(links.linkedin || ''), twitter: addHttps(links.twitter || ''), facebook: addHttps(links.facebook || ''), crunchbase: '' },
    // SparkLabs Korea's portfolio is Korean unless the page says otherwise.
    extra: { country: d.Location || 'South Korea' },
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

async function fetchSparkLabs({ fetchFn = fetchWithTimeout, maxPages = MAX_PAGES, details = true } = {}) {
  const items = [];
  const seen = new Set();
  for (let page = 1; page <= maxPages; page++) {
    const url = `${BASE}?page=${page}`;
    const res = await fetchFn(url, { headers: HEADERS });
    if (!res.ok) {
      if (page === 1) throw new Error(`HTTP ${res.status} from ${url}`);
      break;
    }
    const fresh = parseList(await res.text()).filter((c) => !seen.has(c.slug));
    if (!fresh.length) break; // past the last page
    for (const c of fresh) {
      seen.add(c.slug);
      items.push(c);
    }
  }
  if (!items.length) throw new Error('SparkLabs portfolio returned no companies');
  const detailPages = details
    ? await mapLimit(items, DETAIL_CONCURRENCY, async (c) => {
        try {
          const res = await fetchFn(c.url, { headers: HEADERS });
          return res.ok ? parseDetail(await res.text()) : null;
        } catch (_) {
          return null;
        }
      })
    : [];
  return items.map((c, i) => normalizeSparkLabs(c, detailPages[i]));
}

module.exports = { fetchSparkLabs, parseList, parseDetail, normalizeSparkLabs, BASE };
