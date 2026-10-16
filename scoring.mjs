// ============================================================
// SCORING ENGINE
// All scoring logic lives here. To change how roles are ranked:
//   - Edit calculateDimensions() to change normalisation
//   - Edit calculateRoleScores() to change penalty amounts
//   - Edit getArchetype() to change archetype thresholds
// ============================================================

import { ROLES } from './roles.mjs';

const DIMENSION_KEYS = [
  'writing','research','technology','people','data','creativity',
  'problemSolving','organisation','science','commercial','communication',
  'detail','ambiguity','independence','healthcare','impact','stability',
  'pace','experience',
];

// Maximum raw dimension score achievable across all questions (approx)
const MAX_RAW = 20;

/**
 * Flatten all selected options into a single array of answers
 */
export function flattenAnswers(answersMap) {
  return Object.entries(answersMap).flatMap(([qid, opts]) =>
    opts.map(opt => ({ questionId: qid, ...opt }))
  );
}

/**
 * Sum dimension scores from all answers and normalise to 0–100
 */
export function calculateDimensions(flatAnswers) {
  const raw = Object.fromEntries(DIMENSION_KEYS.map(k => [k, 0]));

  flatAnswers.forEach(a => {
    if (a.dimensionScores) {
      Object.entries(a.dimensionScores).forEach(([k, v]) => {
        if (raw[k] !== undefined) raw[k] += v;
      });
    }
  });

  const normalised = {};
  DIMENSION_KEYS.forEach(k => {
    normalised[k] = Math.min(100, Math.max(0, Math.round((raw[k] / MAX_RAW) * 100)));
  });
  return normalised;
}

/**
 * Extract deal-breaker ids from flat answers
 */
export function extractDealBreakers(flatAnswers) {
  return flatAnswers.filter(a => a.dealBreaker).map(a => a.dealBreaker);
}

/**
 * Calculate weighted score for every role, apply deal-breaker penalties
 */
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

    // Hard block: role is effectively removed if core deal-breaker fires
    const HARD_BLOCKS = {
      R08: 'db_sales',  // Sales + sales-target deal-breaker
      R11: 'db_data',   // Analytics + data deal-breaker
    };
    const hardBlock = HARD_BLOCKS[role.id] && dealBreakers.includes(HARD_BLOCKS[role.id]);

    // Soft penalties: -20 per matching deal-breaker
    const matchingPenalties = (role.dealBreakers || []).filter(db => dealBreakers.includes(db));
    const penalty = matchingPenalties.length * 20;

    scores[role.id] = {
      raw: Math.round(rawScore),
      score: hardBlock ? 0 : Math.max(0, Math.round(rawScore - penalty)),
      hardBlock,
      penalties: matchingPenalties,
    };
  });

  return scores;
}

/**
 * Sort roles by final score descending
 */
export function rankRoles(roleScores) {
  return Object.entries(roleScores)
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Determine tie message for display
 */
export function getTieMessage(score1, score2) {
  const diff = score1 - score2;
  if (diff <= 3)  return 'close';
  if (diff <= 7)  return 'clear-front-runner';
  return 'dominant';
}

/**
 * Confidence label for rank 1
 */
export function getConfidence(score, score2) {
  const diff = score - score2;
  if (diff > 7)  return 'high';
  if (diff > 3)  return 'medium';
  return 'low';
}

/**
 * Generate human-readable explanation for a role result
 */
export function generateExplanation(roleId, dimensions) {
  const role = ROLES[roleId];
  if (!role) return {};

  // Top dimensions for this user
  const topDimensions = Object.entries(dimensions)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k);

  // Match to role's evidence statements
  const whyItFits = [];
  for (const dim of topDimensions) {
    if (role.evidenceStatements[dim] && whyItFits.length < 3) {
      whyItFits.push(role.evidenceStatements[dim]);
    }
  }
  if (whyItFits.length === 0) {
    whyItFits.push(`Your answers show meaningful alignment with key aspects of ${role.name}.`);
  }

  return {
    whyItFits,
    transferableAdvantages: [role.advantage],
    biggestSkillGaps: [role.biggestGap],
    jobTitles: role.entryTitles,
    roadmap: role.roadmap,
    experiment: role.experiment,
  };
}

/**
 * Determine archetype from dimensions
 */
export function getArchetype(dimensions) {
  const archetypes = [
    { name: 'Builder',      keys: ['problemSolving','technology','ambiguity','impact'],          copy: 'You like taking something messy and making it better.' },
    { name: 'Investigator', keys: ['research','science','detail','independence'],                copy: "You don't mind going down a research rabbit hole if there's something worth figuring out." },
    { name: 'Connector',    keys: ['communication','people','healthcare','impact'],              copy: 'You get things moving by getting people on the same page.' },
    { name: 'Operator',     keys: ['organisation','detail','stability','healthcare'],            copy: 'You see chaos and immediately want to put a system around it.' },
    { name: 'Creator',      keys: ['creativity','writing','communication'],                      copy: 'You like turning information into something people actually want to consume.' },
    { name: 'Commercial',   keys: ['commercial','communication','people','pace'],                copy: "You don't mind the chase. Targets and conversations give you energy." },
    { name: 'Analyst',      keys: ['data','problemSolving','detail','technology'],               copy: "Give you a pile of data and you'll probably start looking for the story hiding inside it." },
  ];

  const scored = archetypes.map(a => ({
    ...a,
    score: a.keys.reduce((sum, k) => sum + (dimensions[k] || 0), 0) / a.keys.length,
  })).sort((a, b) => b.score - a.score);

  const top    = scored[0];
  const second = scored[1];
  const combined = second.score >= top.score * 0.85;

  return { primary: top, secondary: combined ? second : null };
}

/**
 * Full scoring pipeline — call this once with the answers map
 */
export function score(answersMap) {
  const flat        = flattenAnswers(answersMap);
  const dealBreakers = extractDealBreakers(flat);
  const dimensions  = calculateDimensions(flat);
  const roleScores  = calculateRoleScores(dimensions, dealBreakers);
  const ranked      = rankRoles(roleScores);
  const top3Ranked  = ranked.slice(0, 3);
  const archetype   = getArchetype(dimensions);

  const top3 = top3Ranked.map((r, i) => {
    const role        = ROLES[r.id];
    const explanation = generateExplanation(r.id, dimensions);
    const watchOuts   = (role.dealBreakers || [])
      .filter(db => dealBreakers.includes(db) && role.frictionStatements[db])
      .map(db => role.frictionStatements[db]);

    return {
      rank:       i + 1,
      roleId:     r.id,
      roleName:   role.name,
      cluster:    role.cluster,
      score:      r.score,
      hardBlock:  r.hardBlock,
      penalties:  r.penalties,
      confidence: i === 0 ? getConfidence(r.score, top3Ranked[1]?.score || 0) : 'medium',
      watchOuts,
      ...explanation,
    };
  });

  return {
    dimensions,
    roleScores,
    ranked,
    top3,
    archetype,
    dealBreakers,
    tieMessage: getTieMessage(top3Ranked[0]?.score || 0, top3Ranked[1]?.score || 0),
  };
}
