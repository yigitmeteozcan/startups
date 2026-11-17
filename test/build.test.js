const test = require('node:test');
const assert = require('node:assert/strict');
const { staleSources, sourcesToAlert, shouldWriteXlsx } = require('../scripts/fetch-direct');

const TUESDAY = new Date('2026-11-17T23:00:00Z');
const MONDAY = new Date('2026-11-16T10:00:00Z');

test('stale sources: cached for 3+ days or never fetched live', () => {
  const sources = [
    { name: 'yc', status: 'live', lastLiveFetch: '2026-11-17T10:00:00Z' },
    { name: 'ef', status: 'cached', lastLiveFetch: '2026-11-16T10:00:00Z' },
    { name: 'plugandplay', status: 'cached', lastLiveFetch: '2026-11-09T16:38:22Z' },
    { name: 'techstars', status: 'cached', lastLiveFetch: null },
  ];
  assert.deepEqual(staleSources(sources, TUESDAY.getTime()).map((s) => s.name), ['plugandplay', 'techstars']);
});

test('alerts fire on the first stale day, then only on Mondays', () => {
  const stale = [
    { name: 'plugandplay', lastLiveFetch: '2026-11-09T16:38:22Z' }, // stale for a week
    { name: 'techstars', lastLiveFetch: null }, // never fetched live
    { name: 'ef', lastLiveFetch: '2026-11-14T10:00:00Z' }, // just went stale
  ];
  assert.deepEqual(sourcesToAlert(stale, TUESDAY).map((s) => s.name), ['ef']);
  assert.deepEqual(sourcesToAlert(stale, MONDAY).map((s) => s.name), ['plugandplay', 'techstars', 'ef']);
});

test('all.xlsx: always rewritten locally, weekly in scheduled CI', () => {
  assert.equal(shouldWriteXlsx('data/all.xlsx', 'always', TUESDAY), true);
  assert.equal(shouldWriteXlsx('data/all.xlsx', 'weekly', TUESDAY), false);
  assert.equal(shouldWriteXlsx('data/all.xlsx', 'weekly', MONDAY), true);
  assert.equal(shouldWriteXlsx('data/does-not-exist.xlsx', 'weekly', TUESDAY), true);
});
