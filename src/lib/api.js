// ============================================================
// CLIENT API LAYER
// Handles the device identifier, the session token, and every call
// to the protected backend.
// ============================================================

const DEVICE_KEY  = 'ncf_device_id';
const SESSION_KEY = 'ncf_session';

/**
 * A stable random id for this browser. Two ids = two devices against
 * the buyer's limit, which is exactly what stops a link being passed
 * around a chat group.
 */
export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`)
        .replace(/-/g, '') + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    // Private mode with storage blocked — a per-tab id still works,
    // it just won't survive a refresh.
    return `ephemeral${Math.random().toString(36).slice(2)}${Date.now()}`;
  }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.session ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(data) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch { /* storage blocked; session lives in memory for this tab */ }
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

/** Exchange the id and password you were sent for a session. */
export async function login(id, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id, password, deviceId: getDeviceId() }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'login_failed');
    err.code = data.error || 'login_failed';
    err.detail = data;
    throw err;
  }

  saveSession(data);
  return data;
}

async function authedFetch(path, options = {}) {
  const session = getSession();
  if (!session) {
    const err = new Error('no_session');
    err.code = 'no_session';
    throw err;
  }

  const res = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${session.session}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 || res.status === 403) {
    clearSession();
    const err = new Error(data.error || 'unauthorised');
    err.code = data.error || 'unauthorised';
    throw err;
  }

  if (!res.ok) {
    const err = new Error(data.error || 'request_failed');
    err.code = data.error || 'request_failed';
    throw err;
  }

  return data;
}

export function fetchContent() {
  return authedFetch('/api/content');
}

/** answers: { Q01: [optionId, ...] } — ids only, never scoring data. */
export function submitAnswers(answers) {
  return authedFetch('/api/score', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}
