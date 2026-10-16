# Non-Clinical Career Finder

A paid, device-locked career assessment for healthcare graduates exploring
non-clinical roles. Runs on Netlify's free tier with no database to manage.

**→ Start with [SETUP.md](./SETUP.md).**

---

## How access works

No shared password. When someone pays, Razorpay redirects them back to
`/api/claim`, which verifies the payment signature, mints a unique access token
and drops them straight into the worksheet. A backup email with the same link
follows, so they can return later. Each token admits a limited number of
devices and then expires.

```
src/                       ← ships to the browser. Contains NO worksheet content.
  config.js                ← public settings (price, payment link, support)
  lib/api.js               ← device id, session handling, API calls
  components/
    Gate.jsx               ← magic-link redemption + post-payment errors
    Welcome.jsx  Assessment.jsx  Transition.jsx  Results.jsx

netlify/
  lib/                     ← server only. Never downloadable.
    questions.mjs          ← question bank, sanitiser, rehydrator
    roles.mjs              ← 12 role profiles, weights, roadmaps, result copy
    scoring.mjs            ← ranking engine
    store.mjs              ← Netlify Blobs: buyers and devices
    jwt.mjs                ← minimal HS256 sessions (no auth library)
    razorpay.mjs           ← redirect + webhook signature verification
    auth.mjs  email.mjs  http.mjs
  functions/
    claim.mjs              ← payment redirect → instant access
    webhook.mjs            ← safety net if the buyer closed the tab
    verify.mjs             ← redeems a link, enforces the device cap
    content.mjs            ← questions with all scoring data stripped
    score.mjs              ← runs the engine
    admin.mjs              ← password-protected buyer list

scripts/
  test-all.mjs             ← scoring, sessions, Razorpay signatures
  verify-build.mjs         ← fails if IP or secrets leak into dist/
```

## Before every deploy

```bash
npm run build && npm run verify
npm test
```

`verify` scans the built bundle for role profiles, roadmaps, scoring internals
and secrets, and exits non-zero if it finds any. Point it at any directory:
`node scripts/verify-build.mjs src`.

## Two secrets, two purposes

Easy to mix up:

- **`RAZORPAY_KEY_SECRET`** signs the redirect (`payment_link_id|reference_id|status|payment_id`)
- **`RAZORPAY_WEBHOOK_SECRET`** signs the webhook (the raw request body)

`netlify/lib/razorpay.mjs` keeps them apart; `npm test` asserts one cannot
stand in for the other.
