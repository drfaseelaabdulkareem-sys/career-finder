// ============================================================
// Everything testable without a deployment.
//   node scripts/test-all.mjs
// ============================================================
process.env.SESSION_SECRET = 'x'.repeat(64); // test-only secret

import crypto from 'node:crypto';
import { QUESTIONS, publicQuestions, rehydrateAnswers, QUESTION_COUNT } from '../netlify/lib/questions.mjs';
import { score } from '../netlify/lib/scoring.mjs';
import { createSession, readSession } from '../netlify/lib/jwt.mjs';
import { verifyPaymentLinkSignature, verifyWebhookSignature, paymentLinkPayload } from '../netlify/lib/razorpay.mjs';

let failures = 0;
const check = (label, cond) => {
  console.log(`${cond ? '  ok  ' : ' FAIL '} ${label}`);
  if (!cond) failures++;
};
const section = t => console.log(`\n${t}`);

// ── 1. Nothing sensitive in the public question payload ──────
section('1. Public question payload is stripped of scoring data');
const pub = publicQuestions();
const flat = JSON.stringify(pub);
check(`${pub.length} questions returned`, pub.length === QUESTION_COUNT);
check('no dimensionScores', !flat.includes('"dimensionScores"'));
check('no evidence blocks', !flat.includes('"evidence"'));
check('no dealBreaker mapping', !flat.includes('"dealBreaker"'));
check('no role weights', !flat.includes('"weights"'));
check('answer labels still present', pub[0].options[0].label.length > 0);
const dbLeak = pub.filter(q => q.id !== 'Q14').some(q => q.options.some(o => /^db_/.test(o.id)));
check('deal-breaker ids confined to Q14', !dbLeak);

// ── 2. Rehydration ──────────────────────────────────────────
section('2. Rehydration rebuilds full options from ids alone');
const answers = {};
for (const q of QUESTIONS) {
  const take = q.type === 'multi-select' ? Math.min(3, q.options.length) : 1;
  answers[q.id] = q.options.slice(0, take).map(o => o.id);
}
const hydrated = rehydrateAnswers(answers);
check('every question rehydrated', Object.keys(hydrated).length === QUESTION_COUNT);
check('options carry dimensionScores again', !!hydrated.Q01[0].dimensionScores);

// ── 3. Tampering ────────────────────────────────────────────
section('3. A tampered payload cannot inject its own scores');
const evil = rehydrateAnswers({
  Q01: ['nope', { label: 'hacked', dimensionScores: { data: 9999 } }],
  FAKE: ['whatever'],
  Q02: 'not-an-array',
});
check('unknown option ids dropped', !evil.Q01);
check('unknown question ids dropped', !evil.FAKE);
check('non-array answers dropped', !evil.Q02);

// ── 4. Scoring output shape ─────────────────────────────────
section('4. Scoring returns what the Results screen reads');
const result = score(hydrated);
check('three roles returned', result.top3?.length === 3);
check('rank 1 is rank 1', result.top3[0].rank === 1);
for (const k of ['roleId','roleName','cluster','score','confidence','whyItFits',
                 'roadmap','experiment','jobTitles','biggestSkillGaps',
                 'transferableAdvantages','watchOuts']) {
  check(`top3[0].${k} present`, result.top3[0][k] !== undefined);
}
const rm = result.top3[0].roadmap;
check('roadmap has all three phases', !!rm.days0to30 && !!rm.days31to60 && !!rm.days61to90);
check('archetype present', !!result.archetype?.primary?.name);
check('scores within 0-100', result.top3.every(r => r.score >= 0 && r.score <= 100));

section('5. Deal-breakers still bite');
const blocked = score(rehydrateAnswers({ ...answers, Q14: ['db_sales'] }))
  .ranked.find(r => r.id === 'R08');
check('sales role hard-blocked by db_sales', blocked?.hardBlock === true && blocked.score === 0);
check('partial answers do not crash', score(rehydrateAnswers({ Q01: answers.Q01 })).top3.length === 3);

// ── 6. Session tokens ───────────────────────────────────────
section('6. Session tokens');
const future = new Date(Date.now() + 30 * 86400_000).toISOString();
const jwt = createSession({ token: 'a'.repeat(48), deviceId: 'device-abc-123456', tokenExpiresAt: future });
const claims = readSession(jwt);
check('round-trips', claims?.t === 'a'.repeat(48) && claims?.d === 'device-abc-123456');
check('has three parts', jwt.split('.').length === 3);

const [h, p, s] = jwt.split('.');
check('rejects an altered payload', readSession(`${h}.${Buffer.from('{"t":"evil","d":"x","exp":9999999999}').toString('base64url')}.${s}`) === null);
check('rejects a wrong signature', readSession(`${h}.${p}.AAAA${s.slice(4)}`) === null);
check('rejects the alg-none trick', readSession(`${Buffer.from('{"alg":"none"}').toString('base64url')}.${p}.`) === null);
check('rejects gibberish', readSession('not-a-token') === null);

// Expiry is clamped to the access token's own expiry.
const soon = new Date(Date.now() + 2 * 86400_000).toISOString();
const shortJwt = readSession(createSession({ token: 'b'.repeat(48), deviceId: 'device-xyz-999999', tokenExpiresAt: soon }));
check('session cannot outlive the access token', shortJwt.exp * 1000 <= new Date(soon).getTime() + 1000);
check('already-expired access yields no session',
  readSession(createSession({ token: 'c'.repeat(48), deviceId: 'device-old-111111', tokenExpiresAt: new Date(Date.now() - 86400_000).toISOString() })) === null);

// ── 7. Razorpay signatures ──────────────────────────────────
section('7. Razorpay signature verification');
const KEY_SECRET = 'test_key_secret_abc';
const params = {
  linkId: 'plink_00000000000001',
  referenceId: 'ref_001',
  status: 'paid',
  paymentId: 'pay_00000000000001',
};
check('payload order matches Razorpay SDK (id|ref|status|payment)',
  paymentLinkPayload(params) === 'plink_00000000000001|ref_001|paid|pay_00000000000001');

const goodSig = crypto.createHmac('sha256', KEY_SECRET)
  .update(paymentLinkPayload(params)).digest('hex');
check('accepts a correct signature',
  verifyPaymentLinkSignature({ ...params, signature: goodSig }, KEY_SECRET) === true);
check('rejects a forged signature',
  verifyPaymentLinkSignature({ ...params, signature: 'deadbeef'.repeat(8) }, KEY_SECRET) === false);
check('rejects a tampered payment id',
  verifyPaymentLinkSignature({ ...params, paymentId: 'pay_99999999999999', signature: goodSig }, KEY_SECRET) === false);
check('rejects a tampered status',
  verifyPaymentLinkSignature({ ...params, status: 'paid ', signature: goodSig }, KEY_SECRET) === false);
check('rejects the wrong secret',
  verifyPaymentLinkSignature({ ...params, signature: goodSig }, 'wrong_secret') === false);
check('rejects a missing signature',
  verifyPaymentLinkSignature(params, KEY_SECRET) === false);

const WEBHOOK_SECRET = 'test_webhook_secret';
const rawBody = '{"event":"payment_link.paid","payload":{}}';
const webhookSig = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
check('accepts a correct webhook signature',
  verifyWebhookSignature(rawBody, webhookSig, WEBHOOK_SECRET) === true);
check('rejects a modified body',
  verifyWebhookSignature(rawBody + ' ', webhookSig, WEBHOOK_SECRET) === false);
check('rejects the redirect secret on a webhook',
  verifyWebhookSignature(rawBody, webhookSig, KEY_SECRET) === false);

console.log(`\n${failures === 0 ? '✓ all checks passed' : `✗ ${failures} check(s) failed`}\n`);
process.exit(failures === 0 ? 0 : 1);
