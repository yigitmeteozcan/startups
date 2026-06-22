// Shared company-normalization logic, used by both the browser scraper and the
// browserless Typesense fetch (so the CI path doesn't depend on Playwright).

function toArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v.filter(Boolean) : [v].filter(Boolean);
}

function addHttps(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
}

// Tags that aren't industries — business models, funding stages, work-styles,
// and filler — which leak into the tag lists from various sources.
const TAG_DENY = new Set(
  [
    'b2b', 'b2c', 'b2b2c', 'b2b2b', 'b2g', 'c2c', 'd2c', 'p2p',
    'pre-seed', 'preseed', 'seed', 'pre-series a', 'series a', 'series b', 'series c',
    'series d', 'series e', 'series f', 'series g', 'growth', 'early', 'late stage',
    'late', 'ipo', 'public', 'private', 'acquired', 'active', 'inactive', 'dead',
    'exit', 'exited', 'unicorn',
    'remote', 'partly remote', 'fully remote', 'hybrid', 'onsite', 'distributed',
    'other', 'others', 'n/a', 'na', 'none', 'unknown', 'unspecified', 'general', '-',
  ].map((s) => s.toLowerCase())
);

// Country / region names should not appear as industries (they leak in from
// scraped meta blocks). Kept lowercase for case-insensitive matching.
const TAG_COUNTRIES = new Set(
  [
    'united states', 'united states of america', 'usa', 'us', 'america', 'canada',
    'united kingdom', 'uk', 'england', 'scotland', 'ireland', 'france', 'germany',
    'spain', 'portugal', 'italy', 'netherlands', 'belgium', 'switzerland', 'austria',
    'sweden', 'norway', 'denmark', 'finland', 'poland', 'czech republic', 'greece',
    'turkey', 'türkiye', 'russia', 'ukraine', 'romania', 'hungary', 'estonia', 'latvia',
    'lithuania', 'israel', 'united arab emirates', 'uae', 'saudi arabia', 'qatar',
    'egypt', 'south africa', 'nigeria', 'kenya', 'ghana', 'morocco', 'india', 'pakistan',
    'bangladesh', 'sri lanka', 'china', 'hong kong', 'taiwan', 'japan', 'south korea',
    'korea', 'singapore', 'malaysia', 'indonesia', 'thailand', 'vietnam', 'philippines',
    'australia', 'new zealand', 'mexico', 'brazil', 'argentina', 'chile', 'colombia',
    'peru', 'uruguay', 'ecuador', 'bolivia', 'remote', 'global', 'europe', 'asia',
    'africa', 'north america', 'south america', 'latin america', 'middle east',
    'apac', 'emea', 'mena', 'southeast asia', 'south asia', 'north asia',
    'bangalore', 'berlin', 'london', 'new york', 'san francisco', 'paris', 'toronto',
    'external',
  ].map((s) => s.toLowerCase())
);

// Normalize a raw tag list into clean industry-ish tags: split mashed
// multi-line values, drop years/numbers, business models, stages, and
// country/region names, then de-duplicate case-insensitively.
function cleanTags(tags) {
  const out = [];
  const seen = new Set();
  for (const raw of toArray(tags)) {
    // Scraped meta blocks sometimes mash country + industry + year with newlines.
    for (const piece of String(raw).split(/[\n\r]+/)) {
      const t = piece.replace(/\s+/g, ' ').trim();
      if (!t) continue;
      const low = t.toLowerCase();
      if (TAG_DENY.has(low) || TAG_COUNTRIES.has(low)) continue;
      if (/^\d+$/.test(t)) continue; // pure numbers / years
      if (/^(19|20)\d{2}$/.test(t)) continue;
      if (seen.has(low)) continue;
      seen.add(low);
      out.push(t);
    }
  }
  return out;
}

function normalizeCompany(raw, source = 'techstars') {
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

  const program =
    toArray(d.program_names).join(', ') ||
    d.program ||
    d.cohort ||
    d.accelerator ||
    '';

  return {
    source,
    name: d.company_name || d.name || d.title || '',
    description:
      d.brief_description || d.description || d.short_description ||
      d.tagline || d.bio || '',
    logo: d.logo_url || d.logo || d.image || d.thumbnail || '',
    website: addHttps(d.website || d.url || d.homepage || d.website_url || ''),
    location,
    region: d.worldregion || '',
    subregion: d.worldsubregion || '',
    tags: [...new Set(tags)],
    year: d.first_session_year || d.year || d.founded_year || d.cohort_year || '',
    program,
    programSlugs: toArray(d.program_slugs),
    isExit: d.is_exit ?? false,
    isUnicorn: d.is_1b ?? false,
    isBCorp: d.is_bcorp ?? false,
    isCurrentSession: d.is_current_session ?? false,
    social: {
      linkedin: addHttps(d.linkedin_url || ''),
      twitter: addHttps(d.twitter_url || ''),
      facebook: addHttps(d.facebook_url || ''),
      crunchbase: addHttps(d.crunchbase_url || ''),
    },
    extra: d,
  };
}

module.exports = { toArray, addHttps, normalizeCompany, cleanTags };
