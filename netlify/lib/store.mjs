// ============================================================
// STORAGE — Netlify Blobs
//
// One record per login. You generate logins in batches from the
// admin page and hand them out on Instagram after a buyer pays.
//
// On the password: these are machine-generated, single-purpose
// codes for a ₹499 worksheet. They are stored as plain text on
// purpose, so you can always look one up and resend it when a buyer
// loses it. Nobody chooses them, so there is no risk of a buyer's
// own password leaking from here.
// ============================================================
import { getStore } from '@netlify/blobs';
import { blankRecord, checkAccess, isValidId } from './access.mjs';

const logins = () => getStore('career-logins');

const ACCESS_DAYS = Number(process.env.ACCESS_DAYS || 30);
const MAX_DEVICES = Number(process.env.MAX_DEVICES || 1);

export async function getLogin(id) {
  if (!isValidId(id)) return null;
  try {
    return await logins().get(id.toUpperCase(), { type: 'json' });
  } catch {
    return null;
  }
}

export async function putLogin(id, record) {
  await logins().setJSON(id.toUpperCase(), record);
  return record;
}

/** Create a batch of unused logins. Returns them in plain text, once. */
export async function createBatch(count = 25) {
  const made = [];

  for (let i = 0; i < count; i++) {
    let record = blankRecord({ accessDays: ACCESS_DAYS, maxDevices: MAX_DEVICES });
    // Vanishingly unlikely, but never overwrite an existing login.
    for (let tries = 0; tries < 5 && await getLogin(record.id); tries++) {
      record = blankRecord({ accessDays: ACCESS_DAYS, maxDevices: MAX_DEVICES });
    }
    await putLogin(record.id, record);
    made.push(record);
  }

  return made;
}

/**
 * Read the login, apply the access rules, write back what changed.
 * The rules themselves live in access.mjs and are unit-tested.
 */
export async function authenticate(id, password, deviceId, meta = {}) {
  const stored = await getLogin(id);
  const result = checkAccess(stored, password, deviceId);

  if (result.record) {
    if (meta.ipHash || meta.userAgent) {
      const d = result.record.devices.find(x => x.id === deviceId);
      if (d) {
        if (meta.ipHash) d.ipHash = meta.ipHash;
        if (meta.userAgent) d.userAgent = String(meta.userAgent).slice(0, 200);
      }
    }
    await putLogin(result.record.id, result.record);
  }

  return result.ok
    ? { ok: true, record: result.record }
    : { ok: false, reason: result.reason, record: result.record };
}

/** Every login, newest first. Used by the admin page. */
export async function listLogins(limit = 500) {
  const store = logins();
  const { blobs } = await store.list();

  const rows = await Promise.all(
    blobs.slice(0, limit).map(async b => {
      try { return await store.get(b.key, { type: 'json' }); }
      catch { return null; }
    })
  );

  return rows.filter(Boolean)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}
