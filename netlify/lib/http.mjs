// ============================================================
// Small shared helpers. Netlify Functions use the standard web
// Request/Response objects, so these are thin wrappers.
// ============================================================
import crypto from 'node:crypto';

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function redirect(location) {
  return new Response(null, { status: 302, headers: { location } });
}

export function clientIp(request) {
  const fwd = request.headers.get('x-nf-client-connection-ip')
    || request.headers.get('x-forwarded-for') || '';
  return fwd.split(',')[0].trim() || 'unknown';
}

/** Store a hash rather than the raw IP — enough to spot abuse, no raw PII kept. */
export function hashIp(ip) {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET || 'dev-salt')
    .update(String(ip)).digest('hex').slice(0, 24);
}

export function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
