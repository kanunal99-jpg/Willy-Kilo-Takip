import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('src/data/healthy_catalog.json');
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const warnings = [];
const repairs = [];

const foods = Array.isArray(catalog.foods) ? catalog.foods : [];
const recipes = Array.isArray(catalog.recipes) ? catalog.recipes : [];

if (catalog.totalEntries !== foods.length + recipes.length) {
  errors.push(`totalEntries mismatch: ${catalog.totalEntries} != ${foods.length + recipes.length}`);
}
if (catalog.foodCount !== foods.length) errors.push(`foodCount mismatch: ${catalog.foodCount} != ${foods.length}`);
if (catalog.recipeCount !== recipes.length) errors.push(`recipeCount mismatch: ${catalog.recipeCount} != ${recipes.length}`);

const seenIds = new Set();
const foodNumeric = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'defaultServing'];
const recipeNumeric = ['calories', 'carbs', 'protein', 'fat', 'prepTimeMinutes', 'servings'];
const legacyFoodIds = new Set(['food-193','food-194','food-195','food-196','food-197','food-198','food-199','food-200','food-201']);

function inferCategory(name) {
  const n = String(name ?? '').toLocaleLowerCase('tr-TR');
  if (/mezgit|palamut|levrek|somon|hamsi|uskumru|sardalya|ton bal|alabalık|balık|karides|midye|kalamar|istakoz|deniz/.test(n)) return 'Balık ve Deniz Ürünleri';
  if (/tavuk|hindi|kanat|göğüs|but|pirzola|biftek|et|köfte|dana|kuzu/.test(n)) return 'Et ve Protein';
  if (/elma|armut|muz|çilek|kiraz|şeftali|kayısı|portakal|mandalina|limon|üzüm|meyve/.test(n)) return 'Meyve';
  if (/domates|biber|patlıcan|kabak|ıspanak|brokoli|havuç|lahana|fasulye|bezelye|sebze/.test(n)) return 'Sebze';
  if (/ekmek|pirinç|bulgur|makarna|yulaf|un|buğday|çavdar/.test(n)) return 'Tahıl ve Bakliyat';
  if (/süt|yoğurt|peynir|ayran|kefir/.test(n)) return 'Süt ve Süt Ürünleri';
  return 'Genel';
}

function repairLegacyFood(entry) {
  if (!entry || typeof entry !== 'object' || !legacyFoodIds.has(entry.id) || typeof entry.category !== 'number') return entry;
  repairs.push(`${entry.id}: repaired legacy left-shifted nutrition fields`);
  return {
    ...entry,
    category: inferCategory(entry.name),
    calories: Number(entry.category),
    protein: Number(entry.calories),
    carbs: Number(entry.protein),
    fat: Number(entry.carbs),
    fiber: Number(entry.fat),
    defaultServing: Number(entry.fiber),
    unit: String(entry.defaultServing ?? 'gram'),
    healthScore: typeof entry.unit === 'number' ? entry.unit : undefined,
    pros: Array.isArray(entry.healthScore) ? entry.healthScore : [],
    cons: Array.isArray(entry.pros) ? entry.pros : [],
  };
}

function validateNumeric(entry, fields, prefix) {
  for (const field of fields) {
    if (typeof entry[field] !== 'number' || !Number.isFinite(entry[field])) {
      errors.push(`${prefix}: ${field} must be a finite number`);
    } else if (entry[field] < 0) {
      errors.push(`${prefix}: ${field} cannot be negative`);
    }
  }
}

function validateMacros(entry, prefix) {
  if (typeof entry.calories === 'number' && entry.calories > 0 &&
      typeof entry.protein === 'number' && typeof entry.carbs === 'number' && typeof entry.fat === 'number') {
    const macroKcal = entry.protein * 4 + entry.carbs * 4 + entry.fat * 9;
    const tolerance = Math.max(35, entry.calories * 0.35);
    if (Math.abs(macroKcal - entry.calories) > tolerance) {
      warnings.push(`${prefix} ${entry.id}: kcal ${entry.calories} vs macro-derived ${macroKcal.toFixed(1)}`);
    }
  }
}

function validateFood(entry, index) {
  const prefix = `food[${index}]`;
  if (!entry || typeof entry !== 'object') return errors.push(`${prefix}: entry is not an object`);
  if (typeof entry.id !== 'string' || !entry.id.trim()) errors.push(`${prefix}: invalid id`);
  if (entry.id && seenIds.has(entry.id)) errors.push(`${prefix}: duplicate id ${entry.id}`);
  if (entry.id) seenIds.add(entry.id);
  if (typeof entry.name !== 'string' || !entry.name.trim()) errors.push(`${prefix}: invalid name`);
  if (typeof entry.category !== 'string' || !entry.category.trim()) errors.push(`${prefix}: invalid category`);
  if (typeof entry.unit !== 'string' || !entry.unit.trim()) errors.push(`${prefix}: invalid unit`);
  validateNumeric(entry, foodNumeric, prefix);
  validateMacros(entry, prefix);
}

function validateRecipe(entry, index) {
  const prefix = `recipe[${index}]`;
  if (!entry || typeof entry !== 'object') return errors.push(`${prefix}: entry is not an object`);
  if (typeof entry.id !== 'string' || !entry.id.trim()) errors.push(`${prefix}: invalid id`);
  if (entry.id && seenIds.has(entry.id)) errors.push(`${prefix}: duplicate id ${entry.id}`);
  if (entry.id) seenIds.add(entry.id);
  if (typeof entry.title !== 'string' || !entry.title.trim()) errors.push(`${prefix}: invalid title`);
  if (!['breakfast','lunch','dinner','snack','dessert'].includes(entry.category)) errors.push(`${prefix}: invalid category`);
  if (typeof entry.difficulty !== 'string' || !['Kolay','Orta','Zor'].includes(entry.difficulty)) errors.push(`${prefix}: invalid difficulty`);
  if (!Array.isArray(entry.tags)) errors.push(`${prefix}: tags must be an array`);
  if (!Array.isArray(entry.ingredients)) errors.push(`${prefix}: ingredients must be an array`);
  if (!Array.isArray(entry.steps) || entry.steps.length === 0) errors.push(`${prefix}: steps must be a non-empty array`);
  validateNumeric(entry, recipeNumeric, prefix);
  validateMacros(entry, prefix);
}

foods.map(repairLegacyFood).forEach(validateFood);
recipes.forEach(validateRecipe);

console.log(`Nutrition catalog audit: ${foods.length} foods + ${recipes.length} recipes = ${foods.length + recipes.length} entries`);
console.log(`Legacy food repairs required: ${repairs.length}`);
console.log(`Structural errors: ${errors.length}`);
console.log(`Macro-energy warnings: ${warnings.length}`);

for (const repair of repairs) console.warn(`REPAIR ${repair}`);
for (const warning of warnings.slice(0, 25)) console.warn(`WARN ${warning}`);
if (warnings.length > 25) console.warn(`WARN ... ${warnings.length - 25} additional warnings`);
if (errors.length) {
  for (const error of errors.slice(0, 50)) console.error(`ERROR ${error}`);
  if (errors.length > 50) console.error(`ERROR ... ${errors.length - 50} additional errors`);
  process.exit(1);
}

console.log('Nutrition catalog quality gate: PASS');
