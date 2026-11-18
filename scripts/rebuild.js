#!/usr/bin/env node
// `npm run rebuild` — re-render every derived file (slices, CSV, XLSX, stats,
// meta, README) from the committed data/all.json without touching the network.
// Use it after changing normalization / output code. Nothing is fetched and no
// company is added or removed.

const path = require('path');
const { gatherAll, DEFAULT_SOURCES } = require('../src/sources');
const { writeDataset, writeXlsx } = require('../src/dataset');

async function main() {
  const root = path.resolve(__dirname, '..');
  const { companies } = await gatherAll({ sources: DEFAULT_SOURCES, offline: true, onLog: () => {} });
  if (companies.length === 0) throw new Error('data/all.json is empty or missing.');

  // sourceStatus omitted: each source's status / lastLiveFetch carries over
  // unchanged from the existing meta.json.
  const stats = writeDataset(companies, { rootDir: root });
  await writeXlsx(companies, path.join(root, 'data', 'all.xlsx'));
  console.log(`✅ Rebuilt data/ from committed data (${stats.total} companies, no network).`);
  for (const w of stats.warnings) console.log(`⚠️  ${w}`);
  for (const n of stats.notes || []) console.log(`ℹ️  ${n}`);
}

main().catch((err) => {
  console.error('❌ Rebuild failed:', err.message);
  process.exit(1);
});
