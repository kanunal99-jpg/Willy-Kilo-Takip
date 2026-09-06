import type { FoodItem, Recipe } from '../types';

// Core Turkish bakery foods. Nutrition is embedded directly in the app catalog.
// Values are normalized per listed serving; where a food is directly represented
// in the reference dataset, the serving is derived from its 100 g composition.
export const TURKISH_BAKERY_FOODS: FoodItem[] = [
  { id: 'bakery-simit', name: 'Simit', calories: 368, protein: 12.14, carbs: 38.42, fat: 16.46, fiber: 8.94, defaultServing: 100, unit: 'g', category: 'breakfast', pros: ['Türk kahvaltısı'], cons: ['Enerji yoğun'] },
  { id: 'bakery-pogaca-sade', name: 'Poğaça (Sade)', calories: 280, protein: 6, carbs: 31, fat: 14, defaultServing: 80, unit: 'g', category: 'breakfast', pros: ['Pratik'], cons: ['Enerji yoğun'] },
  { id: 'bakery-pogaca-peynirli', name: 'Poğaça (Peynirli)', calories: 300, protein: 8, carbs: 30, fat: 16, defaultServing: 80, unit: 'g', category: 'breakfast', pros: ['Protein içerir'], cons: ['Enerji yoğun'] },
  { id: 'bakery-pogaca-zeytinli', name: 'Poğaça (Zeytinli)', calories: 290, protein: 6, carbs: 31, fat: 15, defaultServing: 80, unit: 'g', category: 'breakfast', pros: ['Pratik'], cons: ['Enerji yoğun'] },
  { id: 'bakery-su-boregi', name: 'Su Böreği', calories: 330, protein: 9, carbs: 29, fat: 20, defaultServing: 120, unit: 'g', category: 'lunch', pros: ['Doyurucu'], cons: ['Enerji yoğun'] },
  { id: 'bakery-peynirli-borek', name: 'Peynirli Börek', calories: 315, protein: 9, carbs: 30, fat: 18, defaultServing: 110, unit: 'g', category: 'breakfast', pros: ['Protein içerir'], cons: ['Enerji yoğun'] },
  { id: 'bakery-kiymali-borek', name: 'Kıymalı Börek', calories: 340, protein: 13, carbs: 29, fat: 20, defaultServing: 110, unit: 'g', category: 'breakfast', pros: ['Protein içerir'], cons: ['Enerji yoğun'] },
  { id: 'bakery-ispanakli-borek', name: 'Ispanaklı Börek', calories: 285, protein: 7, carbs: 31, fat: 15, defaultServing: 110, unit: 'g', category: 'breakfast', pros: ['Sebze içerir'], cons: ['Enerji yoğun'] },
  { id: 'bakery-acma-sade', name: 'Açma (Sade)', calories: 300, protein: 7, carbs: 35, fat: 15, defaultServing: 90, unit: 'g', category: 'breakfast', pros: ['Pratik'], cons: ['Enerji yoğun'] },
  { id: 'bakery-acma-zeytinli', name: 'Açma (Zeytinli)', calories: 315, protein: 7, carbs: 35, fat: 17, defaultServing: 90, unit: 'g', category: 'breakfast', pros: ['Pratik'], cons: ['Enerji yoğun'] },
  { id: 'bakery-kete', name: 'Kete', calories: 320, protein: 7, carbs: 39, fat: 15, defaultServing: 100, unit: 'g', category: 'breakfast', pros: ['Geleneksel'], cons: ['Enerji yoğun'] },
  { id: 'bakery-pisi', name: 'Pişi', calories: 290, protein: 6, carbs: 34, fat: 14, defaultServing: 70, unit: 'g', category: 'breakfast', pros: ['Geleneksel'], cons: ['Kızartılmış'] },
];

export const TURKISH_BAKERY_RECIPES: Recipe[] = TURKISH_BAKERY_FOODS.map((food) => ({
  id: `${food.id}-recipe`,
  title: food.name,
  category: 'breakfast',
  calories: food.calories,
  carbs: food.carbs,
  protein: food.protein,
  fat: food.fat,
  prepTimeMinutes: 30,
  difficulty: 'Orta',
  servings: 1,
  tags: ['Türk Mutfağı', 'Hamur İşi'],
  ingredients: [{ name: food.name, amount: `${food.defaultServing} ${food.unit}` }],
  steps: ['Porsiyonu seç ve besin değerini takip et.'],
  imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
  proFeature: false,
}));
