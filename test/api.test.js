const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createApp } = require('../src/index');
const { DataStore } = require('../src/store');
const { finalizeCompanies } = require('../src/finalize');

const company = (o) => ({
  source: 'yc', name: 'Acme', description: 'Makes things', logo: '', website: '', location: '', region: '',
  subregion: '', tags: [], year: 2020, program: '', programSlugs: [], isExit: false, isUnicorn: false,
  isBCorp: false, isCurrentSession: false, founders: [],
  social: { linkedin: '', twitter: '', facebook: '', crunchbase: '' }, extra: {}, ...o,
});

const DATA = finalizeCompanies([
  company({ name: 'Stripe', website: 'stripe.com', tags: ['Fintech'], year: 2009, region: 'United States of America', location: 'San Francisco, CA, USA', isUnicorn: true }),
  company({ source: 'techstars', name: 'DigitalOcean', website: 'digitalocean.com', tags: ['Cloudtech and DevOps'], year: 2012, location: 'New York City, New York, United States', extra: { country: 'United States', city: 'New York City' }, isExit: true }),
  company({ source: 'ef', name: 'Cleo', tags: ['Fintech'], year: 2015, founders: [{ name: 'Barney Hussey-Yeo', role: 'CEO', linkedin: 'https://www.linkedin.com/in/bhusseyyeo/' }] }),
  company({ source: 'plugandplay', name: 'RecoSele', year: '', location: 'Japan', extra: { country: 'Japan' }, tags: ['Brand & Retail'] }),
  company({ source: 'yc', name: 'Stripey', year: 2021 }),
]);

async function start(opts = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sp-api-'));
  fs.writeFileSync(path.join(dir, 'all.json'), JSON.stringify(DATA));
  fs.writeFileSync(path.join(dir, 'stats.json'), JSON.stringify({ generatedAt: '2026-11-17T00:00:00.000Z', total: DATA.length }));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ sources: [{ name: 'yc', status: 'live' }] }));
  const store = new DataStore({ dataDir: dir, dataUrl: '' });
  const app = createApp({ store, ...opts });
  const server = await new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = async (p, init) => {
    const res = await fetch(base + p, init);
    const type = res.headers.get('content-type') || '';
    return { res, body: type.includes('json') ? await res.json() : await res.arrayBuffer() };
  };
  return { server, get, dir };
}

test('GET /portfolio serves every source with filters', async (t) => {
  const { server, get } = await start();
  t.after(() => server.close());

  let { res, body } = await get('/portfolio');
  assert.equal(res.status, 200);
  assert.equal(body.pagination.total, 5);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  assert.equal(res.headers.get('x-powered-by'), null);

  ({ body } = await get('/portfolio?source=ef'));
  assert.deepEqual(body.companies.map((c) => c.name), ['Cleo']);
  ({ body } = await get('/portfolio?industry=fintech&yearFrom=2010'));
  assert.deepEqual(body.companies.map((c) => c.name), ['Cleo']);
  ({ body } = await get('/portfolio?country=united%20states&unicorn=true'));
  // DigitalOcean is flagged by the curated unicorn-domain list.
  assert.deepEqual(body.companies.map((c) => c.name), ['Stripe', 'DigitalOcean']);
  ({ body } = await get('/portfolio?country=united%20states&unicorn=true&exit=false'));
  assert.deepEqual(body.companies.map((c) => c.name), ['Stripe']);
  ({ body } = await get('/portfolio?search=hussey'));
  assert.deepEqual(body.companies.map((c) => c.name), ['Cleo'], 'search covers founders');
  ({ body } = await get('/portfolio?country=japan'));
  assert.deepEqual(body.companies.map((c) => c.name), ['RecoSele']);
  ({ body } = await get('/portfolio?sort=year-desc&limit=2'));
  assert.deepEqual(body.companies.map((c) => c.year), [2021, 2015]);
  assert.equal(body.pagination.totalPages, 3);
  // Legacy params from the old Techstars-only API still work.
  ({ body } = await get('/portfolio?tag=cloud&location=new%20york&year=2012'));
  assert.deepEqual(body.companies.map((c) => c.name), ['DigitalOcean']);
  // year is an exact match now (the old substring match made year=1 match everything).
  ({ body } = await get('/portfolio?year=1'));
  assert.equal(body.pagination.total, 0);
  // Hostile / malformed params are handled.
  ({ res, body } = await get('/portfolio?limit=99999&page=-3&search=a&search=b'));
  assert.equal(res.status, 200);
  assert.equal(body.pagination.limit, 500);
  assert.equal(body.pagination.page, 1);
});

test('GET /portfolio/:idOrName', async (t) => {
  const { server, get } = await start();
  t.after(() => server.close());
  let { res, body } = await get('/portfolio/yc-stripe');
  assert.equal(body.company.name, 'Stripe');
  ({ body } = await get('/portfolio/stripe'));
  assert.equal(body.company.name, 'Stripe', 'exact name beats prefix match');
  assert.deepEqual(body.otherMatches, []);
  ({ body } = await get('/portfolio/strip'));
  assert.equal(body.company.name, 'Stripe');
  assert.equal(body.otherMatches.length, 1);
  ({ res } = await get('/portfolio/nothing-like-this'));
  assert.equal(res.status, 404);
});

test('CSV / XLSX / facets / stats / sources / health', async (t) => {
  const { server, get } = await start();
  t.after(() => server.close());
  let { res, body } = await get('/portfolio.csv?source=yc');
  assert.equal(res.status, 200);
  const csv = Buffer.from(body).toString('utf8');
  assert.equal(csv.trim().split('\n').length, 3);
  ({ res, body } = await get('/portfolio.xlsx'));
  assert.equal(res.status, 200);
  assert.equal(Buffer.from(body).subarray(0, 2).toString(), 'PK', 'xlsx is a zip');
  ({ body } = await get('/facets'));
  assert.equal(body.facets.source.length, 4);
  ({ body } = await get('/stats'));
  assert.equal(body.stats.total, 5);
  ({ body } = await get('/sources'));
  assert.equal(body.sources[0].name, 'yc');
  ({ body } = await get('/health'));
  assert.equal(body.data.companies, 5);
  ({ res } = await get('/does-not-exist'));
  assert.equal(res.status, 404);
});

test('data reloads when all.json changes', async (t) => {
  const { server, get, dir } = await start();
  t.after(() => server.close());
  await get('/portfolio');
  const more = [...DATA, ...finalizeCompanies([company({ name: 'NewCo', source: 'antler' })])];
  await new Promise((r) => setTimeout(r, 20));
  fs.writeFileSync(path.join(dir, 'all.json'), JSON.stringify(more));
  await new Promise((r) => setTimeout(r, 2100)); // stat check runs at most every 2s
  const { body } = await get('/portfolio');
  assert.equal(body.pagination.total, 6);
});

test('admin endpoints: token required, proxied requests refused', async (t) => {
  const withToken = await start({ adminToken: 's3cret' });
  t.after(() => withToken.server.close());
  let { res } = await withToken.get('/cache', { method: 'DELETE' });
  assert.equal(res.status, 401);
  ({ res } = await withToken.get('/cache', { method: 'DELETE', headers: { Authorization: 'Bearer wrong' } }));
  assert.equal(res.status, 401);
  ({ res } = await withToken.get('/cache', { method: 'DELETE', headers: { Authorization: 'Bearer s3cret' } }));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), null, 'no CORS on admin');

  let rebuilt = 0;
  const noToken = await start({ adminToken: '', rebuild: async () => { rebuilt++; return { total: 0 }; } });
  t.after(() => noToken.server.close());
  ({ res } = await noToken.get('/cache', { method: 'DELETE' }));
  assert.equal(res.status, 200, 'localhost allowed without token');
  ({ res } = await noToken.get('/cache', { method: 'DELETE', headers: { 'X-Forwarded-For': '203.0.113.9' } }));
  assert.equal(res.status, 403, 'request through a proxy refused');
  ({ res } = await noToken.get('/admin/rebuild', { method: 'POST' }));
  assert.equal(res.status, 202);
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(rebuilt, 1);
});

test('errors never leak internals', async (t) => {
  const store = { mode: 'file', get: async () => { throw new Error('/secret/path/all.json exploded'); }, info: () => ({}) };
  const app = createApp({ store });
  const server = await new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  t.after(() => server.close());
  const origError = console.error;
  console.error = () => {};
  t.after(() => { console.error = origError; });
  const res = await fetch(`http://127.0.0.1:${server.address().port}/portfolio`);
  const body = await res.json();
  assert.equal(res.status, 500);
  assert.equal(body.message, 'Internal server error.');
});
