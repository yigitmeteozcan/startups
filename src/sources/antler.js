// Antler — stealth-browser portfolio scrape (Webflow CMS + Algolia). See
// browser-portfolio.js for how it works and why it needs a reachable runner.

const { makeBrowserSource } = require('./browser-portfolio');

const config = {
  source: 'antler',
  url: process.env.ANTLER_PORTFOLIO_URL || 'https://www.antler.co/portfolio',
  program: 'Antler',
};

const src = makeBrowserSource(config);

module.exports = {
  fetchAntler: src.fetch,
  scrapeAntler: src.scrape,
  PORTFOLIO_URL: config.url,
};
