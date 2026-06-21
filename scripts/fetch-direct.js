#!/usr/bin/env node
// CI-friendly dataset build: queries Typesense directly (no browser), then
// writes the full sliced dataset. Requires TYPESENSE_API_KEY in the env.

const path = require('path');
const { fetchAllCompanies } = require('../src/typesense');
const { writeDataset, writeXlsx } = require('../src/dataset');

async function main() {
  const root = path.resolve(__dirname, '..');
  console.log('Fetching all companies from Typesense (no browser)...');
  const companies = await fetchAllCompanies();
  console.log(`Fetched ${companies.length} companies.`);

  const stats = writeDataset(companies, { rootDir: root });
  await writeXlsx(companies, path.join(root, 'data', 'all.xlsx'));

  console.log(`\n✅ Wrote dataset to data/ (${companies.length} companies)`);
  console.log(`   Unicorns: ${stats.unicorns} · Exits: ${stats.exits} · B Corps: ${stats.bCorps}`);
}

main().catch((err) => {
  console.error('\n❌ Fetch failed:', err.message);
  process.exit(1);
});
