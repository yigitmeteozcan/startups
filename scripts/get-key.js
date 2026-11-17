#!/usr/bin/env node
// Run this once from your local machine (not CI) to capture the Typesense
// search key from the live Techstars portfolio page.
//
// Usage:
//   npm run install:browsers   (one-time, downloads Chromium)
//   npm run get-key
//
// Copy the printed key and add it as a GitHub Actions secret:
//   Repo → Settings → Secrets and variables → Actions → New secret
//   Name: TYPESENSE_API_KEY  Value: <printed key>

const { chromium } = require('playwright');

const PORTFOLIO_URL = 'https://www.techstars.com/portfolio';

(async () => {
  console.log('Opening Techstars portfolio page…');
  const browser = await chromium.launch({
    headless: true,
    chromiumSandbox: process.env.CHROMIUM_SANDBOX === '1',
  });
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  let key = null;

  page.on('request', (req) => {
    const headers = req.headers();
    const candidate = headers['x-typesense-api-key'];
    if (candidate && !key) {
      key = candidate;
      console.log('\n✅ Typesense API key found:\n');
      console.log('   ' + key);
      console.log('\nAdd this as TYPESENSE_API_KEY in GitHub Actions secrets:');
      console.log('   Repo → Settings → Secrets and variables → Actions → New secret');
      console.log('   Name:  TYPESENSE_API_KEY');
      console.log('   Value: ' + key + '\n');
    }
  });

  try {
    await page.goto(PORTFOLIO_URL, { waitUntil: 'networkidle', timeout: 60000 });
    if (!key) {
      // Scroll to trigger lazy-loaded search requests.
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);
        if (key) break;
      }
    }
  } finally {
    await browser.close();
  }

  if (!key) {
    console.error('❌ Could not capture the Typesense key (page may have blocked the request).');
    console.error('   Try again from a residential connection, or run `npm run fetch:data` —');
    console.error('   without a key it scrapes the page in a browser and captures the key itself.');
    process.exit(1);
  }
})();
