#!/usr/bin/env node
// Restore one source's companies from an earlier commit, e.g. after an upstream
// change made a scraper return junk:
//
//   npm run restore -- plugandplay cd6e6e2
//
// Replaces only that source's records in data/all.json with the ones committed
// at <git-ref>, then re-renders every derived file (no network). All other
// sources are left exactly as they are.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { isPlausibleCompany } = require('../src/normalize');
const { writeDataset, writeXlsx } = require('../src/dataset');
const { SOURCES } = require('../src/sources');

const root = path.resolve(__dirname, '..');

function git(args) {
  return execFileSync('git', args, { cwd: root, maxBuffer: 512 * 1024 * 1024, encoding: 'utf8' });
}

async function main() {
  const [source, ref] = process.argv.slice(2);
  if (!source || !ref) {
    throw new Error('Usage: npm run restore -- <source> <git-ref>   e.g. npm run restore -- plugandplay cd6e6e2');
  }
  if (!Object.prototype.hasOwnProperty.call(SOURCES, source)) {
    throw new Error(`Unknown source "${source}". Known: ${Object.keys(SOURCES).join(', ')}`);
  }
  if (!/^[\w./~^-]+$/.test(ref)) throw new Error(`Invalid git ref "${ref}"`);

  const old = JSON.parse(git(['show', `${ref}:data/all.json`]));
  const restored = old.filter((c) => c.source === source && isPlausibleCompany(c));
  if (restored.length === 0) throw new Error(`No usable ${source} records in ${ref}:data/all.json`);
  const refDate = git(['log', '-1', '--format=%cI', ref]).trim();

  const file = path.join(root, 'data', 'all.json');
  const current = JSON.parse(fs.readFileSync(file, 'utf8'));
  const firstIdx = current.findIndex((c) => c.source === source);
  const others = current.filter((c) => c.source !== source);
  const insertAt = firstIdx === -1 ? others.length : current.slice(0, firstIdx).filter((c) => c.source !== source).length;
  const merged = [...others.slice(0, insertAt), ...restored, ...others.slice(insertAt)];

  const before = current.filter((c) => c.source === source).length;
  console.log(`Restoring ${source}: ${before} -> ${restored.length} companies (from ${ref}, ${refDate.slice(0, 10)})`);

  const stats = writeDataset(merged, {
    rootDir: root,
    sourceStatus: {
      [source]: { status: 'cached', reason: `restored from ${ref}`, lastLiveFetch: new Date(refDate).toISOString() },
    },
  });
  await writeXlsx(merged, path.join(root, 'data', 'all.xlsx'));
  console.log(`✅ Dataset rebuilt: ${stats.total} companies.`);
  for (const w of stats.warnings) console.log(`⚠️  ${w}`);
}

main().catch((err) => {
  console.error('❌ Restore failed:', err.message);
  process.exit(1);
});
