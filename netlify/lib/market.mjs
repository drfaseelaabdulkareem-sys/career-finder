// ============================================================
// MARKET DATA — Indian salary bands, degree access, entry difficulty
//
// Researched October 2026 from Indian reported-salary sources
// (AmbitionBox, Payscale India, Glassdoor India, Indeed India)
// plus live employer job ads. See SALARY-SOURCES.md for every
// figure's origin and confidence.
//
// HOW TO EDIT: change the numbers here, not in roles.mjs.
// Figures are annual CTC in INR lakhs.
//
// IMPORTANT: these are reported ranges, not promises. Entry pay in
// almost every one of these roles is lower than course marketing
// claims. That honesty is the product.
// ============================================================

// Experience bands map to Q09 answers.
export const BAND_FOR_EXPERIENCE = {
  none:  'entry',   // still studying / just graduated
  less1: 'entry',   // under 1 year
  '1to3': 'early',  // 1–3 years
  '3plus': 'mid',   // 3+ years
};

export const BAND_LABEL = {
  entry:  'Starting out (0–1 year)',
  early:  'With 1–3 years',
  mid:    'With 3–5 years',
  senior: 'With 5+ years',
};

// confidence: 'good' = two or more measured sources agree
//             'moderate' = one decent sample, or sources differ
//             'thin' = small samples or inference — say so to the buyer
export const MARKET = {
  R01: { // Product Management
    salary: {
      entry: [4, 10], early: [8, 18], mid: [15, 30], senior: [25, 50],
      confidence: 'thin',
      note: 'The high entry figures you see online come from campus programmes at funded companies, not from open hiring. A clinical graduate almost never enters here directly.',
    },
    cities: ['Bengaluru', 'Gurugram / Delhi NCR', 'Hyderabad', 'Mumbai', 'Pune'],
    entryDifficulty: 'very hard',
    hiringVolume: 'low at entry',
    realityCheck: 'Direct entry is close to non-existent without tech experience. The route that works is customer success, implementation or product operations first, then a move across after 12–24 months.',
    degreeAccess: {
      MBBS:       ['open',    'A clinical degree is a real advantage for doctor-facing products — one Bengaluru health-tech firm asks for MBBS outright. But those same ads also want 3–5 years of product experience.'],
      BDS:        ['open',    'Your degree is neutral here. You will be judged on product thinking, not on clinical training.'],
      BHMS_BAMS:  ['open',    'Your degree is neutral here. Nobody is screening it out, but nobody is screening it in either.'],
      Pharmacy:   ['open',    'Neutral. Pharmacy knowledge helps for medication-related products specifically.'],
      Nursing:    ['open',    'Neutral on paper, but nursing workflow knowledge is genuinely scarce in product teams building for hospitals.'],
      Biotech:    ['open',    'Neutral. You compete with engineering and MBA candidates on the same terms.'],
    },
  },

  R02: { // Product Operations
    salary: {
      entry: [3.5, 6.5], early: [5, 10], mid: [8, 16], senior: [14, 28],
      confidence: 'moderate',
      note: 'The senior figures are less certain — few people report pay under this exact job title.',
    },
    cities: ['Gurugram / Delhi NCR', 'Bengaluru', 'Mumbai', 'Pune', 'Noida'],
    entryDifficulty: 'moderate',
    hiringVolume: 'moderate',
    realityCheck: 'One of the two genuinely open doors into health-tech. No coding test, no portfolio needed. Search for "operations analyst", "business operations" and "provider operations" as well — the job title is inconsistent.',
    degreeAccess: {
      MBBS:       ['open',   'Neutral. The screen is spreadsheets, process discipline and chasing people, not clinical knowledge.'],
      BDS:        ['open',   'Neutral.'],
      BHMS_BAMS:  ['open',   'Neutral — and this matters, because several higher-paying routes are closed to you. This one is not.'],
      Pharmacy:   ['open',   'Neutral.'],
      Nursing:    ['open',   'Neutral, with an edge for hospital-facing operations work.'],
      Biotech:    ['open',   'Neutral.'],
    },
  },

  R03: { // Healthcare Operations
    salary: {
      entry: [2, 4], early: [2.5, 5], mid: [3.5, 7], senior: [6, 12],
      confidence: 'moderate',
      note: 'The lowest-paying role on this list at every stage. Corporate hospital chains in metros pay at the top of each range; smaller hospitals pay at the bottom.',
    },
    cities: ['Bengaluru', 'Delhi NCR', 'Mumbai', 'Hyderabad', 'Chennai', 'available in most cities'],
    entryDifficulty: 'easy',
    hiringVolume: 'high',
    realityCheck: 'Easy to enter and available almost anywhere in India, but pay is low and it plateaus. Without an MHA or MBA in hospital management you will find the manager rung hard to reach.',
    degreeAccess: {
      MBBS:       ['open',   'You can enter at coordinator or executive level without a further degree. An MHA or MBA is what unlocks the manager ladder above it.'],
      BDS:        ['open',   'Same as above — entry is open, progression needs an MHA or MBA.'],
      BHMS_BAMS:  ['strong', 'One of the more welcoming routes for you. Hospital operations hires on coordination ability, not on which medical system you trained in.'],
      Pharmacy:   ['open',   'Open at entry. Hospital pharmacy operations is a natural starting point.'],
      Nursing:    ['strong', 'Nursing experience is directly relevant — you already understand ward and OPD flow from the inside.'],
      Biotech:    ['open',   'Open, though you have less workflow context than clinically trained applicants.'],
    },
  },

  R04: { // Medical Writing
    salary: {
      entry: [3, 5], early: [4.5, 8], mid: [7, 13], senior: [12, 20],
      confidence: 'good',
      note: 'Global agencies and MNC medical-communications teams pay roughly 1.5–2× domestic employers at the same experience.',
    },
    cities: ['Bengaluru', 'Hyderabad', 'Mumbai', 'Pune', 'Chennai', 'Gurugram'],
    entryDifficulty: 'moderate',
    hiringVolume: 'moderate',
    realityCheck: 'Your writing samples decide this, not your degree. Agencies will ask for a portfolio before they ask about your marks.',
    degreeAccess: {
      MBBS:       ['strong', 'Fully open. Your clinical knowledge makes your writing credible in a way a pure science graduate cannot match.'],
      BDS:        ['strong', 'Fully open. Dental and surgical topics are a natural specialism.'],
      BHMS_BAMS:  ['strong', 'This is one of the most open doors available to you. Real job ads ask for a life-sciences or health-related degree without naming specific ones.'],
      Pharmacy:   ['strong', 'The most common background in Indian medical writing. Regulatory writing especially favours B.Pharm, M.Pharm and PharmD.'],
      Nursing:    ['open',   'Open. Patient-education and health-content writing suits your background particularly well.'],
      Biotech:    ['strong', 'Very common route. Research and publication writing is a natural fit.'],
    },
  },

  R05: { // Clinical Research
    salary: {
      entry: [2.5, 4.5], early: [4, 7], mid: [7, 13], senior: [12, 20],
      confidence: 'moderate',
      note: 'Global contract research organisations pay well above domestic ones and hospital sites — often double at the same experience. The senior figures vary widely between sources.',
    },
    cities: ['Bengaluru', 'Hyderabad', 'Mumbai', 'Pune', 'Delhi NCR', 'Chennai'],
    entryDifficulty: 'moderate',
    hiringVolume: 'high',
    realityCheck: 'The job title "Clinical Research Associate" is usually NOT an entry role in India — companies hire into it at 1–2 years. Your actual doors in are Clinical Trial Assistant, Clinical Data Associate, and hospital-based Clinical Research Coordinator.',
    degreeAccess: {
      MBBS:       ['strong', 'Open, but you may be considered overqualified for assistant roles. Ask about Medical Monitor and Medical Advisor positions instead — they need your degree and pay considerably more.'],
      BDS:        ['open',   'Open at coordinator and assistant level.'],
      BHMS_BAMS:  ['open',   'Accepted in practice, though job ads more often name pharmacy and life-science degrees. Expect to make the case for yourself.'],
      Pharmacy:   ['strong', 'The most commonly hired background after life sciences. Ads name your degree directly.'],
      Nursing:    ['strong', 'Particularly well placed for hospital-site coordinator roles, where patient contact and consent are part of the job.'],
      Biotech:    ['strong', 'A standard route. Data and protocol roles suit you.'],
    },
  },

  R06: { // Medical Affairs
    salary: {
      entry: [3.5, 7], early: [6, 12], mid: [10, 18], senior: [18, 30],
      confidence: 'thin',
      note: 'The field-based MSL role pays considerably more — roughly ₹10–16L in the early years — but is very hard to enter directly. The figures here are for office-based medical affairs, where the early-career data is weak.',
    },
    cities: ['Mumbai', 'Delhi NCR / Gurugram', 'Bengaluru', 'Hyderabad', 'Ahmedabad'],
    entryDifficulty: 'hard',
    hiringVolume: 'low',
    realityCheck: 'The best-paid route out of clinical work, and the most tightly gated. Most MSL hires already have two to five years behind them. Office-based medical affairs and medical information roles are the realistic first step.',
    degreeAccess: {
      MBBS:       ['strong', 'Your degree is what these roles are built around. Large pharma ads name MBBS and MD as preferred qualifications.'],
      BDS:        ['strong', 'Named explicitly as eligible by major pharma companies — one global firm lists BDS and MDS among accepted degrees for field medical roles.'],
      BHMS_BAMS:  ['limited', 'Be careful here. No employer advertisement found names BAMS or BHMS for field medical roles, and the big pharma companies list MBBS, MD, BDS, MDS and PharmD instead. Aim at office-based medical affairs, medical information, and Indian pharma companies rather than multinational MSL posts.'],
      Pharmacy:   ['strong', 'PharmD is explicitly named by major pharma companies. B.Pharm and M.Pharm are more often routed to medical information roles.'],
      Nursing:    ['limited', 'Rarely named in medical affairs job ads. Medical information and patient-education roles are a more realistic entry point.'],
      Biotech:    ['limited', 'A PhD can open the door; a bachelor\'s or master\'s alone rarely does without clinical experience.'],
    },
  },

  R07: { // Pharmacovigilance
    salary: {
      entry: [2.5, 4.5], early: [3.5, 6], mid: [5.5, 9], senior: [10, 18],
      confidence: 'good',
      note: 'The best-evidenced figures on this list — several independent sources agree. Be sceptical of anyone quoting double these numbers.',
    },
    cities: ['Hyderabad', 'Bengaluru', 'Pune', 'Mumbai', 'Chennai', 'Noida', 'Ahmedabad'],
    entryDifficulty: 'easy',
    hiringVolume: 'highest of any role here',
    realityCheck: 'The widest door out of clinical work. Hundreds of openings at any given time, mostly at large IT services companies and contract research organisations. Pay starts low but the volume of jobs is unmatched.',
    degreeAccess: {
      MBBS:       ['strong', 'Ask specifically about Medical Reviewer and Drug Safety Physician roles rather than case-processing jobs. They require a medical degree and pay noticeably more from the start.'],
      BDS:        ['open',   'Accepted — some company advertisements name BDS directly alongside pharmacy degrees.'],
      BHMS_BAMS:  ['open',   'Accepted, and some advertisements name BHMS explicitly. The medical review route is also worth asking about, since it needs a medical degree.'],
      Pharmacy:   ['strong', 'The mainstream route. Job ads frequently name B.Pharm and M.Pharm and nothing else.'],
      Nursing:    ['open',   'Hired in practice, though ads name pharmacy degrees more often. Your clinical observation skills transfer directly to case assessment.'],
      Biotech:    ['open',   'Widely hired, particularly at the large IT services companies running safety operations.'],
    },
  },

  R08: { // Sales / Business Development
    salary: {
      entry: [1.8, 3], early: [2.5, 4.6], mid: [3, 5.5], senior: [4, 7],
      confidence: 'good',
      note: 'Multinational pharma pays considerably more than Indian companies — roughly ₹3.5–5.5L at entry against ₹1.8–3L. Promotion to Area Sales Manager at five to eight years typically reaches ₹7–12L. Pay is roughly 85% fixed and 15% incentive, not the half-and-half people fear. Travel allowances are reimbursement, not income.',
    },
    cities: ['every district in India, Kerala included — territories, not head offices'],
    entryDifficulty: 'easy',
    hiringVolume: 'very high',
    realityCheck: 'The only role here you can take without leaving your home state. Entry pay is the lowest on this list, and the ceiling as a representative is low too — the money comes after promotion into management.',
    degreeAccess: {
      MBBS:       ['open',   'No barrier. Your degree gives you real credibility with the doctors you will be calling on.'],
      BDS:        ['open',   'No barrier, and a natural fit for dental products.'],
      BHMS_BAMS:  ['open',   'No barrier at all. One of the most accessible routes available to you, anywhere in the country.'],
      Pharmacy:   ['strong', 'The conventional background. Many job ads name B.Pharm or D.Pharm directly.'],
      Nursing:    ['open',   'No barrier, and especially suited to medical device and hospital-product sales.'],
      Biotech:    ['open',   'No barrier.'],
    },
  },

  R09: { // Healthcare Marketing / Content
    salary: {
      entry: [1.8, 3.5], early: [2.5, 5.5], mid: [3.5, 7], senior: [6, 12],
      confidence: 'moderate',
      note: 'If you move into medical writing proper — regulatory or clinical documents rather than general health content — the figures roughly double at every stage. This is also the most remote-friendly role on the list.',
    },
    cities: ['Gurugram', 'Bengaluru', 'Mumbai', 'Ahmedabad', 'Chennai', 'widely remote'],
    entryDifficulty: 'easy',
    hiringVolume: 'high',
    realityCheck: 'Easy to start, low paid at first, and crowded with non-clinical writers. Your clinical degree is what separates you — lean on it hard, and aim to move toward medical writing where it is paid for properly.',
    degreeAccess: {
      MBBS:       ['strong', 'Your degree raises what you can charge. Health content written by a doctor is trusted and priced differently.'],
      BDS:        ['strong', 'Same advantage, with dental and surgical content as an obvious niche.'],
      BHMS_BAMS:  ['strong', 'Fully open, and the wellness, Ayurveda and integrative health content market in India specifically wants your background.'],
      Pharmacy:   ['strong', 'Strong for medication and regulatory content.'],
      Nursing:    ['strong', 'Patient education content is an area where your background is genuinely scarce and valuable.'],
      Biotech:    ['open',   'Open, and strong for research and science communication.'],
    },
  },

  R10: { // Customer Success
    salary: {
      entry: [2.5, 6], early: [4, 11], mid: [8, 18], senior: [15, 28],
      confidence: 'good',
      note: 'Entry pay is low but the climb is quick — reported pay at four to six years in reaches ₹20L and above.',
    },
    cities: ['Bengaluru', 'Gurugram / Delhi NCR', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai', 'occasionally Kozhikode and Kochi'],
    entryDifficulty: 'easiest of the health-tech roles',
    hiringVolume: 'high',
    realityCheck: 'The role where your clinical background is an asset rather than something to explain away. No coding test, no portfolio. It is also the most common internal stepping stone into product management.',
    degreeAccess: {
      MBBS:       ['strong', 'A clear advantage. You can hold a clinical conversation with a consultant pushing back on the software, which a business graduate simply cannot.'],
      BDS:        ['strong', 'Clear advantage for the same reason.'],
      BHMS_BAMS:  ['strong', 'A clear advantage, and one of the best-paying routes genuinely open to you. Clinical workflow understanding is what is being bought here.'],
      Pharmacy:   ['strong', 'Strong, especially for pharmacy and e-prescription products.'],
      Nursing:    ['strong', 'Possibly the strongest fit of any degree. Hospital software is used by nurses more than by anyone else, and you know how wards actually run.'],
      Biotech:    ['open',   'Open, though you have less workflow knowledge than clinically trained applicants.'],
    },
  },

  R11: { // Data / Business Analytics
    salary: {
      entry: [3, 6], early: [5, 10], mid: [9, 18], senior: [15, 30],
      confidence: 'good',
      note: 'Hospital and provider employers pay at the bottom of these ranges; funded health-tech companies pay at the top. The very high figures circulating online describe people five or more years in at product companies.',
    },
    cities: ['Bengaluru', 'Gurugram / Delhi NCR', 'Noida', 'Hyderabad', 'Mumbai', 'Pune', 'Chennai'],
    entryDifficulty: 'moderate but very crowded',
    hiringVolume: 'high',
    realityCheck: 'The most teachable role here — three to six months of serious practice genuinely gets interviews. It is also the most crowded, and your clinical degree will not shorten the skills work. It only helps you beat an equally skilled candidate for a healthcare-specific team.',
    degreeAccess: {
      MBBS:       ['open',   'Neutral, and a disadvantage at the first screen — nothing on a clinical CV signals data skills. It becomes an advantage only after you can prove them.'],
      BDS:        ['open',   'Same — neutral, and you must prove the technical skills first.'],
      BHMS_BAMS:  ['open',   'Neutral. The screen is skills-based, which in one sense works in your favour: nobody is checking which medical system you trained in.'],
      Pharmacy:   ['open',   'Neutral, with an edge for pharmaceutical and clinical trial data roles.'],
      Nursing:    ['open',   'Neutral at screening; clinical quality and outcomes analytics is where your background pays off.'],
      Biotech:    ['strong', 'The strongest of the health backgrounds here — bioinformatics and research data work are adjacent to what you already know.'],
    },
  },

  R12: { // Healthcare Consulting
    salary: {
      entry: [6, 8], early: [7.5, 12], mid: [9.3, 18], senior: [15, 27],
      confidence: 'moderate',
      note: 'These figures are for healthcare-specialist firms, which is the route actually open to you. The famous strategy firms pay far more but recruit from top business schools, not from clinical practice.',
    },
    cities: ['Hyderabad', 'Bengaluru', 'Pune', 'Gurugram / Delhi NCR', 'Mumbai', 'Noida'],
    entryDifficulty: 'hard, and requires relocating',
    hiringVolume: 'low',
    realityCheck: 'The best entry pay on this list, through a door most people do not know exists. Healthcare analytics firms accept health science degrees directly and need no MBA. The big strategy firms effectively do require one — do not aim there first.',
    degreeAccess: {
      MBBS:       ['strong', 'Healthcare analytics firms list medical and health sciences among accepted degrees. Your clinical judgement is the product.'],
      BDS:        ['open',   'Accepted under health sciences. Less common, but no stated barrier.'],
      BHMS_BAMS:  ['open',   'Accepted under the health-sciences umbrella at specialist firms, though not named specifically. Target healthcare analytics firms, not the big strategy houses.'],
      Pharmacy:   ['strong', 'Very well placed — pharmaceutical commercial analytics is the largest part of this market in India.'],
      Nursing:    ['open',   'Accepted, though less commonly hired than pharmacy and life-science graduates.'],
      Biotech:    ['strong', 'Named directly in accepted-field lists at the major healthcare analytics firms.'],
    },
  },
};

/** Pick the salary band to show, from the Q09 experience answer. */
export function bandFor(experienceOptionId) {
  return BAND_FOR_EXPERIENCE[experienceOptionId] || 'entry';
}

/** Format a range as a buyer would read it. */
export function formatRange([low, high]) {
  const f = n => (Number.isInteger(n) ? n : n.toFixed(1));
  return `₹${f(low)}–${f(high)} lakh a year`;
}
