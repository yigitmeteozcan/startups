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

  const program =
    toArray(d.program_names).join(', ') ||
    d.program ||
    d.cohort ||
    d.accelerator ||
    '';

  return {
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

module.exports = { toArray, addHttps, normalizeCompany };
