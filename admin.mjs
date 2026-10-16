// ============================================================
// /api/admin
//
// Your buyer list. Password-protected, no database dashboard needed.
// Set ADMIN_PASSWORD in Netlify's environment variables.
//
// From here you can: see who bought, resend someone's link, free up a
// device slot when they change phones, extend access, or cut someone off.
// ============================================================
import crypto from 'node:crypto';
import { listAccess, getToken, putToken } from '../lib/store.mjs';
import { sendAccessEmail } from '../lib/email.mjs';
import { html, escapeHtml, safeEqual } from '../lib/http.mjs';

export const config = { path: '/api/admin' };

const COOKIE = 'cf_admin';

function sign(value) {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET || 'dev')
    .update(value).digest('hex');
}

function makeCookie() {
  const exp = Date.now() + 12 * 3600_000;
  const value = `${exp}.${sign(String(exp))}`;
  return `${COOKIE}=${value}; Path=/api/admin; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`;
}

function isLoggedIn(request) {
  const raw = request.headers.get('cookie') || '';
  const match = raw.match(new RegExp(`${COOKIE}=([^;]+)`));
  if (!match) return false;

  const [exp, sig] = decodeURIComponent(match[1]).split('.');
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;

  try {
    return safeEqual(sign(exp), sig);
  } catch {
    return false;
  }
}

const page = (body, extraHead = '') => html(`<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Career Finder — buyers</title>
<style>
  :root {
    --bg:#FAF7F2; --card:#fff; --ink:#1F1D1A; --muted:#8A857C;
    --line:#E8E1D7; --accent:#2C5C4C; --danger:#B4483C; --ok:#2E7D52;
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink);
    font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
    padding:24px 16px; }
  .wrap { max-width:1060px; margin:0 auto; }
  h1 { font-size:1.5rem; margin:0 0 4px; }
  .sub { color:var(--muted); font-size:.85rem; margin-bottom:24px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:12px;
    padding:20px; margin-bottom:16px; }
  table { width:100%; border-collapse:collapse; font-size:.85rem; }
  th { text-align:left; font-size:.68rem; letter-spacing:.09em; text-transform:uppercase;
    color:var(--muted); padding:8px 10px; border-bottom:1.5px solid var(--line); white-space:nowrap; }
  td { padding:11px 10px; border-bottom:1px solid var(--line); vertical-align:top; }
  tr:last-child td { border-bottom:none; }
  .email { font-weight:600; word-break:break-all; }
  .pill { display:inline-block; font-size:.68rem; font-weight:600; padding:2px 9px;
    border-radius:20px; white-space:nowrap; }
  .pill.ok { background:#E6F4EC; color:var(--ok); }
  .pill.warn { background:#FDF0E4; color:#A8631F; }
  .pill.bad { background:#FBE9E7; color:var(--danger); }
  input[type=password], input[type=text] { width:100%; max-width:320px; padding:10px 13px;
    border:1.5px solid var(--line); border-radius:8px; font-size:.95rem; }
  button { font:inherit; font-size:.78rem; font-weight:600; padding:6px 12px; border-radius:20px;
    border:1.5px solid var(--line); background:#fff; color:var(--ink); cursor:pointer; }
  button:hover { border-color:var(--accent); color:var(--accent); }
  button.primary { background:var(--accent); color:#fff; border-color:var(--accent);
    font-size:.9rem; padding:11px 26px; }
  button.danger:hover { border-color:var(--danger); color:var(--danger); }
  form.inline { display:inline; }
  .actions { display:flex; gap:6px; flex-wrap:wrap; }
  .note { background:#FDF0E4; border:1px solid #F0D9BD; border-radius:8px;
    padding:12px 14px; font-size:.83rem; margin-bottom:16px; }
  .stats { display:flex; gap:22px; flex-wrap:wrap; margin-bottom:8px; }
  .stat b { display:block; font-size:1.5rem; line-height:1.2; }
  .stat span { font-size:.72rem; color:var(--muted); text-transform:uppercase; letter-spacing:.07em; }
  .empty { text-align:center; padding:36px 16px; color:var(--muted); }
  code { background:var(--bg); padding:1px 5px; border-radius:4px; font-size:.8rem;
    word-break:break-all; }
</style></head><body><div class="wrap">${body}</div>${extraHead}</body></html>`);

function loginPage(error = '') {
  return page(`
    <h1>Career Finder</h1>
    <div class="sub">Buyer management</div>
    <div class="card">
      ${error ? `<div class="note">${escapeHtml(error)}</div>` : ''}
      <form method="POST">
        <label for="pw" style="display:block;font-weight:600;font-size:.85rem;margin-bottom:8px">Password</label>
        <input id="pw" type="password" name="password" autofocus autocomplete="current-password">
        <div style="margin-top:16px"><button class="primary" type="submit">Sign in</button></div>
      </form>
    </div>`);
}

function statusPill(r) {
  if (r.revoked) return '<span class="pill bad">Revoked</span>';
  if (new Date(r.expiresAt) < new Date()) return '<span class="pill warn">Expired</span>';
  return '<span class="pill ok">Active</span>';
}

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

function dashboard(rows, message = '') {
  const active = rows.filter(r => !r.revoked && new Date(r.expiresAt) > new Date()).length;
  const completed = rows.filter(r => r.completedAt).length;
  const shared = rows.filter(r => (r.blockedAttempts || 0) > 0).length;
  const revenue = rows.reduce((s, r) => s + (r.amountPaise || 0), 0) / 100;

  const body = rows.length === 0
    ? '<div class="card"><div class="empty">No buyers yet. Your first sale will show up here.</div></div>'
    : `<div class="card"><table>
        <thead><tr>
          <th>Buyer</th><th>Status</th><th>Bought</th><th>Expires</th>
          <th>Devices</th><th>Finished?</th><th>Email sent</th><th>Actions</th>
        </tr></thead><tbody>
        ${rows.map(r => `<tr>
          <td>
            <div class="email">${escapeHtml(r.email || '(no email)')}</div>
            ${r.name ? `<div style="color:var(--muted);font-size:.78rem">${escapeHtml(r.name)}</div>` : ''}
            ${(r.blockedAttempts || 0) > 0
              ? `<div style="color:var(--danger);font-size:.74rem;margin-top:3px">⚠ ${r.blockedAttempts} blocked attempt${r.blockedAttempts === 1 ? '' : 's'} — link may be shared</div>`
              : ''}
          </td>
          <td>${statusPill(r)}</td>
          <td>${fmt(r.createdAt)}</td>
          <td>${fmt(r.expiresAt)}</td>
          <td>${(r.devices || []).length} / ${r.maxDevices || 2}</td>
          <td>${r.completedAt ? 'Yes' : 'Not yet'}</td>
          <td>${r.emailSentAt ? 'Yes' : '<span style="color:var(--danger)">No</span>'}</td>
          <td><div class="actions">
            <form class="inline" method="POST"><input type="hidden" name="action" value="reset_devices"><input type="hidden" name="token" value="${r.token}"><button type="submit" title="Clear their devices so they can sign in on a new phone">Reset devices</button></form>
            <form class="inline" method="POST"><input type="hidden" name="action" value="resend"><input type="hidden" name="token" value="${r.token}"><button type="submit">Resend link</button></form>
            <form class="inline" method="POST"><input type="hidden" name="action" value="extend"><input type="hidden" name="token" value="${r.token}"><button type="submit">+30 days</button></form>
            <form class="inline" method="POST"><input type="hidden" name="action" value="${r.revoked ? 'unrevoke' : 'revoke'}"><input type="hidden" name="token" value="${r.token}"><button class="danger" type="submit">${r.revoked ? 'Restore' : 'Revoke'}</button></form>
          </div>
          <details style="margin-top:6px"><summary style="cursor:pointer;font-size:.74rem;color:var(--muted)">Their link</summary>
            <code>${escapeHtml((process.env.APP_URL || '').replace(/\/$/, ''))}/?k=${r.token}</code>
          </details></td>
        </tr>`).join('')}
        </tbody></table></div>`;

  return page(`
    <h1>Career Finder</h1>
    <div class="sub">${rows.length} buyer${rows.length === 1 ? '' : 's'} · updated just now</div>
    ${message ? `<div class="note">${escapeHtml(message)}</div>` : ''}
    <div class="card"><div class="stats">
      <div class="stat"><b>${rows.length}</b><span>Total sales</span></div>
      <div class="stat"><b>${active}</b><span>Active access</span></div>
      <div class="stat"><b>${completed}</b><span>Finished it</span></div>
      <div class="stat"><b>${shared}</b><span>Possibly shared</span></div>
      <div class="stat"><b>₹${revenue.toLocaleString('en-IN')}</b><span>Collected</span></div>
    </div></div>
    ${body}`);
}

export default async (request) => {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured || configured.length < 8) {
    return page('<div class="card"><div class="note">Set <code>ADMIN_PASSWORD</code> in your Netlify environment variables (at least 8 characters), then redeploy.</div></div>');
  }

  if (request.method === 'GET') {
    if (!isLoggedIn(request)) return loginPage();
    try {
      return dashboard(await listAccess());
    } catch (err) {
      return page(`<div class="card"><div class="note">Couldn't load buyers: ${escapeHtml(err.message)}</div></div>`);
    }
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const form = await request.formData();

  // Signing in
  if (!isLoggedIn(request)) {
    const supplied = String(form.get('password') || '');
    let ok = false;
    try { ok = safeEqual(supplied, configured); } catch { ok = false; }

    if (!ok) {
      // Slow brute force down a little without blocking the platform.
      await new Promise(r => setTimeout(r, 900));
      return loginPage('That password is not right.');
    }

    const res = dashboard(await listAccess(), 'Signed in.');
    res.headers.append('set-cookie', makeCookie());
    return res;
  }

  // Actions
  const action = String(form.get('action') || '');
  const token  = String(form.get('token') || '');
  let message  = '';

  try {
    const record = await getToken(token);
    if (!record) {
      message = 'That buyer could not be found.';
    } else if (action === 'reset_devices') {
      record.devices = [];
      record.blockedAttempts = 0;
      await putToken(token, record);
      message = `Devices cleared for ${record.email}. They can open their link again on any two devices.`;
    } else if (action === 'revoke') {
      record.revoked = true;
      await putToken(token, record);
      message = `Access revoked for ${record.email}.`;
    } else if (action === 'unrevoke') {
      record.revoked = false;
      await putToken(token, record);
      message = `Access restored for ${record.email}.`;
    } else if (action === 'extend') {
      const base = Math.max(Date.now(), new Date(record.expiresAt).getTime());
      record.expiresAt = new Date(base + 30 * 86400_000).toISOString();
      await putToken(token, record);
      message = `${record.email} now has access until ${fmt(record.expiresAt)}.`;
    } else if (action === 'resend') {
      if (!record.email) {
        message = 'No email address on file for this buyer — send them their link by hand (see "Their link").';
      } else {
        await sendAccessEmail({
          to: record.email,
          name: record.name,
          link: `${(process.env.APP_URL || '').replace(/\/$/, '')}/?k=${token}`,
          expiresAt: record.expiresAt,
          maxDevices: record.maxDevices,
        });
        record.emailSentAt = new Date().toISOString();
        await putToken(token, record);
        message = `Link resent to ${record.email}.`;
      }
    } else {
      message = 'Unknown action.';
    }
  } catch (err) {
    message = `That didn't work: ${err.message}`;
  }

  return dashboard(await listAccess(), message);
};
