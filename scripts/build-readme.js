#!/usr/bin/env node
// Regenerate README.md from the current dataset (data/meta.json + data/stats.json).
// Run after a data rebuild so the headline counts and endpoint tables stay in sync.

const fs = require('fs');
const path = require('path');
const { renderReadme } = require('../src/readme');

const root = path.resolve(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, 'data', p), 'utf8'));

try {
  const meta = read('meta.json');
  const stats = read('stats.json');
  fs.writeFileSync(path.join(root, 'README.md'), renderReadme(meta, stats));
  console.log('✅ Regenerated README.md from data/');
} catch (err) {
  console.error('❌ Could not build README:', err.message);
  process.exit(1);
}
