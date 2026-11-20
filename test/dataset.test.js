const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { writeDataset, toCsv, csvSafe } = require('../src/dataset');

const company = (o) => ({
  source: 'yc', name: 'Acme', description: 'Makes things', logo: '', website: 'https://acme.com', location: '',
  region: 'Europe', subregion: '', tags: [], year: 2020, program: 'YC W20', programSlugs: [], isExit: false,
  isUnicorn: false, isBCorp: false, isCurrentSession: false,
  founders: [{ name: 'Jane Doe', role: 'CEO', linkedin: 'https://linkedin.com/in/jane' }],
  social: { linkedin: '', twitter: '', facebook: '', crunchbase: '' }, extra: { country: 'UK' }, ...o,
});

function tmpRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'sp-data-'));
}

test('slices whose names collide on disk are merged, not overwritten', () => {
  const root = tmpRoot();
  writeDataset(
    [
      company({ name: 'A', tags: ['Fintech'] }),
      company({ name: 'B', tags: ['FinTech'] }),
      company({ name: 'C', tags: ['Fin-Tech'] }), // two different tags that slugify to "fin-tech"
      company({ name: 'D', tags: ['Fin Tech'] }),
    ],
    { rootDir: root }
  );
  const dir = path.join(root, 'data', 'by-industry');
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'fintech.json'))).length, 2);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'fin-tech.json'))).length, 2);
  const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json')));
  for (const v of Object.values(index)) {
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'data', v.file))).length, v.count);
  }
});

test('stale slice files are kept unless pruning is requested', () => {
  const root = tmpRoot();
  const stale = path.join(root, 'data', 'by-industry', 'old-category.json');
  fs.mkdirSync(path.dirname(stale), { recursive: true });
  fs.writeFileSync(stale, '[]');
  writeDataset([company({ tags: ['AI'] })], { rootDir: root, prune: false });
  assert.ok(fs.existsSync(stale), 'not deleted by default');
  writeDataset([company({ tags: ['AI'] })], { rootDir: root, prune: true });
  assert.ok(!fs.existsSync(stale), 'deleted when prune=true');
});

test('all.json is compact, keeps founders, and adds id/country', () => {
  const root = tmpRoot();
  writeDataset([company({})], { rootDir: root });
  const raw = fs.readFileSync(path.join(root, 'data', 'all.json'), 'utf8');
  assert.ok(!raw.includes('\n'), 'compact');
  const [c] = JSON.parse(raw);
  assert.equal(c.id, 'yc-acme');
  assert.equal(c.country, 'United Kingdom');
  assert.deepEqual(c.founders, [{ name: 'Jane Doe', role: 'CEO', linkedin: 'https://linkedin.com/in/jane' }]);
  assert.ok(fs.existsSync(path.join(root, 'data', 'by-country', 'united-kingdom.json')));
});

test('meta.json tracks per-source freshness', () => {
  const root = tmpRoot();
  writeDataset([company({})], { rootDir: root, sourceStatus: { yc: { status: 'live', reason: '' } } });
  const m1 = JSON.parse(fs.readFileSync(path.join(root, 'data', 'meta.json')));
  const live = m1.sources.find((s) => s.name === 'yc');
  assert.equal(live.status, 'live');
  assert.ok(live.lastLiveFetch);
  // A later cached run keeps the last live timestamp.
  writeDataset([company({})], { rootDir: root, sourceStatus: { yc: { status: 'cached', reason: 'HTTP 500' } } });
  const m2 = JSON.parse(fs.readFileSync(path.join(root, 'data', 'meta.json')));
  const cached = m2.sources.find((s) => s.name === 'yc');
  assert.equal(cached.status, 'cached');
  assert.equal(cached.lastLiveFetch, live.lastLiveFetch);
  assert.equal(cached.note, 'HTTP 500');
});

test('CSV keeps the original 22 columns first and neutralizes formulas', () => {
  const csv = toCsv([company({ name: '=HYPERLINK("x")', description: 'line\r\nbreak' })]);
  const header = csv.split('\n')[0].split(',');
  assert.deepEqual(header.slice(0, 22), [
    'source', 'name', 'description', 'website', 'city', 'state', 'country', 'region', 'subregion', 'tags',
    'year', 'program', 'founders', 'isExit', 'isUnicorn', 'isBCorp', 'isCurrentSession', 'linkedin',
    'twitter', 'facebook', 'crunchbase', 'logo',
  ]);
  assert.ok(header.includes('founder_linkedins'));
  assert.ok(csv.includes(`"'=HYPERLINK(""x"")"`));
  assert.ok(csv.includes('"line\r\nbreak"'));
  assert.equal(csvSafe('-'), '-');
  assert.equal(csvSafe('+1 555'), "'+1 555");
  assert.equal(csvSafe('@handle'), "'@handle");
  assert.equal(csvSafe('Normal'), 'Normal');
});

test('a small dataset raises no size warnings or notes', () => {
  // all.json over jsDelivr's 20 MB limit is served from GitHub automatically,
  // so it is only a note; warnings are reserved for GitHub's 100 MB limit.
  const stats = writeDataset([company({})], { rootDir: tmpRoot() });
  assert.deepEqual(stats.warnings, []);
  assert.deepEqual(stats.notes, []);
});

test('YC detail fields, hiring.json and new.json', () => {
  const { normalizeYc } = require('../src/sources/yc');
  const yc = normalizeYc({
    name: 'Airbnb', slug: 'airbnb', website: 'http://airbnb.com', batch: 'Winter 2009', status: 'Public',
    team_size: 6132, isHiring: true, stage: 'Growth', top_company: true, nonprofit: false, industries: [], regions: [],
  });
  assert.equal(yc.status, 'public');
  assert.equal(yc.teamSize, 6132);
  assert.equal(yc.isHiring, true);
  assert.equal(yc.stage, 'Growth');
  assert.equal(yc.isExit, true);

  const root = tmpRoot();
  const today = new Date().toISOString().slice(0, 10);
  writeDataset(
    [yc, company({ name: 'Fresh', firstSeen: today }), company({ name: 'Old', firstSeen: '2001-01-01' })],
    { rootDir: root }
  );
  const read = (f) => JSON.parse(fs.readFileSync(path.join(root, 'data', f)));
  assert.deepEqual(read('hiring.json').map((c) => c.name), ['Airbnb']);
  assert.deepEqual(read('new.json').map((c) => c.name), ['Fresh']);
  const all = read('all.json');
  const air = all.find((c) => c.name === 'Airbnb');
  assert.equal(air.topCompany, true);
  assert.equal('nonprofit' in air, false, 'false flags are omitted');
  assert.equal('status' in all.find((c) => c.name === 'Fresh'), false, 'no empty detail fields on other sources');
  const meta = read('meta.json');
  assert.equal(meta.endpoints.hiring.count, 1);
  assert.equal(meta.endpoints.new.count, 1);
  const csv = fs.readFileSync(path.join(root, 'data', 'all.csv'), 'utf8').split('\n');
  assert.match(csv[0], /,status,team_size,is_hiring,stage,top_company,first_seen,team_size_range,total_raised$/);
});
