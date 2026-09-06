import type { FoodItem } from '../types';

/**
 * Manually authored Turkish food records reviewed one-by-one against ready TürKomp entries.
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
  {
    id: 'turkomp-bulgur-pilavlik-gaziantep-12020058',
    name: 'Bulgur, pilavlık, Gaziantep',
    calories: 357,
    protein: 12.08,
    carbs: 64.97,
    fat: 3.95,
    fiber: 6.79,
    defaultServing: 100,
    unit: 'g',
    category: 'grains',
  },
  {
    id: 'turkomp-sucuk-pilic-isil-islem-03020013',
    name: 'Isıl işlem görmüş sucuk, piliç',
    calories: 353,
    protein: 13.96,
    carbs: 3.86,
    fat: 30.24,
    fiber: 4.77,
    defaultServing: 100,
    unit: 'g',
    category: 'meat',
  },
  {
    id: 'turkomp-barbunya-fasulyesi-kuru-08020051',
    name: 'Barbunya fasulyesi, kuru',
    calories: 299,
    protein: 21.07,
    carbs: 38.80,
    fat: 1.46,
    fiber: 23.21,
    defaultServing: 100,
    unit: 'g',
    category: 'legumes',
  },
];

export default TURKOMP_VERIFIED_FOODS;
