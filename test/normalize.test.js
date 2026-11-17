const test = require('node:test');
const assert = require('node:assert/strict');
const { addHttps, isPlausibleCompany, splitFounderNames, cleanTags } = require('../src/normalize');
const { normalizeCountry, deriveCountry } = require('../src/data/countries');

test('addHttps repairs scraped URLs', () => {
  assert.equal(addHttps('acme.com'), 'https://acme.com');
  assert.equal(addHttps('Https://scape.mx'), 'https://scape.mx');
  assert.equal(addHttps('https://https://a.io/x'), 'https://a.io/x');
  assert.equal(addHttps('http://a.com'), 'http://a.com');
  assert.equal(addHttps('//cdn.x/y.png'), 'https://cdn.x/y.png');
  assert.equal(addHttps(''), '');
  assert.equal(addHttps(null), '');
  assert.equal(addHttps('http://'), '');
  assert.equal(addHttps('https:// https://www.linkedin.com/in/x/'), 'https://www.linkedin.com/in/x/');
});

test('addHttps never emits executable URLs', () => {
  for (const bad of ['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,x', 'vbscript:x']) {
    assert.equal(addHttps(bad), '', bad);
  }
});

test('isPlausibleCompany rejects the HubSpot junk that wiped Plug and Play', () => {
  for (const name of ['disableCookieSubmission', 'renderRawHtml', 'lang']) {
    assert.equal(isPlausibleCompany({ name, description: '', website: '', logo: '', tags: [], founders: [] }), false);
  }
  assert.equal(isPlausibleCompany({ name: 'Acme', description: 'Makes things' }), true);
  assert.equal(isPlausibleCompany({ name: 'Acme', website: 'https://acme.com' }), true);
  assert.equal(isPlausibleCompany({ name: '', description: 'x' }), false);
  assert.equal(isPlausibleCompany(null), false);
});

test('splitFounderNames splits two people but never loses text', () => {
  assert.deepEqual(splitFounderNames('Edith Harbaugh  John Kodumal'), ['Edith Harbaugh', 'John Kodumal']);
  assert.deepEqual(splitFounderNames('Jesper Klingenberg  and Visti Kløft'), ['Jesper Klingenberg', 'Visti Kløft']);
  assert.deepEqual(splitFounderNames('Laurence Cooke  & Hilton McGough'), ['Laurence Cooke', 'Hilton McGough']);
  // Ambiguous text is kept whole (whitespace collapsed), never truncated.
  assert.deepEqual(splitFounderNames('Team: Michele  Lunati'), ['Team: Michele Lunati']);
  assert.deepEqual(splitFounderNames('**Marcus Virginia:** 2x Founder'), ['Marcus Virginia:** 2x Founder']);
  assert.deepEqual(splitFounderNames('Grant Demaree'), ['Grant Demaree']);
  // Idempotent.
  for (const n of ['Edith Harbaugh', 'Team: Michele Lunati']) assert.deepEqual(splitFounderNames(n), [n]);
});

test('cleanTags drops business models, years and countries', () => {
  assert.deepEqual(cleanTags(['Fintech', 'B2B', '2019', 'United States', 'Fintech', 'AI\nSeed']), ['Fintech', 'AI']);
});

test('normalizeCountry merges spellings and rejects non-countries', () => {
  for (const v of ['USA', 'US', 'UNITED STATES', 'United States of America', 'united states']) {
    assert.equal(normalizeCountry(v), 'United States', v);
  }
  assert.equal(normalizeCountry('UK'), 'United Kingdom');
  assert.equal(normalizeCountry('Czech Republic'), 'Czechia');
  assert.equal(normalizeCountry('CAYMAN ISLANDS'), 'Cayman Islands');
  for (const v of ['Remote', 'Unspecified', '02000', 'Europe', 'CA', '']) assert.equal(normalizeCountry(v), '', v);
});

test('deriveCountry finds the country wherever each source keeps it', () => {
  assert.equal(deriveCountry({ source: 'techstars', extra: { country: 'United States' } }), 'United States');
  assert.equal(deriveCountry({ source: 'yc', region: 'United States of America', extra: {} }), 'United States');
  assert.equal(deriveCountry({ source: 'yc', region: 'Remote', location: 'Bengaluru, KA, India; Remote', extra: {} }), 'India');
  assert.equal(deriveCountry({ source: 'alchemist', location: 'Austin, TX, USA', extra: { country: 'USA' } }), 'United States');
  assert.equal(deriveCountry({ source: 'antler', location: '', extra: {} }), '');
});
