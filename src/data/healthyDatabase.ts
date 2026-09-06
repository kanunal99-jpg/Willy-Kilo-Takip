// Auto-generated 500+ Healthy Food and Recipe Database
import { FoodItem, Recipe } from '../types';
import catalogData from './healthy_catalog.json';
import { normalizeFoods, normalizeRecipes } from './healthyCatalogNormalizer';
import { TURKISH_HOME_FOODS, TURKISH_HOME_RECIPES } from './turkishHomeFoods';

export const HEALTHY_FOODS_CATALOG: FoodItem[] = normalizeFoods([...catalogData.foods, ...TURKISH_HOME_FOODS]);
export const HEALTHY_RECIPES_CATALOG: Recipe[] = normalizeRecipes([...catalogData.recipes, ...TURKISH_HOME_RECIPES]);

export const HEALTHY_DATABASE_STATS = {
  version: catalogData.version,
  updatedAt: catalogData.updatedAt,
  foodCount: HEALTHY_FOODS_CATALOG.length,
  recipeCount: HEALTHY_RECIPES_CATALOG.length,
  totalEntries: HEALTHY_FOODS_CATALOG.length + HEALTHY_RECIPES_CATALOG.length,
};
