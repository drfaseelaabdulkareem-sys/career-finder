// ============================================================
// Everything testable without a deployment.
//   node scripts/test-all.mjs
// ============================================================
process.env.SESSION_SECRET = 'x'.repeat(64); // test-only secret

import { QUESTIONS, publicQuestions, rehydrateAnswers, QUESTION_COUNT } from '../netlify/lib/questions.mjs';
import { score } from '../netlify/lib/scoring.mjs';
import { ROLES } from '../netlify/lib/roles.mjs';
import { MARKET, bandFor, formatRange, BAND_LABEL } from '../netlify/lib/market.mjs';
import { newId, newPassword, isValidId, checkAccess } from '../netlify/lib/access.mjs';
import { createSession, readSession } from '../netlify/lib/jwt.mjs';

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

// ── 4. Result shape ─────────────────────────────────────────
section('4. Results carry no score and no ranking');
const result = score(hydrated);
check('three matches returned', result.matches?.length === 3);
check('no score on any match', result.matches.every(m => m.score === undefined));
check('no rank on any match', result.matches.every(m => m.rank === undefined));
check('no confidence label', result.matches.every(m => m.confidence === undefined));
check('no top3 field left over', result.top3 === undefined);
for (const k of ['roleId','roleName','cluster','shortDesc','whyItFits','roadmap',
                 'experiment','jobTitles','biggestSkillGaps','transferableAdvantages','watchOuts']) {
  check(`matches[0].${k} present`, result.matches[0][k] !== undefined);
}
const rm = result.matches[0].roadmap;
check('roadmap has all three phases', !!rm.days0to30 && !!rm.days31to60 && !!rm.days61to90);
check('archetype present', !!result.archetype?.primary?.name);

section('5. Deal-breakers remove the role entirely');
const blocked = score(rehydrateAnswers({ ...answers, Q14: ['db_sales'] }));
check('sales excluded from matches', !blocked.matches.some(m => m.roleId === 'R08'));
check('exclusion is reported to the buyer', blocked.excluded.includes('Sales / Business Development'));
check('still returns three matches', blocked.matches.length === 3);
check('partial answers do not crash', score(rehydrateAnswers({ Q01: answers.Q01 })).matches.length === 3);

section('5b. Market data covers every role');
const DEGREES = ['MBBS','BDS','BHMS_BAMS','Pharmacy','Nursing','Biotech'];
const BANDS = ['entry','early','mid','senior'];
let marketOk = true;
for (const id of Object.keys(ROLES)) {
  const m = MARKET[id];
  if (!m) { marketOk = false; continue; }
  for (const b of BANDS) if (!Array.isArray(m.salary[b]) || m.salary[b].length !== 2) marketOk = false;
  for (const d of DEGREES) if (!m.degreeAccess[d]) marketOk = false;
}
check('all 12 roles have salary and degree data', marketOk);
check('salary ranges are low-to-high', Object.values(MARKET).every(m =>
  BANDS.every(b => m.salary[b][0] <= m.salary[b][1])));
check('pay rises across the bands', Object.values(MARKET).every(m =>
  m.salary.entry[1] <= m.salary.early[1] &&
  m.salary.early[1] <= m.salary.mid[1] &&
  m.salary.mid[1] <= m.salary.senior[1]));
check('every band has a confidence rating', Object.values(MARKET).every(m =>
  ['good','moderate','thin'].includes(m.salary.confidence)));
check('experience maps to a band', bandFor('1to3') === 'early' && bandFor('3plus') === 'mid' && bandFor('none') === 'entry');
check('ranges format readably', formatRange([2.5, 4.5]) === '₹2.5–4.5 lakh a year');
check('the BAMS warning on medical affairs survives',
  MARKET.R06.degreeAccess.BHMS_BAMS[0] === 'limited');

section('5c. Every role can still reach a buyer');
const seen = {};
Object.keys(ROLES).forEach(id => { seen[id] = 0; });
for (let i = 0; i < 3000; i++) {
  const a = {};
  for (const q of QUESTIONS) {
    if (q.type === 'multi-select') {
      const n = 1 + Math.floor(Math.random() * Math.min(q.maxSelections || 10, q.options.length));
      a[q.id] = [...q.options].sort(() => Math.random() - 0.5).slice(0, n);
    } else a[q.id] = [q.options[Math.floor(Math.random() * q.options.length)]];
  }
  score(a).matches.forEach(m => seen[m.roleId]++);
}
const rates = Object.entries(seen).map(([id, c]) => [id, c / 3000 * 100]);
const buried = rates.filter(([, p]) => p < 8);
check('no role is buried below 8% visibility',
  buried.length === 0 || (console.log('       buried:', buried.map(([id, p]) => ROLES[id].name + ' ' + p.toFixed(1) + '%').join(', ')), false));

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

// ── 7. Access rules ─────────────────────────────────────────
section('7. Login format');
check('ids look like CF-XXXX', /^CF-[A-Z0-9]{4}$/.test(newId()));
check('ids avoid easily-misread characters', (() => {
  for (let i = 0; i < 400; i++) if (/[OIL01]/.test(newId().slice(3))) return false;
  return true;
})());
check('passwords are word-word-number', /^[a-z]+-[a-z]+-\d{2}$/.test(newPassword()));
check('ids are not predictable', new Set(Array.from({length: 300}, newId)).size > 290);
check('isValidId accepts a real one', isValidId('CF-7K2M'));
check('isValidId rejects rubbish', !isValidId('hello') && !isValidId('CF-12') && !isValidId(''));

section('8. Who gets in, and who does not');
const DAY = 86400000;

// The policy the product actually ships with: 30 days, one device.
// These two numbers come from the ACCESS_DAYS and MAX_DEVICES
// environment variables and are stamped onto each login when it is
// generated, so changing them later never shortens access for a
// buyer who already has a login.
const POLICY = { accessDays: 30, maxDevices: 1 };

const base = (over = {}) => ({
  id: 'CF-TEST', password: 'tide-amber-49', createdAt: new Date().toISOString(),
  firstUsedAt: null, expiresAt: null, ...POLICY,
  devices: [], revoked: false, blockedAttempts: 0, ...over,
});
const T0 = new Date('2026-01-01T10:00:00Z');

check('correct password gets in', checkAccess(base(), 'tide-amber-49', 'dev-one', T0).ok);
check('wrong password is refused', checkAccess(base(), 'wrong-pass-11', 'dev-one', T0).reason === 'bad_credentials');
check('empty password is refused', checkAccess(base(), '', 'dev-one', T0).reason === 'bad_credentials');
check('unknown login is refused', checkAccess(null, 'tide-amber-49', 'dev-one', T0).reason === 'bad_credentials');
check('a near-miss password is refused', checkAccess(base(), 'tide-amber-4', 'dev-one', T0).reason === 'bad_credentials');
check('revoked login is refused', checkAccess(base({ revoked: true }), 'tide-amber-49', 'dev-one', T0).reason === 'revoked');

section('9. The 30-day clock starts on first sign-in');
const first = checkAccess(base(), 'tide-amber-49', 'dev-one', T0);
check('first sign-in sets the start date', first.record.firstUsedAt === T0.toISOString());
check('expiry is 30 days later',
  Math.round((new Date(first.record.expiresAt) - T0) / DAY) === 30);

const lateFirstUse = checkAccess(base({ createdAt: new Date('2025-01-01').toISOString() }),
  'tide-amber-49', 'dev-one', T0);
check('a login generated long ago still gets a full 30 days',
  Math.round((new Date(lateFirstUse.record.expiresAt) - T0) / DAY) === 30);

const used = base({ firstUsedAt: T0.toISOString(),
  expiresAt: new Date(T0.getTime() + 30 * DAY).toISOString(),
  devices: [{ id: 'dev-one' }] });
check('still works on day 29',
  checkAccess(used, 'tide-amber-49', 'dev-one', new Date(T0.getTime() + 29 * DAY)).ok);
check('expired on day 31',
  checkAccess(used, 'tide-amber-49', 'dev-one', new Date(T0.getTime() + 31 * DAY)).reason === 'expired');
check('a login never signed in has no expiry yet', base().expiresAt === null);

section('10. One login, one device');
let rec = base();
rec = checkAccess(rec, 'tide-amber-49', 'phone', T0).record;
check('the first device is registered', rec.devices.length === 1);
check('that device keeps working', checkAccess(rec, 'tide-amber-49', 'phone', T0).ok);

const second = checkAccess(rec, 'tide-amber-49', 'friends-phone', T0);
check('a second device is refused', second.reason === 'device_limit');
check('the second device is not added', second.record.devices.length === 1);
check('the blocked attempt is counted', second.record.blockedAttempts === 1);
check('sharing is counted each time',
  checkAccess(second.record, 'tide-amber-49', 'another-phone', T0).record.blockedAttempts === 2);
check('the buyer is not locked out by someone else trying',
  checkAccess(second.record, 'tide-amber-49', 'phone', T0).ok);

const cleared = base({ firstUsedAt: T0.toISOString(),
  expiresAt: new Date(T0.getTime() + 30 * DAY).toISOString() });
check('resetting devices lets them in on a new phone',
  checkAccess(cleared, 'tide-amber-49', 'new-phone', T0).ok);
check('resetting devices does not reset the clock',
  checkAccess(cleared, 'tide-amber-49', 'new-phone', T0).record.expiresAt === cleared.expiresAt);

// Raising MAX_DEVICES has to actually raise the cap, because that is
// the one-line change if one-device support turns out to be a chore.
section('11. Raising the device cap');
let two = base({ maxDevices: 2 });
two = checkAccess(two, 'tide-amber-49', 'phone', T0).record;
two = checkAccess(two, 'tide-amber-49', 'laptop', T0).record;
check('two devices allowed when the cap is 2', two.devices.length === 2);
check('the third is still refused',
  checkAccess(two, 'tide-amber-49', 'tablet', T0).reason === 'device_limit');

console.log(`\n${failures === 0 ? '✓ all checks passed' : `✗ ${failures} check(s) failed`}\n`);
process.exit(failures === 0 ? 0 : 1);
