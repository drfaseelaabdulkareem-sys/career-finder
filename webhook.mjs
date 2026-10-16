// ============================================================
// POST /api/webhook
//
// A safety net behind the redirect. If a buyer closes the tab before
// Razorpay redirects them, this still creates their access and emails
// the link.
//
// Razorpay Dashboard → Settings → Webhooks
//   events: payment_link.paid, payment.captured
// ============================================================
import { createAccess, putToken } from '../lib/store.mjs';
import { verifyWebhookSignature } from '../lib/razorpay.mjs';
import { sendAccessEmail, sendSellerAlert } from '../lib/email.mjs';
import { json } from '../lib/http.mjs';

export const config = { path: '/api/webhook' };

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // The signature covers the exact bytes Razorpay sent, so read the
  // raw text — never a re-serialised object.
  const raw = await request.text();
  const signature = request.headers.get('x-razorpay-signature') || '';
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[webhook] RAZORPAY_WEBHOOK_SECRET is not set');
    return json({ error: 'not_configured' }, 500);
  }

  if (!verifyWebhookSignature(raw, signature, secret)) {
    console.warn('[webhook] bad signature');
    return json({ error: 'bad_signature' }, 401);
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  if (!['payment_link.paid', 'payment.captured'].includes(event.event)) {
    return json({ ok: true, ignored: event.event });
  }

  const payment = event.payload?.payment?.entity || {};
  const plink   = event.payload?.payment_link?.entity || {};
  const paymentId = payment.id || plink.id;
  if (!paymentId) return json({ ok: true, ignored: 'no_payment_id' });

  const email = (plink.customer?.email || payment.email || payment.notes?.email || '')
    .trim().toLowerCase();
  const name = (plink.customer?.name || payment.notes?.name || payment.card?.name || '').trim();
  const contact = plink.customer?.contact || payment.contact || '';

  let created;
  try {
    created = await createAccess({
      email, name, contact, paymentId,
      amountPaise: payment.amount || plink.amount || null,
      source: 'webhook',
    });
  } catch (err) {
    console.error('[webhook] could not create access:', err.message);
    return json({ error: 'server_error' }, 500);
  }

  const { token, record, alreadyExisted } = created;

  // The redirect almost always got here first. Don't email twice.
  if (alreadyExisted && record.emailSentAt) {
    return json({ ok: true, duplicate: true });
  }

  if (!email) {
    await sendSellerAlert({
      subject: 'Career Finder: payment with no email address',
      body: [
        'A payment arrived without an email address, so no link could be sent.',
        '',
        `Payment ID: ${paymentId}`,
        `Phone: ${contact || 'not provided'}`,
        `Their link: ${(process.env.APP_URL || '').replace(/\/$/, '')}/?k=${token}`,
        '',
        'Contact this buyer and send them that link.',
      ].join('\n'),
    });
    return json({ ok: true, warning: 'no_email' });
  }

  try {
    await sendAccessEmail({
      to: email,
      name,
      link: `${(process.env.APP_URL || '').replace(/\/$/, '')}/?k=${token}`,
      expiresAt: record.expiresAt,
      maxDevices: record.maxDevices,
    });
    record.emailSentAt = new Date().toISOString();
    await putToken(token, record);
  } catch (err) {
    console.error('[webhook] email failed:', err.message);
    await sendSellerAlert({
      subject: 'Career Finder: access email failed to send',
      body: [
        'Access was created but the email did not send. Send this link manually.',
        '',
        `Buyer: ${email}`,
        `Payment ID: ${paymentId}`,
        `Link: ${(process.env.APP_URL || '').replace(/\/$/, '')}/?k=${token}`,
      ].join('\n'),
    });
    // Still 200 — the access exists, so a retry would only duplicate work.
  }

  return json({ ok: true });
};
