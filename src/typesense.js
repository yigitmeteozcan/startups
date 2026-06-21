// Browserless Typesense client. The Techstars portfolio is backed by a public
// Typesense Cloud cluster; security is the scoped, read-only search API key
// (which the site exposes client-side), not IP allowlisting. That means we can
// query it directly from anywhere — including CI runners — without a browser.

const { normalizeCompany } = require('./normalize');

// Defaults captured from the live portfolio page. Override via env if they change.
const HOST =
  process.env.TYPESENSE_HOST ||
  'https://8gbms7c94riane0lp-1.a1.typesense.net';
const COLLECTION = process.env.TYPESENSE_COLLECTION || 'companies';

// The search-only key is public (it ships in the page's JS). Prefer env so it
// can be rotated without a code change; fall back to the committed default.
const API_KEY = process.env.TYPESENSE_API_KEY || '';

const QUERY_BY =
  'company_name,brief_description,city,state_province,country,worldregion,program_names,industry_vertical';

function buildSearchUrl({ page, perPage }) {
  const url = new URL(`${HOST}/collections/${COLLECTION}/documents/search`);
  url.searchParams.set('q', '');
  url.searchParams.set('query_by', QUERY_BY);
  url.searchParams.set('filter_by', 'is_accelerator_company:=true');
  url.searchParams.set('sort_by', 'website_order:asc');
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('page', String(page));
  return url.toString();
}

// Fetch every company from Typesense, paging through all results.
async function fetchAllCompanies({ apiKey = API_KEY, perPage = 250 } = {}) {
  if (!apiKey) {
    throw new Error(
      'No Typesense API key. Set TYPESENSE_API_KEY (the public search-only key from the portfolio page).'
    );
  }

  const headers = { 'x-typesense-api-key': apiKey };
  const all = [];
  let page = 1;
  let found = Infinity;

  while (all.length < found && page <= 1000) {
    const res = await fetch(buildSearchUrl({ page, perPage }), { headers });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Typesense ${res.status} on page ${page}: ${body.slice(0, 200)}`);
    }
    const json = await res.json();
    found = typeof json.found === 'number' ? json.found : all.length;
    const hits = (json.hits || []).map((h) => h.document || h);
    if (hits.length === 0) break;
    all.push(...hits);
    page++;
  }

  return all.map(normalizeCompany);
}

module.exports = { fetchAllCompanies, HOST, COLLECTION };
