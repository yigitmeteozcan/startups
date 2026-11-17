// Country normalization. Sources spell the same country many ways ("United
// States", "USA", "UNITED STATES", "United States of America"), which split the
// stats and made country filtering unreliable. normalizeCountry() maps every
// variant onto one canonical English short name, and rejects values that are
// not countries at all ("Remote", "Unspecified", "02000", continents).

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina',
  'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh',
  'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'British Virgin Islands', 'Brunei', 'Bulgaria',
  'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Costa Rica',
  'Croatia', 'Cuba', 'Curaçao', 'Cyprus', 'Czechia', 'Democratic Republic of the Congo', 'Denmark',
  'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Faroe Islands', 'Fiji',
  'Finland', 'France', 'French Polynesia', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
  'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guernsey',
  'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland',
  'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Ivory Coast',
  'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait',
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
  'Lithuania', 'Luxembourg', 'Macau', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali',
  'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
  'Nauru', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
  'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama',
  'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Puerto Rico',
  'Qatar', 'Republic of the Congo', 'Réunion', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
  'São Tomé and Príncipe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone',
  'Singapore', 'Sint Maarten', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks and Caicos Islands', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'United States Virgin Islands', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela',
  'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

// Lower-cased variant -> canonical name.
const ALIASES = {
  'usa': 'United States', 'us': 'United States', 'u.s.': 'United States', 'u.s.a.': 'United States',
  'u.s': 'United States', 'united states of america': 'United States',
  'the united states': 'United States',
  'uk': 'United Kingdom', 'u.k.': 'United Kingdom', 'great britain': 'United Kingdom',
  'britain': 'United Kingdom', 'england': 'United Kingdom', 'scotland': 'United Kingdom',
  'wales': 'United Kingdom', 'northern ireland': 'United Kingdom',
  'uae': 'United Arab Emirates', 'u.a.e.': 'United Arab Emirates', 'dubai': 'United Arab Emirates',
  'abu dhabi': 'United Arab Emirates',
  'czech republic': 'Czechia', 'türkiye': 'Turkey', 'turkiye': 'Turkey',
  'belgië': 'Belgium', 'belgique': 'Belgium', 'deutschland': 'Germany', 'españa': 'Spain',
  'korea': 'South Korea', 'republic of korea': 'South Korea', 'korea, republic of': 'South Korea',
  'korea (south)': 'South Korea',
  'viet nam': 'Vietnam', 'the netherlands': 'Netherlands', 'holland': 'Netherlands',
  'russian federation': 'Russia', 'hong kong sar': 'Hong Kong', 'hong kong sar china': 'Hong Kong',
  'macao': 'Macau', "côte d'ivoire": 'Ivory Coast', "cote d'ivoire": 'Ivory Coast',
  'drc': 'Democratic Republic of the Congo', 'dr congo': 'Democratic Republic of the Congo',
  'congo (kinshasa)': 'Democratic Republic of the Congo',
  'congo, democratic republic of the': 'Democratic Republic of the Congo',
  'congo': 'Republic of the Congo', 'congo (brazzaville)': 'Republic of the Congo',
  'swaziland': 'Eswatini', 'burma': 'Myanmar', 'macedonia': 'North Macedonia',
  'cabo verde': 'Cape Verde', 'east timor': 'Timor-Leste', 'the bahamas': 'Bahamas',
  'the gambia': 'Gambia', 'palestinian territories': 'Palestine', 'state of palestine': 'Palestine',
  'taiwan, province of china': 'Taiwan', 'republic of china': 'Taiwan',
  "people's republic of china": 'China', 'prc': 'China', 'mainland china': 'China',
  'iran, islamic republic of': 'Iran', 'lao pdr': 'Laos', 'syrian arab republic': 'Syria',
  'brunei darussalam': 'Brunei', 'bvi': 'British Virgin Islands',
  'virgin islands, british': 'British Virgin Islands', 'curacao': 'Curaçao', 'reunion': 'Réunion',
};

const CANONICAL = new Map(COUNTRIES.map((c) => [c.toLowerCase(), c]));

function normalizeCountry(value) {
  if (value == null) return '';
  const key = String(value).replace(/\s+/g, ' ').trim().toLowerCase();
  if (!key) return '';
  return ALIASES[key] || CANONICAL.get(key) || CANONICAL.get(key.replace(/^the\s+/, '')) || '';
}

// Best-effort country for a company, from the most reliable field available.
// Every source puts it somewhere different, so try them in order.
function deriveCountry(c) {
  const extra = c.extra || {};
  const candidates = [extra.country];
  // YC's "region" is really the country ("United States of America", "India").
  if (c.source === 'yc') candidates.push(c.region);
  // Location strings: "San Francisco, CA, USA; Remote" -> "USA".
  for (const loc of String(c.location || '').split(';')) {
    const parts = loc.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length) candidates.push(parts[parts.length - 1]);
    if (parts.length === 1) candidates.push(parts[0]);
  }
  for (const cand of candidates) {
    const n = normalizeCountry(cand);
    if (n) return n;
  }
  return '';
}

module.exports = { normalizeCountry, deriveCountry, COUNTRIES };
