// ============================================================
// PUBLIC PRODUCT CONFIG
//
// Everything in this file ships to the browser. Never put a secret,
// a password or an API key here — all of those live in Netlify
// environment variables and are only read by the server code in netlify/.
// ============================================================

export const PRODUCT = {
  NAME: 'Non-Clinical Career Finder',
  TAGLINE: 'Find the non-clinical roles that fit how you actually like to work.',
  DURATION: '~7 minutes',
  QUESTION_COUNT: 14,
  ROLE_COUNT: 12,

  // Your Razorpay Payment Link.
  PAYMENT_LINK: 'https://rzp.io/l/your-link-here',
  PRICE_DISPLAY: '₹499',

  ACCESS_DAYS: 30,
  MAX_DEVICES: 2,
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
