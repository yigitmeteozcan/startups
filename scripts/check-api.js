#!/usr/bin/env node
// Smoke-test the public API exactly as an outside project would use it:
// fetch the endpoint catalog, then a sample of endpoints from their published
// URLs (jsDelivr CDN or raw GitHub), and check each returns valid JSON with
// the expected number of companies and CORS headers. Used by the daily
// workflow after the CDN cache is refreshed; prints GitHub warnings on failure
// but never fails the build (the data itself is already committed).
//
//   node scripts/check-api.js            # checks the live endpoints
//   META_URL=... node scripts/check-api.js

const { fetchWithTimeout } = require('../src/http');

const META_URL =
  process.env.META_URL || 'https://raw.githubusercontent.com/yigitmeteozcan/startups/main/data/meta.json';

async function check(label, url, expectCount) {
  const started = Date.now();
  try {
    const res = await fetchWithTimeout(url, { headers: { Origin: 'https://example.com' } }, 60000);
    const cors = res.headers.get('access-control-allow-origin');
    if (!res.ok) return { label, url, ok: false, detail: `HTTP ${res.status}` };
    const body = await res.json();
    const n = Array.isArray(body) ? body.length : null;
    const problems = [];
    if (expectCount != null && n !== expectCount) problems.push(`expected ${expectCount} records, got ${n}`);
    if (cors !== '*') problems.push(`CORS header is ${cors || 'missing'}`);
    return {
      label,
      url,
      ok: problems.length === 0,
      detail: problems.join('; ') || `${n == null ? 'ok' : `${n} records`} in ${Date.now() - started} ms`,
    };
  } catch (err) {
    return { label, url, ok: false, detail: String(err.message).split('\n')[0] };
  }
}

async function main() {
  const meta = await (await fetchWithTimeout(META_URL, {}, 60000)).json();
  const pick = (coll) => (meta.collections[coll] || [])[0];
  const targets = [
    ['meta.json', `${meta.cdn}/meta.json`],
    ['stats.json', meta.endpoints.stats.api],
    ['all.json', meta.endpoints.all.api, meta.endpoints.all.count],
    ['unicorns.json', meta.endpoints.unicorns.api, meta.endpoints.unicorns.count],
    ...(meta.endpoints.hiring ? [['hiring.json', meta.endpoints.hiring.api, meta.endpoints.hiring.count]] : []),
    ...['by-source', 'by-country', 'by-industry', 'by-year']
      .map((c) => pick(c) && [`${c}/${pick(c).slug}.json`, pick(c).api, pick(c).count])
      .filter(Boolean),
  ];
  if (meta.endpoints.geo) targets.push(['geo.json', meta.endpoints.geo.api]);

  const results = [];
  for (const [label, url, count] of targets) results.push(await check(label, url, count));
  for (const r of results) {
    console.log(`${r.ok ? '✅' : '⚠️ '} ${r.label.padEnd(34)} ${r.detail}`);
    if (!r.ok) console.log(`::warning::API check failed for ${r.label} (${r.url}): ${r.detail}`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} public endpoints OK`);
}

main().catch((err) => {
  console.log(`::warning::API check could not run: ${err.message}`);
});
