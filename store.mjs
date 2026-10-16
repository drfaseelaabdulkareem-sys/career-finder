// ============================================================
// STORAGE — Netlify Blobs
//
// Netlify gives every site a built-in key-value store, so there is
// no separate database to create, no SQL, and no extra account.
//
// Two stores:
//   career-tokens    key = access token   → the buyer's record
//   career-payments  key = razorpay id    → the token (stops double-issuing)
// ============================================================
import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

const tokens   = () => getStore('career-tokens');
const payments = () => getStore('career-payments');

export function newToken() {
  return crypto.randomBytes(24).toString('hex'); // 48 hex characters
}

export async function getToken(token) {
  if (!token || !/^[a-f0-9]{32,64}$/i.test(token)) return null;
  try {
    return await tokens().get(token, { type: 'json' });
  } catch {
    return null;
  }
}

export async function putToken(token, record) {
  await tokens().setJSON(token, record);
  return record;
}

export async function tokenForPayment(paymentId) {
  if (!paymentId) return null;
  try {
    return await payments().get(paymentId, { type: 'text' });
  } catch {
    return null;
  }
}

export async function linkPayment(paymentId, token) {
  await payments().set(paymentId, token);
}

/**
 * Create a buyer record. Returns the existing token if this payment
 * has already been processed — Razorpay retries webhooks, and the
 * redirect and the webhook can both fire for the same purchase.
 */
export async function createAccess({ email, name, contact, paymentId, amountPaise, source }) {
  const existing = await tokenForPayment(paymentId);
  if (existing) {
    const record = await getToken(existing);
    if (record) return { token: existing, record, alreadyExisted: true };
  }

  const token = newToken();
  const days = Number(process.env.ACCESS_DAYS || 30);

  const record = {
    email: String(email || '').trim().toLowerCase(),
    name: name || null,
    contact: contact || null,
    paymentId: paymentId || null,
    amountPaise: amountPaise || null,
    source: source || 'unknown',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + days * 86400_000).toISOString(),
    maxDevices: Number(process.env.MAX_DEVICES || 2),
    revoked: false,
    devices: [],
    blockedAttempts: 0,
    emailSentAt: null,
    completedAt: null,
    lastSeenAt: null,
  };

  await putToken(token, record);
  if (paymentId) await linkPayment(paymentId, token);

  return { token, record, alreadyExisted: false };
}

/**
 * Register a device against a token, enforcing the device cap.
 * This is the anti-piracy rule: the (cap+1)th browser is refused.
 *
 * Note: Blobs have no transactions, so two devices arriving in the
 * same instant could both slip through. The window is milliseconds
 * and the worst case is one extra device, which is acceptable here.
 */
export async function registerDevice(token, record, deviceId, meta = {}) {
  const devices = record.devices || [];
  const known = devices.find(d => d.id === deviceId);
  const now = new Date().toISOString();

  if (known) {
    known.lastSeenAt = now;
    if (meta.ipHash) known.ipHash = meta.ipHash;
    record.lastSeenAt = now;
    await putToken(token, record);
    return { ok: true, isNew: false, record };
  }

  if (devices.length >= (record.maxDevices || 2)) {
    record.blockedAttempts = (record.blockedAttempts || 0) + 1;
    record.lastBlockedAt = now;
    await putToken(token, record);
    return { ok: false, reason: 'device_limit', record };
  }

  devices.push({
    id: deviceId,
    firstSeenAt: now,
    lastSeenAt: now,
    ipHash: meta.ipHash || null,
    userAgent: (meta.userAgent || '').slice(0, 200),
  });

  record.devices = devices;
  record.lastSeenAt = now;
  await putToken(token, record);
  return { ok: true, isNew: true, record };
}

/** Every buyer, newest first. Used by the admin page. */
export async function listAccess(limit = 500) {
  const store = tokens();
  const { blobs } = await store.list();

  const rows = await Promise.all(
    blobs.slice(0, limit).map(async b => {
      try {
        const record = await store.get(b.key, { type: 'json' });
        return record ? { token: b.key, ...record } : null;
      } catch {
        return null;
      }
    })
  );

  return rows
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}
