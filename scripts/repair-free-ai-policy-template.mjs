import fs from 'node:fs';

const file = 'scripts/apply-free-ai-policy.mjs';
const source = fs.readFileSync(file, 'utf8');

// The AI policy patch is now a direct, idempotent source transformation and no longer
// embeds a nested template literal that needs interpolation escaping. Keep this repair
// step as a validation/no-op so older build chains remain compatible.
if (!source.includes("const file = 'server.ts';")) {
  throw new Error('Free AI policy script is malformed: server target missing');
}
if (!source.includes('// FREE_AI_POLICY_APPLIED')) {
  throw new Error('Free AI policy script is malformed: idempotent marker missing');
}

console.log('Free AI policy template validation PASS.');
