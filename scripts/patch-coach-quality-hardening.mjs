import fs from 'node:fs';

const file = 'server.ts';
let source = fs.readFileSync(file, 'utf8');

const marker = '// COACH_QUALITY_HARDENING_APPLIED';
if (source.includes(marker)) {
  console.log('Coach quality hardening already applied.');
  process.exit(0);
}

const helper = `
function buildCoachContext(safeMessage: string, userProfile: any = {}, todaySummary: any = {}) {
  const q = safeMessage.toLocaleLowerCase('tr-TR');
  const waterQuestion = /\\bsu\\b|hidrasyon|sıvı|içme|\\bml\\b|litre/.test(q);
  const foodQuestion = /kalori|kcal|porsiyon|öğün|yemek|kahvalt|akşam|tatlı|protein|karbonhidrat|yağ|lif|kaçamak/.test(q);
  const weightQuestion = /kilo|zayıf|zayıfl|plato|hedef/.test(q);
  const profile: any = {};
  if (userProfile?.goal) profile.goal = userProfile.goal;
  if (weightQuestion) {
    if (userProfile?.currentWeightKg != null) profile.currentWeightKg = userProfile.currentWeightKg;
    if (userProfile?.targetWeightKg != null) profile.targetWeightKg = userProfile.targetWeightKg;
  }
  if (foodQuestion && userProfile?.dailyCalorieTarget != null) profile.dailyCalorieTarget = userProfile.dailyCalorieTarget;
  if (waterQuestion && userProfile?.waterTargetMl != null) profile.waterTargetMl = userProfile.waterTargetMl;
  const today: any = {};
  if (foodQuestion && todaySummary?.consumedCalories != null) today.consumedCalories = todaySummary.consumedCalories;
  if (waterQuestion && todaySummary?.waterMl != null) today.waterMl = todaySummary.waterMl;
  return { profile, today };
}

function sanitizeCoachReply(reply: string): string {
  return String(reply || '')
    .replace(/\\baç\\s+kal\\b/gi, 'normal beslenme düzenini koru')
    .replace(/\\böğün\\s+atla\\b/gi, 'öğün atlama')
    .replace(/ödemi at(?:manı|mak)?/gi, 'ödem konusunda kesin bir sonuç vaat etme')
    .replace(/metabolizmanı canlandır(?:mak)?/gi, 'metabolizma üzerinde kesin sonuç vaat etme')
    .replace(/kesinlikle kilo verdir/gi, 'kilo kaybını garanti etmez')
    .replace(/garanti kilo/gi, 'garantili kilo')
    .trim();
}

// COACH_QUALITY_HARDENING_APPLIED
`;

const parseMarker = 'function parseAiJson(text: string): any {';
if (!source.includes(parseMarker)) throw new Error('Coach quality helper insertion marker not found');
source = source.replace(parseMarker, helper + '\n' + parseMarker);

const promptRegex = /    const systemPrompt = `Sen Willy Kilo Takip uygulamasının kişisel beslenme koçusun\.[^\n]*`;/;
if (!promptRegex.test(source)) throw new Error('Coach systemPrompt anchor not found');
const promptReplacement = `    const coachContext = buildCoachContext(safeMessage, userProfile, todaySummary);
    const systemPrompt = \`Sen Willy Kilo Takip uygulamasının kişisel beslenme koçusun. Türkçe, pratik ve sürdürülebilir öneriler ver. Tıbbi tanı koyma ve kesin/garantili sağlık sonucu iddia etme. Kullanıcı profilini ve bugünün özetini yalnızca mevcut soruyla doğrudan ilgili alanlarda kullan; ilgisiz günlük metrikleri kesinlikle cevaba taşıma. Su metriklerini yalnızca su/hidrasyon sorularında, kalori metriklerini yalnızca beslenme/porsiyon sorularında kullan. Nedensel sağlık iddialarını kesin dille kurma; belirsizlik varsa açıkça belirt. Kullanıcıya uygulanabilir porsiyon, alışkanlık ve takip önerileri sun. Profil: \${JSON.stringify(coachContext.profile)}. Bugün: \${JSON.stringify(coachContext.today)}. Kullanıcı sorusu: \${JSON.stringify(safeMessage)}\`;`;
source = source.replace(promptRegex, promptReplacement);

const replyAnchor = "            const reply = String(response.text || '').trim();";
if (!source.includes(replyAnchor)) throw new Error('Coach reply sanitization anchor not found');
source = source.replace(replyAnchor, "            const reply = sanitizeCoachReply(String(response.text || '').trim());");

fs.writeFileSync(file, source, 'utf8');
console.log('Coach context isolation + reply safety hardening applied.');
