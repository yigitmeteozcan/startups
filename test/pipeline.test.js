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

test('companies missing from a live fetch are kept, flagged listed:false', async () => {
  const committed = [...many('techstars', 100), { source: 'techstars', name: 'Latch', description: 'Smart locks', website: 'https://latch.com' }];
  // Live result: 100 companies, Latch gone, one company renamed but same website.
  const live = many('techstars', 100).map((c, i) => (i === 0 ? { ...c, name: 'Renamed Co' } : c));
  const r = await run({ techstars: async () => live }, committed);
  assert.equal(r.statuses.techstars.status, 'live');
  assert.equal(r.companies.length, 101, 'nothing deleted');
  const latch = r.companies.find((c) => c.name === 'Latch');
  assert.equal(latch.listed, false);
  assert.match(latch.delistedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(!r.companies.some((c) => c.name === 'techstars co 0'), 'rename matched by website, not duplicated');
  assert.match(r.statuses.techstars.reason, /1 no longer listed/);
  // If Latch comes back, it is listed again (live record wins).
  const back = await run({ techstars: async () => [...live, { source: 'techstars', name: 'Latch', description: 'Smart locks', website: 'https://latch.com' }] }, r.companies);
  const latch2 = back.companies.filter((c) => c.name === 'Latch');
  assert.equal(latch2.length, 1);
  assert.equal(latch2[0].listed, undefined);
});

test('a rename keeps the former name', async () => {
  const committed = [...many('techstars', 50), { source: 'techstars', name: 'TawkitAI', description: 'AI copilots', website: 'https://copilotkit.ai' }];
  const live = [...many('techstars', 50), { source: 'techstars', name: 'CopilotKit', description: 'AI copilots', website: 'https://copilotkit.ai' }];
  const r = await run({ techstars: async () => live }, committed);
  const c = r.companies.find((x) => x.name === 'CopilotKit');
  assert.deepEqual(c.formerNames, ['TawkitAI']);
  assert.ok(!r.companies.some((x) => x.name === 'TawkitAI'), 'not duplicated');
  // Carried forward on the next run.
  const r2 = await run({ techstars: async () => live }, r.companies);
  assert.deepEqual(r2.companies.find((x) => x.name === 'CopilotKit').formerNames, ['TawkitAI']);
});

test('rename matching prefers the website over a reused name', async () => {
  const committed = [
    ...many('techstars', 50),
    { source: 'techstars', name: 'FAM', description: 'Teen social app', website: 'https://fam.live' },
    { source: 'techstars', name: 'Frictionless Technologies Ltd', description: 'Payments copilot', website: 'https://joinfam.com' },
  ];
  const live = [
    ...many('techstars', 50),
    { source: 'techstars', name: 'Smack', description: 'Teen social app', website: 'https://fam.live' },
    { source: 'techstars', name: 'FAM', description: 'Payments copilot', website: 'https://joinfam.com' },
  ];
  const r = await run({ techstars: async () => live }, committed);
  assert.deepEqual(r.companies.find((c) => c.name === 'Smack').formerNames, ['FAM']);
  assert.deepEqual(r.companies.find((c) => c.name === 'FAM').formerNames, ['Frictionless Technologies Ltd']);
  assert.equal(r.companies.length, 52);
});

test('values blanked by the source are kept; real updates still win', async () => {
  const committed = [...many('techstars', 50), {
    source: 'techstars', name: 'Seldon', description: 'ML deployment', website: 'https://seldon.io',
    social: { linkedin: 'https://linkedin.com/company/seldon', twitter: '', facebook: 'https://fb.com/seldon', crunchbase: '' },
    founders: [{ name: 'Alex Housley', role: 'CEO', linkedin: '' }], extra: { city: 'London' }, tags: ['AI'],
  }];
  const live = [...many('techstars', 50), {
    source: 'techstars', name: 'Seldon', description: 'Open-source ML deployment', website: '',
    social: { linkedin: '', twitter: 'https://x.com/seldon_io', facebook: '', crunchbase: '' }, founders: [], extra: {}, tags: [],
  }];
  const r = await run({ techstars: async () => live }, committed);
  const c = r.companies.find((x) => x.name === 'Seldon');
  assert.equal(c.website, 'https://seldon.io', 'blanked website kept');
  assert.equal(c.description, 'Open-source ML deployment', 'updated description wins');
  assert.equal(c.social.linkedin, 'https://linkedin.com/company/seldon');
  assert.equal(c.social.twitter, 'https://x.com/seldon_io');
  assert.equal(c.social.facebook, 'https://fb.com/seldon');
  assert.deepEqual(c.founders.map((f) => f.name), ['Alex Housley']);
  assert.equal(c.extra.city, 'London');
  assert.deepEqual(c.tags, ['AI']);
});

test('duplicate entries in a source never borrow each other\'s data', async () => {
  const dupA = { source: 'plugandplay', name: 'folio', description: 'A', website: 'https://folio.jp', tags: ['Media'], extra: { country: 'Japan', city: '' }, isExit: false };
  const dupB = { source: 'plugandplay', name: 'folio', description: 'B', website: 'https://folio.jp', tags: ['Fintech'], extra: { country: 'Japan', city: 'Tokyo' }, isExit: true };
  const pair1 = { source: 'plugandplay', name: 'TopoLogic', description: 'x', website: 'https://topologic.jp' };
  const pair2 = { source: 'plugandplay', name: 'TopoLogic Inc.', description: 'y', website: 'https://topologic.jp' };
  const committed = [...many('plugandplay', 40), dupA, dupB, pair1, pair2];
  const r = await run({ plugandplay: async () => committed.map((c) => ({ ...c })) }, committed);
  const folios = r.companies.filter((c) => c.name === 'folio');
  assert.deepEqual(folios.map((c) => c.tags), [['Media'], ['Fintech']]);
  assert.deepEqual(folios.map((c) => c.extra.city), ['', 'Tokyo']);
  assert.deepEqual(folios.map((c) => c.isExit), [false, true]);
  assert.ok(r.companies.every((c) => !c.formerNames), 'no fake renames between duplicates');
  assert.equal(r.companies.length, committed.length);
});
