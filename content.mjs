// ============================================================
// GET /api/content
// The question bank with every scoring signal stripped out.
// Behind the paywall, so the questions aren't even readable
// without a paid link.
// ============================================================
import { requireSession } from '../lib/auth.mjs';
import { publicQuestions } from '../lib/questions.mjs';
import { json } from '../lib/http.mjs';

export const config = { path: '/api/content' };

export default async (request) => {
  const session = await requireSession(request);
  if (!session.ok) return json({ error: session.error }, session.status);

  return json({
    questions: publicQuestions(),
    watermark: session.record.email,
  });
};
