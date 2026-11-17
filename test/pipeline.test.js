const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { gatherAll } = require('../src/sources');
const { looksLikeCompany } = require('../src/sources/browser-portfolio');

const company = (source, i) => ({ source, name: `${source} co ${i}`, description: 'real company', website: `https://${source}${i}.com` });
const many = (source, n) => Array.from({ length: n }, (_, i) => company(source, i));

function committedFile(records) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sp-'));
  const file = path.join(dir, 'all.json');
  fs.writeFileSync(file, JSON.stringify(records));
  return file;
}

const run = (fetchers, committed, opts = {}) =>
  gatherAll({ sources: Object.keys(fetchers), fetchers, committedFile: committedFile(committed), onLog: () => {}, ...opts });

test('a healthy live result replaces committed data', async () => {
  const r = await run({ yc: async () => many('yc', 110) }, many('yc', 100));
  assert.equal(r.summary.yc, 110);
  assert.equal(r.statuses.yc.status, 'live');
});

test('junk-only result keeps committed records (the Plug and Play incident)', async () => {
  const junk = ['disableCookieSubmission', 'renderRawHtml', 'lang'].map((name) => ({ name, description: '' }));
  const r = await run({ plugandplay: async () => junk }, many('plugandplay', 5508));
  assert.equal(r.summary.plugandplay, 5508);
  assert.equal(r.statuses.plugandplay.status, 'cached');
  assert.match(r.statuses.plugandplay.reason, /junk/);
});

test('suspicious shrink keeps committed records', async () => {
  const r = await run({ antler: async () => many('antler', 30) }, many('antler', 1000));
  assert.equal(r.summary.antler, 1000);
  assert.equal(r.statuses.antler.status, 'cached');
  assert.match(r.statuses.antler.reason, /broken scrape/);
});

test('a failing source (Techstars included) keeps committed records', async () => {
  const boom = async () => { throw new Error('401 bad key'); };
  const r = await run({ techstars: boom, yc: async () => many('yc', 50) }, [...many('techstars', 5105), ...many('yc', 50)]);
  assert.equal(r.summary.techstars, 5105);
  assert.equal(r.statuses.techstars.status, 'cached');
  assert.match(r.statuses.techstars.reason, /401/);
  assert.equal(r.companies.length, 5155);
});

test('a hung source times out and falls back', async () => {
  const hang = () => new Promise(() => {});
  const r = await run({ ef: hang }, many('ef', 40), { sourceTimeoutMs: 50 });
  assert.equal(r.summary.ef, 40);
  assert.match(r.statuses.ef.reason, /timed out/);
});

test('offline and partial runs keep every other source', async () => {
  const committed = [...many('yc', 20), ...many('ef', 20)];
  const neverCalled = async () => { throw new Error('should not be called'); };
  const offline = await run({ yc: neverCalled, ef: neverCalled }, committed, { offline: true });
  assert.equal(offline.companies.length, 40);
  const partial = await run({ yc: async () => many('yc', 21), ef: neverCalled }, committed, { live: ['yc'] });
  assert.equal(partial.summary.yc, 21);
  assert.equal(partial.summary.ef, 20);
  assert.equal(partial.statuses.ef.reason, 'not fetched in this run');
});

test('browser scraper ignores JSON that merely has a name key', () => {
  assert.equal(looksLikeCompany({ name: 'renderRawHtml', value: true }), false);
  assert.equal(looksLikeCompany({ name: 'lang', description: '' }), false);
  assert.equal(looksLikeCompany({ name: 'Acme', website: 'acme.com' }), true);
});
