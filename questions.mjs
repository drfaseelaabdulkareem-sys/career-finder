// ============================================================
// QUESTIONS DATABASE
// To add a question: append an object following the same schema.
// To edit options: find the question by id, edit options array.
// dimensionScores keys must match keys in roles.js weights objects.
// ============================================================

export const QUESTIONS = [
  // ── SECTION 1: WORK INTERESTS ────────────────────────────
  {
    id: 'Q01',
    section: 'DISCOVERING YOU',
    sectionIndex: 0,
    type: 'multi-select',
    question: 'Which of these activities actually sound appealing to you?',
    helperText: 'Pick up to 5 that genuinely interest you.',
    maxSelections: 5,
    options: [
      {
        id: 'writing', label: 'Writing and explaining things clearly',
        description: 'Reports, articles, communications',
        dimensionScores: { writing: 5, communication: 2 },
        evidence: { roles: ['R04','R06','R09'], reason: 'Strong writing interest is a core signal for Medical Writing, Medical Affairs, and Content.' }
      },
      {
        id: 'research', label: 'Digging into research and evidence',
        description: 'Studies, data, scientific papers',
        dimensionScores: { research: 5, science: 2, detail: 2 },
        evidence: { roles: ['R04','R05','R07','R12'], reason: 'Research interest strongly aligns with Medical Writing, Clinical Research, PV, and Consulting.' }
      },
      {
        id: 'technology', label: 'Figuring out how digital products work',
        description: 'Apps, tools, platforms, systems',
        dimensionScores: { technology: 5, problemSolving: 1 },
        evidence: { roles: ['R01','R02','R10','R11'], reason: 'Shows strong interest in digital/technology-enabled work.' }
      },
      {
        id: 'people', label: 'Working closely with people and teams',
        description: 'Collaboration, coordination, relationships',
        dimensionScores: { people: 5, communication: 2 },
        evidence: { roles: ['R03','R06','R08','R10','R12'], reason: 'People-orientation fits roles requiring collaboration and stakeholder management.' }
      },
      {
        id: 'data', label: 'Finding patterns in numbers and data',
        description: 'Analysis, dashboards, metrics',
        dimensionScores: { data: 5, detail: 2, problemSolving: 1 },
        evidence: { roles: ['R11','R12'], reason: 'Data interest is a primary signal for Analytics and Consulting.' }
      },
      {
        id: 'creativity', label: 'Creating content and campaigns',
        description: 'Design, storytelling, marketing',
        dimensionScores: { creativity: 5, writing: 1 },
        evidence: { roles: ['R09'], reason: 'Creativity and content interest aligns with Healthcare Marketing/Content.' }
      },
      {
        id: 'problemSolving', label: 'Breaking down messy, complex problems',
        description: 'Strategy, systems, figuring things out',
        dimensionScores: { problemSolving: 5, ambiguity: 2 },
        evidence: { roles: ['R01','R02','R03','R12'], reason: 'Problem-solving drives Product, Ops, and Consulting roles.' }
      },
      {
        id: 'organisation', label: 'Making systems and processes work better',
        description: 'Planning, workflows, execution',
        dimensionScores: { organisation: 5, detail: 2 },
        evidence: { roles: ['R02','R03','R05','R07'], reason: 'Organisation interest fits Operations, Clinical Research, and PV.' }
      },
      {
        id: 'science', label: 'Staying connected to healthcare and science',
        description: 'Clinical knowledge, medical science',
        dimensionScores: { science: 5, healthcare: 2 },
        evidence: { roles: ['R04','R05','R06','R07'], reason: 'Science interest connects strongly to Medical Writing, Clinical Research, Medical Affairs, PV.' }
      },
      {
        id: 'commercial', label: 'Pitching, persuading and commercial goals',
        description: 'Sales, business development, deals',
        dimensionScores: { commercial: 5, communication: 2 },
        evidence: { roles: ['R08'], reason: 'Commercial interest is required for Sales/BD roles.' }
      },
    ]
  },
  {
    id: 'Q02',
    section: 'DISCOVERING YOU',
    sectionIndex: 0,
    type: 'single-select',
    question: 'If you were handed a 3-month project, which sounds most like you?',
    helperText: null,
    options: [
      { id: 'A', label: 'Build something new — a product, tool or process', dimensionScores: { problemSolving: 4, technology: 2, ambiguity: 2 }, evidence: { roles: ['R01','R02'], reason: 'Builder orientation signals Product or Product Ops.' } },
      { id: 'B', label: 'Research a problem deeply and write up findings', dimensionScores: { research: 4, writing: 3, science: 1 }, evidence: { roles: ['R04','R05','R12'], reason: 'Research + writing signals Medical Writing or Consulting.' } },
      { id: 'C', label: 'Organise a team and make the project actually run', dimensionScores: { organisation: 4, people: 3 }, evidence: { roles: ['R02','R03'], reason: 'Organiser orientation signals Ops roles.' } },
      { id: 'D', label: 'Present findings and convince stakeholders', dimensionScores: { communication: 4, people: 2, commercial: 1 }, evidence: { roles: ['R06','R08','R12'], reason: 'Presenting and persuading signals Medical Affairs, Sales, or Consulting.' } },
      { id: 'E', label: 'Dive into data and extract insights', dimensionScores: { data: 5, detail: 2, problemSolving: 2 }, evidence: { roles: ['R11','R12'], reason: 'Data-first approach signals Analytics or Consulting.' } },
    ]
  },
  {
    id: 'Q03',
    section: 'DISCOVERING YOU',
    sectionIndex: 0,
    type: 'single-select',
    question: 'What kind of work output feels most satisfying?',
    helperText: null,
    options: [
      { id: 'A', label: 'A product or feature that real users interact with', dimensionScores: { technology: 3, problemSolving: 3, impact: 2 }, evidence: { roles: ['R01','R02'], reason: 'Tangible product output is core to Product roles.' } },
      { id: 'B', label: 'A well-crafted document or piece of content', dimensionScores: { writing: 4, detail: 2 }, evidence: { roles: ['R04','R06','R09'], reason: 'Document/content output signals writing-heavy roles.' } },
      { id: 'C', label: 'A process that runs smoothly without me', dimensionScores: { organisation: 4, detail: 2 }, evidence: { roles: ['R02','R03','R07'], reason: 'Systems and process output signals Ops and PV roles.' } },
      { id: 'D', label: 'A decision that moves an organisation forward', dimensionScores: { problemSolving: 3, commercial: 2, impact: 2 }, evidence: { roles: ['R12','R03'], reason: 'Decision-making output signals Consulting and Operations.' } },
      { id: 'E', label: 'A relationship or deal that I built from scratch', dimensionScores: { commercial: 4, communication: 3, people: 2 }, evidence: { roles: ['R08','R10'], reason: 'Relationship/deal output signals Sales or Customer Success.' } },
    ]
  },

  // ── SECTION 2: WORK STYLE ─────────────────────────────────
  {
    id: 'Q04',
    section: 'HOW YOU WORK',
    sectionIndex: 1,
    type: 'single-select',
    question: 'How do you prefer to spend most of your working day?',
    helperText: 'Be honest — your gut answer is the useful one.',
    options: [
      { id: 'A', label: 'Mostly alone, in deep focused work', dimensionScores: { independence: 4, detail: 2 }, evidence: { roles: ['R04','R05','R07','R11'], reason: 'Deep independent work preference aligns with Writing, Research, PV, Analytics.' } },
      { id: 'B', label: 'A mix — some focus time, some collaboration', dimensionScores: { independence: 2, people: 2 }, evidence: { roles: ['R01','R02','R03','R06','R12'], reason: 'Balance preference is compatible with most hybrid roles.' } },
      { id: 'C', label: 'Mostly with people — meetings, calls, coordination', dimensionScores: { people: 4, communication: 3 }, evidence: { roles: ['R03','R06','R08','R10'], reason: 'Strong people preference signals customer-facing or coordination roles.' } },
    ]
  },
  {
    id: 'Q05',
    section: 'HOW YOU WORK',
    sectionIndex: 1,
    type: 'single-select',
    question: 'How do you feel about working without a clear answer in sight?',
    helperText: null,
    options: [
      { id: 'A', label: 'I like it — figuring it out is part of the fun', dimensionScores: { ambiguity: 5, problemSolving: 2 }, evidence: { roles: ['R01','R12'], reason: 'High ambiguity tolerance is required for Product and Consulting.' } },
      { id: 'B', label: 'I can handle it but prefer some structure', dimensionScores: { ambiguity: 2 }, evidence: { roles: ['R02','R03','R06','R10'], reason: 'Moderate ambiguity tolerance fits most hybrid roles.' } },
      { id: 'C', label: 'I work better with clear processes and defined roles', dimensionScores: { ambiguity: -1, organisation: 3 }, evidence: { roles: ['R05','R07','R04'], reason: 'Structure preference signals PV, Clinical Research, or Medical Writing.' } },
    ]
  },
  {
    id: 'Q06',
    section: 'HOW YOU WORK',
    sectionIndex: 1,
    type: 'single-select',
    question: "What's your relationship with repetitive tasks?",
    helperText: null,
    options: [
      { id: 'A', label: 'Fine with them — consistency and accuracy matter', dimensionScores: { organisation: 3, detail: 3 }, evidence: { roles: ['R07','R05'], reason: 'Tolerance for repetition is required for PV and Clinical Research.' } },
      { id: 'B', label: 'Some repetition is fine, too much is draining', dimensionScores: { organisation: 1, problemSolving: 1 }, evidence: { roles: ['R02','R03','R04'], reason: 'Moderate repetition tolerance fits Ops and Writing roles.' } },
      { id: 'C', label: 'I get restless — I need variety and new challenges', dimensionScores: { ambiguity: 2, problemSolving: 2, creativity: 1 }, evidence: { roles: ['R01','R08','R09','R12'], reason: 'Variety preference signals dynamic roles like Product, Sales, or Consulting.' } },
    ]
  },
  {
    id: 'Q07',
    section: 'HOW YOU WORK',
    sectionIndex: 1,
    type: 'single-select',
    question: "What's your honest relationship with data and numbers?",
    helperText: null,
    options: [
      { id: 'A', label: 'Love them — give me a spreadsheet', dimensionScores: { data: 5, detail: 2 }, evidence: { roles: ['R11','R12'], reason: 'Strong data affinity is primary signal for Analytics and Consulting.' } },
      { id: 'B', label: 'Comfortable with data when I need to be', dimensionScores: { data: 2 }, evidence: { roles: ['R01','R02','R03','R05'], reason: 'Moderate data comfort is fine for Product and Ops roles.' } },
      { id: 'C', label: 'I prefer working with people and ideas over numbers', dimensionScores: { data: -1, people: 2, creativity: 1 }, evidence: { roles: ['R04','R06','R08','R09','R10'], reason: 'Non-data preference signals Communication, Writing, or Sales roles.' } },
    ]
  },

  // ── SECTION 3: BACKGROUND & SKILLS ───────────────────────
  {
    id: 'Q08',
    section: 'YOUR BACKGROUND',
    sectionIndex: 2,
    type: 'single-select',
    question: "What's your healthcare or life science degree?",
    helperText: null,
    options: [
      { id: 'MBBS', label: 'MBBS / MD', dimensionScores: { healthcare: 4, science: 3 }, evidence: { roles: ['R01','R03','R05','R06','R12'], reason: 'Clinical degree provides strong healthcare context for most roles.' } },
      { id: 'BDS',  label: 'BDS', dimensionScores: { healthcare: 3, science: 3 }, evidence: { roles: ['R01','R03','R05','R06'], reason: 'Dental background offers strong science and clinical workflow exposure.' } },
      { id: 'BHMS_BAMS', label: 'BHMS / BAMS / other traditional medicine', dimensionScores: { healthcare: 3, science: 2 }, evidence: { roles: ['R05','R06','R07'], reason: 'Traditional medicine background connects to regulatory and research roles.' } },
      { id: 'Pharmacy', label: 'Pharmacy (B.Pharm / M.Pharm / Pharm.D)', dimensionScores: { healthcare: 3, science: 4 }, evidence: { roles: ['R04','R05','R06','R07'], reason: 'Pharmacy background is particularly strong for PV, Clinical Research, and Medical Writing.' } },
      { id: 'Nursing', label: 'Nursing / Allied Health', dimensionScores: { healthcare: 4, people: 2 }, evidence: { roles: ['R03','R10','R06'], reason: 'Clinical care background is valuable for Operations and Customer Success.' } },
      { id: 'Biotech', label: 'Biotechnology / Life Sciences', dimensionScores: { healthcare: 2, science: 5, research: 2 }, evidence: { roles: ['R04','R05','R11'], reason: 'Life science background aligns with research and analytics roles.' } },
    ]
  },
  {
    id: 'Q09',
    section: 'YOUR BACKGROUND',
    sectionIndex: 2,
    type: 'single-select',
    question: 'How much clinical or work experience do you have post-graduation?',
    helperText: null,
    options: [
      { id: 'none',  label: 'Still studying / just graduated', dimensionScores: { experience: 0 }, evidence: { roles: [], reason: 'Early stage — roadmap emphasises learning fundamentals.' } },
      { id: 'less1', label: 'Less than 1 year', dimensionScores: { experience: 1 }, evidence: { roles: [], reason: 'Early career stage.' } },
      { id: '1to3',  label: '1–3 years', dimensionScores: { experience: 2, healthcare: 1 }, evidence: { roles: ['R03','R06'], reason: 'Moderate experience gives some credibility for mid-level entry roles.' } },
      { id: '3plus', label: '3+ years', dimensionScores: { experience: 3, healthcare: 2 }, evidence: { roles: ['R03','R06','R12'], reason: 'Meaningful experience opens doors to Operations, Medical Affairs, and Consulting.' } },
    ]
  },
  {
    id: 'Q10',
    section: 'YOUR BACKGROUND',
    sectionIndex: 2,
    type: 'multi-select',
    question: "Which of these have you actually done — even informally?",
    helperText: 'Side projects, college work, clinical, personal — all counts.',
    maxSelections: 10,
    options: [
      { id: 'sk_write',     label: 'Written articles, papers or reports', dimensionScores: { writing: 3 }, evidence: { roles: ['R04','R09'], reason: 'Demonstrated writing skill.' } },
      { id: 'sk_present',   label: 'Given presentations or talks', dimensionScores: { communication: 3 }, evidence: { roles: ['R06','R12'], reason: 'Presentation experience relevant for Medical Affairs and Consulting.' } },
      { id: 'sk_research',  label: 'Conducted or assisted in research', dimensionScores: { research: 3, science: 1 }, evidence: { roles: ['R04','R05','R12'], reason: 'Research experience is directly transferable.' } },
      { id: 'sk_data',      label: 'Worked with data or statistics', dimensionScores: { data: 3, detail: 1 }, evidence: { roles: ['R11','R12'], reason: 'Data skills are directly transferable to Analytics and Consulting.' } },
      { id: 'sk_manage',    label: 'Managed a team or project', dimensionScores: { organisation: 3, people: 2 }, evidence: { roles: ['R02','R03'], reason: 'Management experience relevant for Ops roles.' } },
      { id: 'sk_tech',      label: 'Built something with technology', dimensionScores: { technology: 3 }, evidence: { roles: ['R01','R02','R11'], reason: 'Technical experience is a strong signal for Product and Analytics.' } },
      { id: 'sk_community', label: 'Organised events or communities', dimensionScores: { organisation: 2, people: 2 }, evidence: { roles: ['R03','R10'], reason: 'Community building shows coordination skills.' } },
      { id: 'sk_content',   label: 'Created content (social, video, blog)', dimensionScores: { creativity: 3, writing: 1 }, evidence: { roles: ['R09'], reason: 'Content creation experience directly relevant to Healthcare Marketing.' } },
      { id: 'sk_sales',     label: 'Done sales, pitching or business development', dimensionScores: { commercial: 3, communication: 2 }, evidence: { roles: ['R08','R10'], reason: 'Sales experience is a strong signal for Sales/BD and Customer Success.' } },
      { id: 'sk_clinical',  label: 'Delivered direct clinical care', dimensionScores: { healthcare: 2, people: 1 }, evidence: { roles: ['R03','R06','R10'], reason: 'Clinical care experience is a transferable advantage for multiple roles.' } },
    ]
  },

  // ── SECTION 4: CAREER GOALS ───────────────────────────────
  {
    id: 'Q11',
    section: 'WHAT YOU WANT',
    sectionIndex: 3,
    type: 'multi-select',
    question: 'What matters most to you in your next career chapter?',
    helperText: 'Pick up to 4.',
    maxSelections: 4,
    options: [
      { id: 'g_healthcare',  label: 'Staying connected to healthcare', dimensionScores: { healthcare: 3 }, evidence: { roles: ['R03','R05','R06','R07'], reason: 'Healthcare connection preference boosts roles with high clinical relevance.' } },
      { id: 'g_growth',      label: 'Fast career growth and progression', dimensionScores: { ambiguity: 2, pace: 2 }, evidence: { roles: ['R01','R08','R12'], reason: 'Growth orientation aligns with dynamic, fast-moving roles.' } },
      { id: 'g_impact',      label: 'Visible, meaningful impact', dimensionScores: { impact: 4 }, evidence: { roles: ['R01','R03','R06','R12'], reason: 'Impact desire signals roles with clear output and stakeholder visibility.' } },
      { id: 'g_stability',   label: 'Stability and work-life balance', dimensionScores: { stability: 3 }, evidence: { roles: ['R04','R05','R07'], reason: 'Stability preference aligns with structured, process-driven roles.' } },
      { id: 'g_tech',        label: 'Working with technology and digital products', dimensionScores: { technology: 3 }, evidence: { roles: ['R01','R02','R10','R11'], reason: 'Tech orientation boosts Product, Ops, Analytics, and CS roles.' } },
      { id: 'g_leadership',  label: 'Leading people and building teams', dimensionScores: { people: 2, organisation: 2 }, evidence: { roles: ['R03','R12'], reason: 'Leadership desire signals Operations and Consulting.' } },
      { id: 'g_creative',    label: 'Creative, expressive work', dimensionScores: { creativity: 3 }, evidence: { roles: ['R09'], reason: 'Creative expression aligns with Marketing/Content.' } },
      { id: 'g_independent', label: 'Independence and flexible working', dimensionScores: { independence: 3 }, evidence: { roles: ['R04','R05','R11'], reason: 'Independence preference aligns with deep-work roles.' } },
    ]
  },
  {
    id: 'Q12',
    section: 'WHAT YOU WANT',
    sectionIndex: 3,
    type: 'single-select',
    question: 'How important is it that your work stays in healthcare?',
    helperText: null,
    options: [
      { id: 'A', label: 'Very — I want to stay in or close to healthcare', dimensionScores: { healthcare: 5 }, evidence: { roles: ['R03','R05','R06','R07'], reason: 'Strong healthcare preference boosts all healthcare-adjacent roles.' } },
      { id: 'B', label: 'Nice to have, but not a dealbreaker', dimensionScores: { healthcare: 2 }, evidence: { roles: [], reason: 'Moderate healthcare preference.' } },
      { id: 'C', label: "Open to going beyond healthcare entirely", dimensionScores: { healthcare: -1 }, evidence: { roles: [], reason: "Open to cross-industry." } },
    ]
  },
  {
    id: 'Q13',
    section: 'WHAT YOU WANT',
    sectionIndex: 3,
    type: 'single-select',
    question: 'Where are you leaning for the type of company?',
    helperText: null,
    options: [
      { id: 'A', label: 'Startup or early-stage — I want to build something', dimensionScores: { ambiguity: 3, pace: 2, technology: 1 }, evidence: { roles: ['R01','R08'], reason: 'Startup preference aligns with Product and Sales roles.' } },
      { id: 'B', label: 'Mid-size or scale-up — growing fast', dimensionScores: { ambiguity: 1, pace: 2 }, evidence: { roles: ['R02','R10'], reason: 'Scale-up preference aligns with Ops and CS.' } },
      { id: 'C', label: 'Large corporate or MNC', dimensionScores: { stability: 2, organisation: 1 }, evidence: { roles: ['R05','R06','R07'], reason: 'Corporate preference aligns with structured roles.' } },
      { id: 'D', label: 'Hospital or healthcare provider', dimensionScores: { healthcare: 3, stability: 1 }, evidence: { roles: ['R03'], reason: 'Hospital preference strongly aligns with Healthcare Operations.' } },
      { id: 'E', label: 'No strong preference yet', dimensionScores: {}, evidence: { roles: [], reason: 'Open to different environments.' } },
    ]
  },

  // ── SECTION 5: DEAL BREAKERS ──────────────────────────────
  {
    id: 'Q14',
    section: 'DEAL BREAKERS',
    sectionIndex: 4,
    type: 'multi-select',
    question: 'Which of these would be a genuine deal-breaker for you?',
    helperText: 'Be honest — this directly shapes your results. Pick all that apply.',
    maxSelections: 10,
    options: [
      { id: 'db_sales',      label: 'Sales targets and commission-based pay', dimensionScores: {}, dealBreaker: 'db_sales' },
      { id: 'db_writing',    label: 'Writing as a major part of the job', dimensionScores: {}, dealBreaker: 'db_writing' },
      { id: 'db_data',       label: 'Working heavily with data/numbers every day', dimensionScores: {}, dealBreaker: 'db_data' },
      { id: 'db_repetitive', label: 'Repetitive, routine tasks', dimensionScores: {}, dealBreaker: 'db_repetitive' },
      { id: 'db_travel',     label: 'Frequent travel or field work', dimensionScores: {}, dealBreaker: 'db_travel' },
      { id: 'db_ambiguity',  label: 'Unclear responsibilities or ambiguous work', dimensionScores: {}, dealBreaker: 'db_ambiguity' },
      { id: 'db_meetings',   label: 'Lots of meetings and stakeholder management', dimensionScores: {}, dealBreaker: 'db_meetings' },
      { id: 'db_clinical',   label: 'Any direct clinical patient interaction', dimensionScores: {}, dealBreaker: 'db_clinical' },
    ]
  },
];

// ============================================================
// SERVER-ONLY HELPERS (added for the protected API)
// These keep scoring metadata off the client. The browser only
// ever receives labels — never dimensionScores, evidence or
// dealBreaker ids.
// ============================================================

/**
 * Strip every scoring signal from the question bank.
 * This is the ONLY shape that is ever sent to a browser.
 */
export function publicQuestions() {
  return QUESTIONS.map(q => ({
    id: q.id,
    section: q.section,
    sectionIndex: q.sectionIndex,
    type: q.type,
    question: q.question,
    helperText: q.helperText,
    maxSelections: q.maxSelections,
    options: q.options.map(o => ({
      id: o.id,
      label: o.label,
      description: o.description,
    })),
  }));
}

const OPTION_INDEX = (() => {
  const idx = {};
  for (const q of QUESTIONS) {
    idx[q.id] = Object.fromEntries(q.options.map(o => [o.id, o]));
  }
  return idx;
})();

/**
 * Turn { Q01: ['writing','research'] } back into the full option
 * objects the scoring engine expects. Unknown ids are dropped, so a
 * tampered payload cannot inject its own dimension scores.
 */
export function rehydrateAnswers(idMap) {
  const out = {};
  if (!idMap || typeof idMap !== 'object') return out;

  for (const [qid, ids] of Object.entries(idMap)) {
    const q = OPTION_INDEX[qid];
    if (!q || !Array.isArray(ids)) continue;

    const picked = ids
      .filter(id => typeof id === 'string')
      .map(id => q[id])
      .filter(Boolean);

    if (picked.length) out[qid] = picked;
  }
  return out;
}

export const QUESTION_COUNT = QUESTIONS.length;
