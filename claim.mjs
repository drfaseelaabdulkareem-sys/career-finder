// ============================================================
// GET /api/claim
//
// Razorpay sends the buyer here the instant they pay. We verify the
// signature Razorpay attaches, create their access token, and drop
// them straight into the worksheet.
//
// This is why nobody waits on an email. The email that follows is a
// convenience copy, not the delivery mechanism.
//
// Set this URL as the Payment Link's callback_url.
// ============================================================
import { createAccess, putToken } from '../lib/store.mjs';
import { verifyPaymentLinkSignature } from '../lib/razorpay.mjs';
import { sendAccessEmail, sendSellerAlert } from '../lib/email.mjs';
import { redirect } from '../lib/http.mjs';

export const config = { path: '/api/claim' };

function appUrl() {
  return (process.env.APP_URL || '').replace(/\/$/, '');
}

function fail(reason) {
  return redirect(`${appUrl()}/?claim=${encodeURIComponent(reason)}`);
}

export default async (request) => {
  const url = new URL(request.url);
  const q = key => url.searchParams.get(key) || '';

  const paymentId   = q('razorpay_payment_id');
  const linkId      = q('razorpay_payment_link_id');
  const referenceId = q('razorpay_payment_link_reference_id');
  const status      = q('razorpay_payment_link_status');
  const signature   = q('razorpay_signature');

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('[claim] RAZORPAY_KEY_SECRET is not set');
    return fail('not_configured');
  }

  if (!paymentId || !linkId || !signature) {
    return fail('missing_params');
  }

  const authentic = verifyPaymentLinkSignature(
    { linkId, referenceId, status, paymentId, signature }, keySecret
  );

  if (!authentic) {
    console.warn('[claim] signature mismatch for payment', paymentId);
    return fail('bad_signature');
  }

  if (status !== 'paid') {
    return fail('not_paid');
  }

  // Look up the buyer's details from Razorpay so we know where to
  // email the backup copy. If this call fails we still grant access —
  // they have paid, and the signature proves it.
  let email = '';
  let name = '';
  let contact = '';
  let amountPaise = null;

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { authorization: `Basic ${auth}` },
    });
    if (res.ok) {
      const payment = await res.json();
      email = (payment.email || '').trim().toLowerCase();
      contact = payment.contact || '';
      name = payment.notes?.name || payment.card?.name || '';
      amountPaise = payment.amount || null;
    } else {
      console.warn('[claim] payment lookup returned', res.status);
    }
  } catch (err) {
    console.warn('[claim] payment lookup failed:', err.message);
  }

  let token;
  let record;
  try {
    const created = await createAccess({
      email, name, contact, paymentId, amountPaise, source: 'redirect',
    });
    token = created.token;
    record = created.record;

    // Send the backup email once, and never let a failure here block
    // the buyer from getting in.
    if (email && !record.emailSentAt && !created.alreadyExisted) {
      try {
        await sendAccessEmail({
          to: email, name, link: `${appUrl()}/?k=${token}`,
          expiresAt: record.expiresAt, maxDevices: record.maxDevices,
        });
        record.emailSentAt = new Date().toISOString();
        await putToken(token, record);
      } catch (err) {
        console.error('[claim] backup email failed:', err.message);
      }
    }

    if (!email) {
      await sendSellerAlert({
        subject: 'Career Finder: a payment came through with no email address',
        body: [
          'Razorpay did not return an email address for this payment, so no',
          'backup email could be sent. The buyer WAS given access in their browser.',
          '',
          `Payment ID: ${paymentId}`,
          `Phone: ${contact || 'not provided'}`,
          `Their link: ${appUrl()}/?k=${token}`,
          '',
          'If they lose the tab, send them that link.',
        ].join('\n'),
      });
    }
  } catch (err) {
    console.error('[claim] could not create access:', err.message);
    return fail('server_error');
  }

  // Straight into the worksheet. Gate.jsx redeems ?k= automatically.
  return redirect(`${appUrl()}/?k=${token}&welcome=1`);
};
