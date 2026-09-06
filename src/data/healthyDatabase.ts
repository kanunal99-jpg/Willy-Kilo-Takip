// Auto-generated 500+ Healthy Food and Recipe Database
import { FoodItem, Recipe } from '../types';
import catalogData from './healthy_catalog.json';
import { normalizeFoods, normalizeRecipes } from './healthyCatalogNormalizer';

export const HEALTHY_FOODS_CATALOG: FoodItem[] = normalizeFoods(catalogData.foods);
export const HEALTHY_RECIPES_CATALOG: Recipe[] = normalizeRecipes(catalogData.recipes);

export const HEALTHY_DATABASE_STATS = {
  version: catalogData.version,
  updatedAt: catalogData.updatedAt,
  foodCount: catalogData.foodCount,
  recipeCount: catalogData.recipeCount,
  totalEntries: catalogData.totalEntries,
};
