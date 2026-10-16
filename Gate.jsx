import { useState, useEffect } from 'react';
import { PRODUCT, BUSINESS } from '../config.js';
import {
  getSession, redeemToken, readTokenFromUrl, extractToken, scrubUrl,
} from '../lib/api.js';

// Problems reported by /api/claim after a payment.
const CLAIM_MESSAGES = {
  not_configured: 'Your payment went through, but the site is not finished setting up. Please contact support — you will not be charged twice.',
  missing_params: "Your payment may have gone through, but we didn't get the confirmation details. Check your email for your access link, or contact support.",
  bad_signature: "We couldn't confirm that payment. If you were charged, contact support and we'll sort it out straight away.",
  not_paid:      'That payment did not complete. Nothing has been charged.',
  server_error:  "Your payment went through but something broke on our side. Check your email for your link, or contact support — we'll fix it.",
};

const MESSAGES = {
  invalid_link: "We couldn't find that access link. Check you've copied the whole thing from your email.",
  expired:      'This access link has expired. Reply to your purchase email and we can extend it.',
  revoked:      'This access link has been deactivated. Get in touch if you think that\'s a mistake.',
  device_limit: `This link has already been used on the maximum number of devices. If that was you — a new phone, say — reply to your purchase email and we'll reset it.`,
  verify_failed:'Something went wrong on our side. Try again in a moment.',
};

const INCLUDES = [
  ['Your top 3 role matches', `Ranked out of ${PRODUCT.ROLE_COUNT} non-clinical career paths, scored against how you answered.`],
  ['Why each one fits', 'Written against your actual answers — not a generic personality blurb.'],
  ['Where each would annoy you', "The friction points. The parts of the job you'd probably resent."],
  ['A 90-day roadmap', 'Three stages, with specific actions. What to do in the first month, the second, the third.'],
  ['Job titles to search', 'The entry-level titles that actually exist, so you stop guessing what to type into LinkedIn.'],
  ['Your unfair advantage', 'What your clinical background gives you that other applicants do not have.'],
  ['One experiment to try first', 'A small task to test a path before you commit months to it.'],
];

const FAQS = [
  ['Who is this for?',
   'MBBS, BDS, BAMS, BHMS, pharmacy, nursing, physiotherapy and life science graduates who are considering work outside direct patient care — whether you have just graduated or have been practising for years.'],
  ['Is this a psychometric test?',
   'No, and we would not claim otherwise. It is a structured way of weighing what you like doing against what twelve real roles actually involve day to day. The score is a ranking device, not a scientific measurement.'],
  ['Will this get me a job?',
   'No tool can promise that. What it gives you is a shortlist worth taking seriously and a concrete 90-day plan, instead of six months of scrolling job boards wondering what you are even qualified for.'],
  ['How long does it take?',
   `About ${PRODUCT.DURATION.replace('~', '')}. ${PRODUCT.QUESTION_COUNT} questions, no long essays to write.`],
  ['What do I actually receive?',
   'Access opens in your browser the instant you pay — there is no file to download and no waiting. You also get an email with a personal link so you can come back to it later.'],
  ['Can I share it with a friend?',
   `No. Your link works on up to ${PRODUCT.MAX_DEVICES} devices — your phone and your laptop, say — and stops working beyond that. If a friend wants it, they will need their own.`],
  ['How long do I have access?',
   `${PRODUCT.ACCESS_DAYS} days from purchase. You can retake it as often as you like in that time.`],
  ['Can I get a refund?',
   'Because the whole product is revealed the moment you are in, we do not refund after access is granted. If we fail to deliver it to you, you get your money back in full. Please read the refund policy before buying.'],
];

export default function Gate({ onUnlock }) {
  const [input, setInput]     = useState('');
  const [error, setError]     = useState('');
  const [busy, setBusy]       = useState(false);
  const [shaking, setShaking] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const [claimError] = useState(() => {
    try {
      const code = new URLSearchParams(window.location.search).get('claim');
      return code ? (CLAIM_MESSAGES[code] || CLAIM_MESSAGES.server_error) : '';
    } catch {
      return '';
    }
  });

  // A link opened straight from the email redeems itself.
  useEffect(() => {
    const urlToken = readTokenFromUrl();
    if (!urlToken) return;

    let cancelled = false;
    setBusy(true);

    redeemToken(urlToken)
      .then(session => { scrubUrl(); if (!cancelled) onUnlock(session); })
      .catch(err => {
        scrubUrl();
        if (!cancelled) {
          setError(MESSAGES[err.code] || MESSAGES.verify_failed);
          setBusy(false);
        }
      });

    return () => { cancelled = true; };
  }, [onUnlock]);

  async function handleSubmit(e) {
    e.preventDefault();
    const token = extractToken(input);
    if (!token) {
      fail('Paste the full link from your email — it ends in a long string of letters and numbers.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      onUnlock(await redeemToken(token));
    } catch (err) {
      setBusy(false);
      fail(MESSAGES[err.code] || MESSAGES.verify_failed);
    }
  }

  function fail(message) {
    setError(message);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }

  const hasPaymentLink =
    PRODUCT.PAYMENT_LINK && !PRODUCT.PAYMENT_LINK.includes('your-link-here');

  // While a link is being redeemed, show only that.
  if (busy && !error && readTokenFromUrl()) {
    return (
      <div style={S.loaderPage}>
        <div className="ncf-spinner" />
        <div style={{ fontSize: '.9rem', color: 'var(--ink-light)' }}>Checking your access…</div>
        <Styles />
      </div>
    );
  }

  const buyButton = (big = false) => hasPaymentLink ? (
    <a href={PRODUCT.PAYMENT_LINK} style={big ? S.ctaBig : S.ctaSmall}>
      Get my results — {PRODUCT.PRICE_DISPLAY}
    </a>
  ) : (
    <div style={S.ctaDisabled}>Payment link not configured yet</div>
  );

  return (
    <div style={S.page}>
      {/* ── Hero ─────────────────────────────────────── */}
      <section style={S.hero}>
        <div style={S.badge}>FOR HEALTHCARE &amp; LIFE SCIENCE GRADUATES</div>
        <h1 style={S.h1}>
          You trained for years.<br />Now you&rsquo;re not sure you want the ward.
        </h1>
        <p style={S.sub}>
          There are real careers outside direct patient care that your training
          already qualifies you for. The hard part is knowing which ones suit how
          you actually like to work. This finds out in {PRODUCT.DURATION.replace('~', '')}.
        </p>
        <div style={S.heroCta}>
          {buyButton(true)}
          <div style={S.heroMeta}>
            {PRODUCT.QUESTION_COUNT} questions · instant access · {PRODUCT.ACCESS_DAYS} days
          </div>
        </div>
      </section>

      {/* ── What you get ─────────────────────────────── */}
      <section style={S.section}>
        <h2 style={S.h2}>What you get</h2>
        <div style={S.cards}>
          {INCLUDES.map(([title, body]) => (
            <div key={title} style={S.card}>
              <div style={S.cardTitle}>{title}</div>
              <div style={S.cardBody}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section style={S.section}>
        <h2 style={S.h2}>How it works</h2>
        <ol style={S.steps}>
          <li style={S.step}>
            <strong>Pay {PRODUCT.PRICE_DISPLAY}.</strong> Card, UPI or net banking,
            handled by Razorpay.
          </li>
          <li style={S.step}>
            <strong>You&rsquo;re in immediately.</strong> No password, no waiting for
            an email. A backup link is emailed to you as well.
          </li>
          <li style={S.step}>
            <strong>Answer {PRODUCT.QUESTION_COUNT} questions</strong> about how you
            prefer to work — not what you studied.
          </li>
          <li style={S.step}>
            <strong>Get your three matches and your 90-day plan.</strong> Come back
            to it any time for {PRODUCT.ACCESS_DAYS} days.
          </li>
        </ol>
      </section>

      {/* ── Honest expectations ──────────────────────── */}
      <section style={S.section}>
        <div style={S.honest}>
          <div style={S.honestTitle}>What this is not</div>
          <p style={S.honestBody}>
            It is not a psychometric test, and it will not get you a job on its own.
            It is a structured way of narrowing twelve possible directions down to
            the three worth your attention, with a concrete plan for the first
            ninety days. The decision stays yours.
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section style={S.section}>
        <h2 style={S.h2}>Questions</h2>
        <div>
          {FAQS.map(([q, a], i) => (
            <div key={q} style={S.faqItem}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={S.faqQ}
                aria-expanded={openFaq === i}
              >
                <span>{q}</span>
                <span style={{ color: 'var(--ink-muted)', flexShrink: 0, marginLeft: 12 }}>
                  {openFaq === i ? '−' : '+'}
                </span>
              </button>
              {openFaq === i && <div style={S.faqA}>{a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── Buy ──────────────────────────────────────── */}
      <section style={{ ...S.section, textAlign: 'center' }}>
        <h2 style={S.h2}>Ready?</h2>
        <p style={{ ...S.sub, margin: '0 auto 1.5rem' }}>
          One payment of {PRODUCT.PRICE_DISPLAY}. No subscription.
        </p>
        {buyButton(true)}
        <div style={{ fontSize: '.78rem', color: 'var(--ink-muted)', marginTop: 14 }}>
          Please read the <a href="/refunds" style={S.link}>refund policy</a> before buying.
        </div>
      </section>

      {/* ── Already bought ───────────────────────────── */}
      <section style={S.section}>
        <div style={{ ...S.accessBox, animation: shaking ? 'shake .4s ease' : 'none' }}>
          <div style={S.accessTitle}>Already bought it?</div>
          <div style={S.accessSub}>
            Paste the link from your email. Opening it directly works too.
          </div>

          {claimError && !error && (
            <div role="alert" style={S.alert}>{claimError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); if (error) setError(''); }}
              placeholder="https://…/?k=…"
              autoComplete="off"
              spellCheck={false}
              disabled={busy}
              style={{ ...S.input, borderColor: error ? 'var(--danger)' : 'var(--border-strong)' }}
              aria-label="Access link"
              aria-invalid={!!error}
            />
            {error && <div role="alert" style={S.errorText}>{error}</div>}
            <button type="submit" disabled={busy} style={S.unlockBtn}>
              {busy ? 'Checking…' : 'Open my worksheet →'}
            </button>
          </form>

          <div style={S.helpText}>
            Lost your link or stuck?{' '}
            <a href={`mailto:${BUSINESS.EMAIL}`} style={S.link}>{BUSINESS.EMAIL}</a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer style={S.footer}>
        <nav style={S.footerNav}>
          <a href="/pricing" style={S.footerLink}>Pricing</a>
          <a href="/terms" style={S.footerLink}>Terms &amp; Conditions</a>
          <a href="/privacy" style={S.footerLink}>Privacy Policy</a>
          <a href="/refunds" style={S.footerLink}>Cancellation &amp; Refunds</a>
          <a href="/shipping" style={S.footerLink}>Delivery</a>
          <a href="/contact" style={S.footerLink}>Contact Us</a>
        </nav>
        <div style={S.footerMeta}>
          {BUSINESS.NAME} · {BUSINESS.LOCATION} · India<br />
          <a href={`mailto:${BUSINESS.EMAIL}`} style={S.footerLink}>{BUSINESS.EMAIL}</a> · {BUSINESS.PHONE}
        </div>
        <div style={{ ...S.footerMeta, marginTop: 14, opacity: .8 }}>
          Payments processed securely by Razorpay. Prices in INR, inclusive of all taxes.
        </div>
      </footer>

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        20% { transform: translateX(-8px); } 40% { transform: translateX(8px); }
        60% { transform: translateX(-5px); } 80% { transform: translateX(5px); }
      }
      @keyframes ncf-spin { to { transform: rotate(360deg); } }
      .ncf-spinner {
        width: 30px; height: 30px; border: 2.5px solid var(--border);
        border-top-color: var(--accent); border-radius: 50%;
        animation: ncf-spin .7s linear infinite;
      }
    `}</style>
  );
}

const S = {
  page: { maxWidth: 680, margin: '0 auto', padding: '0 20px 48px' },
  loaderPage: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '1rem',
  },
  hero: { padding: '56px 0 40px', textAlign: 'center' },
  badge: {
    display: 'inline-block', fontSize: '.68rem', letterSpacing: '.11em',
    fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-light)',
    padding: '5px 14px', borderRadius: 20, marginBottom: 22,
  },
  h1: {
    fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem,5.5vw,2.7rem)',
    lineHeight: 1.18, color: 'var(--ink)', margin: '0 0 1rem',
  },
  sub: {
    fontSize: '1.02rem', lineHeight: 1.65, color: 'var(--ink-light)',
    maxWidth: 460, margin: '0 auto 2rem',
  },
  heroCta: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  heroMeta: { fontSize: '.8rem', color: 'var(--ink-muted)' },
  ctaBig: {
    display: 'inline-block', padding: '15px 36px', background: 'var(--accent)',
    color: '#fff', borderRadius: 50, fontWeight: 600, fontSize: '1rem',
    textDecoration: 'none', boxShadow: '0 4px 18px rgba(46,92,78,.24)',
  },
  ctaSmall: {
    display: 'inline-block', padding: '11px 26px', background: 'var(--accent)',
    color: '#fff', borderRadius: 50, fontWeight: 600, fontSize: '.92rem',
    textDecoration: 'none',
  },
  ctaDisabled: {
    display: 'inline-block', padding: '15px 36px', background: 'var(--border)',
    color: 'var(--ink-muted)', borderRadius: 50, fontWeight: 600, fontSize: '.92rem',
  },
  section: { padding: '32px 0', borderTop: '1px solid var(--border)' },
  h2: {
    fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem,3.4vw,1.5rem)',
    color: 'var(--ink)', margin: '0 0 1.25rem',
  },
  cards: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: {
    background: '#fff', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '15px 18px',
  },
  cardTitle: { fontWeight: 600, fontSize: '.93rem', color: 'var(--ink)', marginBottom: 4 },
  cardBody: { fontSize: '.86rem', lineHeight: 1.6, color: 'var(--ink-light)' },
  steps: { margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 12 },
  step: { fontSize: '.92rem', lineHeight: 1.65, color: 'var(--ink-light)' },
  honest: {
    background: 'var(--cream-dark, #F1ECE4)', borderRadius: 'var(--radius)',
    padding: '20px 22px',
  },
  honestTitle: { fontWeight: 700, fontSize: '.8rem', letterSpacing: '.08em', color: 'var(--ink)', marginBottom: 8, textTransform: 'uppercase' },
  honestBody: { fontSize: '.9rem', lineHeight: 1.7, color: 'var(--ink-light)', margin: 0 },
  faqItem: { borderBottom: '1px solid var(--border)' },
  faqQ: {
    width: '100%', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer',
    padding: '15px 0', fontFamily: 'var(--font-body)', fontSize: '.92rem',
    fontWeight: 600, color: 'var(--ink)', textAlign: 'left',
  },
  faqA: { fontSize: '.88rem', lineHeight: 1.7, color: 'var(--ink-light)', padding: '0 0 16px' },
  accessBox: {
    background: '#fff', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '24px', boxShadow: 'var(--shadow)',
  },
  accessTitle: { fontWeight: 600, fontSize: '1rem', color: 'var(--ink)', marginBottom: 4 },
  accessSub: { fontSize: '.84rem', color: 'var(--ink-muted)', marginBottom: 16, lineHeight: 1.55 },
  alert: {
    background: '#FBE9E7', border: '1px solid #F3C9C3', borderRadius: 'var(--radius-sm)',
    padding: '12px 14px', fontSize: '.82rem', color: 'var(--danger)',
    lineHeight: 1.55, marginBottom: 16,
  },
  input: {
    width: '100%', padding: '12px 15px', fontSize: '.92rem',
    fontFamily: 'var(--font-body)', border: '1.5px solid var(--border-strong)',
    borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--ink)',
    outline: 'none', marginBottom: 12,
  },
  errorText: { fontSize: '.8rem', color: 'var(--danger)', marginBottom: 12, lineHeight: 1.5 },
  unlockBtn: {
    width: '100%', padding: '13px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 50, fontFamily: 'var(--font-body)',
    fontWeight: 600, fontSize: '.93rem', cursor: 'pointer',
  },
  helpText: { fontSize: '.78rem', color: 'var(--ink-muted)', marginTop: 14, textAlign: 'center' },
  link: { color: 'var(--accent)' },
  footer: { borderTop: '1px solid var(--border)', paddingTop: 28, marginTop: 16, textAlign: 'center' },
  footerNav: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 18px', marginBottom: 18 },
  footerLink: { fontSize: '.8rem', color: 'var(--ink-muted)', textDecoration: 'none' },
  footerMeta: { fontSize: '.78rem', color: 'var(--ink-muted)', lineHeight: 1.7 },
};

/** Restores an existing session on page load, if one is still stored. */
export function useGate() {
  const [session, setSession] = useState(() => getSession());
  return {
    unlocked: !!session,
    session,
    unlock: setSession,
    lock: () => setSession(null),
  };
}
