import type { FoodItem, Recipe } from '../types';

const MALFORMED_FOOD_IDS = new Set([
  'food-193', 'food-194', 'food-195', 'food-196', 'food-197',
  'food-198', 'food-199', 'food-200', 'food-201',
]);

function inferFoodCategory(name: string): string {
  const n = name.toLocaleLowerCase('tr-TR');
  if (/mezgit|palamut|levrek|somon|hamsi|uskumru|sardalya|ton bal|alabalık|balık|karides|midye|kalamar|istakoz|deniz/.test(n)) return 'Balık ve Deniz Ürünleri';
  if (/tavuk|hindi|kanat|göğüs|but|pirzola|biftek|et|köfte|dana|kuzu/.test(n)) return 'Et ve Protein';
  if (/elma|armut|muz|çilek|kiraz|şeftali|kayısı|portakal|mandalina|limon|üzüm|meyve/.test(n)) return 'Meyve';
  if (/domates|biber|patlıcan|kabak|ıspanak|brokoli|havuç|lahana|fasulye|bezelye|sebze/.test(n)) return 'Sebze';
  if (/ekmek|pirinç|bulgur|makarna|yulaf|un|buğday|çavdar/.test(n)) return 'Tahıl ve Bakliyat';
  if (/süt|yoğurt|peynir|ayran|kefir/.test(n)) return 'Süt ve Süt Ürünleri';
  return 'Genel';
}

/**
 * A legacy nine-record block in healthy_catalog.json has its values shifted
 * one property to the left (category contains kcal, calories contains protein,
 * etc.). Keep the source JSON immutable and repair only this known shape at
 * the application boundary until the catalog is regenerated from the source.
 */
export function normalizeFood(raw: Record<string, unknown>): FoodItem {
  if (!MALFORMED_FOOD_IDS.has(String(raw.id)) || typeof raw.category !== 'number') {
    // The catalog is external/untyped JSON at this boundary. The runtime
    // quality gate validates the record shape; widen through unknown for the
    // intentional boundary assertion instead of suppressing TypeScript.
    return raw as unknown as FoodItem;
  }

  return {
    ...(raw as object),
    id: String(raw.id),
    name: String(raw.name ?? 'İsimsiz besin'),
    category: inferFoodCategory(String(raw.name ?? '')),
    calories: Number(raw.category),
    protein: Number(raw.calories),
    carbs: Number(raw.protein),
    fat: Number(raw.carbs),
    fiber: Number(raw.fat),
    defaultServing: Number(raw.fiber),
    unit: String(raw.defaultServing ?? 'gram'),
    healthScore: typeof raw.unit === 'number' ? raw.unit : undefined,
    pros: Array.isArray(raw.healthScore) ? raw.healthScore.filter((x): x is string => typeof x === 'string') : [],
    cons: Array.isArray(raw.pros) ? raw.pros.filter((x): x is string => typeof x === 'string') : [],
  };
}

export function normalizeFoods(rawFoods: unknown): FoodItem[] {
  if (!Array.isArray(rawFoods)) return [];
  return rawFoods.map((entry) => normalizeFood((entry ?? {}) as Record<string, unknown>));
}

export function normalizeRecipes(rawRecipes: unknown): Recipe[] {
  return Array.isArray(rawRecipes) ? (rawRecipes as Recipe[]) : [];
}
