const fs = require('fs');
const path = require('path');
const { buildWorkbook } = require('./excel');

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

  return `# Techstars Portfolio — by the numbers

_Auto-generated from the dataset on ${stats.generatedAt.slice(0, 10)}._

| Metric | Count |
|---|---|
| Total companies | **${stats.total.toLocaleString()}** |
| 🦄 Unicorns ($1B+) | **${stats.unicorns}** |
| 💰 Exits | **${stats.exits}** |
| 🌱 B Corps | **${stats.bCorps}** |
| Current session | **${stats.currentSession}** |

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

// Write the full sliced dataset to disk.
function writeDataset(companies, { outDir = 'data', rootDir = '.' } = {}) {
  const base = path.resolve(rootDir, outDir);
  ensureDir(base);

  // Full dataset (JSON + CSV + XLSX).
  writeJson(path.join(base, 'all.json'), companies);
  fs.writeFileSync(path.join(base, 'all.csv'), toCsv(companies));

  // Boolean slices.
  writeJson(path.join(base, 'unicorns.json'), companies.filter((c) => c.isUnicorn));
  writeJson(path.join(base, 'exits.json'), companies.filter((c) => c.isExit));
  writeJson(path.join(base, 'b-corps.json'), companies.filter((c) => c.isBCorp));
  writeJson(path.join(base, 'current.json'), companies.filter((c) => c.isCurrentSession));

  // Grouped slices.
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
  };

  groupWrite('by-year', (c) => c.year);
  groupWrite('by-program', (c) => c.program);
  groupWrite('by-region', (c) => c.region);
  groupWrite('by-industry', (c) => c.tags);

  // Stats (JSON + Markdown).
  const stats = computeStats(companies);
  writeJson(path.join(base, 'stats.json'), stats);
  fs.writeFileSync(path.resolve(rootDir, 'STATS.md'), renderStatsMarkdown(stats));

  return stats;
}

// XLSX is written separately (async).
async function writeXlsx(companies, file) {
  ensureDir(path.dirname(file));
  await buildWorkbook(companies).xlsx.writeFile(file);
}

module.exports = { writeDataset, writeXlsx, computeStats, renderStatsMarkdown, toCsv };
