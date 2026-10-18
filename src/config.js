// ============================================================
// PUBLIC PRODUCT CONFIG
//
// Everything in this file ships to the browser. Never put a secret,
// a password or an API key here — all of those live in Netlify
// environment variables and are only read by the server code in netlify/.
//
// THE TWO LINES YOU MUST FILL IN are marked ← FILL THIS IN below.
// ============================================================

export const PRODUCT = {
  NAME: 'Non-Clinical Career Finder',
  TAGLINE: 'Find the non-clinical roles that fit how you actually like to work.',
  DURATION: '~7 minutes',
  QUESTION_COUNT: 14,
  ROLE_COUNT: 12,

  PRICE_DISPLAY: '₹499',

  // ── Your Razorpay payment link ──────────────────────────────
  // Razorpay Dashboard → Payment Links → Create payment link.
  // Make it REUSABLE so the same link works for every buyer.
  // Then paste the whole address here, inside the quotes.
  RAZORPAY_LINK: 'https://razorpay.me/@drfaseelaabdulkarim',

  // ── Your Instagram ──────────────────────────────────────────
  // Just the username, no @ and no web address.
  INSTAGRAM_HANDLE: 'dr_faseelakareem',

  // Support only — not where the sale happens any more.
  // International format, no spaces, no plus, no leading zero.
  WHATSAPP_NUMBER: '917560893122',
  WHATSAPP_MESSAGE: "Hi! I have a question about the Career Finder.",

  // Access policy, shown on the page. The real enforcement lives in
  // the ACCESS_DAYS and MAX_DEVICES environment variables on Netlify —
  // if you change one of those, change it here too so the page
  // doesn't promise something different from what the site does.
  ACCESS_DAYS: 30,
  MAX_DEVICES: 1,
};

// Convenience links built from the settings above. Don't edit these.
export const LINKS = {
  pay: PRODUCT.RAZORPAY_LINK,
  instagram: `https://instagram.com/${PRODUCT.INSTAGRAM_HANDLE}`,
  whatsapp: `https://wa.me/${PRODUCT.WHATSAPP_NUMBER}` +
            `?text=${encodeURIComponent(PRODUCT.WHATSAPP_MESSAGE)}`,
};

// ============================================================
// BUSINESS DETAILS
// These appear publicly and must match your Razorpay KYC.
// Razorpay checks for them during website verification.
// ============================================================
export const BUSINESS = {
  NAME: 'Faseela Abdul Karim',
  EMAIL: 'drfaseelaabdulkareem@gmail.com',
  PHONE: '+91 7560 893122',
  LOCATION: 'Kerala',
};
