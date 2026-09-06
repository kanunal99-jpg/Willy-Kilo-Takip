import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { createGunzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const SOURCE_URL = process.env.OFF_DUMP_URL || 'https://static.openfoodfacts.org/data/openfoodfacts-products.jsonl.gz';
const OUT_DIR = process.env.OFF_OUT_DIR || path.join(process.cwd(), 'data', 'off-catalog');
const MAX_PRODUCTS = Number(process.env.OFF_MAX_PRODUCTS || 0);
const SHARDS = Number(process.env.OFF_SHARDS || 128);
const MIN_NAME = 2;

fs.mkdirSync(OUT_DIR, { recursive: true });
const handles = new Map();
const counts = new Map();
let imported = 0;
let skipped = 0;

function digits(value) { return String(value ?? '').replace(/\D/g, ''); }
function shardFor(code) {
  let hash = 2166136261;
  for (const ch of code) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
  return Math.abs(hash) % SHARDS;
}
function first(value) { return Array.isArray(value) ? value.find(Boolean) || '' : String(value || '').split(',')[0].trim(); }
function number(value) { const n = Number(value); return Number.isFinite(n) ? n : null; }
function compact(p) {
  const code = digits(p.code || p._id || p.id);
  const name = String(p.product_name_tr || p.product_name_en || p.product_name || '').trim();
  if (code.length < 8 || code.length > 18 || name.length < MIN_NAME) return null;
  const n = p.nutriments || {};
  return {
    barcode: code,
    name,
    brand: first(p.brands),
    category: first(p.categories_tags) || first(p.categories),
    countries: first(p.countries_tags) || first(p.countries),
    servingSize: p.serving_size || null,
    caloriesPer100g: number(n['energy-kcal_100g']),
    proteinPer100g: number(n.proteins_100g),
    carbsPer100g: number(n.carbohydrates_100g),
    sugarPer100g: number(n.sugars_100g),
    fatPer100g: number(n.fat_100g),
    saturatedFatPer100g: number(n['saturated-fat_100g']),
    fiberPer100g: number(n.fiber_100g),
    saltPer100g: number(n.salt_100g),
    image: p.image_front_small_url || p.image_url || null,
    source: 'Open Food Facts',
    sourceLicense: 'ODbL',
    importedAt: new Date().toISOString()
  };
}
function streamForShard(shard) {
  if (!handles.has(shard)) handles.set(shard, fs.createWriteStream(path.join(OUT_DIR, `products-${String(shard).padStart(3, '0')}.jsonl`), { flags: 'a' }));
  return handles.get(shard);
}

console.log(`Downloading/streaming Open Food Facts dump: ${SOURCE_URL}`);
const response = await fetch(SOURCE_URL, { headers: { 'User-Agent': 'WillyKiloTakip/1.0 bulk importer' } });
if (!response.ok || !response.body) throw new Error(`OFF dump HTTP ${response.status}`);
const input = Readable.fromWeb(response.body).pipe(createGunzip());
const rl = readline.createInterface({ input, crlfDelay: Infinity });
for await (const line of rl) {
  if (!line.trim()) continue;
  if (MAX_PRODUCTS && imported >= MAX_PRODUCTS) break;
  try {
    const product = compact(JSON.parse(line));
    if (!product) { skipped++; continue; }
    const shard = shardFor(product.barcode);
    streamForShard(shard).write(JSON.stringify(product) + '\n');
    counts.set(shard, (counts.get(shard) || 0) + 1);
    imported++;
  } catch { skipped++; }
  if (imported && imported % 100000 === 0) console.log(`Imported ${imported.toLocaleString()} products...`);
}
for (const stream of handles.values()) await new Promise((resolve, reject) => { stream.end(resolve); stream.on('error', reject); });
const manifest = {
  schemaVersion: 1,
  source: 'Open Food Facts',
  sourceUrl: SOURCE_URL,
  license: 'ODbL',
  generatedAt: new Date().toISOString(),
  shardCount: SHARDS,
  imported,
  skipped,
  counts: Object.fromEntries([...counts.entries()].sort((a,b) => a[0]-b[0]))
};
fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`DONE: ${imported.toLocaleString()} products imported into ${SHARDS} shards; ${skipped.toLocaleString()} skipped.`);
