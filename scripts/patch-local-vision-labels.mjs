import fs from 'node:fs';

const file = 'server.ts';
let source = fs.readFileSync(file, 'utf8');
const marker = '  const found = entries.find((entry) => entry.keys.some((key) => text.includes(key)));';
if (!source.includes(marker)) {
  console.log('Local vision label mapping already applied or marker unavailable.');
  process.exit(0);
}

const replacement = [
  "  const visionEntries = [",
  "    { keys: ['cheeseburger'], name: 'Cheeseburger', calories: 520, protein: 27, carbs: 40, fat: 27, fiber: 2, healthScore: 55, pros: ['Protein içerir'], cons: ['Enerji ve yağ yoğun olabilir'], advice: 'Porsiyonu ve sosları kontrol edin.' },",
  "    { keys: ['pizza'], name: 'Pizza', calories: 700, protein: 30, carbs: 80, fat: 28, fiber: 4, healthScore: 58, pros: ['Protein ve karbonhidrat içerir'], cons: ['Porsiyona göre kalori hızla artabilir'], advice: 'Sebzeli ve ölçülü porsiyon tercih edin.' },",
  "    { keys: ['sushi'], name: 'Sushi', calories: 450, protein: 20, carbs: 65, fat: 10, fiber: 3, healthScore: 78, pros: ['Protein ve karbonhidrat içerir'], cons: ['Soslar sodyum ve kaloriyi artırabilir'], advice: 'Sos miktarını sınırlayın.' },",
  "    { keys: ['bread'], name: 'Ekmek', calories: 80, protein: 3, carbs: 15, fat: 1, fiber: 1, healthScore: 72, pros: ['Karbonhidrat kaynağı'], cons: ['Porsiyon kolay büyüyebilir'], advice: 'Dilim sayısını ölçün.' },",
  "    { keys: ['couscous'], name: 'Kuskus', calories: 220, protein: 7, carbs: 45, fat: 1, fiber: 3, healthScore: 75, pros: ['Enerji kaynağı'], cons: ['Karbonhidrat ağırlıklı'], advice: 'Protein ve sebze ile dengeleyin.' },",
  "    { keys: ['coffee', 'cappuccino'], name: 'Kahve / Cappuccino', calories: 90, protein: 4, carbs: 8, fat: 4, fiber: 0, healthScore: 82, pros: ['Düşük-orta kalorili olabilir'], cons: ['Şeker ve şurup kaloriyi artırır'], advice: 'Şeker ve şurup eklerini belirtin.' },",
  "    { keys: ['juice'], name: 'Meyve Suyu', calories: 110, protein: 1, carbs: 26, fat: 0, fiber: 1, healthScore: 70, pros: ['Sıvı karbonhidrat kaynağı'], cons: ['Lif düşük olabilir'], advice: 'Meyvenin kendisini tercih edin.' },",
  "    { keys: ['fruit'], name: 'Meyve', calories: 90, protein: 1, carbs: 22, fat: 0, fiber: 3, healthScore: 90, pros: ['Lif ve mikro besin içerir'], cons: ['Tür ve porsiyon sonucu değiştirir'], advice: 'Meyvenin adını ve gramını yazın.' },",
  "    { keys: ['vegetable'], name: 'Sebze', calories: 80, protein: 3, carbs: 12, fat: 2, fiber: 5, healthScore: 94, pros: ['Lif açısından zengin'], cons: ['Pişirme yağı kaloriyi artırabilir'], advice: 'Yağ miktarını ayrıca hesaba katın.' },",
  "    { keys: ['cake'], name: 'Kek', calories: 320, protein: 5, carbs: 42, fat: 15, fiber: 1, healthScore: 55, pros: ['Enerji sağlar'], cons: ['Şeker ve yağ yoğun olabilir'], advice: 'Küçük porsiyon tercih edin.' },",
  "    { keys: ['cookie'], name: 'Kurabiye', calories: 160, protein: 2, carbs: 22, fat: 7, fiber: 1, healthScore: 52, pros: ['Pratik atıştırmalık'], cons: ['Kalori yoğun'], advice: 'Adet ve gram bilgisini ekleyin.' },",
  "    { keys: ['hot dog'], name: 'Hot Dog', calories: 290, protein: 11, carbs: 25, fat: 16, fiber: 1, healthScore: 50, pros: ['Protein içerir'], cons: ['İşlenmiş et ve sodyum yüksek olabilir'], advice: 'Porsiyonu sınırlayın.' },",
  "    { keys: ['pho'], name: 'Pho', calories: 420, protein: 25, carbs: 55, fat: 10, fiber: 3, healthScore: 80, pros: ['Protein ve sıvı içerir'], cons: ['Sodyum yüksek olabilir'], advice: 'Et ve noodle miktarını belirtin.' },",
  "    { keys: ['gelato'], name: 'Gelato', calories: 220, protein: 4, carbs: 28, fat: 10, fiber: 0, healthScore: 58, pros: ['Porsiyon kontrollü tatlı olabilir'], cons: ['Şeker ve yağ içerir'], advice: 'Toplam gramı ölçün.' },",
  "    { keys: ['cola'], name: 'Kola', calories: 140, protein: 0, carbs: 35, fat: 0, fiber: 0, healthScore: 35, pros: ['Hızlı enerji sağlar'], cons: ['Eklenmiş şeker içerir'], advice: 'Şekersiz alternatifleri değerlendirin.' },",
  '  ];',
  `  const found = [...entries, ...visionEntries].find((entry) => entry.keys.some((key) => text.includes(key)));`,
].join('\n');
source = source.replace(marker, replacement);
fs.writeFileSync(file, source, 'utf8');
console.log('Local on-device vision label nutrition mapping PASS.');
