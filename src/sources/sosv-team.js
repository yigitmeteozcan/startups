// Founder / team profiles for SOSV companies. The portfolio API has no people,
// but each company page (sosv.com/company/<slug>/) has a "Team" block with
// name, role, photo and LinkedIn / X links. Pages are visited incrementally,
// like the YC founder enrichment: never-checked companies first, then the
// oldest, a batch per run, with progress kept in data/_state/sosv-team.json.
// A failed page changes nothing.
//
// Env: SOSV_TEAM=0 to skip, SOSV_TEAM_BATCH, SOSV_TEAM_REFRESH_DAYS.

const fs = require('fs');
const path = require('path');
const { fetchWithTimeout } = require('../http');
const { addHttps, collapseSpaces } = require('../normalize');
const { decodeHtml, htmlText } = require('../html');
const { mergeFounders } = require('./yc-founders');

const BATCH = Number(process.env.SOSV_TEAM_BATCH || 250);
const REFRESH_DAYS = Number(process.env.SOSV_TEAM_REFRESH_DAYS || 90);
const CONCURRENCY = 3;
const BUDGET_MS = 4 * 60 * 1000;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

// Company page -> [{ name, role, linkedin, twitter?, avatar? }]
function parseTeam(html) {
  const team = String(html).split(/<div class="single-company-team__item">/).slice(1);
  return team
    .map((chunk) => {
      const body = chunk.split(/<div class="single-company-team__item">|<\/section>/)[0];
      const name = collapseSpaces(htmlText((body.match(/<h3 class="single-company-team__item-name">([\s\S]*?)<\/h3>/) || [])[1]));
      const role = collapseSpaces(htmlText((body.match(/<div class="single-company-team__item-position">([\s\S]*?)<\/div>/) || [])[1]));
      const link = (kind) => decodeHtml((body.match(new RegExp(`href="(https?://[^"]+)"[^>]*social-icon--${kind}`)) || [])[1] || '');
      const avatar = decodeHtml((body.match(/<img src="(https:\/\/res\.cloudinary\.com\/[^"]+)"/) || [])[1] || '');
      const f = { name, role, linkedin: addHttps(link('linkedin').replace(/\?.*$/, '')) };
      const twitter = addHttps(link('twitter'));
      if (twitter) f.twitter = twitter;
      if (avatar) f.avatar = avatar;
      return f;
    })
    .filter((f) => f.name);
}

const slugOf = (c) => (String(c.sourceUrl || '').match(/sosv\.com\/company\/([^/?#]+)/) || [])[1] || '';

function pickBatch(companies, state, { batch = BATCH, refreshDays = REFRESH_DAYS, now = Date.now() } = {}) {
  const sosv = companies.filter((c) => c.source === 'sosv' && c.listed !== false && slugOf(c));
  const never = sosv.filter((c) => !state[slugOf(c)]).sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
  const cutoff = now - refreshDays * 86400000;
  const stale = sosv
    .filter((c) => state[slugOf(c)] && Date.parse(state[slugOf(c)].checkedAt) < cutoff)
    .sort((a, b) => Date.parse(state[slugOf(a)].checkedAt) - Date.parse(state[slugOf(b)].checkedAt));
  return [...never, ...stale].slice(0, batch);
}

async function enrichSosvTeam(
  companies,
  {
    rootDir = path.resolve(__dirname, '../..'),
    onLog = console.log,
    fetchFn = (url) => fetchWithTimeout(url, { headers: HEADERS }, 30000),
    batch = BATCH,
    delayMs = 300,
    now = new Date(),
  } = {}
) {
  const stateFile = path.join(rootDir, 'data', '_state', 'sosv-team.json');
  let state = {};
  try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch (_) {
    state = {};
  }
  const todo = pickBatch(companies, state, { batch, now: now.getTime() });
  const stats = { checked: 0, withTeam: 0, people: 0, failed: 0 };
  if (!todo.length) return stats;
  onLog(`  → SOSV team profiles: visiting ${todo.length} company pages...`);
  const deadline = Date.now() + BUDGET_MS;
  const today = now.toISOString().slice(0, 10);
  let next = 0;
  let failuresInARow = 0;
  async function worker() {
    while (next < todo.length && Date.now() < deadline && failuresInARow < 20) {
      const c = todo[next++];
      const slug = slugOf(c);
      try {
        const res = await fetchFn(`https://sosv.com/company/${slug}/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const team = parseTeam(await res.text());
        stats.checked++;
        failuresInARow = 0;
        if (team.length) {
          c.founders = mergeFounders(c.founders, team);
          stats.withTeam++;
          stats.people += team.length;
        }
        state[slug] = { checkedAt: today, found: team.length };
      } catch (_) {
        stats.failed++;
        failuresInARow++;
      }
      if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(Object.fromEntries(Object.entries(state).sort(([a], [b]) => (a < b ? -1 : 1))), null, 1));
  const total = companies.filter((c) => c.source === 'sosv' && slugOf(c)).length;
  onLog(
    `    ✓ SOSV team: ${stats.checked} pages read, ${stats.withTeam} with a team (${stats.people} people), ` +
      `${stats.failed} failed; progress ${Object.keys(state).length}/${total} companies`
  );
  return stats;
}

module.exports = { enrichSosvTeam, parseTeam, pickBatch, slugOf };
