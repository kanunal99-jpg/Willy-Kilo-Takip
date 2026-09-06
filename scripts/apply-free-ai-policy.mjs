import fs from 'node:fs';

const file = 'server.ts';
let source = fs.readFileSync(file, 'utf8');
const marker = '// FREE_AI_POLICY_APPLIED';

if (source.includes(marker)) {
  console.log('Free AI policy already applied.');
  process.exit(0);
}

const hasOpenAIAnchor = "function hasOpenAI(): boolean {\n  return !!process.env.OPENAI_API_KEY?.trim();\n}";
const hasOpenAIReplacement = `function hasOpenAI(): boolean {
  // Paid OpenAI is deliberately disabled by the zero-cost production policy.
  return false;
}

const USE_GEMINI_FREE_TIER = process.env.USE_GEMINI_FREE_TIER?.trim().toLowerCase() === 'true';

// FREE_AI_POLICY_APPLIED
`;

if (!source.includes(hasOpenAIAnchor)) throw new Error('Free AI policy anchor not found: hasOpenAI');
source = source.replace(hasOpenAIAnchor, hasOpenAIReplacement);

const geminiAnchor = "const apiKey = process.env.GEMINI_API_KEY?.trim();\n  if (!apiKey) return null;";
const geminiReplacement = "const apiKey = process.env.GEMINI_API_KEY?.trim();\n  if (!apiKey || !USE_GEMINI_FREE_TIER) return null;";
if (!source.includes(geminiAnchor)) throw new Error('Free AI policy anchor not found: getGemini');
source = source.replace(geminiAnchor, geminiReplacement);

const foodNoProvider = "if (!hasOpenAI()) return res.status(503).json({ success: false, error: 'AI sağlayıcısı yapılandırılmamış.', code: 'AI_NOT_CONFIGURED' });";
const foodFallback = "if (!hasOpenAI()) return res.json({ success: true, data: localFoodFallback(description, mealType), provider: 'local', model: 'deterministic-free-fallback', fallback: true });";
if (source.includes(foodNoProvider)) source = source.replace(foodNoProvider, foodFallback);
else console.log('Free AI policy: food no-provider route already changed; continuing.');

const foodThrow = "if (!hasOpenAI()) throw err;";
const foodThrowReplacement = "if (!hasOpenAI()) return res.json({ success: true, data: localFoodFallback(description, mealType), provider: 'local', model: 'deterministic-free-fallback', fallback: true, warning: 'Gemini Free Tier kullanılamadı; yerel tahmin kullanıldı.' });";
if (source.includes(foodThrow)) source = source.replace(foodThrow, foodThrowReplacement);
else console.log('Free AI policy: food quota anchor already changed; continuing.');

const coachNoProvider = "if (!hasOpenAI()) return res.status(503).json({ success: false, error: 'AI sağlayıcısı yapılandırılmamış.', code: 'AI_NOT_CONFIGURED' });";
const coachFallback = "if (!hasOpenAI()) return res.json({ success: true, reply: localCoachFallback(userProfile, todaySummary, userMessage), provider: 'local', model: 'deterministic-free-fallback', fallback: true });";
if (source.includes(coachNoProvider)) source = source.replace(coachNoProvider, coachFallback);
else console.log('Free AI policy: coach no-provider route already changed; continuing.');

const coachThrow = "if (!hasOpenAI() && lastError) throw lastError;";
const coachThrowReplacement = "if (!hasOpenAI() && lastError) return res.json({ success: true, reply: localCoachFallback(userProfile, todaySummary, userMessage), provider: 'local', model: 'deterministic-free-fallback', fallback: true, warning: 'Gemini Free Tier kullanılamadı; yerel koç kullanıldı.' });";
if (source.includes(coachThrow)) source = source.replace(coachThrow, coachThrowReplacement);
else console.log('Free AI policy: coach quota anchor already changed; continuing.');

fs.writeFileSync(file, source, 'utf8');
console.log('Production zero-cost AI policy applied safely and idempotently.');
