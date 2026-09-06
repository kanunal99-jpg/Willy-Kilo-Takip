import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('src/data/healthy_catalog.json');
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const warnings = [];

const foods = Array.isArray(catalog.foods) ? catalog.foods : [];
const recipes = Array.isArray(catalog.recipes) ? catalog.recipes : [];

if (catalog.totalEntries !== foods.length + recipes.length) {
  errors.push(`totalEntries mismatch: ${catalog.totalEntries} != ${foods.length + recipes.length}`);
}
if (catalog.foodCount !== foods.length) errors.push(`foodCount mismatch: ${catalog.foodCount} != ${foods.length}`);
if (catalog.recipeCount !== recipes.length) errors.push(`recipeCount mismatch: ${catalog.recipeCount} != ${recipes.length}`);

const seenIds = new Set();
const requiredNumeric = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'defaultServing'];

function validateEntry(entry, kind, index) {
  const prefix = `${kind}[${index}]`;
  if (!entry || typeof entry !== 'object') {
    errors.push(`${prefix}: entry is not an object`);
    return;
  }
  if (typeof entry.id !== 'string' || !entry.id.trim()) errors.push(`${prefix}: invalid id`);
  if (entry.id && seenIds.has(entry.id)) errors.push(`${prefix}: duplicate id ${entry.id}`);
  if (entry.id) seenIds.add(entry.id);
  if (typeof entry.name !== 'string' || !entry.name.trim()) errors.push(`${prefix}: invalid name`);
  if (typeof entry.category !== 'string' || !entry.category.trim()) errors.push(`${prefix}: invalid category`);
  if (typeof entry.unit !== 'string' || !entry.unit.trim()) errors.push(`${prefix}: invalid unit`);

  for (const field of requiredNumeric) {
    if (typeof entry[field] !== 'number' || !Number.isFinite(entry[field])) {
      errors.push(`${prefix}: ${field} must be a finite number`);
    } else if (entry[field] < 0) {
      errors.push(`${prefix}: ${field} cannot be negative`);
    }
  }

  if (typeof entry.calories === 'number' && entry.calories > 0 &&
      typeof entry.protein === 'number' && typeof entry.carbs === 'number' && typeof entry.fat === 'number') {
    const macroKcal = entry.protein * 4 + entry.carbs * 4 + entry.fat * 9;
    const tolerance = Math.max(35, entry.calories * 0.35);
    if (Math.abs(macroKcal - entry.calories) > tolerance) {
      warnings.push(`${prefix} ${entry.id}: kcal ${entry.calories} vs macro-derived ${macroKcal.toFixed(1)}`);
    }
  }
}

foods.forEach((entry, i) => validateEntry(entry, 'food', i));
recipes.forEach((entry, i) => validateEntry(entry, 'recipe', i));

console.log(`Nutrition catalog audit: ${foods.length} foods + ${recipes.length} recipes = ${foods.length + recipes.length} entries`);
console.log(`Structural errors: ${errors.length}`);
console.log(`Macro-energy warnings: ${warnings.length}`);

if (warnings.length) {
  for (const warning of warnings.slice(0, 25)) console.warn(`WARN ${warning}`);
  if (warnings.length > 25) console.warn(`WARN ... ${warnings.length - 25} additional warnings`);
}
if (errors.length) {
  for (const error of errors.slice(0, 50)) console.error(`ERROR ${error}`);
  if (errors.length > 50) console.error(`ERROR ... ${errors.length - 50} additional errors`);
  process.exit(1);
}

console.log('Nutrition catalog quality gate: PASS');
