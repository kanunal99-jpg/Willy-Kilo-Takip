import fs from 'node:fs';

const file = 'server.ts';
let source = fs.readFileSync(file, 'utf8');
if (source.includes('// RENDER_SYNC_PERSISTENCE_GUARD')) {
  console.log('Render sync persistence guard already applied.');
  process.exit(0);
}

const dataAnchor = "const DATA_DIR = path.join(process.cwd(), 'data');\nconst SYNC_FILE = path.join(DATA_DIR, 'cloud_sync_db.json');";
const dataReplacement = "const configuredDataDir = process.env.WILLY_DATA_DIR?.trim();\nconst DATA_DIR = configuredDataDir || path.join(process.cwd(), 'data');\nconst SYNC_FILE = path.join(DATA_DIR, 'cloud_sync_db.json');\nconst SYNC_PERSISTENCE_CONFIGURED = Boolean(configuredDataDir);\n// RENDER_SYNC_PERSISTENCE_GUARD";
if (!source.includes(dataAnchor)) throw new Error('sync data anchor not found');
source = source.replace(dataAnchor, dataReplacement);

const getRoute = "app.get('/api/sync/:userId', (req, res) => {\n  const userId = requireSyncKey(req, res);\n  if (!userId) return;";
const getReplacement = "app.get('/api/sync/:userId', (req, res) => {\n  const userId = requireSyncKey(req, res);\n  if (!userId) return;\n  if (!SYNC_PERSISTENCE_CONFIGURED) return res.status(503).json({ success: false, error: 'Bulut senkronizasyonu için kalıcı veri deposu yapılandırılmamış.', code: 'SYNC_PERSISTENCE_UNAVAILABLE' });";
if (!source.includes(getRoute)) throw new Error('sync GET route anchor not found');
source = source.replace(getRoute, getReplacement);

const postRoute = "app.post('/api/sync/:userId', (req, res) => {\n  const userId = requireSyncKey(req, res);\n  if (!userId) return;";
const postReplacement = "app.post('/api/sync/:userId', (req, res) => {\n  const userId = requireSyncKey(req, res);\n  if (!userId) return;\n  if (!SYNC_PERSISTENCE_CONFIGURED) return res.status(503).json({ success: false, error: 'Bulut senkronizasyonu için kalıcı veri deposu yapılandırılmamış. Yerel veriler korunur; sunucuya sessizce yazılmaz.', code: 'SYNC_PERSISTENCE_UNAVAILABLE' });";
if (!source.includes(postRoute)) throw new Error('sync POST route anchor not found');
source = source.replace(postRoute, postReplacement);

const healthAnchor = "app.get('/api/health', (req, res) => {\n  res.json({ status: 'ok', app: 'Willy Kilo Takip', aiEnabled: !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY), aiProviders: { gemini: !!process.env.GEMINI_API_KEY, openai: !!process.env.OPENAI_API_KEY }, timestamp: new Date().toISOString() });\n});";
const healthReplacement = "app.get('/api/health', (req, res) => {\n  res.json({ status: 'ok', app: 'Willy Kilo Takip', aiEnabled: !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY), aiProviders: { gemini: !!process.env.GEMINI_API_KEY, openai: !!process.env.OPENAI_API_KEY }, syncPersistenceConfigured: SYNC_PERSISTENCE_CONFIGURED, timestamp: new Date().toISOString() });\n});";
if (!source.includes(healthAnchor)) throw new Error('health anchor not found');
source = source.replace(healthAnchor, healthReplacement);

fs.writeFileSync(file, source, 'utf8');
console.log('Render sync persistence guard applied.');
