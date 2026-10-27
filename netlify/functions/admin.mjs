// ============================================================
// /api/admin
//
// Where you run the business. Generate a batch of logins, copy the
// next unused one into Instagram when someone pays, and note down who
// you gave it to.
//
// Password-protected with ADMIN_PASSWORD. Works fine on a phone.
// ============================================================
import crypto from 'node:crypto';
import { listLogins, getLogin, putLogin, createBatch } from '../lib/store.mjs';
import { html, escapeHtml, safeEqual } from '../lib/http.mjs';

export const config = { path: '/api/admin' };

const COOKIE = 'cf_admin';

const sign = v => crypto.createHmac('sha256', process.env.SESSION_SECRET || 'dev').update(v).digest('hex');

function makeCookie() {
  const exp = Date.now() + 12 * 3600_000;
  return `${COOKIE}=${exp}.${sign(String(exp))}; Path=/api/admin; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`;
}

function isLoggedIn(request) {
  const raw = request.headers.get('cookie') || '';
  const m = raw.match(new RegExp(`${COOKIE}=([^;]+)`));
  if (!m) return false;
  const [exp, sig] = decodeURIComponent(m[1]).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  try { return safeEqual(sign(exp), sig); } catch { return false; }
}

const page = body => html(`<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Career Finder — logins</title>
<style>
  :root{--bg:#EEF5FA;--card:#fff;--ink:#14202E;--muted:#7C8C9C;--line:rgba(20,45,78,.14);
        --accent:#2E5C4E;--danger:#B4483C;--ok:#2E7D52;--warn:#A8631F}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
    font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;padding:22px 14px}
  .wrap{max-width:1080px;margin:0 auto}
  h1{font-size:1.45rem;margin:0 0 4px}
  .sub{color:var(--muted);font-size:.85rem;margin-bottom:22px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;font-size:.85rem}
  th{text-align:left;font-size:.66rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);
     padding:8px 10px;border-bottom:1.5px solid var(--line);white-space:nowrap}
  td{padding:11px 10px;border-bottom:1px solid var(--line);vertical-align:top}
  tr:last-child td{border-bottom:none}
  code{background:var(--bg);padding:3px 8px;border-radius:5px;font-size:.92rem;font-weight:600;
       letter-spacing:.04em;user-select:all}
  .pw{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.86rem;user-select:all}
  .pill{display:inline-block;font-size:.66rem;font-weight:700;padding:3px 9px;border-radius:20px;white-space:nowrap}
  .pill.free{background:#E6F0FA;color:#2A5B8C}
  .pill.live{background:#E6F4EC;color:var(--ok)}
  .pill.exp{background:#FDF0E4;color:var(--warn)}
  .pill.rev{background:#FBE9E7;color:var(--danger)}
  input[type=password],input[type=text]{width:100%;max-width:320px;padding:10px 13px;
    border:1.5px solid var(--line);border-radius:8px;font-size:.95rem}
  input[type=number]{width:90px;padding:9px 11px;border:1.5px solid var(--line);border-radius:8px}
  button{font:inherit;font-size:.78rem;font-weight:600;padding:7px 13px;border-radius:20px;
    border:1.5px solid var(--line);background:#fff;color:var(--ink);cursor:pointer}
  button:hover{border-color:var(--accent);color:var(--accent)}
  button.primary{background:var(--accent);color:#fff;border-color:var(--accent);font-size:.9rem;padding:11px 24px}
  button.danger:hover{border-color:var(--danger);color:var(--danger)}
  form.inline{display:inline}
  .actions{display:flex;gap:6px;flex-wrap:wrap}
  .note{background:#FDF0E4;border:1px solid #F0D9BD;border-radius:8px;padding:12px 14px;font-size:.84rem;margin-bottom:16px}
  .stats{display:flex;gap:24px;flex-wrap:wrap}
  .stat b{display:block;font-size:1.5rem;line-height:1.2}
  .stat span{font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.07em}
  .empty{text-align:center;padding:34px 16px;color:var(--muted)}
  .noteinput{width:100%;max-width:150px;padding:6px 9px;font-size:.8rem;border:1px solid var(--line);border-radius:6px}
</style></head><body><div class="wrap">${body}</div></body></html>`);

const loginPage = (err = '') => page(`
  <h1>Career Finder</h1>
  <div class="sub">Buyer logins</div>
  <div class="card">
    ${err ? `<div class="note">${escapeHtml(err)}</div>` : ''}
    <form method="POST">
      <label for="pw" style="display:block;font-weight:600;font-size:.85rem;margin-bottom:8px">Password</label>
      <input id="pw" type="password" name="password" autofocus autocomplete="current-password">
      <div style="margin-top:16px"><button class="primary" type="submit">Sign in</button></div>
    </form>
  </div>`);

const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' }) : '—';

function statusPill(r) {
  if (r.revoked) return '<span class="pill rev">Revoked</span>';
  if (!r.firstUsedAt) return '<span class="pill free">Not used yet</span>';
  if (new Date(r.expiresAt) < new Date()) return '<span class="pill exp">Expired</span>';
  return '<span class="pill live">Active</span>';
}

function dashboard(rows, message = '', fresh = []) {
  const unused = rows.filter(r => !r.firstUsedAt && !r.revoked).length;
  const active = rows.filter(r => r.firstUsedAt && !r.revoked && new Date(r.expiresAt) > new Date()).length;
  const done   = rows.filter(r => r.completedAt).length;
  const shared = rows.filter(r => (r.blockedAttempts || 0) > 0).length;

  const freshBlock = fresh.length ? `<div class="card">
    <div style="font-weight:600;margin-bottom:4px">${fresh.length} new logins</div>
    <div class="sub" style="margin-bottom:14px">Copy these somewhere safe now. They are also listed below.</div>
    <table><tbody>${fresh.map(r => `<tr><td><code>${r.id}</code></td><td class="pw">${escapeHtml(r.password)}</td></tr>`).join('')}</tbody></table>
  </div>` : '';

  const table = rows.length === 0
    ? '<div class="card"><div class="empty">No logins yet. Generate a batch above.</div></div>'
    : `<div class="card"><table>
        <thead><tr><th>Login</th><th>Password</th><th>Status</th><th>Given to</th>
        <th>First used</th><th>Expires</th><th>Devices</th><th>Done?</th><th>Actions</th></tr></thead>
        <tbody>${rows.map(r => `<tr>
          <td><code>${r.id}</code></td>
          <td class="pw">${escapeHtml(r.password)}</td>
          <td>${statusPill(r)}
            ${(r.blockedAttempts || 0) > 0 ? `<div style="color:var(--danger);font-size:.72rem;margin-top:4px">⚠ ${r.blockedAttempts} blocked</div>` : ''}</td>
          <td><form method="POST" style="margin:0">
            <input type="hidden" name="action" value="note"><input type="hidden" name="id" value="${r.id}">
            <input class="noteinput" name="note" value="${escapeHtml(r.note || '')}" placeholder="name or number" onchange="this.form.submit()">
          </form></td>
          <td>${fmt(r.firstUsedAt)}</td>
          <td>${fmt(r.expiresAt)}</td>
          <td>${(r.devices || []).length} / ${r.maxDevices || 1}</td>
          <td>${r.completedAt ? 'Yes' : '—'}</td>
          <td><div class="actions">
            <form class="inline" method="POST"><input type="hidden" name="action" value="reset"><input type="hidden" name="id" value="${r.id}"><button type="submit" title="Clear their devices so they can sign in on a new phone">Reset devices</button></form>
            <form class="inline" method="POST"><input type="hidden" name="action" value="extend"><input type="hidden" name="id" value="${r.id}"><button type="submit">+30 days</button></form>
            <form class="inline" method="POST"><input type="hidden" name="action" value="${r.revoked ? 'unrevoke' : 'revoke'}"><input type="hidden" name="id" value="${r.id}"><button class="danger" type="submit">${r.revoked ? 'Restore' : 'Revoke'}</button></form>
          </div></td>
        </tr>`).join('')}</tbody></table></div>`;

  const secret = process.env.SESSION_SECRET || '';
  const secretOk = secret.length >= 32;
  const settingsWarning = secretOk ? '' : `<div class="card" style="border-color:var(--danger)">
    <div style="font-weight:700;color:var(--danger);margin-bottom:6px">Buyers cannot sign in yet</div>
    <div class="sub" style="margin:0">
      SESSION_SECRET is ${secret ? `only ${secret.length} characters long` : 'not set'}.
      It must be at least 32. Set it in Netlify under Site configuration →
      Environment variables, then deploy again. Logins will fail at the last
      step until you do — the password is accepted and then the sign-in breaks.
    </div>
  </div>`;

  return page(`
    <h1>Career Finder</h1>
    <div class="sub">${rows.length} login${rows.length === 1 ? '' : 's'} · ${unused} still unused</div>
    ${message ? `<div class="note">${escapeHtml(message)}</div>` : ''}
    ${settingsWarning}
    <div class="card"><div class="stats">
      <div class="stat"><b>${unused}</b><span>Ready to hand out</span></div>
      <div class="stat"><b>${active}</b><span>Active</span></div>
      <div class="stat"><b>${done}</b><span>Finished it</span></div>
      <div class="stat"><b>${shared}</b><span>Possibly shared</span></div>
    </div></div>
    <div class="card">
      <form method="POST" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <input type="hidden" name="action" value="generate">
        <label for="n" style="font-weight:600;font-size:.88rem">Generate</label>
        <input id="n" type="number" name="count" value="25" min="1" max="100">
        <button class="primary" type="submit">Create logins</button>
      </form>
    </div>
    ${freshBlock}
    ${table}`);
}

export default async (request) => {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured || configured.length < 8) {
    return page('<div class="card"><div class="note">Set <code>ADMIN_PASSWORD</code> in your Netlify environment variables (at least 8 characters), then redeploy.</div></div>');
  }

  if (request.method === 'GET') {
    if (!isLoggedIn(request)) return loginPage();
    try { return dashboard(await listLogins()); }
    catch (err) { return page(`<div class="card"><div class="note">Couldn't load logins: ${escapeHtml(err.message)}</div></div>`); }
  }

  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const form = await request.formData();

  if (!isLoggedIn(request)) {
    let ok = false;
    try { ok = safeEqual(String(form.get('password') || ''), configured); } catch { ok = false; }
    if (!ok) {
      await new Promise(r => setTimeout(r, 900));
      return loginPage('That password is not right.');
    }
    const res = dashboard(await listLogins(), 'Signed in.');
    res.headers.append('set-cookie', makeCookie());
    return res;
  }

  const action = String(form.get('action') || '');
  let message = '';
  let fresh = [];

  try {
    if (action === 'generate') {
      const count = Math.min(100, Math.max(1, Number(form.get('count')) || 25));
      fresh = await createBatch(count);
      message = `${fresh.length} logins created. Copy them now — they are listed below too.`;
    } else {
      const id = String(form.get('id') || '');
      const record = await getLogin(id);
      if (!record) {
        message = 'That login could not be found.';
      } else if (action === 'reset') {
        record.devices = []; record.blockedAttempts = 0;
        await putLogin(id, record);
        message = `Devices cleared for ${id}. They can sign in again on a new device.`;
      } else if (action === 'revoke') {
        record.revoked = true; await putLogin(id, record);
        message = `${id} revoked.`;
      } else if (action === 'unrevoke') {
        record.revoked = false; await putLogin(id, record);
        message = `${id} restored.`;
      } else if (action === 'extend') {
        const base = Math.max(Date.now(), new Date(record.expiresAt || Date.now()).getTime());
        record.expiresAt = new Date(base + 30 * 86400_000).toISOString();
        if (!record.firstUsedAt) record.firstUsedAt = new Date().toISOString();
        await putLogin(id, record);
        message = `${id} now runs until ${fmt(record.expiresAt)}.`;
      } else if (action === 'note') {
        record.note = String(form.get('note') || '').slice(0, 80);
        await putLogin(id, record);
        message = `Note saved for ${id}.`;
      } else {
        message = 'Unknown action.';
      }
    }
  } catch (err) {
    message = `That didn't work: ${err.message}`;
  }

  return dashboard(await listLogins(), message, fresh);
};
