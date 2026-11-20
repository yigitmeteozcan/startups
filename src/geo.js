// Geocoding for the globe view (data/geo.json).
//
// Each company is placed at its city when the source gives one (Techstars,
// Y Combinator, Alchemist), otherwise at the population-weighted centre of its
// country. City coordinates come from GeoNames (CC BY 4.0) via the
// `all-the-cities` package, a build-time dependency — if it is not installed,
// geocoding is skipped and the previous geo.json is left in place.
//
// Output groups companies by place:
//   { generatedAt, attribution, total, located, points: [
//       { key, place, country, lat, lng, precision: "city"|"country", ids: [...] } ] }

const { COUNTRY_CODES, US_STATES, isUsState } = require('./data/countries');

// Common spellings that differ from GeoNames' primary name.
const CITY_ALIASES = {
  'new york': 'new york city', nyc: 'new york city', manhattan: 'new york city',
  sf: 'san francisco', 'san francisco bay area': 'san francisco', 'bay area': 'san francisco',
  bangalore: 'bengaluru', gurgaon: 'gurugram', bombay: 'mumbai', 'new delhi': 'new delhi',
  'washington dc': 'washington', 'washington d c': 'washington', 'tel aviv yafo': 'tel aviv',
  'tel aviv jaffa': 'tel aviv', saigon: 'ho chi minh city', munchen: 'munich', koln: 'cologne',
  la: 'los angeles', gurugram: 'gurgaon', milano: 'milan', firenze: 'florence', roma: 'rome',
  torino: 'turin', napoli: 'naples', wien: 'vienna', praha: 'prague', lisboa: 'lisbon',
  kobenhavn: 'copenhagen', 'kefar sava': 'kfar saba', 'beer sheva': 'beersheba', 'beer sheba': 'beersheba',
  'rishon lezion': 'rishon letsiyyon', makati: 'makati city', 'grand cayman': 'george town',
};

// Spellings to try, in order: as written, alias, "St."/"Saint" swapped,
// without a leading "City of".
function nameVariants(raw) {
  const n = norm(raw);
  const out = [n, CITY_ALIASES[n]];
  if (/^st /.test(n)) out.push(n.replace(/^st /, 'saint '));
  if (/^saint /.test(n)) out.push(n.replace(/^saint /, 'st '));
  if (/^city of /.test(n)) out.push(n.replace(/^city of /, ''));
  return [...new Set(out.filter(Boolean))];
}

const norm = (s) =>
  String(s || '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

let INDEX = null;

function loadIndex() {
  if (INDEX) return INDEX;
  let cities;
  try {
    cities = require('all-the-cities');
  } catch (_) {
    return null;
  }
  const byName = new Map(); // "US|san francisco" -> [{ admin, pop, lat, lng, name }]
  const centre = new Map(); // "US" -> weighted 3D vector
  for (const c of cities) {
    const [lng, lat] = c.loc.coordinates;
    const entry = { admin: c.adminCode, pop: c.population || 0, lat, lng, name: c.name };
    for (const n of new Set([norm(c.name), norm(c.altName)].filter(Boolean))) {
      const k = `${c.country}|${n}`;
      if (!byName.has(k)) byName.set(k, []);
      byName.get(k).push(entry);
    }
    // Population-weighted centre on the sphere (works across the date line).
    const w = Math.max(1, entry.pop);
    const r = Math.PI / 180;
    const v = centre.get(c.country) || [0, 0, 0];
    v[0] += w * Math.cos(lat * r) * Math.cos(lng * r);
    v[1] += w * Math.cos(lat * r) * Math.sin(lng * r);
    v[2] += w * Math.sin(lat * r);
    centre.set(c.country, v);
  }
  const centres = new Map();
  for (const [cc, [x, y, z]] of centre) {
    centres.set(cc, {
      lat: (Math.atan2(z, Math.hypot(x, y)) * 180) / Math.PI,
      lng: (Math.atan2(y, x) * 180) / Math.PI,
    });
  }
  INDEX = { byName, centres };
  return INDEX;
}

// City (+ optional state/region) for a company, from wherever its source keeps it.
function cityHint(c) {
  const extra = c.extra || {};
  if (c.source === 'techstars' && extra.city) return { city: extra.city, admin: extra.state_province || '' };
  if (c.source === 'plugandplay') return null; // its city field is a Plug and Play office
  const first = String(c.location || '').split(';')[0];
  const parts = first.split(',').map((p) => p.trim()).filter(Boolean);
  // "Palo Alto, California" / "Newark, NJ": the second part is a US state.
  if (parts.length === 2 && isUsState(parts[1])) return { city: parts[0], admin: parts[1] };
  if (parts.length >= 2) return { city: parts[0], admin: parts.length >= 3 ? parts[1] : '' };
  return null;
}

function resolveCity(index, cc, hint) {
  if (!hint || !hint.city) return null;
  let list = null;
  for (const name of nameVariants(hint.city)) {
    list = index.byName.get(`${cc}|${name}`);
    if (list) break;
  }
  if (!list) return null;
  if (cc === 'US' && hint.admin) {
    const a = hint.admin.length === 2 ? hint.admin.toUpperCase() : US_STATES[norm(hint.admin)];
    const inState = a && list.filter((e) => e.admin === a);
    if (inState && inState.length) list = inState;
  }
  return list.reduce((best, e) => (e.pop > best.pop ? e : best));
}

const round = (x) => Math.round(x * 100) / 100;

// Build the geo.json payload for a list of finalized companies.
function buildGeo(companies, { generatedAt = new Date().toISOString() } = {}) {
  const index = loadIndex();
  if (!index) return null;
  const points = new Map();
  let located = 0;
  for (const c of companies) {
    const cc = COUNTRY_CODES[c.country];
    if (!cc) continue;
    const city = resolveCity(index, cc, cityHint(c));
    let key;
    let p;
    if (city) {
      key = `${cc.toLowerCase()}/${norm(city.name).replace(/ /g, '-')}`;
      p = { place: `${city.name}, ${c.country}`, lat: city.lat, lng: city.lng, precision: 'city' };
    } else {
      const centre = index.centres.get(cc);
      if (!centre) continue;
      key = cc.toLowerCase();
      p = { place: c.country, lat: centre.lat, lng: centre.lng, precision: 'country' };
    }
    if (!points.has(key)) {
      points.set(key, { key, place: p.place, country: c.country, lat: round(p.lat), lng: round(p.lng), precision: p.precision, ids: [] });
    }
    points.get(key).ids.push(c.id);
    located++;
  }
  return {
    generatedAt,
    attribution: 'City coordinates: GeoNames (geonames.org, CC BY 4.0) via all-the-cities. Companies without a known city are placed at their country\'s population-weighted centre.',
    total: companies.length,
    located,
    points: [...points.values()].sort((a, b) => b.ids.length - a.ids.length || (a.key < b.key ? -1 : 1)),
  };
}

module.exports = { buildGeo, cityHint, resolveCity, loadIndex, norm };
