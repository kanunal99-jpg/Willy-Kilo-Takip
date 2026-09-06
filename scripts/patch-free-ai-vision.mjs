import fs from 'node:fs';

const file = 'server.ts';
let source = fs.readFileSync(file, 'utf8');
const marker = '// FREE_AI_VISION_HARDENED';
if (source.includes(marker)) {
  console.log('Free AI vision hardening already applied.');
  process.exit(0);
}

const geminiReturn = "return res.json({ success: true, data: parseAiJson(response.text || '{}'), provider: 'gemini', model: 'gemini-3.6-flash' });";
const hardenedGeminiReturn = "return res.json({ success: true, data: parseAiJson(response.text || '{}'), provider: 'gemini', model: 'gemini-3.6-flash', visualAnalyzed: Boolean(imageBase64), fallback: false });";
if (source.includes(geminiReturn)) source = source.replace(geminiReturn, hardenedGeminiReturn);
else console.log('Free AI vision: Gemini response anchor already changed; continuing.');

const localFoodResponse = "res.json({ success: true, data: localFoodFallback(description, mealType), provider: 'local', model: 'deterministic-free-fallback', fallback: true });";
const hardenedLocalFoodResponse = "res.json({ success: true, data: localFoodFallback(description, mealType), provider: 'local', model: 'deterministic-free-fallback', fallback: true, visualAnalyzed: false, warning: imageBase64 ? 'Fotoğraf Gemini Free Tier ile analiz edilemedi; yerel ücretsiz tahmin kullanıldı. Fotoğraftaki ürünü görmüş gibi davranılmaz.' : 'Yerel ücretsiz tahmin kullanıldı.' });";
if (source.includes(localFoodResponse)) source = source.replace(localFoodResponse, hardenedLocalFoodResponse);
else console.log('Free AI vision: local response anchor already changed; continuing.');

const localFoodWarningResponse = "res.json({ success: true, data: localFoodFallback(description, mealType), provider: 'local', model: 'deterministic-free-fallback', fallback: true, warning: 'Gemini Free Tier kullanılamadı; yerel tahmin kullanıldı.' });";
const hardenedLocalFoodWarningResponse = "res.json({ success: true, data: localFoodFallback(description, mealType), provider: 'local', model: 'deterministic-free-fallback', fallback: true, visualAnalyzed: false, warning: imageBase64 ? 'Gemini Free Tier kullanılamadı; fotoğraf görsel olarak doğrulanamadı ve yerel ücretsiz tahmin kullanıldı.' : 'Gemini Free Tier kullanılamadı; yerel ücretsiz tahmin kullanıldı.' });";
if (source.includes(localFoodWarningResponse)) source = source.replace(localFoodWarningResponse, hardenedLocalFoodWarningResponse);
else console.log('Free AI vision: local warning anchor already changed; continuing.');

if (source.includes('// FREE_AI_POLICY_APPLIED')) source = source.replace('// FREE_AI_POLICY_APPLIED', '// FREE_AI_POLICY_APPLIED\n// FREE_AI_VISION_HARDENED');
else source += '\n// FREE_AI_VISION_HARDENED\n';
fs.writeFileSync(file, source, 'utf8');
console.log('Free photo recognition hardening completed without brittle anchors.');
