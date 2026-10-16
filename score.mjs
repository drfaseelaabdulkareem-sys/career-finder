// ============================================================
// POST /api/score
// The scoring engine runs here, never in the browser. The client
// sends option ids only; weights, roadmaps and result copy stay
// on the server.
// ============================================================
import { requireSession } from '../lib/auth.mjs';
import { rehydrateAnswers } from '../lib/questions.mjs';
import { score } from '../lib/scoring.mjs';
import { putToken } from '../lib/store.mjs';
import { json } from '../lib/http.mjs';

export const config = { path: '/api/score' };

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

  // Stamp the buyer's email in, so a circulated screenshot is traceable.
  result.watermark = {
    email: session.record.email,
    generatedAt: new Date().toISOString(),
  };

  if (!session.record.completedAt) {
    session.record.completedAt = new Date().toISOString();
    try {
      await putToken(session.token, session.record);
    } catch (err) {
      console.warn('[score] could not record completion:', err.message);
    }
  }

  return json(result);
};
