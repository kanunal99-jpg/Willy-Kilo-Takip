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
    // Atomic replace prevents a concurrent write or process interruption from corrupting the JSON database.
    const tempFile = `${SYNC_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, SYNC_FILE);
  } catch (err) {
    console.error('Error saving cloud db:', err);
    throw err;
  }
}

// Sync keys are the only credential in this lightweight sync architecture. Existing 6-digit keys remain
// compatible, while new profiles use 128-bit random keys. Rate limiting prevents practical brute-force abuse.
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
  // Supports legacy WILLY-123456 keys and new WILLY- + 32 hex-character keys.
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Willy Kilo Takip', aiEnabled: !!process.env.GEMINI_API_KEY, timestamp: new Date().toISOString() });
});

const VERSION_FILE = path.join(process.cwd(), 'version.json');
let cachedRelease: { timestamp: number; data: any } | null = null;

app.get(['/api/app-version', '/api/app-version/manifest.json'], async (req, res) => {
  try {
    let localVersion = {
      versionName: '1.0.1', versionCode: 2, releaseDate: '2026-09-05', minSupportedVersion: '1.0.0',
      apkUrl: 'https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases/latest/download/WillyKiloTakip.apk',
      githubReleaseUrl: 'https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases/latest',
      releaseNotes: ['Gerçek Gemini AI Willy Koç ve Fotoğraflı Yemek Analizi aktif', 'Canlı OTA Güncelleme Sistemi aktif', 'Otomatik GitHub Actions Release ve APK dağıtımı', 'PWA ve Offline-First yerel veri koruma mimarisi'],
      mandatory: false,
    };
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
            latestGithubData = {
              versionName: ghJson.tag_name.replace(/^v/, ''), versionCode: localVersion.versionCode,
              releaseDate: ghJson.published_at ? ghJson.published_at.split('T')[0] : localVersion.releaseDate,
              releaseNotes: ghJson.body ? ghJson.body.split('\n').filter((l: string) => l.trim()) : localVersion.releaseNotes,
              apkUrl: apkAsset ? apkAsset.browser_download_url : localVersion.apkUrl,
              githubReleaseUrl: ghJson.html_url || localVersion.githubReleaseUrl,
            };
            cachedRelease = { timestamp: now, data: latestGithubData };
          }
        }
      } catch (_) {}
    }
    const effective = latestGithubData || localVersion;
    const hasUpdate = currentCodeQuery > 0 && effective.versionCode
      ? effective.versionCode > currentCodeQuery
      : currentVersionQuery
        ? String(effective.versionName).replace(/^v/, '').trim() !== currentVersionQuery.replace(/^v/, '').trim()
        : false;
    res.json({ success: true, versionName: effective.versionName, versionCode: effective.versionCode || localVersion.versionCode, releaseDate: effective.releaseDate, releaseNotes: effective.releaseNotes, apkUrl: effective.apkUrl, githubReleaseUrl: effective.githubReleaseUrl, mandatory: false, hasUpdate, clientVersion: currentVersionQuery || undefined, checkedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
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
    if (!profile || typeof profile !== 'object' || !Array.isArray(fastingHistory) || !Array.isArray(weightRecords) || typeof dailyLogs !== 'object') {
      return res.status(400).json({ success: false, error: 'Geçersiz senkronizasyon verisi.', code: 'INVALID_SYNC_PAYLOAD' });
    }
    const db = loadCloudDb();
    db[userId] = {
      lastUpdated: Date.now(), profile,
      dailyLogs, fastingHistory, weightRecords,
      customRecipes: Array.isArray(customRecipes) ? customRecipes : db[userId]?.customRecipes || [],
    };
    saveCloudDb(db);
    res.json({ success: true, timestamp: db[userId].lastUpdated, message: 'Bulut senkronizasyonu başarıyla tamamlandı.' });
  } catch (error: any) {
    console.error('Sync error:', error);
    res.status(500).json({ success: false, error: 'Senkronizasyon verisi kaydedilemedi.', code: 'SYNC_SAVE_FAILED' });
  }
});

app.post('/api/ai/analyze-food', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', description, mealType = 'lunch' } = req.body;
    const ai = getGemini();
    if (!ai) return res.status(503).json({ success: false, error: 'GEMINI_API_KEY production ortamında tanımlı değil.', code: 'AI_NOT_CONFIGURED' });

    const promptText = `Sen dünya standartlarında bir AI Beslenme Uzmanı ve Diyetisyensin. Kullanıcı "${mealType}" öğünü için bir yemek fotoğrafı veya açıklaması gönderdi. ${description ? `Kullanıcı notu: "${description}".` : ''}\n\nYemeği detaylıca analiz et ve sadece geçerli JSON nesnesi olarak yanıt ver.\nFormat: {"name":"Yemeğin Türkçe adı","calories":420,"protein":32,"carbs":35,"fat":16,"fiber":6,"healthScore":90,"pros":["İyi protein kaynağı"],"cons":["Orta sodyum"],"advice":"1-2 cümlelik kişisel tavsiye","breakdown":[{"item":"Malzeme","calories":250,"amount":"150g"}]}`;
    const contents: any[] = [];
    if (imageBase64) contents.push({ inlineData: { mimeType, data: imageBase64.replace(/^data:image\/\w+;base64,/, '') } });
    contents.push(promptText);
    const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents, config: { responseMimeType: 'application/json' } });
    const responseText = response.text || '{}';
    let parsed: any;
    try { parsed = JSON.parse(responseText); }
    catch { const match = responseText.match(/\{[\s\S]*\}/); if (match) parsed = JSON.parse(match[0]); else throw new Error('AI JSON yanıtı çözümlenemedi'); }
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('AI Food Analysis Error:', err);
    return res.status(502).json({ success: false, error: 'AI yemek analizi başarısız: ' + (err.message || 'Bilinmeyen hata'), code: 'AI_REQUEST_FAILED' });
  }
});

app.post('/api/ai/coach', async (req, res) => {
  const startedAt = Date.now();
  try {
    const { message, userProfile, todaySummary } = req.body || {};
    const ai = getGemini();
    if (!ai) return res.status(503).json({ success: false, error: 'GEMINI_API_KEY production ortamında tanımlı değil.', code: 'AI_NOT_CONFIGURED' });

    const userMessage = String(message || '').trim() || 'Bugünkü ilerlememi ve bana tavsiyelerini söyler misin?';
    const systemPrompt = `Sen "Willy Kilo Takip" uygulamasının sevimli, sempatik, bilimsel ve motive edici yapay zeka koçu Willy'sin.
Kullanıcının verileri:
- Hedef: ${userProfile?.goal === 'lose_weight' ? 'Kilo Vermek' : 'Kilo Korumak / Kas Kazanmak'}
- Güncel Kilo: ${userProfile?.currentWeightKg ?? 'bilinmiyor'} kg, Hedef: ${userProfile?.targetWeightKg ?? 'bilinmiyor'} kg
- Günlük Kalori Hedefi: ${userProfile?.dailyCalorieTarget ?? 'bilinmiyor'} kcal
- Bugün Alınan: ${todaySummary?.consumedCalories || 0} kcal, Yakılan: ${todaySummary?.burnedCalories || 0} kcal
- Bugün Su: ${(todaySummary?.waterMl || 0) / 1000} L (Hedef: ${(userProfile?.waterTargetMl || 2000) / 1000} L)
- Aralıklı Oruç: ${todaySummary?.fastingActive ? 'aktif' : 'aktif değil'}

KURALLAR:
1. Kullanıcının yazdığı soruya doğrudan cevap ver; soruyu yok sayma.
2. Her soruya aynı cevabı verme. Konuya göre öneri üret.
3. Kullanıcının mevcut verilerini gerektiğinde cevaba bağla.
4. Kilo verme konusunda aşırı kısıtlayıcı veya tıbben riskli öneriler verme.
5. Yanıtı Türkçe, doğal, kısa ama uygulanabilir ver. Gerektiğinde maddeler kullan.
6. Tanı koyma; ciddi sağlık durumlarında doktora yönlendir.

Kullanıcı sorusu: ${userMessage}`;

    const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash'];
    let lastError: any = null;
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({ model, contents: systemPrompt });
        const reply = response.text?.trim();
        if (reply) {
          console.log(`AI Coach success model=${model} durationMs=${Date.now() - startedAt}`);
          return res.json({ success: true, reply, model });
        }
        lastError = new Error(`Model ${model} boş yanıt döndürdü`);
      } catch (err: any) {
        lastError = err;
        console.error(`AI Coach model=${model} failed:`, err?.message || err);
      }
    }

    return res.status(502).json({ success: false, error: 'Gemini AI yanıt üretemedi: ' + (lastError?.message || 'Bilinmeyen hata'), code: 'AI_REQUEST_FAILED' });
  } catch (err: any) {
    console.error('AI Coach Error:', err);
    return res.status(500).json({ success: false, error: 'AI koç isteği işlenemedi: ' + (err.message || 'Bilinmeyen hata'), code: 'AI_SERVER_ERROR' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Willy Kilo Takip server running on http://0.0.0.0:${PORT}`));
}
startServer();
