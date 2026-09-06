const baseUrl = String(process.env.BASE_URL || 'https://willy-kilo-takip.onrender.com').replace(/\/$/, '');

const cases = [
  {
    name: 'kilo-plato',
    question: 'Kilo vermem neden son haftalarda yavaşladı?',
    mustInclude: [/kilo|açık|kalori|hareket|uyku|porsiyon|plato|metabol/i],
    forbidden: [/ödemi at|metabolizmanı canlandır/i],
  },
  {
    name: 'aksam-porsiyon',
    question: 'Akşam kavurma ve pilav yersem porsiyonu nasıl ayarlamalıyım?',
    mustInclude: [/kavurma|pilav|porsiyon|gram|kaşık|sebze|yoğurt/i],
    forbidden: [],
  },
  {
    name: 'protein',
    question: 'Protein hedefimi gün içinde pratik olarak nasıl tamamlarım?',
    mustInclude: [/protein|yoğurt|yumurta|tavuk|balık|baklagil/i],
    forbidden: [],
  },
  {
    name: 'su',
    question: 'Bugün su hedefime ulaşmak için nasıl bir plan yapayım?',
    mustInclude: [/su|hidrasyon|ml|litre|iç/i],
    forbidden: [],
  },
  {
    name: 'egzersiz',
    question: 'Kilo verirken haftalık egzersizimi nasıl düzenleyebilirim?',
    mustInclude: [/egzersiz|yürüyüş|antrenman|kuvvet|hareket/i],
    forbidden: [],
  },
  {
    name: 'uyku',
    question: 'Uyku düzenim bozuksa kilo verme hedefimi nasıl etkileyebilir?',
    mustInclude: [/uyku|dinlen|iştah|enerji|stres/i],
    forbidden: [],
  },
  {
    name: 'tatli',
    question: 'Akşam tatlı krizini daha kolay yönetmek için ne yapabilirim?',
    mustInclude: [/tatlı|şeker|atıştır|porsiyon|yoğurt|meyve|lif/i],
    forbidden: [],
  },
  {
    name: 'kahvalti',
    question: 'Kahvaltıda daha tok kalmak için neyi değiştirebilirim?',
    mustInclude: [/kahvalt|protein|lif|yumurta|yoğurt|sebze/i],
    forbidden: [],
  },
  {
    name: 'kaçamak',
    question: 'Bir öğünde hedefimden fazla yediysem ertesi gün ne yapmalıyım?',
    mustInclude: [/öğün|denge|normal|kalori|açlık|telafi/i],
    forbidden: [/aç kal|öğün atla/i],
  },
  {
    name: 'genel',
    question: 'Motivasyonumu korumak için günlük olarak neye odaklanmalıyım?',
    mustInclude: [/hedef|alışkan|küçük|takip|motivasyon|düzen/i],
    forbidden: [],
  },
];

const context = {
  userProfile: {
    dailyCalorieTarget: 2200,
    waterTargetMl: 2500,
    goal: 'weight_loss',
    activityLevel: 'moderate',
  },
  todaySummary: {
    consumedCalories: 1650,
    waterMl: 750,
  },
};

const responses = [];
const failures = [];

for (const test of cases) {
  const response = await fetch(`${baseUrl}/api/ai/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: test.question, ...context }),
  });
  const body = await response.json().catch(() => ({}));
  const reply = String(body?.reply || '').trim();

  if (!response.ok || !body?.success) failures.push(`${test.name}: HTTP ${response.status} / success=false`);
  if (body?.provider !== 'gemini' || body?.fallback !== false) failures.push(`${test.name}: not real Gemini (provider=${body?.provider}, fallback=${body?.fallback})`);
  if (!reply) failures.push(`${test.name}: empty reply`);
  if (test.mustInclude.length && !test.mustInclude.some((pattern) => pattern.test(reply))) failures.push(`${test.name}: answer does not visibly address its question topic`);
  for (const pattern of test.forbidden) if (pattern.test(reply)) failures.push(`${test.name}: contains an overconfident/unsafe phrase matching ${pattern}`);

  responses.push({ name: test.name, question: test.question, reply });
  console.log(`CASE ${test.name}: provider=${body?.provider} model=${body?.model} fallback=${body?.fallback}`);
  console.log(`REPLY ${reply.replace(/\s+/g, ' ').slice(0, 500)}`);
}

const normalized = responses.map((item) => item.reply.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim());
if (new Set(normalized).size !== normalized.length) failures.push('reply diversity: duplicate replies detected');

const nonWater = responses.filter((item) => item.name !== 'su').map((item) => item.reply.toLocaleLowerCase('tr-TR'));
const waterContextHits = nonWater.filter((reply) => /750\s*ml|2500\s*ml|su hedef/i.test(reply)).length;
if (waterContextHits >= 3) failures.push(`context bleed: water-specific 750/2500 ml context appeared in ${waterContextHits} non-water answers`);

const healthOverclaim = responses.filter((item) => item.name !== 'su').filter((item) => /ödemi at|metabolizmanı canlandır|kesinlikle kilo verdir|garanti kilo/i.test(item.reply)).length;
if (healthOverclaim > 0) failures.push(`health calibration: ${healthOverclaim} answer(s) contain overconfident health/weight claims`);

if (failures.length) {
  console.error('\nCOACH QUALITY SMOKE FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('\nCOACH QUALITY SMOKE PASS');
