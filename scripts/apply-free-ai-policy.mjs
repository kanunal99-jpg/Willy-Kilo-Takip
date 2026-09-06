import fs from 'node:fs';

const file = 'server.ts';
let source = fs.readFileSync(file, 'utf8');

const marker = '// FREE_AI_POLICY_APPLIED';
if (source.includes(marker)) {
  console.log('Free AI policy already applied.');
  process.exit(0);
}

const anchor = "function hasOpenAI(): boolean {\n  return !!process.env.OPENAI_API_KEY?.trim();\n}";
const replacement = `function hasOpenAI(): boolean {
  // Paid OpenAI is deliberately disabled in the zero-cost production policy.
  return false;
}

const USE_GEMINI_FREE_TIER = process.env.USE_GEMINI_FREE_TIER?.trim().toLowerCase() === 'true';

// FREE_AI_POLICY_APPLIED
function localFoodFallback(description = '', mealType = 'lunch') {
  const text = String(description || '').toLocaleLowerCase('tr-TR');
  const presets = [
    { keys: ['salata'], name: 'Karışık salata', calories: 180, protein: 6, carbs: 18, fat: 10, fiber: 6 },
    { keys: ['çorba', 'corba'], name: 'Çorba', calories: 180, protein: 7, carbs: 24, fat: 6, fiber: 4 },
    { keys: ['pilav', 'pirinç', 'pirinc'], name: 'Pilav', calories: 260, protein: 5, carbs: 50, fat: 5, fiber: 2 },
    { keys: ['makarna'], name: 'Makarna', calories: 320, protein: 11, carbs: 55, fat: 8, fiber: 4 },
    { keys: ['tavuk', 'chicken'], name: 'Tavuk yemeği', calories: 330, protein: 38, carbs: 12, fat: 14, fiber: 2 },
    { keys: ['yumurta', 'omlet'], name: 'Yumurta / omlet', calories: 220, protein: 15, carbs: 4, fat: 16, fiber: 1 },
    { keys: ['yoğurt', 'yogurt'], name: 'Yoğurt', calories: 120, protein: 7, carbs: 9, fat: 6, fiber: 0 },
    { keys: ['sandviç', 'sandvic'], name: 'Sandviç', calories: 350, protein: 18, carbs: 42, fat: 13, fiber: 4 },
  ];
  const preset = presets.find((item) => item.keys.some((key) => text.includes(key))) || { name: 'Karışık öğün', calories: 420, protein: 22, carbs: 45, fat: 16, fiber: 6 };
  return {
    name: preset.name, calories: preset.calories, protein: preset.protein, carbs: preset.carbs, fat: preset.fat, fiber: preset.fiber,
    healthScore: 78, pros: ['Yerel ücretsiz tahmin hazırlandı'], cons: ['Porsiyon ve fotoğraf ayrıntısı doğrulanmadı'],
    advice: imageFallbackAdvice(description, mealType),
    breakdown: [{ item: preset.name, calories: preset.calories, amount: 'standart porsiyon' }],
  };
}

function imageFallbackAdvice(description, mealType) {
  if (!description) return 'Ücretsiz yerel modda fotoğrafın görsel içeriği analiz edilemiyor. Daha doğru hesap için yemeğin adını ve yaklaşık porsiyonunu yazabilirsin.';
  return \`${mealType === 'breakfast' ? 'Kahvaltı' : mealType === 'dinner' ? 'Akşam' : 'Öğün'} için yerel tahmin yapıldı. Porsiyon gramını yazarsan kalori tahminini daha iyi ölçekleyebilirim.\`;
}

function localCoachFallback(userProfile, todaySummary, userMessage) {
  const message = String(userMessage || '').trim();
  const text = message.toLocaleLowerCase('tr-TR');
  const target = Number(userProfile?.dailyCalorieTarget) || 0;
  const consumed = Number(todaySummary?.consumedCalories) || 0;
  const water = Number(todaySummary?.waterMl) || 0;
  const waterTarget = Number(userProfile?.waterTargetMl) || 2000;
  const remaining = target > 0 ? Math.max(0, target - consumed) : null;
  const waterRemaining = Math.max(0, waterTarget - water);

  // Deterministic intent router: different questions must produce different, relevant answers.
  if (/(kahve|kafein|çay|cay)/.test(text) && /(oruç|oruc|fast)/.test(text)) {
    return 'Oruç penceresinde sade kahve veya şekersiz çay genellikle kalori açısından çok düşük olduğu için tercih edilebilir; ancak süt, şeker ve şuruplar kalori ekler. Oruç protokolünün kuralları kişiden kişiye değişebileceği için kendi planını esas al. Baş dönmesi veya kötü hissetme olursa orucu zorlamama.';
  }

  if (/(kilo.*(yavaş|dur|verem)|yavaşladı|yavasladi|plato|plateau)/.test(text)) {
    const remainingText = remaining === null ? 'Günlük kalori hedefini belirlediysen' : \`Bugün yaklaşık \${remaining} kcal alanın kaldı\`;
    return \`Kilo kaybı yavaşladığında önce 1-2 haftalık gerçek trendi, porsiyonları ve günlük hareketi kontrol etmek iyi bir başlangıçtır. \${remainingText}. Aşırı kalori kısıtlamak yerine sürdürülebilir bir açık, yeterli protein, uyku ve düzenli hareketi koru.\`;
  }

  if (/(akşam|aksam).*(yemek|ne yemel|öğün|ogun)|akşam yemeğinde|aksam yemeginde/.test(text)) {
    return \`Akşam için sebze + yağsız/az yağlı protein + kontrollü bir karbonhidrat kombinasyonu iyi bir seçenek olabilir: örneğin tavuk veya yoğurt yanında bol salata ve küçük bir bulgur/patates porsiyonu. \${remaining !== null ? \`Bugünkü yaklaşık \${remaining} kcal kalan bütçene göre porsiyonu ayarlayabilirsin.\` : 'Porsiyonu açlık ve günlük hedefine göre ayarla.'}\`;
  }

  if (/(protein|proteini).*(hedef|tamam|tamamla|eksik)|hedef.*protein|protein.*nasıl/.test(text)) {
    return 'Protein hedefini tamamlamak için gün içine yayılmış yoğurt/kefir, yumurta, tavuk/hindi, balık, baklagiller veya uygun bir protein ürünü seçebilirsin. Tek öğünde yüklenmek yerine kalan ihtiyacı 1-2 öğüne bölmek daha sürdürülebilir olur.';
  }

  if (/(su|sıvı|sivi|hidrasyon|litre|ml)/.test(text)) {
    if (waterRemaining > 0) return \`Bugünkü su tüketimin hedefinin yaklaşık \${waterRemaining} ml altında. Bunu tek seferde içmek yerine gün içine bölerek tamamlamaya çalış.\`;
    return 'Bugünkü su hedefin dolmuş görünüyor. Gün boyunca susama durumuna göre düzenli içmeye devam et.';
  }

  if (/(kalori|kcal).*(kaç|kac|hesap|kalan|hedef)|kaç kalori|kac kalori/.test(text)) {
    if (remaining !== null) return \`Bugünkü hedefin \${target} kcal ve kayıtlı tüketimin \${consumed} kcal; yaklaşık \${remaining} kcal kaldı. Bu değer kayıtlı öğünlere dayanır, porsiyon kayıtlarının doğruluğu sonucu etkiler.\`;
    return 'Kalori hedefini hesaplamak için yaş, boy, kilo, aktivite düzeyi ve hedef gibi bilgileri kullanmak gerekir. Kayıtlı hedefin varsa günlük tüketimini onunla karşılaştırabilirsin.';
  }

  if (/(kahvaltı|kahvalti|sabah)/.test(text)) {
    return 'Dengeli bir kahvaltı için protein + lif + kontrollü karbonhidrat iyi bir temel: örneğin yumurta ve yoğurt yanında sebze ve tam tahıllı küçük bir porsiyon. Açlık durumuna göre miktarı ayarla.';
  }

  if (/(tatlı|tatli|şeker|seker|abur cubur|atıştır|atistir)/.test(text)) {
    return 'Tatlı isteğinde önce porsiyonu küçültmek ve öğüne protein/lif eklemek yardımcı olabilir. Meyve + yoğurt gibi daha doyurucu bir alternatif deneyebilir, tatlıyı tamamen yasaklamak yerine planlı küçük porsiyon tercih edebilirsin.';
  }

  if (/(spor|egzersiz|yürüyüş|yuruyus|antrenman|hareket)/.test(text)) {
    return 'Kilo yönetiminde düzenli hareket önemli. Başlangıç için günlük yürüyüş ve haftada birkaç gün kuvvet egzersizi iyi bir temel olabilir; mevcut kondisyonuna göre kademeli artır ve ağrı/rahatsızlık varsa zorlamadan profesyonel destek al.';
  }

  const context = remaining !== null ? \`Bugün yaklaşık \${remaining} kcal alanın kaldı.\` : 'Günlük kalori hedefin kayıtlı değil.';
  return \`Sorunu anladım: “\${message.slice(0, 140)}”. Bu konuda en güvenli başlangıç, günlük kayıtlarını ve hedeflerini birlikte değerlendirmek. \${context} Su tüketimini ve öğün kayıtlarını da güncel tutarsan daha anlamlı bir değerlendirme yapılabilir.\`;
}
`;

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
console.log('Production zero-cost AI policy applied: paid OpenAI disabled; Gemini enabled only with USE_GEMINI_FREE_TIER=true; intent-aware local fallbacks active.');
