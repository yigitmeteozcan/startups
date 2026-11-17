// fetch() with a timeout, so one hung upstream can never stall the whole daily
// build (the old fetches had no timeout at all). Override with FETCH_TIMEOUT_MS.

const DEFAULT_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS) || 45000;

function fetchWithTimeout(url, opts = {}, ms = DEFAULT_TIMEOUT_MS) {
  return fetch(url, { ...opts, signal: opts.signal || AbortSignal.timeout(ms) });
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
