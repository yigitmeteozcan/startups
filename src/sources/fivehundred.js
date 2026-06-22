// 500 Global (500.co) — stealth-browser portfolio scrape. JS-rendered and
// Cloudflare-guarded, so it runs via the shared browser scraper where the host
// is reachable (CI / residential IP). See browser-portfolio.js.

const { makeBrowserSource } = require('./browser-portfolio');

const config = {
  source: '500',
  url: process.env.FIVEHUNDRED_PORTFOLIO_URL || 'https://500.co/portfolio',
  program: '500 Global',
};

const src = makeBrowserSource(config);

module.exports = {
  fetch500: src.fetch,
  scrape500: src.scrape,
  PORTFOLIO_URL: config.url,
};
