#!/usr/bin/env node
// Restore one source's companies from an earlier commit, e.g. after an upstream
// change made a scraper return junk:
//
//   npm run restore -- plugandplay cd6e6e2
//     Replaces that source's records with the ones committed at <git-ref>.
//
//   npm run restore -- techstars 763d795 --missing-only
//     Keeps today's records and only adds back companies from <git-ref> that
//     are missing now, flagged `listed: false` (nothing is ever deleted).
//
// Re-renders every derived file afterwards (no network). Other sources are
// left exactly as they are.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { isPlausibleCompany } = require('../src/normalize');
const { writeDataset, writeXlsx } = require('../src/dataset');
const { SOURCES, carryOverDelisted, carryOverHistory, missingFrom } = require('../src/sources');

const root = path.resolve(__dirname, '..');

function git(args) {
  return execFileSync('git', args, { cwd: root, maxBuffer: 512 * 1024 * 1024, encoding: 'utf8' });
}

async function main() {
  const args = process.argv.slice(2);
  const missingOnly = args.includes('--missing-only');
  const [source, ref] = args.filter((a) => !a.startsWith('--'));
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

  if (missingOnly) {
    const now = current.filter((c) => c.source === source);
    const back = carryOverDelisted(restored, now);
    console.log(`Adding back ${back.length} ${source} companies from ${ref} that are missing now (flagged listed:false).`);
    for (const c of back) console.log(`   + ${c.name}`);
    // Renamed companies keep their old name; fields the source blanked since
    // <ref> (e.g. websites) are restored from <ref>.
    const withHistory = carryOverHistory(restored, now);
    let backfilled = 0;
    withHistory.forEach((c, k) => {
      if (c.formerNames && !now[k].formerNames) console.log(`   ~ ${c.name} (formerly ${c.formerNames.join(', ')})`);
      if (JSON.stringify(c) !== JSON.stringify(now[k])) backfilled++;
    });
    console.log(`Restored lost values on ${backfilled} existing ${source} records.`);
    let i = 0;
    const updated = current.map((c) => (c.source === source ? withHistory[i++] : c));
    const lastIdx = updated.map((c) => c.source).lastIndexOf(source);
    const merged = [...updated.slice(0, lastIdx + 1), ...back, ...updated.slice(lastIdx + 1)];
    const stats = writeDataset(merged, { rootDir: root });
    await writeXlsx(merged, path.join(root, 'data', 'all.xlsx'));
    console.log(`✅ Dataset rebuilt: ${stats.total} companies.`);
    return;
  }
  const firstIdx = current.findIndex((c) => c.source === source);
  const others = current.filter((c) => c.source !== source);
  const insertAt = firstIdx === -1 ? others.length : current.slice(0, firstIdx).filter((c) => c.source !== source).length;
  // Real companies present now but not in <ref> are kept too — never deleted.
  const keepNow = missingFrom(current.filter((c) => c.source === source && isPlausibleCompany(c)), restored);
  if (keepNow.length) console.log(`Keeping ${keepNow.length} current ${source} companies that are not in ${ref}.`);
  const merged = [...others.slice(0, insertAt), ...restored, ...keepNow, ...others.slice(insertAt)];

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
