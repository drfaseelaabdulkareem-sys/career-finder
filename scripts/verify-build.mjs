// ============================================================
// Build safety check.
// Fails loudly if worksheet content or a secret made it into the
// public bundle.
//
//   npm run build && npm run verify
//
// Pass a directory to scan something else:  node scripts/verify-build.mjs src
// ============================================================
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TARGET = process.argv[2] || 'dist';

// Each needle must be something that appears ONLY in the protected
// server files — never a property name the Results screen legitimately
// reads off the API response (e.g. `result.roadmap.days31to60` is fine
// in client code; the roadmap TEXT is what must not be there).
const FORBIDDEN = [
  // --- scoring internals ---
  ['scoring: dimension weights',  'dimensionScores'],
  ['scoring: role weight table',  'evidenceStatements'],
  ['scoring: friction copy',      'frictionStatements'],
  ['scoring: engine internals',   'calculateRoleScores'],
  ['scoring: hard-block rules',   'HARD_BLOCKS'],
  ['scoring: archetype rules',    'getArchetype'],

  // --- actual worksheet copy (canaries lifted from roles.js) ---
  ['role copy: entry job titles', 'Associate Product Manager'],
  ['role copy: advantage text',   'hard to teach'],
  ['role copy: roadmap steps',    'heartbeat trace of a career'],
  ['market data: salary bands',   'degreeAccess'],
  ['market data: reality checks', 'realityCheck:'],

  // --- secrets ---
  ['secret: session secret',      'SESSION_SECRET'],
  ['secret: razorpay webhook',    'RAZORPAY_WEBHOOK_SECRET'],
  ['secret: razorpay key secret', 'RAZORPAY_KEY_SECRET'],
  ['secret: brevo key',           'BREVO_API_KEY'],
  ['secret: admin password',      'ADMIN_PASSWORD'],
];

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

let files;
try {
  files = walk(TARGET).filter(f => /\.(js|jsx|css|html|map)$/.test(f));
} catch {
  console.error(`✗ No ${TARGET}/ directory. Run "npm run build" first.`);
  process.exit(1);
}

const leaks = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const [label, needle] of FORBIDDEN) {
    if (text.includes(needle)) leaks.push({ file, label, needle });
  }
}

console.log(`Scanned ${files.length} files in ${TARGET}/\n`);

if (leaks.length) {
  console.error('✗ PROTECTED CONTENT LEAKED INTO THE PUBLIC BUNDLE:\n');
  for (const l of leaks) {
    console.error(`  ${l.file}\n    ${l.label} — found "${l.needle}"\n`);
  }
  console.error('Do not deploy. Anything in the bundle is downloadable by anyone.');
  process.exit(1);
}

console.log('✓ No role profiles, roadmaps, scoring logic or secrets found.');
