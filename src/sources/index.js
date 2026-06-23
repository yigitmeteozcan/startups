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
const { fetchAlchemist } = require('./alchemist');
const { fetchPlugAndPlay } = require('./plugandplay');

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
  alchemist: fetchAlchemist,
  plugandplay: fetchPlugAndPlay,
};

const DEFAULT_SOURCES = ['techstars', 'yc', 'antler', '500', 'ef', 'alchemist', 'plugandplay'];

// Last-resort fallback: when a source fetches nothing (network flake, a host
// blocking the CI runner, an API change), reuse whatever was already committed
// for it in data/all.json rather than dropping the source from the dataset.
function committedFor(name) {
  try {
    const file = path.resolve(__dirname, '../../data/all.json');
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8')).filter((c) => c.source === name);
  } catch (_) {
    return [];
  }
}

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
      let companies = await fetcher();
      // Don't let a transient empty fetch wipe a source — keep the prior data.
      if ((!companies || companies.length === 0) && name !== 'techstars') {
        const prior = committedFor(name);
        if (prior.length > 0) {
          onLog(`    ⚠️  ${name} returned 0 — keeping ${prior.length} previously committed.`);
          companies = prior;
        }
      }
      summary[name] = companies.length;
      all.push(...companies);
      onLog(`    ✓ ${name}: ${companies.length} companies`);
    } catch (err) {
      const prior = name !== 'techstars' ? committedFor(name) : [];
      if (prior.length > 0) {
        summary[name] = prior.length;
        all.push(...prior);
        onLog(`    ✗ ${name} failed (${err.message}) — kept ${prior.length} committed.`);
      } else {
        summary[name] = 0;
        onLog(`    ✗ ${name} failed: ${err.message}`);
      }
    }
  }
  return { companies: all, summary };
}

module.exports = { gatherAll, fetchTechstars, SOURCES };
