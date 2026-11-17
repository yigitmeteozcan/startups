// Filtering, sorting and pagination for the REST API. Pure functions over the
// company list so they are easy to test.

const MAX_PARAM_LENGTH = 200;
const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 50;

// Query values can arrive as strings, arrays (?a=1&a=2) or objects (?a[b]=1).
function str(v) {
  if (Array.isArray(v)) v = v[0];
  if (v == null || typeof v === 'object') return '';
  return String(v).trim().slice(0, MAX_PARAM_LENGTH);
}

function list(v) {
  return str(v)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// true / false / null (not set). Accepts 1/0, yes/no.
function bool(v) {
  const s = str(v).toLowerCase();
  if (['true', '1', 'yes'].includes(s)) return true;
  if (['false', '0', 'no'].includes(s)) return false;
  return null;
}

function int(v) {
  const n = parseInt(str(v), 10);
  return Number.isNaN(n) ? null : n;
}

// Lower-cased text each company is searched against.
function haystack(c) {
  return [
    c.name,
    (c.formerNames || []).join(' '),
    c.description,
    (c.tags || []).join(' '),
    c.location,
    c.country,
    c.region,
    c.program,
    c.source,
    (c.founders || []).map((f) => f && f.name).join(' '),
  ]
    .filter(Boolean)
    .join('\n') // separator no search term can span
    .toLowerCase();
}

function yearOf(c) {
  const y = parseInt(c.year, 10);
  return Number.isNaN(y) ? null : y;
}

// Parse request query params into a normalized filter object.
function parseFilters(q = {}) {
  return {
    search: str(q.search || q.q).toLowerCase().split(/\s+/).filter(Boolean),
    source: list(q.source),
    industry: list(q.industry),
    tag: str(q.tag).toLowerCase(),
    country: list(q.country),
    region: list(q.region),
    location: str(q.location).toLowerCase(),
    program: str(q.program).toLowerCase(),
    year: list(q.year).map(Number).filter((n) => !Number.isNaN(n)),
    yearFrom: int(q.yearFrom),
    yearTo: int(q.yearTo),
    isUnicorn: bool(q.unicorn ?? q.isUnicorn),
    isExit: bool(q.exit ?? q.isExit),
    isBCorp: bool(q.bcorp ?? q.isBCorp),
    isCurrentSession: bool(q.current ?? q.isCurrentSession),
    hasFounders: bool(q.hasFounders),
    sort: str(q.sort),
  };
}

function filterCompanies(companies, f, haystacks = null) {
  return companies.filter((c, i) => {
    if (f.search.length) {
      const h = haystacks ? haystacks[i] : haystack(c);
      if (!f.search.every((t) => h.includes(t))) return false;
    }
    if (f.source.length && !f.source.includes(String(c.source).toLowerCase())) return false;
    if (f.industry.length) {
      const tags = (c.tags || []).map((t) => t.toLowerCase());
      if (!f.industry.some((t) => tags.includes(t))) return false;
    }
    if (f.tag && !(c.tags || []).some((t) => t.toLowerCase().includes(f.tag))) return false;
    if (f.country.length && !f.country.includes(String(c.country || '').toLowerCase())) return false;
    if (f.region.length && !f.region.includes(String(c.region || '').toLowerCase())) return false;
    if (f.location) {
      const loc = [c.location, c.country, c.extra && c.extra.city].filter(Boolean).join(' ').toLowerCase();
      if (!loc.includes(f.location)) return false;
    }
    if (f.program && !String(c.program || '').toLowerCase().includes(f.program)) return false;
    if (f.year.length || f.yearFrom != null || f.yearTo != null) {
      const y = yearOf(c);
      if (y == null) return false;
      if (f.year.length && !f.year.includes(y)) return false;
      if (f.yearFrom != null && y < f.yearFrom) return false;
      if (f.yearTo != null && y > f.yearTo) return false;
    }
    for (const flag of ['isUnicorn', 'isExit', 'isBCorp', 'isCurrentSession']) {
      if (f[flag] != null && !!c[flag] !== f[flag]) return false;
    }
    if (f.hasFounders != null && ((c.founders || []).length > 0) !== f.hasFounders) return false;
    return true;
  });
}

const byName = (a, b) =>
  String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });

// Undated companies always sink to the bottom, in both directions.
const byYear = (dir) => (a, b) => {
  const ya = yearOf(a);
  const yb = yearOf(b);
  if (ya === null && yb === null) return 0;
  if (ya === null) return 1;
  if (yb === null) return -1;
  return dir * (ya - yb);
};

function sortCompanies(companies, mode) {
  const out = companies.slice();
  if (mode === 'name-asc') out.sort(byName);
  else if (mode === 'name-desc') out.sort((a, b) => byName(b, a));
  else if (mode === 'year-asc') out.sort(byYear(1));
  else if (mode === 'year-desc') out.sort(byYear(-1));
  return out;
}

function paginate(items, q = {}) {
  const page = Math.max(1, int(q.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, int(q.limit) || DEFAULT_LIMIT));
  const total = items.length;
  return {
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    items: items.slice((page - 1) * limit, page * limit),
  };
}

// Every filter value with its count, for building UIs.
function facets(companies) {
  const count = (keyFn) => {
    const m = new Map();
    for (const c of companies) {
      for (const k of [].concat(keyFn(c)).filter((x) => x !== '' && x != null)) {
        m.set(k, (m.get(k) || 0) + 1);
      }
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([value, n]) => ({ value, count: n }));
  };
  return {
    source: count((c) => c.source),
    country: count((c) => c.country),
    region: count((c) => c.region),
    industry: count((c) => c.tags),
    program: count((c) => c.program),
    year: count((c) => yearOf(c)).sort((a, b) => b.value - a.value),
  };
}

// Find one company by id, then exact name, then name prefix, then substring.
function findCompany(companies, term, { source } = {}) {
  const t = str(term).toLowerCase();
  if (!t) return { company: null, matches: [] };
  const pool = source ? companies.filter((c) => c.source === source) : companies;
  const byId = pool.find((c) => String(c.id || '').toLowerCase() === t);
  if (byId) return { company: byId, matches: [byId] };
  const tiers = [
    (c) => String(c.name).toLowerCase() === t,
    (c) => String(c.name).toLowerCase().startsWith(t),
    (c) => String(c.name).toLowerCase().includes(t),
  ];
  for (const test of tiers) {
    const matches = pool.filter(test);
    if (matches.length) return { company: matches[0], matches };
  }
  return { company: null, matches: [] };
}

module.exports = {
  parseFilters,
  filterCompanies,
  sortCompanies,
  paginate,
  facets,
  findCompany,
  haystack,
  str,
  MAX_LIMIT,
};
