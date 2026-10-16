// ============================================================
// RAZORPAY SIGNATURE VERIFICATION
//
// Both checks are HMAC-SHA256, but they use DIFFERENT secrets and
// different payloads, which is the easiest thing to get wrong:
//
//   redirect  → your API key secret,  payload is 4 fields joined by |
//   webhook   → your webhook secret,  payload is the raw request body
//
// Payload order for payment links, per Razorpay's own SDK:
//   payment_link_id | payment_link_reference_id | payment_link_status | payment_id
// ============================================================
import crypto from 'node:crypto';

function hmac(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function safeEqualHex(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function paymentLinkPayload({ linkId, referenceId, status, paymentId }) {
  return `${linkId}|${referenceId}|${status}|${paymentId}`;
}

/** Verifies the signature Razorpay appends when redirecting a payer back. */
export function verifyPaymentLinkSignature(params, keySecret) {
  if (!keySecret) return false;
  const { signature } = params;
  if (!signature) return false;
  return safeEqualHex(hmac(paymentLinkPayload(params), keySecret), signature);
}

/** Verifies a webhook. `rawBody` must be the exact bytes received. */
export function verifyWebhookSignature(rawBody, signature, webhookSecret) {
  if (!webhookSecret || !signature) return false;
  return safeEqualHex(hmac(rawBody, webhookSecret), signature);
}
