// ============================================================
// SCORING ENGINE
//
// Produces three career matches. It does NOT produce a score the
// buyer ever sees — the old /100 number read as a grade and made a
// good match look like a failure. Ranking is internal only.
//
// The key fix over the first version: each dimension is normalised
// against the maximum it can actually reach given the questions,
// rather than against a fixed number. Previously five dimensions
// could never exceed 35%, which permanently buried every role that
// depended on them.
// ============================================================

import { ROLES } from './roles.mjs';
import { QUESTIONS } from './questions.mjs';
import { CALIBRATION } from './calibration.mjs';

const DIMENSION_KEYS = [
  'writing','research','technology','people','data','creativity',
  'problemSolving','organisation','science','commercial','communication',
  'detail','ambiguity','independence','healthcare','impact','stability',
  'pace','experience',
];

/**
 * The most any dimension can score, given the question bank.
 * Computed once at load, so adding or editing a question
 * automatically rebalances the scale instead of silently skewing it.
 */
const ACHIEVABLE_MAX = (() => {
  const max = Object.fromEntries(DIMENSION_KEYS.map(k => [k, 0]));

  for (const q of QUESTIONS) {
    const picks = q.type === 'multi-select' ? (q.maxSelections || 10) : 1;
    for (const dim of DIMENSION_KEYS) {
      const values = q.options
        .map(o => (o.dimensionScores && o.dimensionScores[dim]) || 0)
        .sort((a, b) => b - a);
      max[dim] += values.slice(0, picks).reduce((a, b) => a + b, 0);
    }
  }

  // Never divide by zero for a dimension no question touches.
  for (const dim of DIMENSION_KEYS) if (max[dim] === 0) max[dim] = 1;
  return max;
})();

export function flattenAnswers(answersMap) {
  return Object.entries(answersMap).flatMap(([qid, opts]) =>
    opts.map(opt => ({ questionId: qid, ...opt }))
  );
}

/** Sum dimension scores and normalise each against its own ceiling. */
export function calculateDimensions(flatAnswers) {
  const raw = Object.fromEntries(DIMENSION_KEYS.map(k => [k, 0]));

  flatAnswers.forEach(a => {
    if (!a.dimensionScores) return;
    Object.entries(a.dimensionScores).forEach(([k, v]) => {
      if (raw[k] !== undefined) raw[k] += v;
    });
  });

  const normalised = {};
  DIMENSION_KEYS.forEach(k => {
    normalised[k] = Math.min(100, Math.max(0,
      Math.round((raw[k] / ACHIEVABLE_MAX[k]) * 100)
    ));
  });
  return normalised;
}

export function extractDealBreakers(flatAnswers) {
  return flatAnswers.filter(a => a.dealBreaker).map(a => a.dealBreaker);
}

/** Internal fit value per role. Never shown to the buyer. */
export function calculateRoleScores(dimensions, dealBreakers) {
  const scores = {};

  Object.values(ROLES).forEach(role => {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(role.weights).forEach(([dim, weight]) => {
      if (weight > 0) {
        weightedSum += (dimensions[dim] || 0) * weight;
        totalWeight += weight * 100;
      }
    });

    const rawScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

    // Judge each role against its OWN range rather than against the
    // other roles' raw numbers. Without this, roles whose scores run
    // naturally high crowd out everything else, and a buyer never
    // sees two thirds of the careers on offer.
    const cal = CALIBRATION[role.id] || { mean: 35, sd: 7 };
    const relativeFit = (rawScore - cal.mean) / cal.sd;

    // A hard block removes the role entirely — there is no point
    // recommending sales to someone who told us sales targets are a
    // deal-breaker.
    const HARD_BLOCKS = { R08: 'db_sales', R11: 'db_data' };
    const hardBlock = HARD_BLOCKS[role.id] && dealBreakers.includes(HARD_BLOCKS[role.id]);

    // Softer deal-breakers cost about a third of a standard deviation each.
    const matchingPenalties = (role.dealBreakers || []).filter(db => dealBreakers.includes(db));

    scores[role.id] = {
      internal: hardBlock ? -Infinity : relativeFit - matchingPenalties.length * 0.35,
      hardBlock,
      penalties: matchingPenalties,
    };
  });

  return scores;
}

export function rankRoles(roleScores) {
  return Object.entries(roleScores)
    .map(([id, s]) => ({ id, ...s }))
    .filter(r => !r.hardBlock)
    .sort((a, b) => b.internal - a.internal);
}

/** Explanation text for one role, drawn from the user's strongest dimensions. */
export function generateExplanation(roleId, dimensions) {
  const role = ROLES[roleId];
  if (!role) return {};

  const topDimensions = Object.entries(dimensions)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k);

  const whyItFits = [];
  for (const dim of topDimensions) {
    if (role.evidenceStatements[dim] && whyItFits.length < 3) {
      whyItFits.push(role.evidenceStatements[dim]);
    }
  }
  if (whyItFits.length === 0) {
    whyItFits.push(`Your answers line up with several core parts of ${role.name}.`);
  }

  return {
    whyItFits,
    transferableAdvantages: [role.advantage],
    biggestSkillGaps: [role.biggestGap],
    jobTitles: role.entryTitles,
    roadmap: role.roadmap,
    experiment: role.experiment,
    typicalWork: role.typicalWork,
  };
}

export function getArchetype(dimensions) {
  const archetypes = [
    { name: 'Builder',      keys: ['problemSolving','technology','ambiguity','impact'],   copy: 'You like taking something messy and making it better.' },
    { name: 'Investigator', keys: ['research','science','detail','independence'],         copy: "You don't mind going down a research rabbit hole if there's something worth figuring out." },
    { name: 'Connector',    keys: ['communication','people','healthcare','impact'],       copy: 'You get things moving by getting people on the same page.' },
    { name: 'Operator',     keys: ['organisation','detail','stability','healthcare'],     copy: 'You see chaos and immediately want to put a system around it.' },
    { name: 'Creator',      keys: ['creativity','writing','communication'],               copy: 'You like turning information into something people actually want to consume.' },
    { name: 'Commercial',   keys: ['commercial','communication','people','pace'],         copy: "You don't mind the chase. Targets and conversations give you energy." },
    { name: 'Analyst',      keys: ['data','problemSolving','detail','technology'],        copy: "Give you a pile of data and you'll probably start looking for the story hiding inside it." },
  ];

  const scored = archetypes.map(a => ({
    ...a,
    score: a.keys.reduce((sum, k) => sum + (dimensions[k] || 0), 0) / a.keys.length,
  })).sort((a, b) => b.score - a.score);

  const top = scored[0];
  const second = scored[1];
  return { primary: top, secondary: second.score >= top.score * 0.85 ? second : null };
}

/**
 * Full pipeline. Returns three matches, deliberately unranked and
 * unscored, ordered by how hard each is to get into rather than by
 * any judgement about which suits the buyer best.
 */
export function score(answersMap) {
  const flat         = flattenAnswers(answersMap);
  const dealBreakers = extractDealBreakers(flat);
  const dimensions   = calculateDimensions(flat);
  const roleScores   = calculateRoleScores(dimensions, dealBreakers);
  const ranked       = rankRoles(roleScores);
  const topThree     = ranked.slice(0, 3);
  const archetype    = getArchetype(dimensions);

  const matches = topThree.map(r => {
    const role        = ROLES[r.id];
    const explanation = generateExplanation(r.id, dimensions);
    const watchOuts   = (role.dealBreakers || [])
      .filter(db => dealBreakers.includes(db) && role.frictionStatements[db])
      .map(db => role.frictionStatements[db]);

    return {
      roleId:    r.id,
      roleName:  role.name,
      cluster:   role.cluster,
      shortDesc: role.shortDesc,
      watchOuts,
      ...explanation,
    };
  });

  return {
    dimensions,
    matches,
    archetype,
    dealBreakers,
    excluded: Object.entries(roleScores)
      .filter(([, s]) => s.hardBlock)
      .map(([id]) => ROLES[id].name),
  };
}
