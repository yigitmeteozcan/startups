// Entrepreneur First (joinef.com) — stealth-browser portfolio scrape.
// JS-rendered and Cloudflare-guarded; runs via the shared browser scraper where
// the host is reachable (CI / residential IP). See browser-portfolio.js.

const { makeBrowserSource } = require('./browser-portfolio');

const config = {
  source: 'ef',
  url: process.env.EF_PORTFOLIO_URL || 'https://www.joinef.com/portfolio/',
  program: 'Entrepreneur First',
};

const src = makeBrowserSource(config);

module.exports = {
  fetchEf: src.fetch,
  scrapeEf: src.scrape,
  PORTFOLIO_URL: config.url,
};
