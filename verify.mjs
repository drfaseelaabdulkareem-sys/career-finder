// ============================================================
// POST /api/verify
// Redeems an access link for one device and returns a session.
// The device cap is enforced here — this is the anti-piracy rule.
// ============================================================
import { getToken, registerDevice } from '../lib/store.mjs';
import { createSession } from '../lib/auth.mjs';
import { json, clientIp, hashIp } from '../lib/http.mjs';

export const config = { path: '/api/verify' };

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const accessToken = String(body.accessToken || '').trim();
  const deviceId    = String(body.deviceId || '').trim();

  if (!/^[a-f0-9]{32,64}$/i.test(accessToken) || deviceId.length < 16) {
    return json({ error: 'invalid_link' }, 400);
  }

  const record = await getToken(accessToken);
  if (!record) return json({ error: 'invalid_link' }, 404);
  if (record.revoked) return json({ error: 'revoked' }, 403);

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return json({ error: 'expired', expiresAt: record.expiresAt }, 403);
  }

  const result = await registerDevice(accessToken, record, deviceId, {
    ipHash: hashIp(clientIp(request)),
    userAgent: request.headers.get('user-agent') || '',
  });

  if (!result.ok) {
    return json({ error: result.reason, limit: record.maxDevices }, 403);
  }

  return json({
    session: createSession({
      token: accessToken,
      deviceId,
      tokenExpiresAt: record.expiresAt,
    }),
    email: record.email,
    name: record.name,
    expiresAt: record.expiresAt,
  });
};
