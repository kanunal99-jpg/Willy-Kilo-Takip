import fs from 'node:fs';

const file = 'server.ts';
let source = fs.readFileSync(file, 'utf8');

const marker = '// FREE_AI_POLICY_APPLIED';
if (source.includes(marker)) {
  console.log('Free AI policy already applied.');
  process.exit(0);
}

const anchor = "function hasOpenAI(): boolean {\n  return !!process.env.OPENAI_API_KEY?.trim();\n}";
const replacement = `function hasOpenAI(): boolean {\n  // Paid OpenAI is deliberately disabled in the zero-cost production policy.\n  return false;\n}\n\nconst USE_GEMINI_FREE_TIER = process.env.USE_GEMINI_FREE_TIER?.trim().toLowerCase() === 'true';\n\n// FREE_AI_POLICY_APPLIED\nfunction localFoodFallback(description = '', mealType = 'lunch') {\n  const text = String(description || '').toLocaleLowerCase('tr-TR');\n  const presets = [\n    { keys: ['salata', 'salata'], name: 'Karışık salata', calories: 180, protein: 6, carbs: 18, fat: 10, fiber: 6 },\n    { keys: ['çorba', 'corba'], name: 'Çorba', calories: 180, protein: 7, carbs: 24, fat: 6, fiber: 4 },\n    { keys: ['pilav', 'pirinç', 'pirinc'], name: 'Pilav', calories: 260, protein: 5, carbs: 50, fat: 5, fiber: 2 },\n    { keys: ['makarna'], name: 'Makarna', calories: 320, protein: 11, carbs: 55, fat: 8, fiber: 4 },\n    { keys: ['tavuk', 'chicken'], name: 'Tavuk yemeği', calories: 330, protein: 38, carbs: 12, fat: 14, fiber: 2 },\n    { keys: ['yumurta', 'omlet'], name: 'Yumurta / omlet', calories: 220, protein: 15, carbs: 4, fat: 16, fiber: 1 },\n    { keys: ['yoğurt', 'yogurt'], name: 'Yoğurt', calories: 120, protein: 7, carbs: 9, fat: 6, fiber: 0 },\n    { keys: ['sandviç', 'sandvic'], name: 'Sandviç', calories: 350, protein: 18, carbs: 42, fat: 13, fiber: 4 },\n  ];\n  const preset = presets.find((item) => item.keys.some((key) => text.includes(key))) || { name: 'Karışık öğün', calories: 420, protein: 22, carbs: 45, fat: 16, fiber: 6 };\n  return {\n    name: preset.name, calories: preset.calories, protein: preset.protein, carbs: preset.carbs, fat: preset.fat, fiber: preset.fiber,\n    healthScore: 78, pros: ['Yerel ücretsiz tahmin hazırlandı'], cons: ['Porsiyon ve fotoğraf ayrıntısı doğrulanmadı'],\n    advice: imageFallbackAdvice(description, mealType),\n    breakdown: [{ item: preset.name, calories: preset.calories, amount: 'standart porsiyon' }],\n  };\n}\n\nfunction imageFallbackAdvice(description, mealType) {\n  if (!description) return 'Ücretsiz yerel modda fotoğrafın görsel içeriği analiz edilemiyor. Daha doğru hesap için yemeğin adını ve yaklaşık porsiyonunu yazabilirsin.';\n  return \`\${mealType === 'breakfast' ? 'Kahvaltı' : mealType === 'dinner' ? 'Akşam' : 'Öğün'} için yerel tahmin yapıldı. Porsiyon gramını yazarsan kalori tahminini daha iyi ölçekleyebilirim.\`;\n}\n\nfunction localCoachFallback(userProfile, todaySummary, userMessage) {\n  const target = Number(userProfile?.dailyCalorieTarget) || 0;\n  const consumed = Number(todaySummary?.consumedCalories) || 0;\n  const water = Number(todaySummary?.waterMl) || 0;\n  const waterTarget = Number(userProfile?.waterTargetMl) || 2000;\n  const remaining = target > 0 ? Math.max(0, target - consumed) : null;\n  const tips = [];\n  if (remaining !== null && remaining < 300) tips.push('Kalan kalorini hafif ve protein ağırlıklı bir öğünle kullan.');\n  else if (remaining !== null) tips.push(\`Bugün yaklaşık \${remaining} kcal alanın kaldı; dengeli bir öğün planlayabilirsin.\`);\n  if (water < waterTarget) tips.push(\`Su hedefinin yaklaşık \${Math.round(waterTarget - water)} ml altındasın.\`);\n  else tips.push('Su hedefin iyi gidiyor; aynı tempoyu koru.');\n  return \`Willy ücretsiz yerel modda yanında. “\${userMessage.slice(0, 120)}” için hızlı değerlendirmem: \${tips.join(' ')} Küçük ve sürdürülebilir adımlar en iyisi.\`;\n}\n`;

if (!source.includes(anchor)) throw new Error('Free AI policy anchor not found: hasOpenAI');
source = source.replace(anchor, replacement);

const geminiAnchor = "const apiKey = process.env.GEMINI_API_KEY?.trim();\n  if (!apiKey) return null;";
const geminiReplacement = "const apiKey = process.env.GEMINI_API_KEY?.trim();\n  if (!apiKey || !USE_GEMINI_FREE_TIER) return null;";
if (!source.includes(geminiAnchor)) throw new Error('Free AI policy anchor not found: getGemini');
source = source.replace(geminiAnchor, geminiReplacement);

const foodNoProvider = "if (!hasOpenAI()) return res.status(503).json({ success: false, error: 'AI sağlayıcısı yapılandırılmamış.', code: 'AI_NOT_CONFIGURED' });";
const foodFallback = "if (!hasOpenAI()) return res.json({ success: true, data: localFoodFallback(description, mealType), provider: 'local', model: 'deterministic-free-fallback', fallback: true });";
if (!source.includes(foodNoProvider)) throw new Error('Free AI policy anchor not found: food fallback');
source = source.replace(foodNoProvider, foodFallback);

const foodThrow = "if (!hasOpenAI()) throw err;";
const foodThrowReplacement = "if (!hasOpenAI()) return res.json({ success: true, data: localFoodFallback(description, mealType), provider: 'local', model: 'deterministic-free-fallback', fallback: true, warning: 'Gemini Free Tier kullanılamadı; yerel tahmin kullanıldı.' });";
if (!source.includes(foodThrow)) throw new Error('Free AI policy anchor not found: food quota fallback');
source = source.replace(foodThrow, foodThrowReplacement);

const coachNoProvider = "if (!hasOpenAI()) return res.status(503).json({ success: false, error: 'AI sağlayıcısı yapılandırılmamış.', code: 'AI_NOT_CONFIGURED' });";
const coachFallback = "if (!hasOpenAI()) return res.json({ success: true, reply: localCoachFallback(userProfile, todaySummary, userMessage), provider: 'local', model: 'deterministic-free-fallback', fallback: true });";
if (!source.includes(coachNoProvider)) throw new Error('Free AI policy anchor not found: coach fallback');
source = source.replace(coachNoProvider, coachFallback);

const coachThrow = "if (!hasOpenAI() && lastError) throw lastError;";
const coachThrowReplacement = "if (!hasOpenAI() && lastError) return res.json({ success: true, reply: localCoachFallback(userProfile, todaySummary, userMessage), provider: 'local', model: 'deterministic-free-fallback', fallback: true, warning: 'Gemini Free Tier kullanılamadı; yerel koç kullanıldı.' });";
if (!source.includes(coachThrow)) throw new Error('Free AI policy anchor not found: coach quota fallback');
source = source.replace(coachThrow, coachThrowReplacement);

fs.writeFileSync(file, source, 'utf8');
console.log('Production zero-cost AI policy applied: paid OpenAI disabled; Gemini enabled only with USE_GEMINI_FREE_TIER=true; local fallbacks active.');
