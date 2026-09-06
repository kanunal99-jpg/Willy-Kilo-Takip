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
function localFoodFallback(description = '', mealType = 'lunch') {
  const text = String(description || '').toLocaleLowerCase('tr-TR');
  const presets = [
    { keys: ['yumurta', 'omlet'], name: 'Yumurta / omlet', calories: 220, protein: 15, carbs: 4, fat: 16, fiber: 1 },
    { keys: ['tavuk', 'chicken'], name: 'Tavuk yemeği', calories: 330, protein: 38, carbs: 12, fat: 14, fiber: 2 },
    { keys: ['pilav', 'pirinç', 'pirinc'], name: 'Pilav', calories: 260, protein: 5, carbs: 50, fat: 5, fiber: 2 },
    { keys: ['makarna'], name: 'Makarna', calories: 320, protein: 11, carbs: 55, fat: 8, fiber: 4 },
    { keys: ['çorba', 'corba', 'mercimek'], name: 'Çorba', calories: 180, protein: 7, carbs: 24, fat: 6, fiber: 4 },
    { keys: ['salata'], name: 'Karışık salata', calories: 180, protein: 6, carbs: 18, fat: 10, fiber: 6 },
    { keys: ['yoğurt', 'yogurt'], name: 'Yoğurt', calories: 120, protein: 7, carbs: 9, fat: 6, fiber: 0 },
    { keys: ['muz'], name: 'Muz', calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3 },
    { keys: ['elma'], name: 'Elma', calories: 95, protein: 1, carbs: 25, fat: 0, fiber: 4 },
  ];
  const preset = presets.find((item) => item.keys.some((key) => text.includes(key))) || { name: 'Karışık öğün', calories: 250, protein: 15, carbs: 28, fat: 9, fiber: 4 };
  const advice = !description
    ? 'Fotoğrafın görsel içeriği yerel modda doğrulanamadı. Yemeğin adını ve yaklaşık gram/ml miktarını yazarsan daha iyi tahmin yapılabilir.'
    : (mealType === 'breakfast' ? 'Kahvaltı' : mealType === 'dinner' ? 'Akşam' : 'Öğün') + ' için yerel tahmin yapıldı. Gram/ml verirsen değerler ölçeklenebilir.';
  return {
    name: preset.name, calories: preset.calories, protein: preset.protein, carbs: preset.carbs, fat: preset.fat, fiber: preset.fiber,
    healthScore: 78, confidence: preset.name === 'Karışık öğün' ? 'low' : 'medium', analysisMode: 'local-description',
    pros: ['Yerel ücretsiz tahmin hazırlandı'], cons: ['Porsiyon ve fotoğraf ayrıntısı doğrulanmadı'], advice,
    breakdown: [{ item: preset.name, calories: preset.calories, amount: 'standart porsiyon' }],
  };
}

function localCoachFallback(userProfile, todaySummary, userMessage) {
  const text = String(userMessage || '').trim();
  const lower = text.toLocaleLowerCase('tr-TR');
  const target = Number(userProfile?.dailyCalorieTarget) || 0;
  const consumed = Number(todaySummary?.consumedCalories) || 0;
  const remaining = target > 0 ? Math.max(0, target - consumed) : null;
  const water = Number(todaySummary?.waterMl) || 0;
  const waterTarget = Number(userProfile?.waterTargetMl) || 2000;
  if (/(su|sıvı|sivi|hidrasyon|litre|ml)/.test(lower)) return water < waterTarget ? 'Bugünkü su hedefinin yaklaşık ' + (waterTarget - water) + ' ml altındasın. Gün içine bölerek tamamlamaya çalış.' : 'Bugünkü su hedefin dolmuş görünüyor; susama durumuna göre düzenli içmeye devam et.';
  if (/(kalori|kcal)/.test(lower)) return remaining !== null ? 'Bugünkü hedefin ' + target + ' kcal; kayıtlı tüketimine göre yaklaşık ' + remaining + ' kcal kaldı. Porsiyon kayıtlarının doğruluğu sonucu etkiler.' : 'Kalori hedefin kayıtlı değil. Yaş, boy, kilo, aktivite ve hedef bilgileriyle hesaplanması gerekir.';
  if (/(protein)/.test(lower)) return 'Protein için yoğurt/kefir, yumurta, tavuk/hindi, balık veya baklagilleri gün içine yayabilirsin.';
  if (/(akşam|aksam)/.test(lower)) return remaining !== null ? 'Akşamı protein + sebze + kontrollü karbonhidrat şeklinde planlayabilirsin. Bugün yaklaşık ' + remaining + ' kcal alanın kaldı.' : 'Akşamı protein + sebze + kontrollü karbonhidrat şeklinde planlayabilirsin.';
  if (/(kahvaltı|kahvalti|sabah)/.test(lower)) return 'Dengeli kahvaltı için protein + lif + kontrollü karbonhidrat iyi bir temel olabilir; örneğin yumurta, yoğurt, sebze ve küçük bir tam tahıl porsiyonu.';
  if (/(tatlı|tatli|şeker|seker|abur cubur)/.test(lower)) return 'Tatlı isteğinde porsiyonu küçültmek ve öğüne protein/lif eklemek yardımcı olabilir. Meyve + yoğurt gibi bir alternatif deneyebilirsin.';
  if (/(spor|egzersiz|yürüyüş|yuruyus|antrenman)/.test(lower)) return 'Düzenli yürüyüş ve haftada birkaç gün kuvvet egzersizi kilo yönetimine yardımcı olabilir; kondisyonuna göre kademeli ilerle.';
  return 'Sorunu anladım: “' + text.slice(0, 140) + '”. Günlük kayıtlarını ve hedeflerini birlikte değerlendirmek en güvenli başlangıç. ' + (remaining !== null ? 'Bugün yaklaşık ' + remaining + ' kcal alanın kaldı.' : 'Günlük kalori hedefin kayıtlı değil.');
}
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
