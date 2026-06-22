// Plug and Play (plugandplaytechcenter.com). JS-rendered, Cloudflare-guarded
// "our startups" directory with no public data API we can replay browserless,
// so it runs via the shared stealth-browser scraper. See browser-portfolio.js.

const { makeBrowserSource } = require('./browser-portfolio');

const config = {
  source: 'plugandplay',
  url:
    process.env.PLUGANDPLAY_PORTFOLIO_URL ||
    'https://www.plugandplaytechcenter.com/innovation-services/startups/our-startups',
  program: 'Plug and Play',
};

const src = makeBrowserSource(config);

module.exports = {
  fetchPlugAndPlay: src.fetch,
  scrapePlugAndPlay: src.scrape,
  PORTFOLIO_URL: config.url,
};
