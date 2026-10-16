// ============================================================
// Session checking: a valid JWT is necessary but not sufficient.
// We re-read the buyer's record on every call, so revoking someone
// takes effect on their next request rather than whenever their
// session happens to lapse.
// ============================================================
import { getToken } from './store.mjs';
import { readSession } from './jwt.mjs';

export { createSession } from './jwt.mjs';

export async function requireSession(request) {
  const header = request.headers.get('authorization') || '';
  const jwt = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!jwt) return { ok: false, status: 401, error: 'no_session' };

  const claims = readSession(jwt);
  if (!claims) return { ok: false, status: 401, error: 'bad_session' };

  const record = await getToken(claims.t);
  if (!record) return { ok: false, status: 401, error: 'unknown_token' };
  if (record.revoked) return { ok: false, status: 403, error: 'revoked' };
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return { ok: false, status: 403, error: 'expired' };
  }
  if (!(record.devices || []).some(d => d.id === claims.d)) {
    return { ok: false, status: 403, error: 'device_revoked' };
  }

  return { ok: true, token: claims.t, deviceId: claims.d, record };
}
