const test = require('node:test');
const assert = require('node:assert/strict');
const { buildGeo } = require('../src/geo');

const co = (id, o) => ({ id, source: 'yc', name: id, extra: {}, ...o });

test('places companies at their city, with state and alias handling', () => {
  const geo = buildGeo([
    co('a', { location: 'San Francisco, CA, USA', country: 'United States' }),
    co('b', { location: 'Cambridge, MA, USA', country: 'United States' }),
    co('c', { location: 'Cambridge, England, United Kingdom', country: 'United Kingdom' }),
    co('d', { location: 'Bangalore, KA, India', country: 'India' }),
    co('e', { source: 'techstars', location: '', extra: { city: 'New York', state_province: 'New York' }, country: 'United States' }),
    co('f', { location: 'Milano, Lombardy, Italy', country: 'Italy' }),
  ]);
  const at = (id) => geo.points.find((p) => p.ids.includes(id));
  assert.equal(at('a').key, 'us/san-francisco');
  assert.ok(Math.abs(at('a').lat - 37.77) < 0.1 && Math.abs(at('a').lng + 122.42) < 0.1);
  assert.ok(Math.abs(at('b').lat - 42.37) < 0.2, 'Cambridge, MA — not the UK one');
  assert.ok(Math.abs(at('c').lat - 52.2) < 0.2, 'Cambridge, UK');
  assert.equal(at('d').key, 'in/bengaluru');
  assert.equal(at('e').key, 'us/new-york-city');
  assert.equal(at('f').key, 'it/milan');
  assert.ok(geo.points.every((p) => p.precision === 'city'));
});

test('falls back to the country centre; unknown places are skipped', () => {
  const geo = buildGeo([
    co('x', { source: '500', location: 'Japan', country: 'Japan' }),
    co('y', { source: 'plugandplay', location: 'Japan', extra: { city: 'Sunnyvale' }, country: 'Japan' }), // PnP city = their office
    co('z', { source: 'antler', location: '', country: '' }),
  ]);
  assert.equal(geo.total, 3);
  assert.equal(geo.located, 2);
  const jp = geo.points.find((p) => p.key === 'jp');
  assert.equal(jp.precision, 'country');
  assert.deepEqual(jp.ids, ['x', 'y']);
  assert.ok(jp.lat > 30 && jp.lat < 40 && jp.lng > 130 && jp.lng < 141, 'inside Japan');
  assert.match(geo.attribution, /GeoNames/);
});
