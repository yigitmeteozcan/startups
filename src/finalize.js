// Final, source-independent clean-up applied to every company right before the
// dataset is written. Runs on both freshly fetched and previously committed
// records, so every step here must be idempotent (running it twice changes
// nothing) and must never drop a company, a founder, or a LinkedIn URL.
//
// Fields are only ever repaired or added, never removed:
//   + id       stable unique key, e.g. "yc-airbnb"
//   + country  normalized country ("USA" / "UNITED STATES" -> "United States")
//   + alsoIn   other portfolios the same company (same website) appears in

const { addHttps, cleanTags, collapseSpaces, splitFounderNames } = require('./normalize');
const { deriveCountry } = require('./data/countries');
const { isKnownUnicorn, domainOf } = require('./data/unicorns');

// Slug used for slice file names (by-industry/fintech.json, ...). Must stay
// byte-for-byte the same as before so existing endpoint URLs keep working.
function slugify(s) {
  return (
    String(s)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unknown'
  );
}

// Slug for the new `id` field: same idea, but accents are folded first
// ("Café" -> "cafe" rather than "caf").
function idSlug(s) {
  return slugify(String(s).normalize('NFKD').replace(/\p{M}/gu, ''));
}

// Keep `extra` to a small whitelist. The full raw record (YC long_description,
// Q&A, duplicate urls, etc.) bloats all.json past jsDelivr's 20 MB per-file
// limit; these are the only raw fields the CSV/stats/explorer read.
const EXTRA_KEEP = ['city', 'state_province', 'country', 'investor'];
function slimExtra(extra) {
  const e = extra || {};
  const kept = {};
  for (const k of EXTRA_KEEP) if (e[k] != null) kept[k] = e[k];
  return kept;
}

function fixLogo(logo, source) {
  const l = String(logo || '').trim();
  if (!l) return '';
  if (l.startsWith('//')) return `https:${l}`;
  if (l.startsWith('/')) return source === 'yc' ? `https://www.ycombinator.com${l}` : l;
  if (/^https?:/i.test(l)) return addHttps(l);
  return l;
}

// Clean founder entries without losing any person, role or LinkedIn URL:
//  - whitespace is collapsed ("Ahmed  Sidam" -> "Ahmed Sidam")
//  - Alchemist's "A B  C D" free text is split into two people
//  - exact repeats of the same person (500 Global lists some people twice) are
//    merged, keeping whichever role / LinkedIn either copy has. Two entries with
//    the same name but different LinkedIn URLs stay separate.
function repairFounders(founders, source) {
  const out = [];
  const byName = new Map();
  for (const f of Array.isArray(founders) ? founders : []) {
    if (!f) continue;
    const base = typeof f === 'string' ? { name: f } : f;
    const names = source === 'alchemist' ? splitFounderNames(base.name) : [collapseSpaces(base.name)];
    for (const name of names) {
      if (!name) continue;
      const entry = {
        ...base,
        name,
        role: collapseSpaces(base.role),
        linkedin: names.length === 1 ? addHttps(base.linkedin) : '',
      };
      const prev = byName.get(name.toLowerCase());
      if (prev && !(prev.linkedin && entry.linkedin && prev.linkedin !== entry.linkedin)) {
        if (!prev.linkedin) prev.linkedin = entry.linkedin;
        if (entry.role && !prev.role.split(', ').includes(entry.role)) {
          prev.role = prev.role ? `${prev.role}, ${entry.role}` : entry.role;
        }
        continue;
      }
      byName.set(name.toLowerCase(), entry);
      out.push(entry);
    }
  }
  return out;
}

function repairCompany(c) {
  const out = { ...c };
  out.name = collapseSpaces(c.name);

  // Antler's card scrape put the company name in `description` and the tagline
  // in `location`. Move the tagline back where it belongs.
  if (
    c.source === 'antler' &&
    c.location &&
    collapseSpaces(c.description) === out.name &&
    collapseSpaces(c.location) !== out.name
  ) {
    out.description = c.location;
    out.location = '';
  }

  out.website = addHttps(c.website);
  out.logo = fixLogo(c.logo, c.source);
  const social = c.social || {};
  out.social = {
    ...social,
    linkedin: addHttps(social.linkedin),
    twitter: addHttps(social.twitter),
    facebook: addHttps(social.facebook),
    crunchbase: addHttps(social.crunchbase),
  };
  out.founders = repairFounders(c.founders, c.source);
  out.extra = slimExtra(c.extra);
  out.tags = cleanTags(c.tags);
  return out;
}

// "Fintech" (2,075) and "FinTech" (197) are the same industry but used to be
// two categories whose slices overwrote each other on disk. Collapse every
// case-variant onto its most common spelling.
function canonicalizeTags(companies) {
  const variants = new Map(); // lower -> Map(variant -> count)
  for (const c of companies) {
    for (const t of c.tags || []) {
      const low = t.toLowerCase();
      if (!variants.has(low)) variants.set(low, new Map());
      const m = variants.get(low);
      m.set(t, (m.get(t) || 0) + 1);
    }
  }
  const canon = new Map();
  for (const [low, m] of variants) {
    const best = [...m.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];
    canon.set(low, best);
  }
  return companies.map((c) => {
    const seen = new Set();
    const tags = [];
    for (const t of c.tags || []) {
      const v = canon.get(t.toLowerCase()) || t;
      if (seen.has(v)) continue;
      seen.add(v);
      tags.push(v);
    }
    return { ...c, tags };
  });
}

// Stable, unique id per company: "<source>-<name-slug>", disambiguated by the
// website domain (then a counter) when two companies in a source share a name.
function assignIds(companies) {
  const baseOf = (c) => `${idSlug(c.source || 'unknown')}-${idSlug(c.name)}`;
  const counts = new Map();
  for (const c of companies) counts.set(baseOf(c), (counts.get(baseOf(c)) || 0) + 1);
  const used = new Set();
  return companies.map((c) => {
    const base = baseOf(c);
    let id = base;
    if (counts.get(base) > 1) {
      const dom = domainOf(c.website);
      if (dom) id = `${base}-${idSlug(dom)}`;
    }
    if (used.has(id)) {
      let n = 2;
      while (used.has(`${id}-${n}`)) n++;
      id = `${id}-${n}`;
    }
    used.add(id);
    const { id: _old, ...rest } = c;
    return { id, ...rest };
  });
}

// Hosts that many unrelated companies use as their "website" — never treat a
// shared host as evidence that two records are the same company.
const SHARED_HOSTS = new Set([
  'linkedin.com', 'facebook.com', 'twitter.com', 'x.com', 'instagram.com', 'angel.co',
  'wellfound.com', 'crunchbase.com', 'medium.com', 'github.com', 'google.com', 'sites.google.com',
  'docs.google.com', 'play.google.com', 'apps.apple.com', 'youtube.com', 'linktr.ee', 'notion.so',
  'notion.site', 'bit.ly', 'ycombinator.com', 'techstars.com', 'antler.co', '500.co', 'joinef.com',
  'substack.com', 'webflow.io', 'wixsite.com', 'carrd.co', 'producthunt.com',
]);

// alsoIn: the other portfolios a company (matched by website domain) is in,
// e.g. SendGrid is in both Techstars and 500 Global.
function assignAlsoIn(companies) {
  const byDomain = new Map();
  for (const c of companies) {
    const d = domainOf(c.website);
    if (!d || SHARED_HOSTS.has(d)) continue;
    if (!byDomain.has(d)) byDomain.set(d, []);
    byDomain.get(d).push(c);
  }
  const alsoIn = new Map();
  for (const list of byDomain.values()) {
    const sources = new Set(list.map((c) => c.source));
    if (sources.size < 2) continue;
    // A domain used by many companies within one source is a shared host.
    const perSource = new Map();
    for (const c of list) perSource.set(c.source, (perSource.get(c.source) || 0) + 1);
    if ([...perSource.values()].some((n) => n > 3)) continue;
    for (const c of list) {
      alsoIn.set(c, [...sources].filter((s) => s !== c.source).sort());
    }
  }
  return companies.map((c) => ({ ...c, alsoIn: alsoIn.get(c) || [] }));
}

function finalizeCompanies(companies) {
  let out = companies.map(repairCompany);
  out = canonicalizeTags(out);
  out = out.map((c) => ({
    ...c,
    country: deriveCountry(c),
    isUnicorn: !!c.isUnicorn || isKnownUnicorn(c.website),
  }));
  out = assignIds(out);
  out = assignAlsoIn(out);
  return out;
}

module.exports = {
  finalizeCompanies,
  repairCompany,
  repairFounders,
  canonicalizeTags,
  assignIds,
  assignAlsoIn,
  slugify,
  idSlug,
  slimExtra,
  fixLogo,
  SHARED_HOSTS,
};
