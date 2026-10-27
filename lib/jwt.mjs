// ============================================================
// A minimal HS256 JWT on node:crypto, so the project needs no auth
// library. Pure crypto — no storage, no network — which also means
// it can be unit-tested on its own.
// ============================================================
import crypto from 'node:crypto';

const SESSION_DAYS = 7;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters long');
  }
  return s;
}

const b64url = buf => Buffer.from(buf)
  .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromB64url = str =>
  Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

const sign = data =>
  b64url(crypto.createHmac('sha256', secret()).update(data).digest());

export function createSession({ token, deviceId, tokenExpiresAt }) {
  // A session never outlives the access token that produced it.
  const sessionExp = Date.now() + SESSION_DAYS * 86400_000;
  const hardExp = new Date(tokenExpiresAt).getTime();
  const exp = Math.floor(Math.min(sessionExp, hardExp) / 1000);

  const header  = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ t: token, d: deviceId, exp }));
  const body    = `${header}.${payload}`;

  return `${body}.${sign(body)}`;
}

/** Returns the claims, or null if the token is forged, altered or expired. */
export function readSession(jwt) {
  const parts = String(jwt).split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expected = sign(`${header}.${payload}`);

  // Constant-time compare, so a wrong signature leaks no timing signal.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let claims;
  try {
    claims = JSON.parse(fromB64url(payload).toString('utf8'));
  } catch {
    return null;
  }

  if (!claims.exp || claims.exp * 1000 < Date.now()) return null;
  return claims;
}
