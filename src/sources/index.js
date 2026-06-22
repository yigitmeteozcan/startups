// Multi-source registry. Each source returns companies in the shared shape
// (see src/normalize.js) tagged with a `source` field. `gatherAll` fetches the
// requested sources, isolates failures per-source (one source being
// unreachable never kills the whole build), and returns the merged list.

const fs = require('fs');
const path = require('path');
const { fetchAllCompanies } = require('../typesense');
const { fetchYc } = require('./yc');
const { fetchAntler } = require('./antler');
const { fetch500 } = require('./fivehundred');
const { fetchEf } = require('./ef');

// Techstars: live Typesense when a key is available, otherwise fall back to the
// already-committed dataset so non-key environments can still rebuild.
async function fetchTechstars() {
  if (process.env.TYPESENSE_API_KEY) {
    const companies = await fetchAllCompanies();
    return companies.map((c) => ({ ...c, source: 'techstars' }));
  }
  const file = path.resolve(__dirname, '../../data/all.json');
  if (fs.existsSync(file)) {
    const arr = JSON.parse(fs.readFileSync(file, 'utf8'));
    return arr
      .filter((c) => !c.source || c.source === 'techstars')
      .map((c) => ({ ...c, source: 'techstars' }));
  }
  throw new Error('No TYPESENSE_API_KEY and no committed data/all.json to fall back to.');
}

const SOURCES = {
  techstars: fetchTechstars,
  yc: fetchYc,
  antler: fetchAntler,
  500: fetch500,
  ef: fetchEf,
};

const DEFAULT_SOURCES = ['techstars', 'yc', 'antler', '500', 'ef'];

async function gatherAll({ sources = DEFAULT_SOURCES, onLog = console.log } = {}) {
  const all = [];
  const summary = {};
  for (const name of sources) {
    const fetcher = SOURCES[name];
    if (!fetcher) {
      onLog(`  ⚠️  Unknown source "${name}" — skipping.`);
      continue;
    }
    try {
      onLog(`  → Fetching ${name}...`);
      const companies = await fetcher();
      summary[name] = companies.length;
      all.push(...companies);
      onLog(`    ✓ ${name}: ${companies.length} companies`);
    } catch (err) {
      summary[name] = 0;
      onLog(`    ✗ ${name} failed: ${err.message}`);
    }
  }
  return { companies: all, summary };
}

module.exports = { gatherAll, fetchTechstars, SOURCES };
