const test = require('node:test');
const assert = require('node:assert/strict');
const { fetchWithTimeout } = require('../src/http');

function stubFetch(t, responses) {
  const original = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    const r = responses[Math.min(calls++, responses.length - 1)];
    if (r instanceof Error) throw r;
    return { status: r, ok: r < 400 };
  };
  t.after(() => { global.fetch = original; });
  return () => calls;
}

const fast = { delays: [1, 1] };

test('retries transient network errors, then succeeds', async (t) => {
  const calls = stubFetch(t, [new TypeError('fetch failed'), 200]);
  const res = await fetchWithTimeout('https://x.test', {}, 1000, fast);
  assert.equal(res.status, 200);
  assert.equal(calls(), 2);
});

test('retries 503 / 429 a limited number of times', async (t) => {
  const calls = stubFetch(t, [503, 429, 503, 200]);
  const res = await fetchWithTimeout('https://x.test', {}, 1000, { retries: 2, delays: [1] });
  assert.equal(res.status, 503, 'gives up after 2 retries and returns the last response');
  assert.equal(calls(), 3);
});

test('does not retry real errors like 403 / 404', async (t) => {
  const calls = stubFetch(t, [403, 200]);
  const res = await fetchWithTimeout('https://x.test', {}, 1000, fast);
  assert.equal(res.status, 403);
  assert.equal(calls(), 1);
});

test('does not retry timeouts', async (t) => {
  const err = new Error('timed out');
  err.name = 'TimeoutError';
  const calls = stubFetch(t, [err, 200]);
  await assert.rejects(fetchWithTimeout('https://x.test', {}, 1000, fast), /timed out/);
  assert.equal(calls(), 1);
});
