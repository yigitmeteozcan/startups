// Alchemist Accelerator. Backed by a public JSON:API at
// vault.alchemistaccelerator.com. Each item keeps its name under `attributes`
// and the rest of its fields under `meta`; the cohort number comes from the
// included `alchemist_classes`. ~519 companies, paged via page[number]. We
// fetch it directly; fall back to the browser scraper if blocked.

const { makeBrowserSource } = require('./browser-portfolio');

const API = process.env.ALCHEMIST_API_URL || 'https://vault.alchemistaccelerator.com/api/v1/alchemist_companies';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/vnd.api+json, application/json, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  Origin: 'https://www.alchemistaccelerator.com',
  Referer: 'https://www.alchemistaccelerator.com/',
};

const browser = makeBrowserSource({
  source: 'alchemist',
  url: process.env.ALCHEMIST_PORTFOLIO_URL || 'https://www.alchemistaccelerator.com/portfolio',
  program: 'Alchemist Accelerator',
});

function buildUrl(page, size) {
  const u = new URL(API);
  u.searchParams.set('include', 'aclass');
  u.searchParams.set('fields[alchemist_classes]', 'number');
  u.searchParams.set('filter[aclass.class_type:eq]', 'alchemist');
  u.searchParams.set('sort', '-startup_totalraise');
  u.searchParams.set('page[size]', String(size));
  u.searchParams.set('page[number]', String(page));
  return u.toString();
}

// "Grant Demaree (West Point, Army Officer); Rafa Pereira (VP Eng @IAC)" ->
// [{name:'Grant Demaree'}, {name:'Rafa Pereira'}]. Team descriptions are messy:
// strip the parenthetical bios first (they contain their own ; and ,), then
// split on ; / newlines and trim each entry down to the person's name.
function parseFounders(teamDescription) {
  if (!teamDescription) return [];
  let s = String(teamDescription);
  let prev;
  do {
    prev = s;
    s = s.replace(/\([^()]*\)/g, ''); // remove (bio), repeat for any nesting
  } while (s !== prev);

  const out = [];
  const seen = new Set();
  for (const part of s.split(/[;\n]+/)) {
    let name = part.replace(/^[\s\-–• ]+/, '');
    name = name.split(/\s[-–]\s|,/)[0].trim(); // cut at " - " / comma (bio start)
    if (!name || name.length > 50 || !/[A-Za-z]/.test(name)) continue;
    if (name.split(/\s+/).length > 5) continue; // too long to be a name
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name, role: '', linkedin: '' });
  }
  return out;
}

function normalizeAlchemist(item, classById) {
  const a = item.attributes || {};
  const m = item.meta || {};
  const classId = item.relationships && item.relationships.aclass && item.relationships.aclass.data && item.relationships.aclass.data.id;
  const classNum = classId != null ? classById[classId] : undefined;
  const status = String(m.status || '');

  return {
    source: 'alchemist',
    name: a.name || '',
    description: m.oneliner || m.description || '',
    logo: '', // API exposes only a logo hash, not a usable URL
    website: '', // not provided by the API
    location: m.location_formatted_address || '',
    region: '',
    subregion: '',
    tags: [], // API has no industry/sector field
    year: m.created_at ? new Date(m.created_at).getFullYear() : '',
    program: classNum != null ? `Alchemist Class ${classNum}` : 'Alchemist Accelerator',
    programSlugs: ['alchemist'],
    isExit: /acquired|exit|public|ipo/i.test(status),
    isUnicorn: false,
    isBCorp: false,
    isCurrentSession: false,
    founders: parseFounders(m.startup_teamdescription),
    social: { linkedin: '', twitter: '', facebook: '', crunchbase: '' },
    extra: { country: (m.location_formatted_address || '').split(',').pop().trim() },
  };
}

async function fetchAlchemist({ size = 200, maxPages = 60 } = {}) {
  try {
    const all = [];
    let lastPage = Infinity;
    for (let page = 1; page <= Math.min(lastPage, maxPages); page++) {
      const res = await fetch(buildUrl(page, size), { headers: HEADERS });
      if (!res.ok) break;
      const json = await res.json();
      const data = json.data || [];
      if (data.length === 0) break;
      const classById = {};
      for (const inc of json.included || []) {
        if (inc.type === 'alchemist_classes') classById[inc.id] = inc.attributes && inc.attributes.number;
      }
      for (const item of data) all.push(normalizeAlchemist(item, classById));
      const available = json.meta && json.meta.results && json.meta.results.available;
      if (available) lastPage = Math.ceil(available / size);
      if (data.length < size) break;
    }
    const companies = all.filter((c) => c.name);
    if (companies.length > 0) return companies;
  } catch (_) {
    // fall through to the browser scraper
  }
  return browser.fetch();
}

module.exports = { fetchAlchemist, normalizeAlchemist, scrapeAlchemist: browser.scrape, API };
