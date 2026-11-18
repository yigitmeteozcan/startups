// Y Combinator source. YC publishes its full company directory as static JSON
// via the community-maintained `yc-oss/api` mirror, so we can pull it
// browserless (CI-friendly) from raw GitHub — no key, no rate limit.
//
// Each raw YC record is mapped into the shared company shape used across every
// source, with the original record preserved under `extra`.

const { toArray, addHttps } = require('../normalize');
const { fetchWithTimeout } = require('../http');

const YC_URL =
  process.env.YC_API_URL ||
  'https://raw.githubusercontent.com/yc-oss/api/main/companies/all.json';

// "Summer 2009" / "Winter 2012" / "IK12" -> 2009 / 2012 / 2012
function batchYear(batch) {
  const m = String(batch || '').match(/(19|20)\d{2}/) || String(batch || '').match(/(\d{2})$/);
  if (!m) return '';
  const y = m[0].length === 2 ? Number(m[0]) + 2000 : Number(m[0]);
  return y >= 2000 && y <= 2100 ? y : '';
}

// YC uses a site-relative placeholder ("/company/thumb/missing.png") for
// companies without a logo; make every logo an absolute URL.
function absoluteLogo(url) {
  if (!url) return '';
  if (url.startsWith('/') && !url.startsWith('//')) return `https://www.ycombinator.com${url}`;
  return addHttps(url);
}

// YC's status -> lowercase: "active" | "inactive" | "acquired" | "public".
function ycStatus(s) {
  const v = String(s || '').trim().toLowerCase();
  return ['active', 'inactive', 'acquired', 'public'].includes(v) ? v : '';
}

function normalizeYc(d) {
  const tags = [...new Set([...toArray(d.industries), ...toArray(d.tags)])];
  const batch = d.batch && d.batch !== 'Unspecified' ? d.batch : '';

  return {
    source: 'yc',
    name: d.name || '',
    description: d.one_liner || d.long_description || '',
    logo: absoluteLogo(d.small_logo_thumb_url || ''),
    website: addHttps(d.website || ''),
    // The company's page on ycombinator.com (founders are read from it).
    sourceUrl: d.url || (d.slug ? `https://www.ycombinator.com/companies/${d.slug}` : ''),
    location: d.all_locations || '',
    region: toArray(d.regions)[0] || '',
    subregion: '',
    tags,
    year: batchYear(d.batch),
    // Use the batch as the "program" so by-program slices stay meaningful
    // across sources (e.g. "YC Summer 2009").
    program: batch ? `YC ${batch}` : 'Y Combinator',
    programSlugs: batch ? [`yc-${batch.toLowerCase().replace(/\s+/g, '-')}`] : ['y-combinator'],
    // YC marks acquisitions and IPOs via `status`.
    isExit: d.status === 'Acquired' || d.status === 'Public',
    isUnicorn: false, // YC does not expose a $1B+ flag
    isBCorp: false,
    isCurrentSession: false,
    // Extra detail YC publishes for every company.
    status: ycStatus(d.status),
    teamSize: Number.isFinite(d.team_size) && d.team_size > 0 ? d.team_size : null,
    isHiring: d.isHiring === true,
    stage: d.stage === 'Early' || d.stage === 'Growth' ? d.stage : '',
    topCompany: d.top_company === true,
    nonprofit: d.nonprofit === true,
    founders: [],
    social: {
      linkedin: '',
      twitter: '',
      facebook: '',
      crunchbase: '',
    },
    extra: d,
  };
}

async function fetchYc({ url = YC_URL } = {}) {
  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`YC fetch ${res.status}: ${body.slice(0, 200)}`);
  }
  const raw = await res.json();
  if (!Array.isArray(raw)) throw new Error('YC response was not an array');
  return raw.map(normalizeYc);
}

module.exports = { fetchYc, normalizeYc, absoluteLogo, ycStatus, YC_URL };
