#!/usr/bin/env node
// CI-friendly dataset build. Gathers every source (Techstars via Typesense, YC
// via the static JSON mirror, Antler via the headless browser), merges them,
// and writes the full sliced dataset.
//
// Techstars needs TYPESENSE_API_KEY in the env; if it's absent the build falls
// back to the committed data/all.json for Techstars. Antler needs a browser and
// network reachability to antler.co — if it can't run it's skipped without
// failing the build. Pass SOURCES=techstars,yc to limit which sources run.

const path = require('path');
const { gatherAll } = require('../src/sources');
const { writeDataset, writeXlsx } = require('../src/dataset');

async function main() {
  const root = path.resolve(__dirname, '..');
  const sources = (process.env.SOURCES || 'techstars,yc,antler,500,ef,alchemist,plugandplay')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Gathering sources: ${sources.join(', ')}`);
  const { companies, summary } = await gatherAll({ sources });
  console.log(`\nFetched ${companies.length} companies total:`);
  for (const [name, n] of Object.entries(summary)) console.log(`  ${name}: ${n}`);

  if (companies.length === 0) {
    throw new Error('No companies fetched from any source — refusing to overwrite dataset.');
  }

  const stats = writeDataset(companies, { rootDir: root });
  await writeXlsx(companies, path.join(root, 'data', 'all.xlsx'));

  console.log(`\n✅ Wrote dataset to data/ (${companies.length} companies)`);
  console.log(`   Unicorns: ${stats.unicorns} · Exits: ${stats.exits} · B Corps: ${stats.bCorps}`);
}

main().catch((err) => {
  console.error('\n❌ Fetch failed:', err.message);
  process.exit(1);
});
