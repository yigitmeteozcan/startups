// fetch() with a timeout, so one hung upstream can never stall the whole daily
// build (the old fetches had no timeout at all). Override with FETCH_TIMEOUT_MS.

const DEFAULT_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS) || 45000;
const DEFAULT_RETRIES = Number(process.env.FETCH_RETRIES ?? 2);
// Worth retrying: rate limits and gateway/availability errors.
const RETRY_STATUS = new Set([429, 502, 503, 504]);

// Transient failures ("fetch failed", connection resets, 503s) are retried a
// couple of times with a short backoff. Timeouts are not retried, so a slow
// host costs one timeout, not three.
async function fetchWithTimeout(url, opts = {}, ms = DEFAULT_TIMEOUT_MS, { retries = DEFAULT_RETRIES, delays = [1500, 4000] } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { ...opts, signal: opts.signal || AbortSignal.timeout(ms) });
      if (!RETRY_STATUS.has(res.status) || attempt >= retries) return res;
    } catch (err) {
      const timedOut = err && (err.name === 'TimeoutError' || err.name === 'AbortError');
      if (timedOut || attempt >= retries) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, delays[Math.min(attempt, delays.length - 1)]));
  }
}

// Reject a promise that takes longer than `ms` (used to cap a whole source).
function withTimeout(promise, ms, label = 'operation') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

module.exports = { fetchWithTimeout, withTimeout, DEFAULT_TIMEOUT_MS };
