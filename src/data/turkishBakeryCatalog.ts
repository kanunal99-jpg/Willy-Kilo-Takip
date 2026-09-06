import type { FoodItem, Recipe } from '../types';

/** Everyday Turkish bakery staples with practical serving-based nutrition values. */
export const TURKISH_BAKERY_FOODS: FoodItem[] = [
  { id: 'bakery-simit', name: 'Simit', category: 'Hamur İşi', calories: 275, protein: 9, carbs: 52, fat: 5, fiber: 3, defaultServing: 1, unit: 'adet (100g)', healthScore: 72, pros: ['Pratik', 'Tok tutmaya yardımcı olur'], cons: ['Karbonhidrat yoğun'] },
  { id: 'bakery-pogaca-sade', name: 'Poğaça (Sade)', category: 'Hamur İşi', calories: 280, protein: 6, carbs: 31, fat: 14, fiber: 1, defaultServing: 1, unit: 'adet (80g)', healthScore: 62, pros: ['Pratik'], cons: ['Yağ ve enerji yoğun'] },
  { id: 'bakery-pogaca-peynirli', name: 'Poğaça (Peynirli)', category: 'Hamur İşi', calories: 300, protein: 8, carbs: 30, fat: 16, fiber: 1, defaultServing: 1, unit: 'adet (80g)', healthScore: 64, pros: ['Peynir içerir'], cons: ['Yağ ve enerji yoğun'] },
  { id: 'bakery-pogaca-zeytinli', name: 'Poğaça (Zeytinli)', category: 'Hamur İşi', calories: 290, protein: 6, carbs: 31, fat: 15, fiber: 2, defaultServing: 1, unit: 'adet (80g)', healthScore: 65, pros: ['Zeytin içerir'], cons: ['Enerji yoğun'] },
  { id: 'bakery-borek-su', name: 'Su Böreği', category: 'Hamur İşi', calories: 330, protein: 9, carbs: 29, fat: 20, fiber: 1, defaultServing: 1, unit: 'dilim (120g)', healthScore: 58, pros: ['Protein içerir'], cons: ['Yağ ve enerji yoğun'] },
  { id: 'bakery-borek-peynirli', name: 'Peynirli Börek', category: 'Hamur İşi', calories: 315, protein: 9, carbs: 30, fat: 18, fiber: 1, defaultServing: 1, unit: 'dilim (110g)', healthScore: 60, pros: ['Peynir içerir'], cons: ['Yağ ve enerji yoğun'] },
  { id: 'bakery-borek-kiymali', name: 'Kıymalı Börek', category: 'Hamur İşi', calories: 340, protein: 13, carbs: 29, fat: 20, fiber: 1, defaultServing: 1, unit: 'dilim (110g)', healthScore: 61, pros: ['Protein içerir'], cons: ['Yağ ve enerji yoğun'] },
  { id: 'bakery-borek-ispanakli', name: 'Ispanaklı Börek', category: 'Hamur İşi', calories: 285, protein: 7, carbs: 31, fat: 15, fiber: 3, defaultServing: 1, unit: 'dilim (110g)', healthScore: 67, pros: ['Ispanak içerir'], cons: ['Hamur ve yağ içerir'] },
  { id: 'bakery-acma-sade', name: 'Açma (Sade)', category: 'Hamur İşi', calories: 300, protein: 7, carbs: 35, fat: 15, fiber: 1, defaultServing: 1, unit: 'adet (90g)', healthScore: 60, pros: ['Pratik'], cons: ['Enerji yoğun'] },
  { id: 'bakery-acma-zeytinli', name: 'Açma (Zeytinli)', category: 'Hamur İşi', calories: 315, protein: 7, carbs: 35, fat: 17, fiber: 2, defaultServing: 1, unit: 'adet (90g)', healthScore: 61, pros: ['Zeytin içerir'], cons: ['Enerji yoğun'] },
  { id: 'bakery-kete', name: 'Kete', category: 'Hamur İşi', calories: 320, protein: 7, carbs: 39, fat: 15, fiber: 2, defaultServing: 1, unit: 'adet (100g)', healthScore: 59, pros: ['Pratik'], cons: ['Enerji yoğun'] },
  { id: 'bakery-pisi', name: 'Pişi', category: 'Hamur İşi', calories: 290, protein: 6, carbs: 34, fat: 14, fiber: 1, defaultServing: 1, unit: 'adet (70g)', healthScore: 55, pros: ['Pratik'], cons: ['Kızartılmış', 'Yağ içerir'] },
];

const bakeryImage = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80';

export const TURKISH_BAKERY_RECIPES: Recipe[] = TURKISH_BAKERY_FOODS.map((food) => ({
  id: food.id,
  title: food.name,
  category: 'breakfast',
  calories: food.calories,
  carbs: food.carbs,
  protein: food.protein,
  fat: food.fat,
  prepTimeMinutes: 5,
  difficulty: 'Kolay',
  servings: 1,
  tags: ['Hamur İşi', 'Kahvaltı', food.name],
  ingredients: [{ name: food.name, amount: food.unit }],
  steps: [`${food.name} için standart porsiyon bilgisi: ${food.unit}.`, `Besin değerleri bu porsiyon için yaklaşık değerlerdir.`],
  imageUrl: bakeryImage,
  proFeature: true,
}));
