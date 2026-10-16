// ============================================================
// EMAIL — Brevo, over plain fetch
//
// No SDK, so there is nothing extra to install. Brevo's free tier
// sends 300 emails a day.
//
// Important: this email is a BACKUP copy of the access link. Buyers
// get into the worksheet immediately after paying via the redirect,
// so if this lands in a spam folder nobody is locked out of
// something they paid for.
// ============================================================
import { escapeHtml } from './http.mjs';

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

function senderFromEnv() {
  const raw = (process.env.EMAIL_FROM || '').trim();
  const match = raw.match(/^(.*?)\s*<(.+)>$/);
  if (match) return { name: match[1].replace(/^"|"$/g, ''), email: match[2] };
  return { name: process.env.PRODUCT_NAME || 'Career Finder', email: raw };
}

async function send({ to, toName, subject, html, text }) {
  const key = process.env.BREVO_API_KEY;
  if (!key) throw new Error('BREVO_API_KEY is not set');

  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'api-key': key,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: senderFromEnv(),
      to: [{ email: to, name: toName || undefined }],
      replyTo: process.env.EMAIL_REPLY_TO
        ? { email: process.env.EMAIL_REPLY_TO }
        : undefined,
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Brevo ${res.status}: ${detail.slice(0, 300)}`);
  }

  return res.json().catch(() => ({}));
}

export async function sendAccessEmail({ to, name, link, expiresAt, maxDevices }) {
  const firstName = (name || '').trim().split(/\s+/)[0] || 'there';
  const expiry = new Date(expiresAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #E8E1D7;border-radius:14px;padding:36px 32px;"><tr><td>
<div style="font-size:11px;letter-spacing:.12em;font-weight:700;color:#2C5C4C;margin-bottom:18px;">YOUR ACCESS LINK</div>
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:#1F1D1A;">The Non-Clinical Career Finder</h1>
<p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#4A463F;">Hi ${escapeHtml(firstName)} — thanks for your purchase. Here's your link again, so you can come back to it any time.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="border-radius:50px;background:#2C5C4C;">
<a href="${link}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;border-radius:50px;">Open my worksheet &rarr;</a>
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:10px;padding:16px 18px;margin-bottom:22px;"><tr><td style="font-size:13px;line-height:1.7;color:#4A463F;">
<strong style="color:#1F1D1A;">Worth knowing</strong><br>
&bull; Save this email — it's how you get back in.<br>
&bull; The link is personal to you and works on up to <strong>${maxDevices} devices</strong> (your phone and your laptop, say).<br>
&bull; Access runs until <strong>${expiry}</strong>.<br>
&bull; Please don't forward it. A shared link stops working once the device limit is reached.
</td></tr></table>
<p style="margin:0;font-size:13px;line-height:1.6;color:#8A857C;">Something not working? Just reply to this email.</p>
<p style="margin:18px 0 0;font-size:11px;line-height:1.6;color:#A9A49A;word-break:break-all;">If the button doesn't work, paste this into your browser:<br>${link}</p>
</td></tr></table></td></tr></table></body></html>`;

  const text = [
    `Hi ${firstName},`,
    '',
    "Thanks for your purchase. Here's your access link to the Non-Clinical Career Finder:",
    '',
    link,
    '',
    'Save this email — it is how you get back in.',
    `The link is personal to you and works on up to ${maxDevices} devices. Access runs until ${expiry}.`,
    "Please don't forward it — a shared link stops working once the device limit is reached.",
    '',
    'Something not working? Just reply to this email.',
  ].join('\n');

  return send({ to, toName: name, subject: 'Your Career Finder access link', html, text });
}

/** Tells you when something needed a human — a payment with no email, say. */
export async function sendSellerAlert({ subject, body }) {
  const to = process.env.SELLER_ALERT_EMAIL;
  if (!to) return;
  try {
    await send({ to, subject, text: body, html: `<pre style="font:14px/1.6 monospace;white-space:pre-wrap">${escapeHtml(body)}</pre>` });
  } catch (err) {
    console.error('[email] seller alert failed:', err.message);
  }
}
