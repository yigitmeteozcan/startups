// Antler source. Unlike Techstars (Typesense) and YC (static JSON mirror),
// Antler has no public data API we can replay browserless, so we drive a
// stealth headless browser — the same approach as src/scraper.js for Techstars.
//
// Antler's portfolio (https://www.antler.co/portfolio) is a Webflow CMS grid
// with Finsweet client-side pagination, and the site additionally uses Algolia
// for search. We therefore try two paths and keep whichever yields more:
//   1. Intercept any Algolia/JSON responses the page fires and parse them.
//   2. Fall back to extracting the rendered Webflow company cards from the DOM.
//
// Cloudflare guards the site, so this must run from an environment that can
// actually reach antler.co (a residential IP or a CI runner with open egress) —
// exactly like `npm run build:data` already requires for Techstars.

const { toArray, addHttps } = require('../normalize');

// Lazily required inside scrapeAntler() so the browserless build path (and the
// other sources) never need Playwright installed just to import this module.
function getChromium() {
  return require('playwright').chromium;
}

const PORTFOLIO_URL = process.env.ANTLER_PORTFOLIO_URL || 'https://www.antler.co/portfolio';

const LAUNCH_OPTIONS = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled',
    '--disable-infobars',
    '--window-size=1920,1080',
  ],
};

const CONTEXT_OPTIONS = {
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1920, height: 1080 },
  locale: 'en-US',
  timezoneId: 'America/New_York',
  extraHTTPHeaders: {
    'Accept-Language': 'en-US,en;q=0.9',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  },
};

function normalizeAntler(raw) {
  // `raw` may be an Algolia hit (rich object) or a card scraped from the DOM.
  const d = raw || {};
  const tags = [
    ...toArray(d.sector),
    ...toArray(d.sectors),
    ...toArray(d.industry),
    ...toArray(d.industries),
    ...toArray(d.tags),
  ];
  const location =
    d.location ||
    [d.city, d.country].filter(Boolean).join(', ') ||
    d.country ||
    '';

  return {
    source: 'antler',
    name: d.name || d.company_name || d.title || '',
    description: d.description || d.one_liner || d.tagline || d.summary || '',
    logo: d.logo || d.logo_url || d.image || '',
    website: addHttps(d.website || d.url || d.homepage || ''),
    location,
    region: d.region || d.worldregion || '',
    subregion: '',
    tags: [...new Set(tags.filter(Boolean))],
    year: d.year || d.founded_year || d.cohort_year || '',
    program: d.location_program || d.program || d.cohort || 'Antler',
    programSlugs: ['antler'],
    isExit: !!d.is_exit,
    isUnicorn: !!d.is_unicorn,
    isBCorp: false,
    isCurrentSession: false,
    social: {
      linkedin: addHttps(d.linkedin || d.linkedin_url || ''),
      twitter: addHttps(d.twitter || d.twitter_url || ''),
      facebook: '',
      crunchbase: addHttps(d.crunchbase || d.crunchbase_url || ''),
    },
    extra: d,
  };
}

// Pull the largest array of company-like records out of any intercepted JSON
// (Algolia wraps results as { hits: [...] }).
function looksLikeCompany(o) {
  if (!o || typeof o !== 'object') return false;
  const keys = Object.keys(o).map((k) => k.toLowerCase());
  return keys.some((k) => ['name', 'company_name', 'title'].includes(k));
}

function findCompanyArray(value, depth = 0) {
  let best = null;
  if (depth > 8 || value == null) return best;
  if (Array.isArray(value)) {
    const matches = value.filter(looksLikeCompany);
    if (matches.length >= 3 && matches.length >= value.length / 2) best = value;
    for (const item of value) {
      const nested = findCompanyArray(item, depth + 1);
      if (nested && (!best || nested.length > best.length)) best = nested;
    }
    return best;
  }
  if (typeof value === 'object') {
    for (const v of Object.values(value)) {
      const nested = findCompanyArray(v, depth + 1);
      if (nested && (!best || nested.length > best.length)) best = nested;
    }
  }
  return best;
}

async function autoScroll(page, { maxRounds = 120, idleLimit = 5 } = {}) {
  let lastHeight = 0;
  let idle = 0;
  for (let round = 0; round < maxRounds; round++) {
    const height = await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      return document.body.scrollHeight;
    });
    // Click Finsweet / Webflow "load more" controls if present.
    try {
      const btn = page.locator(
        'a:has-text("Load more"), button:has-text("Load more"), a:has-text("Show more"), [fs-cmsload-element="load-more"]'
      );
      if (await btn.first().isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.first().click({ timeout: 2000 }).catch(() => {});
      }
    } catch (_) {}
    await page.waitForTimeout(900);
    if (height === lastHeight) {
      if (++idle >= idleLimit) break;
    } else {
      idle = 0;
      lastHeight = height;
    }
  }
}

async function extractCards(page) {
  return page.evaluate(() => {
    const candidateSelectors = [
      '[class*="portfolio-item"]',
      '[class*="portfolio_item"]',
      '[class*="portfolio-card"]',
      '[class*="company-card"]',
      '[class*="company_item"]',
      '[role="listitem"]',
      '.w-dyn-item',
      'article',
    ];
    let cards = [];
    for (const sel of candidateSelectors) {
      const found = Array.from(document.querySelectorAll(sel));
      if (found.length > 5) {
        cards = found;
        break;
      }
    }
    const seen = new Set();
    const out = [];
    for (const card of cards) {
      const logoEl = card.querySelector('img');
      const linkEl = card.querySelector('a[href]') || card.closest('a[href]');
      const name =
        card.querySelector('[class*="name"], [class*="title"], h2, h3, h4')?.innerText?.trim() ||
        logoEl?.alt?.trim() ||
        '';
      const description =
        card.querySelector('[class*="description"], [class*="desc"], [class*="excerpt"], p')
          ?.innerText?.trim() || '';
      const location =
        card.querySelector('[class*="location"], [class*="country"], [class*="city"]')
          ?.innerText?.trim() || '';
      const tags = Array.from(
        card.querySelectorAll('[class*="tag"], [class*="sector"], [class*="category"], [class*="badge"]')
      )
        .map((el) => el.innerText.trim())
        .filter(Boolean);
      const logo = logoEl?.src || logoEl?.getAttribute('data-src') || '';
      const website = linkEl?.href || '';
      if (!name && !logo) continue;
      const key = `${name}|${website}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ name, description, location, tags, logo, website });
    }
    return out;
  });
}

async function scrapeAntler({ debug = false } = {}) {
  let browser;
  try {
    browser = await getChromium().launch(LAUNCH_OPTIONS);
    const context = await browser.newContext(CONTEXT_OPTIONS);
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.chrome = { runtime: {} };
    });

    const page = await context.newPage();

    // Capture intercepted JSON (Algolia or any backing API).
    const captured = [];
    page.on('response', async (response) => {
      const type = response.headers()['content-type'] || '';
      if (!type.includes('application/json')) return;
      try {
        captured.push(await response.json());
      } catch (_) {}
    });

    await page.goto(PORTFOLIO_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    await autoScroll(page);
    await page.waitForTimeout(1500);

    // Path 1: intercepted API JSON.
    let apiArray = null;
    for (const json of captured) {
      const arr = findCompanyArray(json);
      if (arr && (!apiArray || arr.length > apiArray.length)) apiArray = arr;
    }

    // Path 2: rendered DOM cards.
    const domCards = await extractCards(page);

    const useApi = apiArray && apiArray.length >= domCards.length && apiArray.length > 0;
    const rows = useApi ? apiArray : domCards;
    const companies = rows.map(normalizeAntler).filter((c) => c.name);

    const result = { source: useApi ? 'antler-api' : 'antler-dom', count: companies.length, companies };
    if (debug) {
      result.debug = { apiCount: apiArray ? apiArray.length : 0, domCount: domCards.length };
    }
    return result;
  } finally {
    if (browser) await browser.close();
  }
}

// Convenience wrapper matching the other sources' `fetch*` signature.
async function fetchAntler(opts = {}) {
  const { companies } = await scrapeAntler(opts);
  return companies;
}

module.exports = { scrapeAntler, fetchAntler, normalizeAntler, PORTFOLIO_URL };
