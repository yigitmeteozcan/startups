#!/usr/bin/env node
// One-off Excel export.
//
//   npm run export                            -> startup-portfolios.xlsx (whole dataset)
//   npm run export -- out.xlsx --source=yc    -> only Y Combinator companies
//   npm run export -- --live                  -> re-scrape Techstars live first
//                                                (needs a browser; the original
//                                                behaviour of this script)

const fs = require('fs');
const path = require('path');
const { buildWorkbook } = require('../src/excel');
const { finalizeCompanies } = require('../src/finalize');

async function main() {
  const args = process.argv.slice(2);
  const flags = Object.fromEntries(
    args.filter((a) => a.startsWith('--')).map((a) => {
      const [k, v] = a.slice(2).split('=');
      return [k, v === undefined ? true : v];
    })
  );
  const outArg = args.find((a) => !a.startsWith('--'));

  let companies;
  let defaultName = 'startup-portfolios.xlsx';
  if (flags.live) {
    const { scrapePortfolio } = require('../src/scraper');
    console.log('Scraping Techstars portfolio (this loads a headless browser, ~1 min)...');
    const data = await scrapePortfolio();
    console.log(`Fetched ${data.count} companies (source: ${data.source}).`);
    companies = data.companies;
    defaultName = 'techstars-portfolio.xlsx';
  } else {
    const file = path.resolve(__dirname, '..', 'data', 'all.json');
    companies = JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  if (flags.source) {
    const wanted = String(flags.source).split(',');
    companies = companies.filter((c) => wanted.includes(c.source));
  }

  const outPath = outArg ? path.resolve(outArg) : path.resolve(process.cwd(), defaultName);
  console.log(`Building Excel workbook for ${companies.length} companies...`);
  await buildWorkbook(finalizeCompanies(companies)).xlsx.writeFile(outPath);
  console.log(`\n✅ Saved ${companies.length} companies to:\n   ${outPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Export failed:', err.message);
    process.exit(1);
  });
