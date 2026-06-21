const { chromium } = require('playwright');

const PORTFOLIO_URL = 'https://www.techstars.com/portfolio';

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

async function autoScroll(page, { maxRounds = 80, idleLimit = 4 } = {}) {
  let lastHeight = 0;
  let idle = 0;

  for (let round = 0; round < maxRounds; round++) {
    // Scroll to the bottom to trigger lazy-load / infinite scroll.
    const height = await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      return document.body.scrollHeight;
    });

    // Try to click any "load more" / "show more" button if present.
    try {
      const btn = page.locator(
        'button:has-text("Load more"), button:has-text("Show more"), button:has-text("View more"), a:has-text("Load more")'
      );
      if (await btn.first().isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.first().click({ timeout: 2000 }).catch(() => {});
      }
    } catch (_) {}

    await page.waitForTimeout(1000);

    if (height === lastHeight) {
      idle++;
      if (idle >= idleLimit) break; // page height stable -> assume fully loaded
    } else {
      idle = 0;
      lastHeight = height;
    }
  }
}

async function waitForCompanies(page) {
  // Try multiple selectors that Techstars might use
  const selectors = [
    '[class*="portfolio"]',
    '[class*="company"]',
    '[class*="card"]',
    '[data-company]',
    'article',
  ];

  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 8000 });
      const count = await page.locator(selector).count();
      if (count > 5) return selector;
    } catch (_) {
      // try next
    }
  }
  return null;
}

async function extractCompanies(page) {
  return page.evaluate(() => {
    const results = [];

    // Techstars portfolio grid — try several known patterns
    const candidateSelectors = [
      '[class*="PortfolioCard"]',
      '[class*="portfolio-card"]',
      '[class*="CompanyCard"]',
      '[class*="company-card"]',
      '[class*="portfolio_card"]',
      '[class*="company_card"]',
      '[class*="card"]',
      'article',
      'li[class*="company"]',
      'li[class*="portfolio"]',
    ];

    let cards = [];
    for (const sel of candidateSelectors) {
      const found = Array.from(document.querySelectorAll(sel));
      if (found.length > 5) {
        cards = found;
        break;
      }
    }

    if (cards.length === 0) {
      // Last resort: find all anchor-wrapped images with nearby text
      cards = Array.from(document.querySelectorAll('a[href]')).filter((a) => {
        return a.querySelector('img') && a.innerText.trim().length > 3;
      });
    }

    const seen = new Set();

    for (const card of cards) {
      const logoEl = card.querySelector('img');
      const logo = logoEl?.src || logoEl?.getAttribute('data-src') || '';

      const linkEl = card.closest('a') || card.querySelector('a');
      const website = linkEl?.href || '';

      // The Techstars cards render text as "CompanyName(Techstars 2012)".
      // Prefer an explicit name/title element; otherwise parse the card text.
      let name =
        card.querySelector('[class*="name"], [class*="title"], h2, h3, h4')
          ?.innerText?.trim() || '';

      // Logo alt text is often the cleanest source of the company name.
      if (!name && logoEl?.alt) name = logoEl.alt.trim();

      let year = '';
      let program = '';

      const fullText = (card.innerText || '').replace(/\s+/g, ' ').trim();

      // Parse "(Techstars 2012)" / "(Powered by Techstars 2019)" style suffix.
      const cohortMatch = fullText.match(/\(([^()]*?Techstars[^()]*?)\)/i);
      if (cohortMatch) {
        program = cohortMatch[1].trim();
        const y = program.match(/(19|20)\d{2}/);
        if (y) year = y[0];
      }

      // If we still don't have a clean name, derive it from the full text by
      // stripping the cohort suffix.
      if (!name && fullText) {
        name = fullText.replace(/\([^()]*?Techstars[^()]*?\)/i, '').trim();
      }

      const description =
        card
          .querySelector('[class*="description"], [class*="desc"], p')
          ?.innerText?.trim() || '';

      const location =
        card
          .querySelector('[class*="location"], [class*="city"]')
          ?.innerText?.trim() || '';

      const tags = Array.from(
        card.querySelectorAll('[class*="tag"], [class*="badge"], [class*="sector"]')
      )
        .map((el) => el.innerText.trim())
        .filter(Boolean);

      if (!name && !logo) continue;

      // De-dupe on name+website (cards can appear more than once in the DOM).
      const key = `${name}|${website}`;
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({
        name,
        description: description && description !== fullText ? description : '',
        logo,
        website,
        location,
        tags,
        year,
        program,
      });
    }

    return results;
  });
}

async function interceptApiResponse(page) {
  const captured = [];
  const endpoints = [];
  let typesense = null; // { url, apiKey, method, postData }

  // The Techstars portfolio is backed by a Typesense search cluster. Capture
  // the request so we can replay it directly (with the search-only API key,
  // which the site exposes client-side) and page through every company.
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('typesense.net') && url.includes('/documents/search')) {
      const headers = request.headers();
      typesense = {
        url,
        apiKey:
          headers['x-typesense-api-key'] ||
          new URL(url).searchParams.get('x-typesense-api-key') ||
          null,
        method: request.method(),
        postData: request.postData() || null,
      };
    }
  });

  page.on('response', async (response) => {
    const url = response.url();
    const type = response.headers()['content-type'] || '';
    if (!type.includes('application/json')) return;

    try {
      const json = await response.json();
      endpoints.push(url);
      captured.push({ url, data: json });
    } catch (_) {}
  });

  return { captured, endpoints, getTypesense: () => typesense };
}

// Replay the Typesense search directly, paging through all results.
async function fetchAllFromTypesense(ts) {
  if (!ts || !ts.apiKey) return null;

  const base = new URL(ts.url);
  base.searchParams.set('per_page', '250'); // Typesense max page size
  base.searchParams.set('max_facet_values', '1'); // we don't need facets here
  base.searchParams.delete('x-typesense-api-key'); // send via header instead

  const headers = { 'x-typesense-api-key': ts.apiKey };
  const all = [];
  let page = 1;
  let found = Infinity;

  while (all.length < found && page <= 500) {
    base.searchParams.set('page', String(page));
    const res = await fetch(base.toString(), { headers });
    if (!res.ok) {
      if (page === 1) return null; // couldn't start -> let caller fall back
      break;
    }
    const json = await res.json();
    found = typeof json.found === 'number' ? json.found : all.length;
    const hits = (json.hits || []).map((h) => h.document || h);
    if (hits.length === 0) break;
    all.push(...hits);
    page++;
  }

  return all;
}

function looksLikeCompany(obj) {
  if (!obj || typeof obj !== 'object') return false;
  // Typesense wraps each result as { document: {...}, highlight, text_match }.
  const o = obj.document && typeof obj.document === 'object' ? obj.document : obj;
  const keys = Object.keys(o).map((k) => k.toLowerCase());
  const hasName = keys.some((k) =>
    ['name', 'company_name', 'companyname', 'title'].includes(k)
  );
  const hasMeta = keys.some((k) =>
    [
      'website', 'url', 'homepage', 'logo', 'logo_url', 'description',
      'brief_description', 'tagline', 'location', 'city',
    ].includes(k)
  );
  return hasName && hasMeta;
}

// Recursively walk any JSON value and collect the largest array whose items
// look like company records. This makes us resilient to the exact API shape.
function findCompanyArray(value, depth = 0) {
  let best = null;
  if (depth > 8 || value == null) return best;

  if (Array.isArray(value)) {
    const matches = value.filter(looksLikeCompany);
    if (matches.length >= 3 && matches.length >= value.length / 2) {
      best = value;
    }
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

function normalizeApiData(apiResponses) {
  let best = null;
  for (const { data } of apiResponses) {
    const arr = findCompanyArray(data);
    if (arr && (!best || arr.length > best.length)) best = arr;
  }
  return best ? best.map(normalizeCompany) : null;
}

function toArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v.filter(Boolean) : [v].filter(Boolean);
}

function normalizeCompany(raw) {
  // Unwrap Typesense hit wrappers if present.
  const d = raw.document && typeof raw.document === 'object' ? raw.document : raw;

  const location =
    [d.city, d.state_province, d.country].filter(Boolean).join(', ') ||
    d.location ||
    d.headquarters ||
    '';

  const tags = [
    ...toArray(d.industry_vertical),
    ...toArray(d.tags),
    ...toArray(d.categories),
    ...toArray(d.sectors),
  ];

  const program = toArray(d.program_names).join(', ') ||
    d.program || d.cohort || d.accelerator || '';

  return {
    name: d.company_name || d.name || d.title || '',
    description:
      d.brief_description || d.description || d.short_description ||
      d.tagline || d.bio || '',
    logo: d.logo || d.logo_url || d.image || d.thumbnail || '',
    website: d.website || d.url || d.homepage || d.website_url || '',
    location,
    region: d.worldregion || '',
    tags: [...new Set(tags)],
    year: d.first_session_year || d.year || d.founded_year || d.cohort_year || '',
    program,
    isExit: d.is_exit ?? undefined,
    isUnicorn: d.is_1b ?? undefined,
    isBCorp: d.is_bcorp ?? undefined,
    extra: d,
  };
}

async function scrapePortfolio({ filters = {}, debug = false } = {}) {
  let browser;
  try {
    browser = await chromium.launch(LAUNCH_OPTIONS);
    const context = await browser.newContext(CONTEXT_OPTIONS);

    // Hide webdriver flag
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.chrome = { runtime: {} };
    });

    const page = await context.newPage();
    const { captured, endpoints, getTypesense } = await interceptApiResponse(page);

    // Apply filters via URL params if supported.
    const target = new URL(PORTFOLIO_URL);
    for (const [k, v] of Object.entries(filters)) target.searchParams.set(k, v);

    await page.goto(target.toString(), { waitUntil: 'networkidle', timeout: 60000 });
    await waitForCompanies(page);
    // Give the Typesense search request a moment to fire.
    await page.waitForTimeout(2000);

    // FAST PATH: replay the Typesense search directly and page through everything.
    const ts = getTypesense();
    const direct = await fetchAllFromTypesense(ts).catch(() => null);
    if (direct && direct.length > 0) {
      const companies = direct.map(normalizeCompany);
      const result = { source: 'typesense', count: companies.length, companies };
      if (debug) {
        result.debug = {
          typesenseUrl: ts.url,
          hasApiKey: !!ts.apiKey,
          fetched: companies.length,
        };
      }
      return result;
    }

    // FALLBACK: scroll to trigger lazy-load, then use intercepted JSON or DOM.
    await autoScroll(page);
    await page.waitForTimeout(2000);

    const normalized = normalizeApiData(captured);
    const apiCount = normalized ? normalized.length : 0;
    const domCompanies = await extractCompanies(page);

    const useApi = apiCount >= domCompanies.length && apiCount > 0;
    const result = useApi
      ? { source: 'api', count: normalized.length, companies: normalized }
      : { source: 'dom', count: domCompanies.length, companies: domCompanies };

    if (debug) {
      result.debug = {
        jsonEndpoints: [...new Set(endpoints)],
        apiCount,
        domCount: domCompanies.length,
        typesenseFound: !!(ts && ts.apiKey),
      };
    }

    return result;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapePortfolio };
