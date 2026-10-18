// ============================================================
// ACCESS RULES — pure logic, no storage, no network
//
// Kept separate from store.mjs so the rules that decide who gets in
// can be tested directly. store.mjs does the reading and writing
// around these functions.
// ============================================================
import crypto from 'node:crypto';

// Characters chosen to avoid the pairs people misread in a chat message:
// no O/0, no I/1, no L.
const ID_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const WORDS = [
  'amber','anchor','basil','beacon','cedar','cobalt','coral','delta','ember','fable',
  'falcon','garnet','harbor','indigo','ivory','jasper','kite','lantern','linen','maple',
  'meadow','nectar','opal','orbit','pebble','quartz','ripple','saffron','sierra','slate',
  'summit','tide','timber','topaz','umber','valley','velvet','willow','zephyr','zenith',
];

const pick = arr => arr[crypto.randomInt(arr.length)];

export function newId() {
  let s = '';
  for (let i = 0; i < 4; i++) s += ID_CHARS[crypto.randomInt(ID_CHARS.length)];
  return `CF-${s}`;
}

export function newPassword() {
  return `${pick(WORDS)}-${pick(WORDS)}-${crypto.randomInt(10, 100)}`;
}

export const ID_PATTERN = /^CF-[A-Z0-9]{4}$/;

export function isValidId(id) {
  return typeof id === 'string' && ID_PATTERN.test(id.trim().toUpperCase());
}

export function blankRecord({ accessDays, maxDevices }) {
  return {
    id: newId(),
    password: newPassword(),
    createdAt: new Date().toISOString(),
    firstUsedAt: null,
    expiresAt: null,              // the clock starts on first sign-in
    accessDays,
    maxDevices,
    devices: [],
    revoked: false,
    blockedAttempts: 0,
    note: '',
    completedAt: null,
  };
}

/** Constant-time string compare, so a wrong password leaks no timing. */
export function passwordMatches(given, expected) {
  const a = Buffer.from(String(given ?? ''));
  const b = Buffer.from(String(expected ?? ''));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Decide whether this sign-in is allowed, and return the record as it
 * should now be stored. Pure: it mutates and returns a copy, and the
 * caller persists it.
 *
 * `now` is injectable so expiry can be tested without waiting 30 days.
 */
export function checkAccess(record, password, deviceId, now = new Date()) {
  if (!record) return { ok: false, reason: 'bad_credentials', record: null };

  if (!passwordMatches(password, record.password)) {
    return { ok: false, reason: 'bad_credentials', record: null };
  }

  const r = { ...record, devices: [...(record.devices || [])] };

  if (r.revoked) return { ok: false, reason: 'revoked', record: r };

  // First sign-in starts the access period.
  if (!r.firstUsedAt) {
    r.firstUsedAt = now.toISOString();
    r.expiresAt = new Date(now.getTime() + (r.accessDays || 30) * 86400_000).toISOString();
  }

  if (new Date(r.expiresAt).getTime() < now.getTime()) {
    return { ok: false, reason: 'expired', record: r };
  }

  const known = r.devices.find(d => d.id === deviceId);

  if (!known) {
    if (r.devices.length >= (r.maxDevices || 1)) {
      r.blockedAttempts = (r.blockedAttempts || 0) + 1;
      r.lastBlockedAt = now.toISOString();
      return { ok: false, reason: 'device_limit', record: r };
    }
    r.devices.push({
      id: deviceId,
      firstSeenAt: now.toISOString(),
      lastSeenAt: now.toISOString(),
      ipHash: null,
      userAgent: '',
    });
  } else {
    known.lastSeenAt = now.toISOString();
  }

  r.lastSeenAt = now.toISOString();
  return { ok: true, reason: null, record: r };
}
