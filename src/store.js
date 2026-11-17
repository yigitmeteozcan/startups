// In-memory copy of the dataset for the REST API.
//
// File mode (default): reads data/all.json, stats.json and meta.json from disk
// and reloads automatically when all.json changes (checked at most every 2s),
// so a `git pull` or `npm run fetch:data` is picked up without a restart.
//
// URL mode (DATA_URL set, e.g. the jsDelivr CDN base): fetches the same three
// files over HTTPS and refreshes them every CACHE_TTL_MS (default 1 hour).

const fs = require('fs');
const path = require('path');
const { fetchWithTimeout } = require('./http');
const { haystack, facets } = require('./query');

const DEFAULT_DATA_DIR = path.resolve(__dirname, '..', 'data');

class DataStore {
  constructor({
    dataDir = process.env.DATA_DIR || DEFAULT_DATA_DIR,
    dataUrl = process.env.DATA_URL || '',
    ttlMs = Number(process.env.CACHE_TTL_MS) || 60 * 60 * 1000,
    statIntervalMs = 2000,
    minManualReloadMs = 30 * 1000,
  } = {}) {
    this.dataDir = dataDir;
    this.dataUrl = dataUrl.replace(/\/+$/, '');
    this.ttlMs = ttlMs;
    this.statIntervalMs = statIntervalMs;
    this.minManualReloadMs = minManualReloadMs;
    this.data = null;
    this.loading = null;
    this.lastStatAt = 0;
    this.mtimeMs = 0;
    this.expiresAt = 0;
  }

  get mode() {
    return this.dataUrl ? 'url' : 'file';
  }

  async readFile(name, required) {
    const p = path.join(this.dataDir, name);
    try {
      return JSON.parse(await fs.promises.readFile(p, 'utf8'));
    } catch (err) {
      if (required) throw new Error(`Could not read ${p}: ${err.message}`);
      return null;
    }
  }

  async readUrl(name, required) {
    try {
      const res = await fetchWithTimeout(`${this.dataUrl}/${name}`, {}, 60000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (required) throw new Error(`Could not fetch ${name} from DATA_URL: ${err.message}`);
      return null;
    }
  }

  async load() {
    const read = (name, required) =>
      this.mode === 'url' ? this.readUrl(name, required) : this.readFile(name, required);
    const [companies, stats, meta] = await Promise.all([
      read('all.json', true),
      read('stats.json', false),
      read('meta.json', false),
    ]);
    if (!Array.isArray(companies)) throw new Error('all.json is not an array');
    if (this.mode === 'file') {
      this.mtimeMs = fs.statSync(path.join(this.dataDir, 'all.json')).mtimeMs;
    }
    this.expiresAt = Date.now() + this.ttlMs;
    this.data = {
      companies,
      haystacks: companies.map(haystack),
      facets: facets(companies),
      stats,
      meta,
      loadedAt: new Date().toISOString(),
      generatedAt: (stats && stats.generatedAt) || (meta && meta.generatedAt) || null,
    };
    return this.data;
  }

  // Share one in-flight load between concurrent requests.
  reload() {
    if (!this.loading) {
      this.loading = this.load().finally(() => {
        this.loading = null;
      });
    }
    return this.loading;
  }

  isStale() {
    if (!this.data) return true;
    if (this.mode === 'url') return Date.now() > this.expiresAt;
    const now = Date.now();
    if (now - this.lastStatAt < this.statIntervalMs) return false;
    this.lastStatAt = now;
    try {
      return fs.statSync(path.join(this.dataDir, 'all.json')).mtimeMs !== this.mtimeMs;
    } catch (_) {
      return false; // keep serving what we have
    }
  }

  // Returns { data, cached } — cached=false when this call (re)loaded the data.
  // `refresh` forces a reload, rate-limited to once per minManualReloadMs.
  async get({ refresh = false } = {}) {
    const recent = this.data && Date.now() - Date.parse(this.data.loadedAt) < this.minManualReloadMs;
    if (this.isStale() || (refresh && !recent)) {
      try {
        return { data: await this.reload(), cached: false };
      } catch (err) {
        if (!this.data) throw err;
        console.error('[store] reload failed, serving previous data:', err.message);
      }
    }
    return { data: this.data, cached: true };
  }

  invalidate() {
    this.data = null;
    this.mtimeMs = 0;
  }

  info() {
    return {
      mode: this.mode,
      loaded: !!this.data,
      loadedAt: this.data ? this.data.loadedAt : null,
      generatedAt: this.data ? this.data.generatedAt : null,
      companies: this.data ? this.data.companies.length : 0,
      expiresAt: this.mode === 'url' && this.data ? new Date(this.expiresAt).toISOString() : null,
    };
  }
}

module.exports = { DataStore };
