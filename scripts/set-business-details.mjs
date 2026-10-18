// ============================================================
// Fills your business details into every public page at once.
//
// Edit the four values below, then run:
//   node scripts/set-business-details.mjs
//
// These details appear publicly and must match your Razorpay KYC.
// ============================================================
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DETAILS = {
  __BUSINESS_NAME__:  'Faseela Abdul Karim',
  __CONTACT_EMAIL__:  'drfaseelaabdulkareem@gmail.com',
  __CONTACT_PHONE__:  '+91 7560 893122',
  __CITY_STATE__:     'Kerala',
};

const TARGETS = [
  'src/config.js',
  ...readdirSync('public').filter(f => f.endsWith('.html')).map(f => join('public', f)),
];

let touched = 0;
let remaining = [];

for (const file of TARGETS) {
  let text = readFileSync(file, 'utf8');
  const before = text;

  for (const [token, value] of Object.entries(DETAILS)) {
    text = text.split(token).join(value);
  }

  if (text !== before) {
    writeFileSync(file, text);
    console.log(`  updated  ${file}`);
    touched++;
  }

  if (/__[A-Z_]+__/.test(text)) {
    remaining.push(file);
  }
}

console.log(`\n${touched} file(s) updated.`);

if (remaining.length) {
  console.error('\n✗ Placeholders still left in:');
  remaining.forEach(f => console.error(`    ${f}`));
  console.error('\nCheck the DETAILS block at the top of this script.');
  process.exit(1);
}

console.log('✓ No placeholders left. Safe to deploy.');
