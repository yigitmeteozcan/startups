const fs = require('fs');
const path = require('path');
const { buildWorkbook } = require('./excel');
const { renderReadme } = require('./readme');
const { cleanTags } = require('./normalize');
const { isKnownUnicorn } = require('./data/unicorns');

function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Minimal RFC-4180 CSV (quotes fields containing comma/quote/newline).
function toCsv(companies) {
  const cols = [
    ['source', (c) => c.source || ''],
    ['name', (c) => c.name],
    ['description', (c) => c.description],
    ['website', (c) => c.website],
    ['city', (c) => c.extra?.city || ''],
    ['state', (c) => c.extra?.state_province || ''],
    ['country', (c) => c.extra?.country || ''],
    ['region', (c) => c.region],
    ['subregion', (c) => c.subregion],
    ['tags', (c) => (c.tags || []).join('; ')],
    ['year', (c) => c.year],
    ['program', (c) => c.program],
    ['isExit', (c) => c.isExit],
    ['isUnicorn', (c) => c.isUnicorn],
    ['isBCorp', (c) => c.isBCorp],
    ['isCurrentSession', (c) => c.isCurrentSession],
    ['linkedin', (c) => c.social?.linkedin || ''],
    ['twitter', (c) => c.social?.twitter || ''],
    ['facebook', (c) => c.social?.facebook || ''],
    ['crunchbase', (c) => c.social?.crunchbase || ''],
    ['logo', (c) => c.logo],
  ];
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.map((c) => c[0]).join(',')];
  for (const c of companies) lines.push(cols.map(([, f]) => esc(f(c))).join(','));
  return lines.join('\n');
}

function countBy(companies, keyFn) {
  const map = new Map();
  for (const c of companies) {
    for (const k of [].concat(keyFn(c)).filter((x) => x !== '' && x != null)) {
      map.set(k, (map.get(k) || 0) + 1);
    }
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function computeStats(companies) {
  return {
    generatedAt: new Date().toISOString(),
    total: companies.length,
    bySource: Object.fromEntries(countBy(companies, (c) => c.source)),
    unicorns: companies.filter((c) => c.isUnicorn).length,
    exits: companies.filter((c) => c.isExit).length,
    bCorps: companies.filter((c) => c.isBCorp).length,
    currentSession: companies.filter((c) => c.isCurrentSession).length,
    byYear: Object.fromEntries(countBy(companies, (c) => c.year).sort((a, b) => a[0] - b[0])),
    topCountries: countBy(companies, (c) => c.extra?.country).slice(0, 15),
    topCities: countBy(companies, (c) => c.extra?.city).slice(0, 15),
    byRegion: countBy(companies, (c) => c.region),
    topPrograms: countBy(companies, (c) => c.program).slice(0, 15),
    topIndustries: countBy(companies, (c) => c.tags).slice(0, 20),
  };
}

function bar(n, max, width = 28) {
  const filled = max > 0 ? Math.round((n / max) * width) : 0;
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function renderStatsMarkdown(stats) {
  const yearEntries = Object.entries(stats.byYear);
  const maxYear = Math.max(...yearEntries.map(([, n]) => n), 1);
  const yearChart = yearEntries
    .map(([y, n]) => `${y}  ${bar(n, maxYear)} ${n}`)
    .join('\n');

  const list = (rows) =>
    rows.map(([k, n], i) => `${i + 1}. **${k}** — ${n}`).join('\n');

  const sourceRows = Object.entries(stats.bySource || {}).sort((a, b) => b[1] - a[1]);
  const sourceTable = sourceRows.length
    ? '\n\n## By source\n\n| Source | Companies |\n|---|---|\n' +
      sourceRows.map(([k, n]) => `| ${k} | ${n.toLocaleString()} |`).join('\n')
    : '';

  return `# Startup Portfolios — by the numbers

_Auto-generated from the dataset on ${stats.generatedAt.slice(0, 10)}._

| Metric | Count |
|---|---|
| Total companies | **${stats.total.toLocaleString()}** |
| 🦄 Unicorns ($1B+) | **${stats.unicorns}** |
| 💰 Exits | **${stats.exits}** |
| 🌱 B Corps | **${stats.bCorps}** |
| Current session | **${stats.currentSession}** |${sourceTable}

## Companies by first session year

\`\`\`
${yearChart}
\`\`\`

## Top countries
${list(stats.topCountries)}

## Top cities
${list(stats.topCities)}

## Top programs
${list(stats.topPrograms)}

## Top industries
${list(stats.topIndustries)}

## By region
${list(stats.byRegion)}
`;
}

const CDN_BASE =
  process.env.CDN_BASE ||
  'https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data';

// Keep `extra` to a small whitelist. The full raw record (YC long_description,
// Q&A, duplicate urls, etc.) bloats all.json past jsDelivr's 20 MB per-file
// limit; these are the only raw fields the CSV/stats actually read.
const EXTRA_KEEP = ['city', 'state_province', 'country'];
function slimExtra(companies) {
  return companies.map((c) => {
    const e = c.extra || {};
    const kept = {};
    for (const k of EXTRA_KEEP) if (e[k] != null) kept[k] = e[k];
    return { ...c, extra: kept };
  });
}

// Write the full sliced dataset to disk.
function writeDataset(companies, { outDir = 'data', rootDir = '.' } = {}) {
  const base = path.resolve(rootDir, outDir);
  ensureDir(base);

  // Trim the heavy raw `extra` blob (CSV/stats only read city/state/country),
  // clean up the industry tags, and enrich the unicorn flag across all sources.
  companies = slimExtra(companies).map((c) => ({
    ...c,
    tags: cleanTags(c.tags),
    isUnicorn: !!c.isUnicorn || isKnownUnicorn(c.website),
  }));

  // Full dataset (JSON + CSV + XLSX).
  writeJson(path.join(base, 'all.json'), companies);
  fs.writeFileSync(path.join(base, 'all.csv'), toCsv(companies));

  // Boolean slices.
  const unicorns = companies.filter((c) => c.isUnicorn);
  const exits = companies.filter((c) => c.isExit);
  const bCorps = companies.filter((c) => c.isBCorp);
  const current = companies.filter((c) => c.isCurrentSession);
  writeJson(path.join(base, 'unicorns.json'), unicorns);
  writeJson(path.join(base, 'exits.json'), exits);
  writeJson(path.join(base, 'b-corps.json'), bCorps);
  writeJson(path.join(base, 'current.json'), current);

  // Grouped slices.
  const groupIndexes = {};
  const groupWrite = (subdir, keyFn) => {
    const groups = new Map();
    for (const c of companies) {
      for (const k of [].concat(keyFn(c)).filter((x) => x !== '' && x != null)) {
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(c);
      }
    }
    const index = {};
    for (const [k, list] of groups) {
      const slug = slugify(k);
      writeJson(path.join(base, subdir, `${slug}.json`), list);
      index[k] = { slug, count: list.length, file: `${subdir}/${slug}.json` };
    }
    writeJson(path.join(base, subdir, 'index.json'), index);
    groupIndexes[subdir] = index;
  };

  groupWrite('by-source', (c) => c.source);
  groupWrite('by-year', (c) => c.year);
  groupWrite('by-program', (c) => c.program);
  groupWrite('by-region', (c) => c.region);
  groupWrite('by-industry', (c) => c.tags);

  // Stats (JSON + Markdown).
  const stats = computeStats(companies);
  writeJson(path.join(base, 'stats.json'), stats);
  fs.writeFileSync(path.resolve(rootDir, 'STATS.md'), renderStatsMarkdown(stats));

  // Meta — the catalog of every endpoint (like yc-oss/api meta.json).
  const counts = {
    all: companies.length,
    unicorns: unicorns.length,
    exits: exits.length,
    bCorps: bCorps.length,
    current: current.length,
  };
  const meta = buildMeta({ counts, groupIndexes, generatedAt: stats.generatedAt, bySource: stats.bySource });
  writeJson(path.join(base, 'meta.json'), meta);

  // Keep README counts/tables in sync with the data.
  fs.writeFileSync(path.resolve(rootDir, 'README.md'), renderReadme(meta, stats));

  return stats;
}

// Build the endpoint catalog. Every entry carries a ready-to-use CDN URL.
const SOURCE_SITES = {
  techstars: 'https://www.techstars.com/portfolio',
  yc: 'https://www.ycombinator.com/companies',
  antler: 'https://www.antler.co/portfolio',
  500: 'https://500.co/portfolio',
  ef: 'https://www.joinef.com/portfolio/',
};

function buildMeta({ counts, groupIndexes, generatedAt, bySource = {} }) {
  const url = (p) => `${CDN_BASE}/${p}`;
  const collection = (subdir) =>
    Object.entries(groupIndexes[subdir] || {})
      .map(([name, info]) => ({
        name,
        slug: info.slug,
        count: info.count,
        api: url(info.file),
      }))
      .sort((a, b) => b.count - a.count);

  return {
    generatedAt,
    sources: Object.keys(bySource).map((name) => ({
      name,
      site: SOURCE_SITES[name] || '',
      count: bySource[name],
    })),
    cdn: CDN_BASE,
    total: counts.all,
    endpoints: {
      all: { count: counts.all, api: url('all.json'), csv: url('all.csv'), xlsx: url('all.xlsx') },
      unicorns: { count: counts.unicorns, api: url('unicorns.json') },
      exits: { count: counts.exits, api: url('exits.json') },
      bCorps: { count: counts.bCorps, api: url('b-corps.json') },
      current: { count: counts.current, api: url('current.json') },
      stats: { api: url('stats.json') },
    },
    collections: {
      'by-source': collection('by-source'),
      'by-year': collection('by-year'),
      'by-program': collection('by-program'),
      'by-region': collection('by-region'),
      'by-industry': collection('by-industry'),
    },
  };
}

// XLSX is written separately (async).
async function writeXlsx(companies, file) {
  ensureDir(path.dirname(file));
  await buildWorkbook(companies).xlsx.writeFile(file);
}

module.exports = { writeDataset, writeXlsx, computeStats, renderStatsMarkdown, toCsv, buildMeta };
