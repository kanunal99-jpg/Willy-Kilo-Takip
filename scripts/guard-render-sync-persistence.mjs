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

// Append only the missing sync field; preserve unrelated health/AI status keys.
const healthStart = source.indexOf("app.get('/api/health', (req, res) => {");
const healthEnd = source.indexOf("\n});", healthStart);
if (healthStart === -1 || healthEnd === -1) throw new Error('health route not found');
const healthRoute = source.slice(healthStart, healthEnd);
const commitField = "deployCommit: process.env.RENDER_GIT_COMMIT || null";
if (!healthRoute.includes(commitField)) throw new Error('health deployCommit field not found');
if (healthRoute.includes('syncPersistenceConfigured:')) throw new Error('health sync status already patched unexpectedly');
const updatedHealthRoute = healthRoute.replace(
  commitField,
  'syncPersistenceConfigured: SYNC_PERSISTENCE_CONFIGURED, ' + commitField
);
source = source.slice(0, healthStart) + updatedHealthRoute + source.slice(healthEnd);

fs.writeFileSync(file, source, 'utf8');
console.log('Render sync persistence guard applied.');
