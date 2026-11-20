// Sanity checks on the committed dataset itself. These only assert invariants
// the build guarantees by construction, so normal growth can never fail them.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { isPlausibleCompany } = require('../src/normalize');

const DATA = path.resolve(__dirname, '..', 'data');
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

test('committed dataset: every record is a real company with a unique id', () => {
  const all = read('all.json');
  assert.ok(all.length > 1000);
  const bad = all.filter((c) => !isPlausibleCompany(c)).map((c) => `${c.source}:${c.name}`);
  assert.deepEqual(bad, []);
  const ids = all.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('committed dataset: every source is present', () => {
  const sources = new Set(read('all.json').map((c) => c.source));
  for (const s of ['techstars', 'yc', 'antler', '500', 'ef', 'alchemist', 'plugandplay', 'sosv', 'speedrun', 'itucekirdek', 'sparklabs', 'founderinstitute']) {
    assert.ok(sources.has(s), `missing source ${s}`);
  }
});

test('committed slices: every index entry points at a file with the right count', () => {
  for (const dir of ['by-source', 'by-year', 'by-program', 'by-region', 'by-country', 'by-industry']) {
    const index = read(`${dir}/index.json`);
    const slugs = Object.values(index).map((v) => v.slug);
    assert.equal(new Set(slugs).size, slugs.length, `${dir}: duplicate slugs`);
    for (const [name, v] of Object.entries(index)) {
      assert.equal(read(v.file).length, v.count, `${dir}/${name}`);
    }
  }
});

test('explorer: scripts parse and the CSP allows exactly what the page uses', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '..', 'docs', 'index.html'), 'utf8');
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /script-src 'self' https:\/\/cdn\.sheetjs\.com;/);
  assert.ok(!/<script>[^<]/.test(html), 'no inline scripts');
  assert.ok(!/\son[a-z]+=/i.test(html), 'no inline event handlers');
  const app = fs.readFileSync(path.resolve(__dirname, '..', 'docs', 'app.js'), 'utf8');
  assert.doesNotThrow(() => new Function(app));
  assert.ok(!/innerHTML|insertAdjacentHTML|outerHTML/.test(app), 'no HTML-string rendering');
});
