// Tracks whether the frontend is talking to the real Django backend or is
// running on the explicit, labelled demo fallback (fictional data).
//
// Modes:
//   'unknown' — no request attempted yet
//   'live'    — the Django backend answered
//   'demo'    — the backend was unreachable; fictional demo data is in use
//               and the UI must show a visible demo-data warning.

let mode = 'unknown';
const listeners = new Set();

export function getApiMode() {
  return mode;
}

export function setApiMode(next) {
  if (!['unknown', 'live', 'demo'].includes(next) || next === mode) return;
  mode = next;
  listeners.forEach((listener) => listener(mode));
}

export function subscribeApiMode(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Axios only populates `error.response` when a server actually answered, so a
// missing response means the request never reached the backend (server down,
// refused connection, offline, timeout, CORS). Those cases may fall back to the
// labelled demo data. HTTP error responses (4xx/5xx) are real backend failures
// and must surface as errors — never as silent mock data.
export function isNetworkError(error) {
  if (!error || error.response) return false;
  const networkCodes = ['ECONNABORTED', 'ERR_NETWORK', 'ETIMEDOUT', 'ECONNREFUSED', 'ERR_NETWORK_ERROR'];
  return Boolean(error.request) || networkCodes.includes(error.code);
}
