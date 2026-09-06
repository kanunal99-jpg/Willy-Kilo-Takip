import type { FoodItem } from '../types';

/**
 * Manually curated Turkish foods from verified public TürKomp records.
 * Values are stored exactly on a 100 g edible basis; no recipe calculation is applied.
 * Source pages are intentionally not exposed in the app UI.
 */
export const TURKOMP_VERIFIED_FOODS: FoodItem[] = [
  {
    id: 'turkomp-simit-izmir-12020021',
    name: 'Simit, İzmir',
    calories: 368,
    protein: 12.14,
    carbs: 38.42,
    fat: 16.46,
    fiber: 8.94,
    defaultServing: 100,
    unit: 'g',
    category: 'breakfast',
  },
  {
    id: 'turkomp-kayseri-sucugu-12020075',
    name: 'Kayseri sucuğu',
    calories: 431,
    protein: 20.38,
    carbs: 9.54,
    fat: 34.36,
    fiber: 1.01,
    defaultServing: 100,
    unit: 'g',
    category: 'meat',
  },
];

export default TURKOMP_VERIFIED_FOODS;
