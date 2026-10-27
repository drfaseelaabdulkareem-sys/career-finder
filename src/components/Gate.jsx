import { useState } from 'react';
import { PRODUCT, BUSINESS, LINKS } from '../config.js';
import VortexArt from './VortexArt.jsx';
import { getSession, login } from '../lib/api.js';

const DEVICE_WORD = PRODUCT.MAX_DEVICES === 1 ? 'one device' : `${PRODUCT.MAX_DEVICES} devices`;

const MESSAGES = {
  bad_credentials: "That login or password isn't right. Check for typos — the password is all lowercase, with hyphens.",
  expired:         'This login has expired. Send us a message on Instagram and we can extend it.',
  revoked:         "This login has been switched off. Get in touch if you think that's a mistake.",
  device_limit:    PRODUCT.MAX_DEVICES === 1
    ? "This login has already been used on another device. Each login works on one device only. If that device was yours — a phone you no longer use, say — message us on Instagram and we'll reset it for you."
    : `This login has already been used on ${PRODUCT.MAX_DEVICES} devices. If that was you — a new phone, say — message us on Instagram and we'll reset it.`,
  server_misconfigured:
    "Your login is correct, but the site isn't finished being set up. Message us on Instagram and we'll fix it straight away — you will not need to pay again.",
  login_failed:    'Something went wrong on our side. Try again in a moment.',
};

const INCLUDES = [
  ['Three careers that fit you', 'Chosen from twelve, based on how you answer. No ranking, no score out of a hundred — three real options.'],
  ['What each one pays in India', 'Actual reported salary ranges for your experience level, and what the next five years look like.'],
  ['Whether your degree opens that door', 'Some roles are wide open to a BAMS graduate. Some are quietly closed. We say which.'],
  ['Where each one would frustrate you', "The parts of the job you'd resent. Said plainly, before you commit."],
  ['A 90-day plan you can start on Monday', 'Specific things to do and make. No courses to buy.'],
  ['The job titles that actually exist', 'What to type into a job site, including the titles nobody tells you about.'],
  ['One experiment to try first', 'A small task that tells you whether you would enjoy the work, before you spend a year on it.'],
];

const FAQS = [
  ['Who is this for?',
   'MBBS, BDS, BAMS, BHMS, pharmacy, nursing, physiotherapy and life science graduates in India who are weighing up work outside direct patient care — whether you just graduated or have been practising for years.'],
  ['How do I get in?',
   `Pay ${PRODUCT.PRICE_DISPLAY} on the payment link on this page, then send us the payment screenshot on Instagram. We reply with a login and password, which you type into the box on this page. Nothing to download.`],
  ['How long does it take to get my login?',
   'Usually a few minutes, and always within 24 hours. If you pay late at night it may reach you the next morning — one person runs this, not a call centre.'],
  ['Why no score out of 100?',
   'Because a score reads like a mark, and a career is not an exam. You get three careers that fit, described honestly, and you decide. Nothing is ranked above anything else.'],
  ['Where do the salary figures come from?',
   'Indian reported-salary data, checked across several sources, plus real job advertisements. Where the data is thin we say so on the page rather than quoting a confident number we cannot stand behind. These are ranges, not promises.'],
  ['Will this get me a job?',
   'No tool can promise that. What it gives you is a shortlist worth taking seriously, honest pay expectations, and a concrete plan for the first ninety days — instead of months of scrolling job sites wondering what you are even eligible for.'],
  ['Is this a psychometric test?',
   'No, and we would not claim otherwise. It weighs what you like doing against what twelve real jobs involve day to day.'],
  ['How long do I get access, and on how many devices?',
   `${PRODUCT.ACCESS_DAYS} days, counted from the first time you sign in rather than from the day you pay — so you lose nothing by starting later. It works on ${DEVICE_WORD}, so sign in on the one you will actually use. Within those ${PRODUCT.ACCESS_DAYS} days you can retake it as often as you like.`],
  ['Can I share it with a friend?',
   `No. Your login works on ${DEVICE_WORD} and stops working on any other. If a friend wants it, they will need their own.`],
  ['Can I get a refund?',
   'Because the whole thing is revealed the moment you sign in, we do not refund after your login has been used. If you change your mind before we send your login, or we fail to get you a working one, you get your money back in full.'],
];

export default function Gate({ onUnlock }) {
  const [id, setId]           = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');
  const [busy, setBusy]       = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!id.trim() || !password.trim()) {
      setError('Enter both the login and the password we sent you.');
      return;
    }
    setBusy(true); setError('');
    try {
      onUnlock(await login(id.trim(), password.trim()));
    } catch (err) {
      setBusy(false);
      setError(MESSAGES[err.code] || MESSAGES.login_failed);
    }
  }

  // START does not leave the site. It takes them down to the one place
  // where both halves of the sale live: the payment link and the login box.
  const Start = ({ className = 'btn btn-light', label = 'START' }) => (
    <a className={className} href="#access">{label}</a>
  );

  const Pay = ({ className = 'btn btn-primary btn-block' }) => (
    <a className={className} href={LINKS.pay} target="_blank" rel="noopener noreferrer">
      Pay {PRODUCT.PRICE_DISPLAY} on Razorpay →
    </a>
  );

  return (
    <div className="shell">
      <section className="opener">
        <VortexArt />
        {/* Drop a licensed portrait in here when you have one:
            <div className="portrait"><img src="/portrait.jpg" alt="" /></div> */}
        <div className="opener-inner">
          <div className="opener-eyebrow">For Indian healthcare graduates</div>
          <h1>
            Clinics aren&rsquo;t
            <span className="lime">the only answer.</span>
          </h1>

          <div className="opener-get">
            <div className="opener-get-h">Buy the worksheet to get access to:</div>
            <ol className="opener-get-list">
              <li>The 3 careers that fit you best</li>
              <li>The salary range for each</li>
              <li>Your 90-day roadmap</li>
            </ol>
          </div>

          <Start className="btn-start" label="START" />
        </div>
      </section>

      <div className="narrow">
        {/* ── The whole sale, in one panel ───────────────────────── */}
        <section className="section" id="access">
          <h2>Get access</h2>

          <div className="buybox">
            <div className="buystep">
              <div className="buystep-n">1</div>
              <div className="buystep-b">
                <strong>Pay {PRODUCT.PRICE_DISPLAY}</strong>
                <p>
                  This is the only way in. There is no free version and no
                  password to guess &mdash; you pay here, and we send you a login.
                </p>
                <Pay />
              </div>
            </div>

            <div className="buystep">
              <div className="buystep-n">2</div>
              <div className="buystep-b">
                <strong>Send us the payment screenshot on Instagram</strong>
                <p>
                  Message{' '}
                  <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">
                    @{PRODUCT.INSTAGRAM_HANDLE}
                  </a>{' '}
                  with the screenshot from Razorpay or your UPI app. That is how we
                  know the payment is yours.
                </p>
              </div>
            </div>

            <div className="buystep">
              <div className="buystep-n">3</div>
              <div className="buystep-b">
                <strong>We reply with your login and password</strong>
                <p>
                  Usually within a few minutes, always within 24 hours. Keep that
                  message &mdash; it is how you come back later.
                </p>
              </div>
            </div>

            <div className="buystep">
              <div className="buystep-n">4</div>
              <div className="buystep-b">
                <strong>Type them in below and start</strong>
                <p>
                  {PRODUCT.QUESTION_COUNT} questions, about {PRODUCT.DURATION.replace('~', '')}.
                  Your access lasts {PRODUCT.ACCESS_DAYS} days from that first sign-in,
                  on {DEVICE_WORD}.
                </p>
              </div>
            </div>
          </div>

          {/* ── Login ───────────────────────────────────────────── */}
          <div className="accessbox" id="login">
            <div style={{ fontWeight:600, fontSize:'1rem', marginBottom:4 }}>Already paid?</div>
            <div style={{ fontSize:'.84rem', color:'var(--ink-muted)', marginBottom:16 }}>
              Sign in with the login and password we sent you.
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <label className="flabel" htmlFor="login-id">Login</label>
              <input
                id="login-id" className={`field${error ? ' err' : ''}`} type="text"
                value={id} disabled={busy} placeholder="CF-XXXX"
                onChange={e => { setId(e.target.value.toUpperCase()); if (error) setError(''); }}
                autoComplete="username" autoCapitalize="characters" spellCheck={false}
                aria-invalid={!!error}
              />

              <label className="flabel" htmlFor="login-pw">Password</label>
              <input
                id="login-pw" className={`field${error ? ' err' : ''}`} type="text"
                value={password} disabled={busy} placeholder="word-word-00"
                onChange={e => { setPass(e.target.value.toLowerCase()); if (error) setError(''); }}
                autoComplete="current-password" autoCapitalize="none" spellCheck={false}
                aria-invalid={!!error}
              />

              {error && <div className="errtext" role="alert">{error}</div>}

              <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
                {busy ? 'Checking…' : 'Open my worksheet →'}
              </button>
            </form>

            <div style={{ fontSize:'.78rem', color:'var(--ink-muted)', marginTop:14, textAlign:'center' }}>
              Lost your login?{' '}
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer"
                 style={{ color:'var(--accent)' }}>Message us on Instagram</a>
            </div>
          </div>

          <div style={{ fontSize:'.78rem', color:'var(--ink-muted)', marginTop:14, textAlign:'center' }}>
            Please read the <a href="/refunds" style={{ color:'var(--accent)' }}>refund policy</a> before you pay.
          </div>
        </section>

        <section className="section" id="what">
          <h2>What you get</h2>
          <div className="grid">
            {INCLUDES.map(([t, b]) => (
              <div className="card" key={t}><h3>{t}</h3><p>{b}</p></div>
            ))}
          </div>
        </section>

        <section className="section" id="how">
          <h2>How it works</h2>
          <ol className="steps">
            <li><strong>Pay {PRODUCT.PRICE_DISPLAY} on the Razorpay link above.</strong></li>
            <li><strong>Send us the screenshot on Instagram.</strong></li>
            <li><strong>We send your login and password.</strong></li>
            <li><strong>Answer {PRODUCT.QUESTION_COUNT} questions and get your three careers.</strong></li>
          </ol>
        </section>

        <section className="section">
          <div className="panel">
            <div className="panel-title">What this is not</div>
            <p>
              It is not a psychometric test, and it will not get you a job on its own. It
              narrows twelve possible directions to the three worth your attention, tells
              you honestly what they pay and whether your degree opens them, and gives you
              something concrete to do for ninety days. The decision stays yours.
            </p>
          </div>
        </section>

        <section className="section" id="faq">
          <h2>Questions</h2>
          {FAQS.map(([q, a], i) => (
            <div className="faq" key={q}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                {q}<span>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <div className="faq-a">{a}</div>}
            </div>
          ))}
        </section>

        <section className="section center">
          <h2>Ready?</h2>
          <Start className="btn btn-primary" label={`Pay ${PRODUCT.PRICE_DISPLAY} and get started`} />
        </section>

        <footer className="foot">
          <div className="foot-meta">
            <a href={`mailto:${BUSINESS.EMAIL}`}>{BUSINESS.EMAIL}</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export function useGate() {
  const [session, setSession] = useState(() => getSession());
  return { unlocked: !!session, session, unlock: setSession, lock: () => setSession(null) };
}
