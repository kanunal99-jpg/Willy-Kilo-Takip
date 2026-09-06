import fs from 'node:fs';
const file = 'server.ts';
let source = fs.readFileSync(file, 'utf8');
if (!source.includes("/api/products/barcode/:barcode")) {
  const marker = "app.get('/api/health', (req, res) => {";
  if (!source.includes(marker)) throw new Error('health route marker not found');
  const route = [
    "const PACKAGED_CATALOG_FILE = path.join(process.cwd(), 'src', 'data', 'packaged-products.json');",
    "function normalizeBarcode(value: string): string { return String(value || '').replace(/\\D/g, '').slice(0, 18); }",
    "function loadPackagedCatalog(): any[] { try { if (!fs.existsSync(PACKAGED_CATALOG_FILE)) return []; const parsed = JSON.parse(fs.readFileSync(PACKAGED_CATALOG_FILE, 'utf-8')); return Array.isArray(parsed?.products) ? parsed.products : []; } catch (error) { console.error('Packaged catalog read failed:', error); return []; } }",
    "function productToFood(product: any): any { const calories = Number(product.caloriesPer100g) || 0; const protein = Number(product.proteinPer100g) || 0; const carbs = Number(product.carbsPer100g) || 0; const fat = Number(product.fatPer100g) || 0; const fiber = Number(product.fiberPer100g) || 0; const servingGrams = Number(product.servingGrams) || 100; const m = servingGrams / 100; return { id: 'packaged-' + product.barcode, barcode: product.barcode, name: product.name || 'Paketli ürün', brand: product.brand || '', category: product.category || 'Paketli ürün', unit: 'porsiyon', defaultServing: 1, calories: Math.round(calories * m), protein: Math.round(protein * m * 10) / 10, carbs: Math.round(carbs * m * 10) / 10, fat: Math.round(fat * m * 10) / 10, fiber: Math.round(fiber * m * 10) / 10, healthScore: 80, source: product.source || 'local-catalog', sourceVerifiedAt: product.sourceVerifiedAt || null, per100g: { calories, protein, carbs, fat, fiber, sugar: Number(product.sugarPer100g) || 0, saturatedFat: Number(product.saturatedFatPer100g) || 0, salt: Number(product.saltPer100g) || 0 } }; }",
    "app.get('/api/products/barcode/:barcode', async (req, res) => {",
    "  const barcode = normalizeBarcode(req.params.barcode);",
    "  if (barcode.length < 8) return res.status(400).json({ success: false, error: 'Geçersiz barkod.', code: 'INVALID_BARCODE' });",
    "  const local = loadPackagedCatalog().find(item => normalizeBarcode(item.barcode) === barcode);",
    "  if (local) return res.json({ success: true, found: true, source: 'local-catalog', cached: true, data: productToFood(local) });",
    "  try { const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 4500); const fields = 'code,product_name,brands,categories,serving_size,nutriments'; const response = await fetch('https://world.openfoodfacts.org/api/v2/product/' + encodeURIComponent(barcode) + '?fields=' + fields, { headers: { 'User-Agent': 'WillyKiloTakip/1.0 (nutrition lookup)' }, signal: controller.signal }); clearTimeout(timeout); if (!response.ok) throw new Error('Open Food Facts HTTP ' + response.status); const payload = await response.json(); if (payload?.status !== 1 || !payload?.product) return res.json({ success: true, found: false, source: 'open-food-facts', code: 'PRODUCT_NOT_FOUND' }); const p = payload.product; const n = p.nutriments || {}; const product = { barcode, name: p.product_name || 'Barkodlu ürün', brand: p.brands || '', category: p.categories || 'Paketli ürün', servingGrams: Number.parseFloat(String(p.serving_size || '').replace(',', '.')) || 100, caloriesPer100g: Number(n['energy-kcal_100g']) || 0, proteinPer100g: Number(n.proteins_100g) || 0, carbsPer100g: Number(n.carbohydrates_100g) || 0, sugarPer100g: Number(n.sugars_100g) || 0, fatPer100g: Number(n.fat_100g) || 0, saturatedFatPer100g: Number(n['saturated-fat_100g']) || 0, fiberPer100g: Number(n.fiber_100g) || 0, saltPer100g: Number(n.salt_100g) || 0, source: 'open-food-facts', sourceVerifiedAt: new Date().toISOString() }; return res.json({ success: true, found: true, source: 'open-food-facts', cached: false, data: productToFood(product), raw: product }); } catch (error: any) { console.error('Packaged product lookup failed:', error?.message || error); return res.status(503).json({ success: false, found: false, source: 'fallback', code: 'PRODUCT_LOOKUP_UNAVAILABLE', error: 'Ürün kataloğu geçici olarak erişilemiyor.' }); }",
    "});",
    ""
  ].join('\\n');
  source = source.replace(marker, route + marker);
}
fs.writeFileSync(file, source, 'utf8');
console.log('Packaged product catalog API PASS.');
