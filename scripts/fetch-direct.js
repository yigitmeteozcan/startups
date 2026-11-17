#!/usr/bin/env node
// Full dataset build (used by the daily GitHub Action and `npm run fetch:data`
// / `npm run build:data`). Fetches every source live, merges them, and writes
// the full sliced dataset + README.
//
// Nothing is ever lost on a bad day: a source that fails, returns junk, or
// shrinks suspiciously keeps its previously committed records (see
// src/sources/index.js). Limit which sources are fetched live with
// SOURCES=techstars,yc — the others keep their committed records.
//
// Techstars uses TYPESENSE_API_KEY when set, otherwise a headless browser.
//
// Exit code is 0 whenever the dataset was written. Sources that have not been
// fetched live for STALE_ALERT_DAYS (default 3) are reported via GITHUB_OUTPUT
// so the workflow can fail *after* committing and notify the owner.

const fs = require('fs');
const path = require('path');
const { gatherAll, DEFAULT_SOURCES } = require('../src/sources');
const { writeDataset, writeXlsx } = require('../src/dataset');

const STALE_ALERT_DAYS = Number(process.env.STALE_ALERT_DAYS || 3);

function parseList(v) {
  return String(v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function staleSources(metaSources, now = Date.now()) {
  const limit = STALE_ALERT_DAYS * 24 * 3600 * 1000;
  return metaSources.filter((s) => {
    if (s.status === 'live') return false;
    if (!s.lastLiveFetch) return true;
    return now - Date.parse(s.lastLiveFetch) > limit;
  });
}

function writeGithubSummary(metaSources, stale, stats) {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (!file) return;
  const rows = metaSources
    .map((s) => {
      const icon = s.status === 'live' ? '✅' : s.status === 'failed' ? '❌' : '⚠️';
      const last = s.lastLiveFetch ? s.lastLiveFetch.slice(0, 10) : 'never recorded';
      return `| ${s.label || s.name} | ${s.count.toLocaleString()} | ${icon} ${s.status} | ${last} | ${String(s.note || '').replace(/\s+/g, ' ').replace(/\|/g, '\\|')} |`;
    })
    .join('\n');
  const md =
    `## Dataset build — ${stats.total.toLocaleString()} companies\n\n` +
    `| Source | Companies | Status | Last live fetch | Note |\n|---|---|---|---|---|\n${rows}\n\n` +
    (stale.length
      ? `**⚠️ Not fetched live for ${STALE_ALERT_DAYS}+ days:** ${stale.map((s) => s.label || s.name).join(', ')}. ` +
        `Their committed records were kept.\n`
      : 'All sources are fresh.\n') +
    (stats.warnings.length ? `\n${stats.warnings.map((w) => `- ⚠️ ${w}`).join('\n')}\n` : '');
  fs.appendFileSync(file, md);
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const requested = parseList(process.env.SOURCES);
  const live = requested.length ? requested : null;

  console.log(`Fetching live: ${(live || DEFAULT_SOURCES).join(', ')}`);
  const { companies, statuses } = await gatherAll({ sources: DEFAULT_SOURCES, live });

  if (companies.length === 0) {
    throw new Error('No companies from any source (live or committed) — refusing to overwrite dataset.');
  }

  const stats = writeDataset(companies, { rootDir: root, sourceStatus: statuses });
  await writeXlsx(companies, path.join(root, 'data', 'all.xlsx'));

  console.log(`\n✅ Wrote dataset to data/ (${stats.total} companies)`);
  console.log(
    `   Unicorns: ${stats.unicorns} · Exits: ${stats.exits} · B Corps: ${stats.bCorps} · Founders: ${stats.founders}`
  );
  for (const w of stats.warnings) console.log(`::warning::${w}`);

  const stale = staleSources(stats.sources);
  for (const s of stale) {
    console.log(
      `::warning::${s.label || s.name} has not been fetched live since ` +
        `${s.lastLiveFetch ? s.lastLiveFetch.slice(0, 10) : 'an unknown date'} — ${s.note || 'no detail'}`
    );
  }
  writeGithubSummary(stats.sources, stale, stats);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `stale=${stale.map((s) => s.name).join(',')}\n`);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0)) // a still-open browser must not keep the job alive
    .catch((err) => {
      console.error('\n❌ Fetch failed:', err.message);
      process.exit(1);
    });
}

module.exports = { main, staleSources };
