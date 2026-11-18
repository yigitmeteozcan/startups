const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { extractFounders, mergeFounders, pickBatch, enrichYcFounders } = require('../src/sources/yc-founders');

const escapeAttr = (o) => JSON.stringify(o).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// Inertia-style page: props serialized into a data-page attribute.
const inertiaPage = `<html><body><div id="app" data-page="${escapeAttr({
  component: 'CompanyShowPage',
  props: {
    company: {
      name: 'Memorable',
      founders: [
        {
          full_name: 'Nikhil Krishnaswamy',
          title: 'Founder/CEO',
          founder_bio: 'CS @ Stanford. Building navigation for agents @ Memorable',
          linkedin_url: 'https://www.linkedin.com/in/nikhil-k/',
          twitter_url: 'https://x.com/nikhilk8754',
          github_url: 'github.com/nikhilk',
          personal_url: 'nikhil.dev',
          avatar_thumb_url: 'https://bookface-images.s3.amazonaws.com/avatars/n.jpg',
        },
        { full_name: 'Advaiyt Sane', title: 'Founder/CTO', founder_bio: "CS @ CMU '29", linkedin_url: '' },
      ],
    },
  },
})}"></div></body></html>`;

// schema.org LD+JSON page.
const ldPage = `<script type="application/ld+json">${JSON.stringify({
  '@type': 'Organization',
  name: 'Acme',
  founder: [
    { '@type': 'Person', name: 'Jane Doe', jobTitle: 'CEO', sameAs: ['https://linkedin.com/in/jane', 'https://twitter.com/jane'] },
  ],
})}</script>`;

test('extracts founders and all their profile links from an Inertia page', () => {
  const f = extractFounders(inertiaPage);
  assert.equal(f.length, 2);
  assert.deepEqual(f[0], {
    name: 'Nikhil Krishnaswamy',
    role: 'Founder/CEO',
    linkedin: 'https://www.linkedin.com/in/nikhil-k/',
    twitter: 'https://x.com/nikhilk8754',
    github: 'https://github.com/nikhilk',
    website: 'https://nikhil.dev',
    bio: 'CS @ Stanford. Building navigation for agents @ Memorable',
    avatar: 'https://bookface-images.s3.amazonaws.com/avatars/n.jpg',
  });
  assert.deepEqual(f[1], { name: 'Advaiyt Sane', role: 'Founder/CTO', linkedin: '', bio: "CS @ CMU '29" });
});

test('extracts founders from schema.org markup', () => {
  assert.deepEqual(extractFounders(ldPage), [
    { name: 'Jane Doe', role: 'CEO', linkedin: 'https://linkedin.com/in/jane', twitter: 'https://twitter.com/jane' },
  ]);
});

test('pages without founder data yield nothing', () => {
  assert.deepEqual(extractFounders('<html><body>Hello</body></html>'), []);
  assert.deepEqual(extractFounders(`<div data-page="${escapeAttr({ props: { company: { name: 'X', tags: ['AI'] } } })}"></div>`), []);
});

test('merging founders never loses a person or a link', () => {
  const existing = [
    { name: 'Nikhil Krishnaswamy', role: 'CEO', linkedin: 'https://linkedin.com/in/old', twitter: 'https://x.com/n' },
    { name: 'Former Founder', role: 'CTO', linkedin: 'https://linkedin.com/in/ff' },
  ];
  const scraped = [{ name: 'Nikhil Krishnaswamy', role: 'Founder/CEO', linkedin: 'https://linkedin.com/in/new' }];
  assert.deepEqual(mergeFounders(existing, scraped), [
    { name: 'Nikhil Krishnaswamy', role: 'Founder/CEO', linkedin: 'https://linkedin.com/in/new', twitter: 'https://x.com/n' },
    { name: 'Former Founder', role: 'CTO', linkedin: 'https://linkedin.com/in/ff' },
  ]);
});

test('batches: never-checked first (newest year first), then stale ones', () => {
  const yc = (slug, year) => ({ source: 'yc', name: slug, year, sourceUrl: `https://www.ycombinator.com/companies/${slug}` });
  const companies = [yc('old', 2010), yc('new', 2027), yc('checked', 2020), yc('stale', 2015), { source: 'ef', name: 'x' }];
  const state = { checked: { checkedAt: '2026-11-10' }, stale: { checkedAt: '2026-01-01' } };
  const now = Date.parse('2026-11-18');
  assert.deepEqual(pickBatch(companies, state, { now }).map((c) => c.name), ['new', 'old', 'stale']);
  assert.deepEqual(pickBatch(companies, state, { now, batch: 1 }).map((c) => c.name), ['new']);
});

test('enrichment updates YC records and saves progress', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ycf-'));
  const companies = [
    { source: 'yc', name: 'Memorable', year: 2027, founders: [], sourceUrl: 'https://www.ycombinator.com/companies/memorable' },
    { source: 'yc', name: 'Broken', year: 2027, founders: [], sourceUrl: 'https://www.ycombinator.com/companies/broken' },
  ];
  const fetchFn = async (url) =>
    url.endsWith('/memorable')
      ? { ok: true, status: 200, text: async () => inertiaPage }
      : { ok: false, status: 404, text: async () => '' };
  const stats = await enrichYcFounders(companies, { rootDir: root, fetchFn, delayMs: 0, onLog: () => {}, now: new Date('2026-11-18') });
  assert.equal(stats.withFounders, 1);
  assert.equal(stats.failed, 1);
  assert.deepEqual(companies[0].founders.map((f) => f.name), ['Nikhil Krishnaswamy', 'Advaiyt Sane']);
  assert.deepEqual(companies[1].founders, [], 'failed page changes nothing');
  const state = JSON.parse(fs.readFileSync(path.join(root, 'data', '_state', 'yc-founders.json'), 'utf8'));
  assert.deepEqual(state, { memorable: { checkedAt: '2026-11-18', found: 2 } });
});

test('expiring signed photo URLs are stored as stable public URLs', () => {
  const signed = 'https://bookface-images.s3.us-west-2.amazonaws.com/avatars/abc.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=x&X-Amz-Expires=3600&X-Amz-Signature=deadbeef';
  const page = `<div data-page="${escapeAttr({ props: { company: { founders: [{ full_name: 'A B', title: 'CEO', avatar_thumb_url: signed }] } } })}"></div>`;
  assert.equal(extractFounders(page)[0].avatar, 'https://bookface-images.s3.us-west-2.amazonaws.com/avatars/abc.jpg');
  const { repairFounders } = require('../src/finalize');
  assert.equal(repairFounders([{ name: 'A B', avatar: signed }], 'yc')[0].avatar, 'https://bookface-images.s3.us-west-2.amazonaws.com/avatars/abc.jpg');
});
