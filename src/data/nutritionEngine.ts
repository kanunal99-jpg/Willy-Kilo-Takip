import { NUTRITION_SOURCES } from './nutritionSources';

export type RecipeIngredient = { key: string; name: string; amount: number; unit: string };
export type NutritionIngredient = { key: string; name: string; amount: number; unit: string; source: string; confidence: number; calories: number; protein: number; carbs: number; fat: number };
export type NutritionResult = { ingredients: NutritionIngredient[]; calories: number; protein: number; carbs: number; fat: number; source: string; confidence: number };

export function calculateNutrition(ingredients: RecipeIngredient[], servings = 1): NutritionResult {
  const normalizedServings = Math.max(1, servings);
  const mapped = ingredients.map((item) => {
    const n = INGREDIENTS[item.key];
    if (!n) throw new Error(`Nutrition ingredient not found: ${item.key}`);
    const ratio = item.amount / n.baseAmount;
    return { key: item.key, name: n.name, amount: item.amount, unit: item.unit, source: n.source, confidence: n.confidence, calories: n.calories * ratio, protein: n.protein * ratio, carbs: n.carbs * ratio, fat: n.fat * ratio };
  });
  const total = mapped.reduce((a, x) => ({ calories: a.calories + x.calories, protein: a.protein + x.protein, carbs: a.carbs + x.carbs, fat: a.fat + x.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  return { ingredients: mapped, calories: total.calories / normalizedServings, protein: total.protein / normalizedServings, carbs: total.carbs / normalizedServings, fat: total.fat / normalizedServings, source: mapped.length ? mapped.map((x) => x.source).join(', ') : NUTRITION_SOURCES.default, confidence: mapped.length ? mapped.reduce((s, x) => s + x.confidence, 0) / mapped.length : 0 };
}
export function nutritionAudit(ingredients: RecipeIngredient[], servings = 1) { const r = calculateNutrition(ingredients, servings); return { source: r.source, confidence: r.confidence, ingredientCount: r.ingredients.length, calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat }; }

type NutritionEntry = { name: string; baseAmount: number; calories: number; protein: number; carbs: number; fat: number; source: string; confidence: number };
const INGREDIENTS: Record<string, NutritionEntry> = {
  salt: { name: 'İyotlu tuz', baseAmount: 100, calories: 0, protein: 0, carbs: 0, fat: 0, source: NUTRITION_SOURCES.default, confidence: 0.99 },
  rose: { name: 'Gül suyu', baseAmount: 100, calories: 0, protein: 0, carbs: 0, fat: 0, source: NUTRITION_SOURCES.default, confidence: 0.95 },
};
