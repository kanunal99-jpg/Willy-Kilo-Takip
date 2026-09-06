import fs from 'node:fs';

const file = 'scripts/apply-free-ai-policy.mjs';
let source = fs.readFileSync(file, 'utf8');
const startMarker = 'const replacement = `';
const endMarker = '`;\n\nif (!source.includes(anchor))';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start + startMarker.length);
if (start === -1 || end === -1) throw new Error('Free AI policy replacement template markers not found');

const prefix = source.slice(0, start + startMarker.length);
const body = source.slice(start + startMarker.length, end);
const suffix = source.slice(end);
const repaired = body.replace(/(?<!\\)\$\{/g, '\\\${');

if (repaired !== body) {
  fs.writeFileSync(file, prefix + repaired + suffix, 'utf8');
  console.log('Free AI policy template interpolation repaired.');
} else {
  console.log('Free AI policy template already safe.');
}
