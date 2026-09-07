import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.RENDER ? (Number(process.env.PORT) || 10000) : (process.env.NODE_ENV === 'production' && process.env.PORT && process.env.PORT !== '8080' ? Number(process.env.PORT) : 3000);

// Capacitor Android runs from a native localhost origin and calls the Render API cross-origin.
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  if (origin === 'capacitor://' || origin === 'http://localhost' || origin === 'https://localhost' || origin.startsWith('capacitor://') || origin.startsWith('http://localhost') || origin.startsWith('https://localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const SYNC_FILE = path.join(DATA_DIR, 'cloud_sync_db.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

interface CloudDb {
  [userId: string]: {
    lastUpdated: number;
    profile: any;
    dailyLogs: { [date: string]: any };
    fastingHistory: any[];
    weightRecords: any[];
    customRecipes?: any[];
  };
}

function loadCloudDb(): CloudDb {
  try {
    if (fs.existsSync(SYNC_FILE)) return JSON.parse(fs.readFileSync(SYNC_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading cloud db:', err);
  }
  return {};
}

function saveCloudDb(data: CloudDb) {
  try {
    const tempFile = `${SYNC_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, SYNC_FILE);
  } catch (err) {
    console.error('Error saving cloud db:', err);
    throw err;
  }
}

type RateEntry = { windowStart: number; count: number };
const syncRateByIp = new Map<string, RateEntry>();
const syncInvalidByIp = new Map<string, RateEntry>();
const SYNC_WINDOW_MS = 60_000;
const SYNC_MAX_REQUESTS_PER_IP = 60;
const SYNC_MAX_INVALID_PER_IP = 10;

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim();
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function allowRate(map: Map<string, RateEntry>, ip: string, max: number): boolean {
  const now = Date.now();
  const existing = map.get(ip);
  if (!existing || now - existing.windowStart >= SYNC_WINDOW_MS) {
    map.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  if (existing.count >= max) return false;
  existing.count += 1;
  return true;
}

function syncKeyLooksValid(key: string): boolean {
  return /^WILLY-(?:\d{6}|[A-F0-9]{32})$/i.test(key);
}

function requireSyncKey(req: express.Request, res: express.Response): string | null {
  const key = String(req.params.userId || '').trim().toUpperCase();
  const ip = getClientIp(req);
  if (!allowRate(syncRateByIp, ip, SYNC_MAX_REQUESTS_PER_IP)) {
    res.status(429).json({ success: false, error: 'Çok fazla senkronizasyon isteği. Lütfen kısa süre sonra tekrar deneyin.', code: 'SYNC_RATE_LIMITED' });
    return null;
  }
  if (!syncKeyLooksValid(key)) {
    allowRate(syncInvalidByIp, ip, SYNC_MAX_INVALID_PER_IP);
    res.status(400).json({ success: false, error: 'Geçersiz bulut senkronizasyon anahtarı.', code: 'INVALID_SYNC_KEY' });
    return null;
  }
  return key;
}

let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  if (!aiClient) aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
}

function hasOpenAI(): boolean {
  return !!process.env.OPENAI_API_KEY?.trim();
}

function isGeminiQuotaError(err: any): boolean {
  const text = String(err?.message || err || '').toLowerCase();
  return text.includes('resource_exhausted') || text.includes('resource exhausted') || text.includes('quota') || text.includes('prepayment credits are depleted') || text.includes('billing');
}

function extractOpenAIText(data: any): string {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const chunks = Array.isArray(data?.output) ? data.output.flatMap((item: any) => Array.isArray(item?.content) ? item.content : []) : [];
  return chunks.filter((c: any) => c?.type === 'output_text' && typeof c?.text === 'string').map((c: any) => c.text).join('').trim();
}

async function callOpenAI(prompt: string, imageBase64?: string, mimeType = 'image/jpeg'): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('OPENAI_API_KEY production ortamında tanımlı değil.');
  const content: any[] = [{ type: 'input_text', text: prompt }];
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    content.push({ type: 'input_image', image_url: `data:${mimeType};base64,${cleanBase64}` });
  }
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL?.trim() || 'gpt-5.6-luna', input: [{ role: 'user', content }] }),
  });
  const data: any = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `OpenAI HTTP ${response.status}`);
  const text = extractOpenAIText(data);
  if (!text) throw new Error('OpenAI boş yanıt döndürdü.');
  return text;
}

function parseAiJson(text: string): any {
  try { return JSON.parse(text); }
  catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI JSON yanıtı çözümlenemedi');
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Willy Kilo Takip', aiEnabled: !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY), aiProviders: { gemini: !!process.env.GEMINI_API_KEY, openai: !!process.env.OPENAI_API_KEY }, deployCommit: process.env.RENDER_GIT_COMMIT || null, deployBranch: process.env.RENDER_GIT_BRANCH || null, timestamp: new Date().toISOString() });
});

const VERSION_FILE = path.join(process.cwd(), 'version.json');
let cachedRelease: { timestamp: number; data: any } | null = null;

app.get(['/api/app-version', '/api/app-version/manifest.json'], async (req, res) => {
  try {
    let localVersion = { versionName: '1.0.1', versionCode: 2, releaseDate: '2026-09-05', minSupportedVersion: '1.0.0', apkUrl: 'https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases/latest/download/WillyKiloTakip.apk', githubReleaseUrl: 'https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases/latest', releaseNotes: ['Gerçek Gemini AI Willy Koç ve Fotoğraflı Yemek Analizi aktif', 'Canlı OTA Güncelleme Sistemi aktif', 'Otomatik GitHub Actions Release ve APK dağıtımı', 'PWA ve Offline-First yerel veri koruma mimarisi'], mandatory: false };
    if (fs.existsSync(VERSION_FILE)) {
      try { localVersion = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf-8')); } catch (e) { console.error('Error reading version.json:', e); }
    }
    const currentVersionQuery = (req.query.currentVersion as string) || '';
    const currentCodeQuery = Number(req.query.currentCode) || 0;
    let latestGithubData: any = null;
    const now = Date.now();
    if (cachedRelease && now - cachedRelease.timestamp < 300000) latestGithubData = cachedRelease.data;
    else {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const ghRes = await fetch('https://api.github.com/repos/kanunal99-jpg/Willy-Kilo-Takip/releases/latest', { headers: { 'User-Agent': 'WillyKiloTakip-OTA-Checker' }, signal: controller.signal });
        clearTimeout(timeout);
        if (ghRes.ok) {
          const ghJson: any = await ghRes.json();
          if (ghJson?.tag_name) {
            const apkAsset = Array.isArray(ghJson.assets) ? ghJson.assets.find((a: any) => a.name?.endsWith('.apk')) : null;
            latestGithubData = { versionName: ghJson.tag_name.replace(/^v/, ''), versionCode: localVersion.versionCode, releaseDate: ghJson.published_at ? ghJson.published_at.split('T')[0] : localVersion.releaseDate, releaseNotes: ghJson.body ? ghJson.body.split('\n').filter((l: string) => l.trim()) : localVersion.releaseNotes, apkUrl: apkAsset ? apkAsset.browser_download_url : localVersion.apkUrl, githubReleaseUrl: ghJson.html_url || localVersion.githubReleaseUrl };
            cachedRelease = { timestamp: now, data: latestGithubData };
          }
        }
      } catch (_) {}
    }
    const effective = latestGithubData || localVersion;
    const hasUpdate = currentCodeQuery > 0 && effective.versionCode ? effective.versionCode > currentCodeQuery : currentVersionQuery ? String(effective.versionName).replace(/^v/, '').trim() !== currentVersionQuery.replace(/^v/, '').trim() : false;
    res.json({ success: true, versionName: effective.versionName, versionCode: effective.versionCode || localVersion.versionCode, releaseDate: effective.releaseDate, releaseNotes: effective.releaseNotes, apkUrl: effective.apkUrl, githubReleaseUrl: effective.githubReleaseUrl, mandatory: false, hasUpdate, clientVersion: currentVersionQuery || undefined, checkedAt: new Date().toISOString() });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/sync/:userId', (req, res) => {
  const userId = requireSyncKey(req, res);
  if (!userId) return;
  const db = loadCloudDb();
  const data = db[userId];
  if (data) return res.json({ success: true, found: true, data });
  return res.json({ success: true, found: false, message: 'User sync not found yet on cloud.' });
});

app.post('/api/sync/:userId', (req, res) => {
  const userId = requireSyncKey(req, res);
  if (!userId) return;
  try {
    const { profile, dailyLogs, fastingHistory, weightRecords, customRecipes } = req.body || {};
    if (!profile || typeof profile !== 'object' || !Array.isArray(fastingHistory) || !Array.isArray(weightRecords) || typeof dailyLogs !== 'object') return res.status(400).json({ success: false, error: 'Geçersiz senkronizasyon verisi.', code: 'INVALID_SYNC_PAYLOAD' });
    const db = loadCloudDb();
    db[userId] = { lastUpdated: Date.now(), profile, dailyLogs, fastingHistory, weightRecords, customRecipes: Array.isArray(customRecipes) ? customRecipes : db[userId]?.customRecipes || [] };
    saveCloudDb(db);
    res.json({ success: true, timestamp: db[userId].lastUpdated, message: 'Bulut senkronizasyonu başarıyla tamamlandı.' });
  } catch (error: any) { console.error('Sync error:', error); res.status(500).json({ success: false, error: 'Senkronizasyon verisi kaydedilemedi.', code: 'SYNC_SAVE_FAILED' }); }
});

app.post('/api/ai/analyze-food', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', description, mealType = 'lunch' } = req.body || {};
    const safeDescription = String(description || '').trim().slice(0, 500);
    const promptText = 'Sen dünya standartlarında bir AI Beslenme Uzmanı ve Diyetisyensin. Kullanıcı ' + mealType + ' öğünü için bir yemek fotoğrafı veya açıklaması gönderdi. ' + (safeDescription ? 'Kullanıcı notu: ' + JSON.stringify(safeDescription) + '.' : '') + '\n\nYemeği detaylıca analiz et ve sadece geçerli JSON nesnesi olarak yanıt ver. Format: {name, calories, protein, carbs, fat, fiber, healthScore, pros, cons, advice, breakdown}';
    const ai = getGemini();
    if (ai) {
      try {
        const contents: any[] = [];
        if (imageBase64) contents.push({ inlineData: { mimeType, data: String(imageBase64).replace(/^data:[^;]+;base64,/, '') } });
        contents.push(promptText);
        const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents, config: { responseMimeType: 'application/json' } });
        const data = parseAiJson(response.text || '{}');
        return res.json({ success: true, data, provider: 'gemini', model: 'gemini-3.6-flash', fallback: false, analysisMode: 'cloud-ai', visualAnalyzed: Boolean(imageBase64) });
      } catch (err: any) { console.error('AI Food Gemini failed' + (isGeminiQuotaError(err) ? ' (quota/billing)' : '') + ':', err?.message || err); }
    }
    const fallback = localFoodAnalysisFallback(safeDescription, mealType);
    return res.status(200).json({ success: true, data: fallback, provider: 'local', model: 'local-safe-food-fallback-v1', fallback: true, analysisMode: fallback.analysisMode, visualAnalyzed: false, warning: 'Fotoğraf görsel olarak doğrulanamadı; sonuç metin/porsiyon bilgisi yoksa yaklaşık tahmindir.' });
  } catch (err: any) { console.error('AI Food Analysis Error:', err); return res.status(200).json({ success: true, data: localFoodAnalysisFallback('', 'lunch'), provider: 'local', model: 'local-safe-food-fallback-v1', fallback: true, analysisMode: 'local-safe-default', visualAnalyzed: false, warning: 'Görsel analiz başarısız; sonuç kesin besin değeri değildir.' }); }
});

app.post('/api/ai/coach', async (req, res) => {
  const startedAt = Date.now();
  try {
    const { message: userMessage, userProfile, todaySummary } = req.body || {};
    const safeMessage = String(userMessage || '').trim().slice(0, 1000);
    if (!safeMessage) return res.status(400).json({ success: false, error: 'Mesaj boş olamaz.', code: 'INVALID_AI_MESSAGE' });
    const systemPrompt = `Sen Willy Kilo Takip uygulamasının kişisel beslenme koçusun. Türkçe, pratik ve sürdürülebilir öneriler ver. Tıbbi tanı koyma ve kesin/garantili sağlık sonucu iddia etme. Kullanıcı profilini ve bugünün özetini yalnızca mevcut soruyla doğrudan ilgili olduğunda kullan; soruyla ilgisiz günlük metrikleri cevaba taşıma. Nedensel sağlık iddialarını kesin dille kurma; belirsizlik varsa açıkça belirt. Kullanıcıya uygulanabilir porsiyon, alışkanlık ve takip önerileri sun. Profil: ${JSON.stringify(userProfile || {})}. Bugün: ${JSON.stringify(todaySummary || {})}. Kullanıcı sorusu: ${JSON.stringify(safeMessage)}`;
    const ai = getGemini(); let lastError: any = null;
    if (ai) {
      const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash'];
      for (let round = 0; round < 2; round++) {
        for (const model of models) {
          try {
            const response = await ai.models.generateContent({ model, contents: systemPrompt });
            const reply = String(response.text || '').trim();
            if (!reply) throw new Error('Gemini boş yanıt döndürdü.');
            console.log(`AI Coach success provider=gemini model=${model} round=${round + 1} durationMs=${Date.now() - startedAt}`);
            return res.json({ success: true, reply, model, provider: 'gemini', fallback: false });
          } catch (err: any) {
            lastError = err;
            console.error(`AI Coach Gemini model=${model} round=${round + 1} failed${isGeminiQuotaError(err) ? ' (quota/billing)' : ''}:`, err?.message || err);
            await new Promise((resolve) => setTimeout(resolve, 700));
          }
        }
        if (round === 0) await new Promise((resolve) => setTimeout(resolve, 1600));
      }
      if (!hasOpenAI() && lastError) throw lastError;
    }
    if (!hasOpenAI()) return res.status(503).json({ success: false, error: 'AI sağlayıcısı yapılandırılmamış.', code: 'AI_NOT_CONFIGURED' });
    const reply = await callOpenAI(systemPrompt);
    return res.json({ success: true, reply, model: process.env.OPENAI_MODEL?.trim() || 'gpt-5.6-luna', provider: 'openai', fallback: true });
  } catch (err: any) { console.error('AI Coach Error:', err); return res.status(502).json({ success: false, error: 'AI koç isteği işlenemedi: ' + (err.message || 'Bilinmeyen hata'), code: 'AI_REQUEST_FAILED' }); }
});

function localFoodAnalysisFallback(description = '', mealType = 'lunch') {
  const text = String(description || '').toLocaleLowerCase('tr-TR');
  const entries = [
    { keys: ['yumurta', 'omlet'], name: 'Yumurta / Omlet', calories: 180, protein: 13, carbs: 2, fat: 13, fiber: 0, healthScore: 88, pros: ['İyi protein kaynağı'], cons: ['Porsiyona göre yağ miktarı değişebilir'], advice: 'Pişirme yağını ve eklenen malzemeleri ayrıca hesaba katın.' },
    { keys: ['tavuk', 'ızgara tavuk', 'tavuk göğsü'], name: 'Tavuk Göğsü', calories: 250, protein: 46, carbs: 0, fat: 6, fiber: 0, healthScore: 92, pros: ['Yüksek protein'], cons: ['Porsiyon büyüdükçe kalori artar'], advice: 'Yanına sebze ekleyerek öğünü dengeli tutabilirsiniz.' },
    { keys: ['yoğurt', 'yogurt'], name: 'Yoğurt', calories: 120, protein: 8, carbs: 9, fat: 5, fiber: 0, healthScore: 90, pros: ['Protein ve kalsiyum içerir'], cons: ['Şekerli çeşitlerde ilave şeker olabilir'], advice: 'Şekersiz/ sade yoğurt tercih edebilirsiniz.' },
  ];
  const match = entries.find((entry) => entry.keys.some((key) => text.includes(key)));
  return { name: match?.name || (description || 'Dengeli Sağlıklı Tabak'), calories: match?.calories || 385, protein: match?.protein || 26, carbs: match?.carbs || 32, fat: match?.fat || 14, fiber: match?.fiber || 5, healthScore: match?.healthScore || 82, pros: match?.pros || ['Porsiyon kontrolü yapılabilir'], cons: match?.cons || ['Besin değerleri yaklaşık olabilir'], advice: match?.advice || 'Porsiyonu ve eklenen sos/yağı ayrıca değerlendirin.', breakdown: [], analysisMode: 'local-safe-default' };
}

function localCoachFallback(userProfile: any = {}, todaySummary: any = {}, userMessage = '') {
  const target = Number(userProfile?.dailyCalorieTarget) || 1800;
  const waterTarget = Number(userProfile?.waterTargetMl) || 2000;
  const consumed = Number(todaySummary?.consumedCalories) || 0;
  const water = Number(todaySummary?.waterMl) || 0;
  const q = String(userMessage || '').toLocaleLowerCase('tr-TR');
  if (/protein/.test(q)) return `Protein hedefini tamamlamak için öğünlerine yoğurt, yumurta, tavuk, balık veya baklagil gibi kaynaklardan birini ekleyebilirsin. Günlük hedefini tek öğünde kapatmak yerine gün içine yaymak daha pratik olabilir.`;
  if (/su|hidrasyon|iç/.test(q)) return `Bugün ${water} ml su içtiysen hedefin ${waterTarget} ml. Günün kalanına bölerek düzenli aralıklarla su içmeyi deneyebilirsin.`;
  if (/tatlı|şeker/.test(q)) return 'Tatlı isteğinde önce normal bir öğün düzenini koru; ardından küçük bir porsiyon, meyve veya sade yoğurt gibi seçenekleri değerlendirebilirsin.';
  return `Bugünkü hedefin yaklaşık ${target} kcal. Şu ana kadar ${consumed} kcal aldıysan kalan öğününü dengeli bir protein, sebze ve uygun porsiyon karbonhidratla planlayabilirsin.`;
}

app.get('/api/products/barcode/:barcode', async (req, res) => {
  const barcode = String(req.params.barcode || '').replace(/\D/g, '').slice(0, 18);
  if (barcode.length < 8) return res.status(400).json({ success: false, error: 'Geçersiz barkod.', code: 'INVALID_BARCODE' });
  const file = path.join(process.cwd(), 'src', 'data', 'packaged-products.json');
  try {
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      const local = Array.isArray(parsed?.products) ? parsed.products.find((item: any) => String(item?.barcode || '').replace(/\D/g, '') === barcode) : null;
      if (local) return res.json({ success: true, found: true, source: 'local-catalog', cached: true, data: local });
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}?fields=code,product_name,brands,categories,serving_size,nutriments`, { headers: { 'User-Agent': 'WillyKiloTakip/1.0 (nutrition lookup)' }, signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`Open Food Facts HTTP ${response.status}`);
    const payload: any = await response.json();
    if (payload?.status !== 1 || !payload?.product) return res.json({ success: true, found: false, source: 'open-food-facts', code: 'PRODUCT_NOT_FOUND' });
    return res.json({ success: true, found: true, source: 'open-food-facts', cached: false, data: payload.product });
  } catch (error: any) {
    console.error('Packaged product lookup failed:', error?.message || error);
    return res.status(503).json({ success: false, found: false, source: 'fallback', code: 'PRODUCT_LOOKUP_UNAVAILABLE', error: 'Ürün kataloğu geçici olarak erişilemiyor.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), 'dist', 'index.html')));
  }
  app.listen(PORT, () => console.log(`Willy Kilo Takip server running on port ${PORT}`));
}

startServer();
