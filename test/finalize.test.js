const test = require('node:test');
const assert = require('node:assert/strict');
const { finalizeCompanies, repairCompany, repairFounders } = require('../src/finalize');

const base = (o) => ({
  source: 'yc', name: 'Acme', description: 'Makes things', logo: '', website: 'acme.com', location: '',
  region: '', subregion: '', tags: [], year: 2020, program: '', programSlugs: [], isExit: false,
  isUnicorn: false, isBCorp: false, isCurrentSession: false, founders: [],
  social: { linkedin: '', twitter: '', facebook: '', crunchbase: '' }, extra: {}, ...o,
});

test('Antler tagline is moved from location back to description', () => {
  const c = repairCompany(base({ source: 'antler', name: '3Square', description: '3Square', location: 'The Decision OS for the AI era.' }));
  assert.equal(c.description, 'The Decision OS for the AI era.');
  assert.equal(c.location, '');
  // A real location is never touched.
  const d = repairCompany(base({ source: 'antler', name: 'X', description: 'Does X', location: 'London' }));
  assert.equal(d.location, 'London');
});

test('founders: duplicates merged without losing roles or LinkedIn', () => {
  const out = repairFounders([
    { name: 'Ahmed  Sidam', role: '', linkedin: '' },
    { name: 'Ahmed Sidam', role: 'CEO', linkedin: 'linkedin.com/in/ahmed' },
    { name: 'arif makhdzir', role: '', linkedin: '' },
    { name: 'Arif Makhdzir', role: 'CTO', linkedin: '' },
  ], '500');
  assert.deepEqual(out.map((f) => [f.name, f.role, f.linkedin]), [
    ['Ahmed Sidam', 'CEO', 'https://linkedin.com/in/ahmed'],
    ['arif makhdzir', 'CTO', ''],
  ]);
  // Same name, different LinkedIn profiles: two different people, both kept.
  const twins = repairFounders([
    { name: 'Sam Lee', linkedin: 'https://linkedin.com/in/a' },
    { name: 'Sam Lee', linkedin: 'https://linkedin.com/in/b' },
  ], 'ef');
  assert.equal(twins.length, 2);
});

test('Alchemist double-spaced names become two founders', () => {
  const out = repairFounders([{ name: 'Edith Harbaugh  John Kodumal', role: '', linkedin: '' }], 'alchemist');
  assert.deepEqual(out.map((f) => f.name), ['Edith Harbaugh', 'John Kodumal']);
});

test('YC relative placeholder logo becomes absolute', () => {
  assert.equal(repairCompany(base({ logo: '/company/thumb/missing.png' })).logo, 'https://www.ycombinator.com/company/thumb/missing.png');
});

test('finalize: canonical tags, unique ids, country, alsoIn, idempotent', () => {
  const input = [
    base({ name: 'Stripe', website: 'stripe.com', tags: ['FinTech'], region: 'United States of America' }),
    base({ source: '500', name: 'Stripe', website: 'https://stripe.com', tags: ['Fintech'], extra: { country: 'USA' } }),
    base({ source: '500', name: 'Other', website: 'https://other.com', tags: ['Fintech'] }),
    base({ name: 'Twin', website: 'a.com' }),
    base({ name: 'Twin', website: 'b.com' }),
    base({ name: 'Twin', website: 'b.com' }),
  ];
  const out = finalizeCompanies(input);
  assert.equal(out.length, input.length, 'never drops a company');
  assert.deepEqual(out.map((c) => c.tags), [['Fintech'], ['Fintech'], ['Fintech'], [], [], []]);
  assert.equal(new Set(out.map((c) => c.id)).size, out.length, 'ids unique');
  assert.equal(out[0].id, 'yc-stripe');
  assert.deepEqual(out[0].alsoIn, ['500']);
  assert.deepEqual(out[1].alsoIn, ['yc']);
  assert.equal(out[0].country, 'United States');
  assert.equal(out[1].country, 'United States');
  assert.equal(out[0].isUnicorn, true, 'known unicorn domain');
  assert.deepEqual(finalizeCompanies(out), out, 'idempotent');
});
