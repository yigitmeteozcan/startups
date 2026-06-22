// Alchemist Accelerator (alchemistaccelerator.com). JS-rendered, Cloudflare-
// guarded portfolio page with no public data API we can replay browserless, so
// it runs via the shared stealth-browser scraper. See browser-portfolio.js.

const { makeBrowserSource } = require('./browser-portfolio');

const config = {
  source: 'alchemist',
  url: process.env.ALCHEMIST_PORTFOLIO_URL || 'https://www.alchemistaccelerator.com/portfolio',
  program: 'Alchemist Accelerator',
};

const src = makeBrowserSource(config);

module.exports = {
  fetchAlchemist: src.fetch,
  scrapeAlchemist: src.scrape,
  PORTFOLIO_URL: config.url,
};
