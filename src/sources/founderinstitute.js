// Founder Institute (fi.co) — the pre-seed accelerator with chapters in 200+
// cities. It has launched 9,000+ companies but publishes only its featured
// graduates (about 100) on fi.co/graduates, each with location, description,
// status (Acquired / IPO), website and founders.

const { addHttps, collapseSpaces } = require('../normalize');
const { decodeHtml, htmlText } = require('../html');
const { fetchWithTimeout } = require('../http');

const URL_GRADUATES = process.env.FOUNDER_INSTITUTE_URL || 'https://fi.co/graduates';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// "Silicon Valley, US" -> country from the flag's ISO code where possible.
const FLAG_COUNTRY = {
  us: 'United States', gb: 'United Kingdom', ca: 'Canada', mx: 'Mexico', br: 'Brazil', ar: 'Argentina', cl: 'Chile',
  co: 'Colombia', pe: 'Peru', in: 'India', sg: 'Singapore', id: 'Indonesia', my: 'Malaysia', ph: 'Philippines',
  vn: 'Vietnam', th: 'Thailand', au: 'Australia', nz: 'New Zealand', de: 'Germany', fr: 'France', es: 'Spain',
  it: 'Italy', nl: 'Netherlands', be: 'Belgium', ch: 'Switzerland', at: 'Austria', se: 'Sweden', fi: 'Finland',
  dk: 'Denmark', no: 'Norway', pl: 'Poland', ro: 'Romania', bg: 'Bulgaria', hu: 'Hungary', cz: 'Czechia',
  sk: 'Slovakia', ee: 'Estonia', lt: 'Lithuania', lv: 'Latvia', ua: 'Ukraine', tr: 'Turkey', il: 'Israel',
  ae: 'United Arab Emirates', sa: 'Saudi Arabia', eg: 'Egypt', ma: 'Morocco', ng: 'Nigeria', ke: 'Kenya',
  za: 'South Africa', gh: 'Ghana', pk: 'Pakistan', bd: 'Bangladesh', jp: 'Japan', kr: 'South Korea', cn: 'China',
  hk: 'Hong Kong', tw: 'Taiwan', ie: 'Ireland', pt: 'Portugal', gr: 'Greece', hr: 'Croatia', rs: 'Serbia',
  si: 'Slovenia', am: 'Armenia', ge: 'Georgia', kz: 'Kazakhstan', jo: 'Jordan', lb: 'Lebanon', tn: 'Tunisia',
};

function parseGraduates(html) {
  return String(html)
    .split(/js-graduate-each/)
    .slice(1)
    .map((chunk) => {
      const body = chunk.split(/js-graduate-each|<footer\b/)[0];
      const flag = (body.match(/\/flags\/([a-z]{2})-[0-9a-f]+\.svg/) || [])[1] || '';
      const status = htmlText((body.match(/<span class='rounded-full[^']*'>([\s\S]*?)<\/span>/) || [])[1]);
      const founders = htmlText((body.match(/Founder\(s\)<\/span>\s*<p[^>]*>([\s\S]*?)<\/p>/) || [])[1]);
      return {
        name: htmlText((body.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1]),
        location: htmlText((body.match(/<span class='md:mt-1[^']*'>([\s\S]*?)<\/span>/) || [])[1]),
        description: htmlText((body.match(/<p class='md:mt-2[^']*'>([\s\S]*?)<\/p>/) || [])[1]),
        website: decodeHtml((body.match(/rel="nofollow" href="(https?:\/\/[^"]+)"/) || [])[1] || ''),
        logo: decodeHtml((body.match(/<img class="object-contain[^"]*"[^>]*src="([^"]+)"/) || [])[1] || ''),
        status,
        country: FLAG_COUNTRY[flag] || '',
        founders: founders ? founders.split(/\s*(?:,|&|\band\b)\s*/).filter(Boolean) : [],
      };
    })
    .filter((c) => c.name);
}

function normalizeFi(g) {
  const st = g.status.toLowerCase();
  return {
    source: 'founderinstitute',
    name: collapseSpaces(g.name),
    description: g.description || '',
    logo: g.logo || '',
    website: addHttps(g.website || ''),
    location: g.location || '',
    region: '',
    subregion: '',
    tags: [],
    year: '',
    program: 'Founder Institute',
    programSlugs: ['founder-institute'],
    isExit: st === 'acquired' || st === 'ipo',
    isUnicorn: false,
    isBCorp: false,
    isCurrentSession: false,
    status: st === 'acquired' ? 'acquired' : st === 'ipo' ? 'public' : '',
    founders: g.founders.map((name) => ({ name: collapseSpaces(name), role: '', linkedin: '' })).filter((f) => f.name),
    social: { linkedin: '', twitter: '', facebook: '', crunchbase: '' },
    extra: { country: g.country },
  };
}

async function fetchFounderInstitute({ fetchFn = fetchWithTimeout } = {}) {
  const res = await fetchFn(URL_GRADUATES, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${URL_GRADUATES}`);
  const seen = new Set();
  const companies = parseGraduates(await res.text())
    .filter((g) => !seen.has(g.name.toLowerCase()) && seen.add(g.name.toLowerCase()))
    .map(normalizeFi);
  if (!companies.length) throw new Error('fi.co/graduates listed no companies');
  return companies;
}

module.exports = { fetchFounderInstitute, parseGraduates, normalizeFi, URL_GRADUATES };
