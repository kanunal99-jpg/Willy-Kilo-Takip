import fs from 'node:fs';

const file = 'server.ts';
let source = fs.readFileSync(file, 'utf8');

if (source.includes('function localFoodAnalysisFallback(')) {
  console.log('Local food fallback already present.');
  process.exit(0);
}

const helper = `
function localFoodAnalysisFallback(description = '', mealType = 'lunch') {
  const text = String(description || '').toLocaleLowerCase('tr-TR');
  const entries = [
    { keys: ['yumurta', 'omlet'], name: 'Yumurta / Omlet', calories: 180, protein: 13, carbs: 2, fat: 13, fiber: 0, healthScore: 88, pros: ['İyi protein kaynağı'], cons: ['Porsiyona göre yağ miktarı değişebilir'], advice: 'Pişirme yağını ve eklenen malzemeleri ayrıca hesaba katın.' },
    { keys: ['tavuk', 'ızgara tavuk', 'tavuk göğsü'], name: 'Tavuk Göğsü', calories: 250, protein: 46, carbs: 0, fat: 6, fiber: 0, healthScore: 92, pros: ['Yüksek protein'], cons: ['Porsiyon büyüdükçe kalori artar'], advice: 'Yanına sebze ekleyerek öğünü dengeli tutabilirsiniz.' },
    { keys: ['pilav', 'pirinç'], name: 'Pirinç Pilavı', calories: 260, protein: 5, carbs: 50, fat: 5, fiber: 1, healthScore: 74, pros: ['Enerji sağlar'], cons: ['Karbonhidrat yoğun'], advice: 'Porsiyonu ölçerek protein ve sebze ile dengeleyin.' },
    { keys: ['makarna'], name: 'Makarna', calories: 300, protein: 10, carbs: 55, fat: 6, fiber: 3, healthScore: 76, pros: ['Pratik enerji kaynağı'], cons: ['Sos ve yağ kaloriyi yükseltebilir'], advice: 'Sos ve yağ miktarını kontrol edin; yanına protein ve sebze ekleyin.' },
    { keys: ['mercimek çorba', 'mercimek corba', 'mercimek'], name: 'Mercimek Çorbası', calories: 180, protein: 9, carbs: 27, fat: 5, fiber: 7, healthScore: 90, pros: ['Lif ve bitkisel protein içerir'], cons: ['Ekmeğe göre toplam karbonhidrat değişir'], advice: 'Limon ve bol yeşillikle tamamlayabilirsiniz.' },
    { keys: ['salata'], name: 'Karışık Salata', calories: 120, protein: 3, carbs: 12, fat: 7, fiber: 5, healthScore: 95, pros: ['Lif açısından zengin'], cons: ['Sos ve yağ kaloriyi artırabilir'], advice: 'Yağ miktarını ölçerek ekleyin.' },
    { keys: ['yoğurt', 'yogurt'], name: 'Yoğurt', calories: 120, protein: 7, carbs: 9, fat: 6, fiber: 0, healthScore: 90, pros: ['Protein ve kalsiyum kaynağı'], cons: ['Şekerli çeşitlerde kalori artabilir'], advice: 'Sade yoğurt tercih edin ve porsiyonu ölçün.' },
    { keys: ['muz'], name: 'Muz', calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, healthScore: 88, pros: ['Potasyum ve lif içerir'], cons: ['Doğal şeker içerir'], advice: 'Ara öğünde porsiyon kontrollü tüketebilirsiniz.' },
    { keys: ['elma'], name: 'Elma', calories: 95, protein: 1, carbs: 25, fat: 0, fiber: 4, healthScore: 93, pros: ['Lif içerir'], cons: ['Doğal şeker içerir'], advice: 'Kabuklu tüketmek lif alımını artırır.' },
  ];
  const found = entries.find((entry) => entry.keys.some((key) => text.includes(key)));
  if (found) return { ...found, breakdown: [{ item: found.name, calories: found.calories, amount: '1 standart porsiyon' }], confidence: 'medium', analysisMode: 'local-description', note: 'Ücretsiz yerel analiz. Değerler yaklaşık olup porsiyona göre değişebilir.' };
  return {
    name: text ? text.slice(0, 80) : 'Fotoğraftaki yemek',
    calories: 250,
    protein: 15,
    carbs: 28,
    fat: 9,
    fiber: 4,
    healthScore: 80,
    pros: ['Analiz sonucu güvenli varsayılan olarak oluşturuldu'],
    cons: ['Yemeğin türü ve porsiyonu doğrulanmadı'],
    advice: 'Gemini kotası kullanılamadığı için bu sonuç yaklaşık yerel tahmindir. Yemeğin adını veya porsiyonunu yazarak sonucu netleştirin.',
    breakdown: [{ item: 'Yaklaşık standart öğün', calories: 250, amount: '1 porsiyon' }],
    confidence: 'low',
    analysisMode: 'local-safe-default',
    note: 'Ücretsiz yerel güvenli varsayılan. Fotoğraf görsel olarak doğrulanamadığı için kesin besin değeri değildir.',
  };
}
`;

const marker = "function parseAiJson(text: string): any {";
if (!source.includes(marker)) throw new Error('parseAiJson marker not found');
source = source.replace(marker, helper + "\n" + marker);

const routeStart = source.indexOf("app.post('/api/ai/analyze-food'");
const routeEnd = source.indexOf("\n\napp.post('/api/ai/coach'", routeStart);
if (routeStart < 0 || routeEnd < 0) throw new Error('analyze-food route boundaries not found');

const newRoute = `app.post('/api/ai/analyze-food', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', description, mealType = 'lunch' } = req.body || {};
    const safeDescription = String(description || '').trim().slice(0, 500);
    const promptText = \\`Sen dünya standartlarında bir AI Beslenme Uzmanı ve Diyetisyensin. Kullanıcı "\\${mealType}" öğünü için bir yemek fotoğrafı veya açıklaması gönderdi. \\${safeDescription ? \\`Kullanıcı notu: "\\${safeDescription}".\\` : ''}\\n\\nYemeği detaylıca analiz et ve sadece geçerli JSON nesnesi olarak yanıt ver.\\nFormat: {"name":"Yemeğin Türkçe adı","calories":420,"protein":32,"carbs":35,"fat":16,"fiber":6,"healthScore":90,"pros":["İyi protein kaynağı"],"cons":["Orta sodyum"],"advice":"1-2 cümlelik kişisel tavsiye","breakdown":[{"item":"Malzeme","calories":250,"amount":"150g"}]}\\`;
    const ai = getGemini();
    if (ai) {
      try {
        const contents: any[] = [];
        if (imageBase64) contents.push({ inlineData: { mimeType, data: String(imageBase64).replace(/^data:[^;]+;base64,/, '') } });
        contents.push(promptText);
        const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents, config: { responseMimeType: 'application/json' } });
        const data = parseAiJson(response.text || '{}');
        return res.json({ success: true, data, provider: 'gemini', model: 'gemini-3.6-flash', fallback: false, analysisMode: 'cloud-ai' });
      } catch (err: any) {
        console.error(\`AI Food Gemini failed\\${isGeminiQuotaError(err) ? ' (quota/billing)' : ''}:\`, err?.message || err);
      }
    }

    // Zero-cost policy: never require a paid provider. Gemini failure is converted into a truthful local result.
    const fallback = localFoodAnalysisFallback(safeDescription, mealType);
    console.log(\`AI Food local fallback mode=\\${fallback.analysisMode} reason=\\${ai ? 'gemini-unavailable' : 'gemini-not-configured'}\`);
    return res.json({ success: true, data: fallback, provider: 'local', model: 'local-safe-food-fallback-v1', fallback: true, analysisMode: fallback.analysisMode });
  } catch (err: any) {
    console.error('AI Food Analysis Error:', err);
    const fallback = localFoodAnalysisFallback('', 'lunch');
    return res.json({ success: true, data: fallback, provider: 'local', model: 'local-safe-food-fallback-v1', fallback: true, analysisMode: fallback.analysisMode });
  }
});`;

source = source.slice(0, routeStart) + newRoute + source.slice(routeEnd);
fs.writeFileSync(file, source, 'utf8');
console.log('Local food analysis fallback patch applied.');
