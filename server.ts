import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.RENDER ? (Number(process.env.PORT) || 10000) : (process.env.NODE_ENV === 'production' && process.env.PORT && process.env.PORT !== '8080' ? Number(process.env.PORT) : 3000);
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
    fs.writeFileSync(SYNC_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving cloud db:', err);
  }
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
  const db = loadCloudDb();
  const data = db[req.params.userId];
  if (data) return res.json({ success: true, found: true, data });
  return res.json({ success: true, found: false, message: 'User sync not found yet on cloud.' });
});

app.post('/api/sync/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { profile, dailyLogs, fastingHistory, weightRecords, customRecipes } = req.body;
    const db = loadCloudDb();
    db[userId] = {
      lastUpdated: Date.now(), profile: profile || db[userId]?.profile,
      dailyLogs: dailyLogs || db[userId]?.dailyLogs || {}, fastingHistory: fastingHistory || db[userId]?.fastingHistory || [],
      weightRecords: weightRecords || db[userId]?.weightRecords || [], customRecipes: customRecipes || db[userId]?.customRecipes || [],
    };
    saveCloudDb(db);
    res.json({ success: true, timestamp: db[userId].lastUpdated, message: 'Bulut senkronizasyonu başarıyla tamamlandı.' });
  } catch (error: any) {
    console.error('Sync error:', error);
    res.status(500).json({ success: false, error: error.message });
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

// AI Nutrition & Weight Coach — gerçek Gemini yanıtı; sessiz/sabit fallback YOK.
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

    // Stable production model first, then current GA fallbacks for transient/model-specific failures.
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
