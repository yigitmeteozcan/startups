// Entrepreneur First (joinef.com). WordPress site; the portfolio renders the
// first page of company tiles server-side and loads the rest via admin-ajax
// ("load more"). We therefore:
//   1. Parse the first page's HTML (featured + first batch of tiles), then
//   2. Page through the rest by POSTing to admin-ajax.php. The exact AJAX action
//      name isn't published, so we auto-discover it (try the standard names,
//      keep whichever returns `.tile--company` HTML) and reuse it.
// Falls back to the shared stealth-browser scraper if everything is blocked.

const { normalizeRecord, makeBrowserSource } = require('./browser-portfolio');

const BASE_URL = process.env.EF_PORTFOLIO_URL || 'https://www.joinef.com/portfolio/';
const AJAX_URL = process.env.EF_AJAX_URL || 'https://www.joinef.com/wp-admin/admin-ajax.php';
const MAX_PAGES = Number(process.env.EF_MAX_PAGES || 40);

// Featured company IDs are excluded from the paged "all" query (they render in
// their own section). Captured from the page; staleness is harmless (dedup).
const FEATURED_NOT_IN = [
  12720, 12721, 12722, 12723, 12724, 12725, 12727, 12728, 12729, 12730, 12731, 12732,
  12733, 12734, 12735, 12736, 12737, 12738, 12739, 12740, 12741, 12742, 12743, 13192,
];

const BASE_QUERY = {
  post_type: 'company',
  post_status: 'publish',
  post__not_in: FEATURED_NOT_IN,
  orderby: 'menu_order',
  order: 'ASC',
  posts_per_page: 24,
};

// Standard WordPress "load more" action names to probe.
const AJAX_ACTIONS = [
  'loadmore',
  'load_more',
  'load_more_posts',
  'filter',
  'filter_posts',
  'ajax_filter',
  'get_posts',
  'more_posts',
  'load_companies',
  'filter_companies',
];

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const browser = makeBrowserSource({ source: 'ef', url: BASE_URL, program: 'Entrepreneur First' });

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

// Parse `.tile--company` blocks out of a chunk of portfolio HTML.
function parseTiles(html) {
  const out = [];
  const blocks = String(html || '').split('class="tile tile--company');
  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i];
    const name = (b.match(/data-companyname="([^"]*)"/) || [])[1];
    if (!name) continue;
    const slug = (b.match(/data-companyslug="([^"]*)"/) || [])[1] || '';
    const description = (b.match(/tile__description[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '';
    const location =
      (b.match(/locationtag[^>]*>\s*<span class="linkline">([\s\S]*?)<\/span>/) || [])[1] || '';
    const industries = [
      ...b.matchAll(/categorytag[^>]*>\s*<span class="linkline">([\s\S]*?)<\/span>/g),
    ].map((m) => decodeEntities(m[1]));
    const yearMatch = b.match(/Founded<\/div>[\s\S]*?meta__row__name[^>]*>\s*(\d{4})\s*</);
    const year = yearMatch ? Number(yearMatch[1]) : '';
    const isExit = /Exited to<\/div>/.test(b);

    // Founders: each `meta__row` pairs a role with a person (LinkedIn-linked).
    const founders = [];
    for (const row of b.split('class="meta__row ')) {
      const role = (row.match(/meta__row__role[^>]*>([\s\S]*?)<\/div>/) || [])[1];
      const link = row.match(/meta__row__founder[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
      if (link) {
        founders.push({
          name: decodeEntities(link[2]),
          role: decodeEntities(role || ''),
          linkedin: link[1],
        });
      }
    }
    // "Funded by" / "Exited to" investor or acquirer.
    const investor =
      (b.match(/(?:Funded by|Exited to)<\/div>[\s\S]*?meta__row__name[^>]*>([\s\S]*?)<\/div>/) ||
        [])[1] || '';

    out.push({
      name: decodeEntities(name),
      slug,
      description: decodeEntities(description),
      location: decodeEntities(location),
      industries,
      year,
      is_exit: isExit,
      founders,
      investor: decodeEntities(investor),
    });
  }
  return out;
}

async function getText(url, opts = {}) {
  const res = await fetch(url, opts).catch(() => null);
  if (!res || !res.ok) return null;
  return res.text();
}

// POST the load-more query for a given page; returns tile HTML or null.
async function postAjax(action, page) {
  const query = { ...BASE_QUERY, paged: page };
  const body = new URLSearchParams();
  body.set('action', action);
  // Cover the common field-name variants in one shot (unknown ones are ignored).
  body.set('query', JSON.stringify(query));
  body.set('posts', JSON.stringify(query));
  body.set('page', String(page));
  body.set('paged', String(page));
  body.set('current_page', String(page));
  const html = await getText(AJAX_URL, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  return html && html.includes('tile--company') ? html : null;
}

async function fetchEf({ maxPages = MAX_PAGES } = {}) {
  const all = [];
  const seen = new Set();
  const add = (tiles) => {
    let added = 0;
    for (const t of tiles) {
      const key = t.slug || t.name;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      all.push(t);
      added++;
    }
    return added;
  };

  // 1) First page (featured + first batch) from the rendered HTML.
  const firstHtml = await getText(BASE_URL, { headers: HEADERS });
  if (firstHtml) add(parseTiles(firstHtml));

  // 2) Remaining pages via admin-ajax; discover the working action once.
  let action = null;
  for (let page = 2; page <= maxPages; page++) {
    let html = null;
    if (action) {
      html = await postAjax(action, page);
    } else {
      for (const a of AJAX_ACTIONS) {
        html = await postAjax(a, page);
        if (html) {
          action = a;
          break;
        }
      }
    }
    if (!html) break; // AJAX unavailable or no more pages
    if (add(parseTiles(html)) === 0) break; // nothing new -> end of list
  }

  if (all.length === 0) return browser.fetch(); // everything blocked -> browser
  return all.map((d) => normalizeRecord(d, { source: 'ef', program: 'Entrepreneur First' }));
}

module.exports = { fetchEf, scrapeEf: browser.scrape, parseTiles, BASE_URL };
