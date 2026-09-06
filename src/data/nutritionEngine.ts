import { NUTRITION_SOURCES, USDA } from './nutritionSources';

export type RecipeIngredient = { key: string; name: string; amount?: number; unit?: string; grams?: number };
export type NutritionInput = { key: string; grams: number };

type NutritionEntry = {
  key: string; name: string; kcalPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number; fiberPer100g: number;
  source: string; sourceUrl: string; confidence: 'reference' | 'estimated';
};

const ingredient = (key: string, name: string, kcal: number, protein: number, carbs: number, fat: number, fiber: number): NutritionEntry => ({
  key, name, kcalPer100g: kcal, proteinPer100g: protein, carbsPer100g: carbs, fatPer100g: fat, fiberPer100g: fiber,
  source: NUTRITION_SOURCES.default, sourceUrl: USDA, confidence: 'reference',
});

export const INGREDIENTS: Record<string, NutritionEntry> = {
  water: ingredient('water', 'Su', 0, 0, 0, 0, 0), honey: ingredient('honey', 'Bal', 304, 0.3, 82.4, 0, 0), yogurt: ingredient('yogurt', 'Yoğurt', 61, 3.5, 4.7, 3.3, 0), milk: ingredient('milk', 'Süt', 61, 3.2, 4.8, 3.3, 0), lemon: ingredient('lemon', 'Limon', 29, 1.1, 9.3, 0.3, 2.8), strawberry: ingredient('strawberry', 'Çilek', 32, 0.7, 7.7, 0.3, 2), apple: ingredient('apple', 'Elma', 52, 0.3, 13.8, 0.2, 2.4), mango: ingredient('mango', 'Mango', 60, 0.8, 15, 0.4, 1.6), berries: ingredient('berries', 'Orman Meyveleri', 57, 0.7, 13.8, 0.3, 4), ginger: ingredient('ginger', 'Zencefil', 80, 1.8, 17.8, 0.8, 2), cinnamon: ingredient('cinnamon', 'Tarçın', 247, 4, 80.6, 1.2, 53.1), coffee: ingredient('coffee', 'Kahve', 2, 0.1, 0.3, 0, 0), tea: ingredient('tea', 'Çay', 1, 0, 0.2, 0, 0), herbs: ingredient('herbs', 'Taze Otlar', 30, 2, 5, 0.5, 3), sugar: ingredient('sugar', 'Şeker', 387, 0, 100, 0, 0), oats: ingredient('oats', 'Yulaf', 389, 16.9, 66.3, 6.9, 10.6), protein: ingredient('protein', 'Protein Tozu', 400, 80, 8, 6, 0), salt: ingredient('salt', 'İyotlu tuz', 0, 0, 0, 0, 0), rose: ingredient('rose', 'Gül', 0, 0, 0, 0, 0), mint: ingredient('mint', 'Nane', 44, 3.3, 8.4, 0.7, 6.8), vanilla: ingredient('vanilla', 'Vanilya', 288, 0.1, 12.7, 0.1, 0), cocoa: ingredient('cocoa', 'Kakao', 228, 19.6, 57.9, 13.1, 33.2), banana: ingredient('banana', 'Muz', 89, 1.1, 22.8, 0.3, 2.6), orange: ingredient('orange', 'Portakal', 47, 0.9, 11.8, 0.1, 2.4), peach: ingredient('peach', 'Şeftali', 39, 0.9, 9.5, 0.3, 1.5), pomegranate: ingredient('pomegranate', 'Nar', 83, 1.7, 18.7, 1.2, 4), grape: ingredient('grape', 'Üzüm', 69, 0.7, 18.1, 0.2, 0.9), carrot: ingredient('carrot', 'Havuç', 41, 0.9, 9.6, 0.2, 2.8), cucumber: ingredient('cucumber', 'Salatalık', 15, 0.7, 3.6, 0.1, 0.5), lime: ingredient('lime', 'Misket limonu', 30, 0.7, 10.5, 0.2, 2.8), watermelon: ingredient('watermelon', 'Karpuz', 30, 0.6, 7.6, 0.2, 0.4), chocolate: ingredient('chocolate', 'Bitter çikolata', 598, 7.8, 45.9, 42.6, 10.9), almond: ingredient('almond', 'Badem', 579, 21.2, 21.6, 49.9, 12.5), peanut: ingredient('peanut', 'Yer fıstığı', 567, 25.8, 16.1, 49.2, 8.5), hazelnut: ingredient('hazelnut', 'Fındık', 628, 14.9, 16.7, 60.8, 9.7), date: ingredient('date', 'Hurma', 282, 2.5, 75, 0.4, 8), chia: ingredient('chia', 'Chia', 486, 16.5, 42.1, 30.7, 34.4), flaxseed: ingredient('flaxseed', 'Keten tohumu', 534, 18.3, 28.9, 42.2, 27.3), avocado: ingredient('avocado', 'Avokado', 160, 2, 8.5, 14.7, 6.7), beet: ingredient('beet', 'Pancar', 43, 1.6, 9.6, 0.2, 2.8), spinach: ingredient('spinach', 'Ispanak', 23, 2.9, 3.6, 0.4, 2.2), celery: ingredient('celery', 'Kereviz', 16, 0.7, 3, 0.2, 1.6), parsley: ingredient('parsley', 'Maydanoz', 36, 3, 6.3, 0.8, 3.3), lemon_peel: ingredient('lemon_peel', 'Limon kabuğu', 47, 1.5, 16, 0.3, 10.6), rosewater: ingredient('rosewater', 'Gül suyu', 0, 0, 0, 0, 0), sparkling_water: ingredient('sparkling_water', 'Maden suyu', 0, 0, 0, 0, 0), ice: ingredient('ice', 'Buz', 0, 0, 0, 0, 0), turmeric: ingredient('turmeric', 'Zerdeçal', 312, 9.7, 67.1, 3.2, 22.7), cardamom: ingredient('cardamom', 'Kakule', 311, 10.8, 68.5, 6.7, 28), clove: ingredient('clove', 'Karanfil', 274, 6, 65.5, 13, 33.9), black_pepper: ingredient('black_pepper', 'Karabiber', 251, 10.4, 63.9, 3.3, 25.3), coconut: ingredient('coconut', 'Hindistan cevizi', 354, 3.3, 15.2, 33.5, 9), coconut_milk: ingredient('coconut_milk', 'Hindistan cevizi sütü', 230, 2.3, 5.5, 23.8, 2.2), tahini: ingredient('tahini', 'Tahin', 595, 17, 21.2, 53.8, 9.3), molasses: ingredient('molasses', 'Pekmez', 290, 0, 74, 0, 0), boza: ingredient('boza', 'Boza', 87, 3.5, 17, 0.5, 1), black_tea: ingredient('black_tea', 'Siyah çay', 1, 0, 0.2, 0, 0), green_tea: ingredient('green_tea', 'Yeşil çay', 1, 0, 0.2, 0, 0), protein_plant: ingredient('protein_plant', 'Bitkisel protein', 380, 75, 10, 5, 2), raspberry: ingredient('raspberry', 'Ahududu', 52, 1.2, 11.9, 0.7, 6.5), blueberry: ingredient('blueberry', 'Yaban mersini', 57, 0.7, 14.5, 0.3, 2.4), kiwi: ingredient('kiwi', 'Kivi', 61, 1.1, 14.7, 0.5, 3), pineapple: ingredient('pineapple', 'Ananas', 50, 0.5, 13.1, 0.1, 1.4), pear: ingredient('pear', 'Armut', 57, 0.4, 15.2, 0.1, 3.1), cherry: ingredient('cherry', 'Vişne', 50, 1, 12, 0.3, 1.6), sourcherry: ingredient('sourcherry', 'Ekşi vişne', 50, 1, 12, 0.3, 1.6), apricot: ingredient('apricot', 'Kayısı', 48, 1.4, 11.1, 0.4, 2), plum: ingredient('plum', 'Erik', 46, 0.7, 11.4, 0.3, 1.4), tamarind: ingredient('tamarind', 'Demirhindi', 239, 2.8, 62.5, 0.6, 5.1), hibiscus: ingredient('hibiscus', 'Hibiskus', 0, 0, 0, 0, 0), chamomile: ingredient('chamomile', 'Papatya', 0, 0, 0, 0, 0), linden: ingredient('linden', 'Ihlamur', 0, 0, 0, 0, 0), sage: ingredient('sage', 'Adaçayı', 0, 0, 0, 0, 0), rosehip: ingredient('rosehip', 'Kuşburnu', 162, 1.6, 38.2, 0.3, 24), salep: ingredient('salep', 'Salep', 0, 0, 0, 0, 0), şalgam: ingredient('şalgam', 'Şalgam suyu', 5, 0.2, 1, 0, 0), compote: ingredient('compote', 'Ev kompostosu', 50, 0.2, 12, 0.1, 1.5), classic: ingredient('classic', 'Klasik', 0, 0, 0, 0, 0),
};

export type NutritionIngredient = Omit<NutritionEntry, 'confidence'> & { amount: number; unit: string; calories: number; confidence: number };
export type NutritionProvenance = { source: string; confidence: number; entries: NutritionEntry[] };
export type NutritionResult = { ingredients: NutritionIngredient[]; calories: number; kcal: number; protein: number; carbs: number; fat: number; fiber: number; source: string; confidence: number; provenance: NutritionProvenance };

type CompatibleIngredient = RecipeIngredient | NutritionInput;
function toCanonical(item: CompatibleIngredient): { key: string; name: string; amount: number; unit: string } {
  const fallbackName = INGREDIENTS[item.key]?.name ?? item.key;
  if ('grams' in item && typeof item.grams === 'number') {
    return { key: item.key, name: 'name' in item && typeof item.name === 'string' ? item.name : fallbackName, amount: item.grams, unit: 'g' };
  }
  if ('amount' in item && typeof item.amount === 'number') {
    return { key: item.key, name: 'name' in item && typeof item.name === 'string' ? item.name : fallbackName, amount: item.amount, unit: item.unit || 'g' };
  }
  throw new Error(`Invalid nutrition ingredient amount: ${item.key}`);
}

export function calculateNutrition(items: CompatibleIngredient[], servings = 1): NutritionResult {
  const normalizedServings = Math.max(1, servings);
  const mapped: NutritionIngredient[] = items.map((raw) => {
    const item = toCanonical(raw); const n = INGREDIENTS[item.key]; if (!n) throw new Error(`Nutrition ingredient not found: ${item.key}`); const ratio = item.amount / 100;
    return { ...n, amount: item.amount, unit: item.unit, source: n.source, confidence: n.confidence === 'reference' ? 1 : 0.7, calories: n.kcalPer100g * ratio };
  });
  const totals = mapped.reduce((a, x) => ({ calories: a.calories + x.calories, protein: a.protein + x.proteinPer100g * (x.amount / 100), carbs: a.carbs + x.carbsPer100g * (x.amount / 100), fat: a.fat + x.fatPer100g * (x.amount / 100), fiber: a.fiber + x.fiberPer100g * (x.amount / 100) }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const perServing = { calories: totals.calories / normalizedServings, protein: totals.protein / normalizedServings, carbs: totals.carbs / normalizedServings, fat: totals.fat / normalizedServings, fiber: totals.fiber / normalizedServings };
  const source = mapped.length ? [...new Set(mapped.map((x) => x.source))].join(', ') : NUTRITION_SOURCES.default;
  const entries: NutritionEntry[] = mapped.map((x) => ({ key: x.key, name: x.name, kcalPer100g: x.kcalPer100g, proteinPer100g: x.proteinPer100g, carbsPer100g: x.carbsPer100g, fatPer100g: x.fatPer100g, fiberPer100g: x.fiberPer100g, source: x.source, sourceUrl: x.sourceUrl, confidence: x.confidence === 1 ? 'reference' : 'estimated' }));
  const confidence = mapped.length ? mapped.reduce((sum, x) => sum + x.confidence, 0) / mapped.length : 0;
  return { ingredients: mapped, calories: perServing.calories, kcal: perServing.calories, protein: perServing.protein, carbs: perServing.carbs, fat: perServing.fat, fiber: perServing.fiber, source, confidence, provenance: { source, confidence, entries } };
}

export function nutritionAudit(items: CompatibleIngredient[], servings = 1) { return calculateNutrition(items, servings); }
