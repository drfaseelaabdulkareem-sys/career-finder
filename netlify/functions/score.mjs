// ============================================================
// POST /api/score
//
// Runs the engine server-side and attaches the market layer:
// salary for the buyer's own experience level, and an honest read
// on how open each role is to their specific degree.
// ============================================================
import { requireSession } from '../lib/auth.mjs';
import { rehydrateAnswers } from '../lib/questions.mjs';
import { score } from '../lib/scoring.mjs';
import { MARKET, BAND_LABEL, bandFor, formatRange } from '../lib/market.mjs';
import { putLogin } from '../lib/store.mjs';
import { json } from '../lib/http.mjs';

export const config = { path: '/api/score' };

const ACCESS_LABEL = {
  strong:  'Well suited to your degree',
  open:    'Open to your degree',
  limited: 'Harder with your degree',
};

/** Build the salary ladder, marking where this buyer stands today. */
function salaryLadder(salary, currentBand) {
  return ['entry', 'early', 'mid', 'senior'].map(band => ({
    band,
    label: BAND_LABEL[band],
    range: formatRange(salary[band]),
    isCurrent: band === currentBand,
  }));
}

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const session = await requireSession(request);
  if (!session.ok) return json({ error: session.error }, session.status);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const answers = rehydrateAnswers(body.answers);
  if (Object.keys(answers).length === 0) return json({ error: 'no_answers' }, 400);

  const result = score(answers);

  // The buyer's own degree and experience drive the market layer.
  const degreeId     = answers.Q08?.[0]?.id || null;
  const degreeLabel  = answers.Q08?.[0]?.label || null;
  const experienceId = answers.Q09?.[0]?.id || 'none';
  const band         = bandFor(experienceId);

  result.profile = {
    degree: degreeLabel,
    experienceLabel: answers.Q09?.[0]?.label || null,
    band,
    bandLabel: BAND_LABEL[band],
  };

  result.matches = result.matches.map(match => {
    const m = MARKET[match.roleId];
    if (!m) return match;

    const access = degreeId && m.degreeAccess[degreeId];

    return {
      ...match,
      market: {
        salaryNow: formatRange(m.salary[band]),
        salaryBandLabel: BAND_LABEL[band],
        ladder: salaryLadder(m.salary, band),
        salaryNote: m.salary.note,
        confidence: m.salary.confidence,
        cities: m.cities,
        entryDifficulty: m.entryDifficulty,
        hiringVolume: m.hiringVolume,
        realityCheck: m.realityCheck,
        degreeFit: access ? {
          level: access[0],
          label: ACCESS_LABEL[access[0]],
          note: access[1],
        } : null,
      },
    };
  });

  // Order by how hard each is to get into, easiest first. This is
  // deliberately NOT a ranking of which suits the buyer best — all
  // three are matches. The order just puts the most reachable first.
  const DIFFICULTY_ORDER = [
    'easiest of the health-tech roles', 'easy', 'moderate',
    'moderate but very crowded', 'hard', 'hard, and requires relocating', 'very hard',
  ];
  result.matches.sort((a, b) =>
    DIFFICULTY_ORDER.indexOf(a.market?.entryDifficulty ?? 'moderate') -
    DIFFICULTY_ORDER.indexOf(b.market?.entryDifficulty ?? 'moderate')
  );

  if (!session.record.completedAt) {
    session.record.completedAt = new Date().toISOString();
    try {
      await putLogin(session.token, session.record);
    } catch (err) {
      console.warn('[score] could not record completion:', err.message);
    }
  }

  return json(result);
};
