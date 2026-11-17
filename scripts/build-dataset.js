#!/usr/bin/env node
// `npm run build:data` — kept for compatibility. This used to scrape Techstars
// only and then overwrite the whole multi-source dataset with it (wiping every
// other source). It now runs the full, safe multi-source build: every source is
// fetched live, and Techstars is scraped in a headless browser when no
// TYPESENSE_API_KEY is set.

const { main } = require('./fetch-direct');

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Build failed:', err.message);
    process.exit(1);
  });
