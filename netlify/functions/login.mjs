// ============================================================
// POST /api/login
//
// Takes the login id and password you sent the buyer on Instagram,
// plus an identifier for their browser. Enforces the device cap and
// returns a session.
// ============================================================
import { authenticate } from '../lib/store.mjs';
import { createSession } from '../lib/jwt.mjs';
import { json, clientIp, hashIp } from '../lib/http.mjs';

export const config = { path: '/api/login' };

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const id       = String(body.id || '').trim().toUpperCase();
  const password = String(body.password || '').trim().toLowerCase();
  const deviceId = String(body.deviceId || '').trim();

  if (!id || !password || deviceId.length < 16) {
    return json({ error: 'bad_credentials' }, 400);
  }

  // A small delay on every attempt, so guessing is slow and a wrong
  // password cannot be told from an unknown id by how fast we answer.
  await new Promise(r => setTimeout(r, 400));

  const result = await authenticate(id, password, deviceId, {
    ipHash: hashIp(clientIp(request)),
    userAgent: request.headers.get('user-agent') || '',
  });

  if (!result.ok) {
    const status = result.reason === 'bad_credentials' ? 401 : 403;
    return json({
      error: result.reason,
      limit: result.record?.maxDevices,
      expiresAt: result.record?.expiresAt,
    }, status);
  }

  // The credentials were right and the device is registered. The only
  // thing that can still fail here is a missing or too-short
  // SESSION_SECRET, which is a setup mistake, not the buyer's fault —
  // so say that plainly instead of a generic error.
  let session;
  try {
    session = createSession({
      token: result.record.id,
      deviceId,
      tokenExpiresAt: result.record.expiresAt,
    });
  } catch (err) {
    console.error('SESSION_SECRET is missing or shorter than 32 characters:', err.message);
    return json({ error: 'server_misconfigured' }, 500);
  }

  return json({ session, expiresAt: result.record.expiresAt });
};
