#!/usr/bin/env node
// Local dataset build: uses the headless browser scraper (which auto-captures
// the Typesense API key from the live page), then writes the full sliced
// dataset. No API key needed — run this once from a residential IP to seed the
// data/ directory, then commit. The daily GitHub Action keeps it fresh.

const path = require('path');
const { scrapePortfolio } = require('../src/scraper');
const { writeDataset, writeXlsx } = require('../src/dataset');

async function main() {
  const root = path.resolve(__dirname, '..');
  console.log('Scraping Techstars portfolio via headless browser (~1 min)...');
  const data = await scrapePortfolio();
  console.log(`Fetched ${data.count} companies (source: ${data.source}).`);

  const stats = writeDataset(data.companies, { rootDir: root });
  await writeXlsx(data.companies, path.join(root, 'data', 'all.xlsx'));

  console.log(`\n✅ Wrote dataset to data/ (${data.count} companies)`);
  console.log(`   Unicorns: ${stats.unicorns} · Exits: ${stats.exits} · B Corps: ${stats.bCorps}`);
}

main().catch((err) => {
  console.error('\n❌ Build failed:', err.message);
  process.exit(1);
});
