export type NutritionSource = 'TURKOMP' | 'USDA_FDC_REFERENCE';

export type IngredientNutrition = {
  key: string;
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  source: NutritionSource;
  sourceId?: string;
  sourceUrl: string;
  confidence: 'verified' | 'reference';
};

export type RecipeIngredient = {
  key: string;
  name: string;
  grams: number;
};

export type CalculatedNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  kcalPer100ml: number;
  provenance: {
    source: NutritionSource;
    confidence: 'verified' | 'reference';
    ingredients: Array<{ key: string; grams: number; source: NutritionSource; sourceId?: string }>;
  };
};

const TURKOMP = 'https://turkomp.tarimorman.gov.tr/';
const USDA = 'https://fdc.nal.usda.gov/';

// Values are normalized to edible 100 g. Values without a TürKomp record are
// explicitly marked as USDA reference values; they are never presented as TürKomp data.
export const INGREDIENTS: Record<string, IngredientNutrition> = {
  water: { key:'water', name:'İçme suyu', kcalPer100g:0, proteinPer100g:0, carbsPer100g:0, fatPer100g:0, fiberPer100g:0, source:'TURKOMP', sourceId:'11.02.0005', sourceUrl:TURKOMP+'food-su-icme-kullanma-414', confidence:'verified' },
  honey: { key:'honey', name:'Çam balı', kcalPer100g:327, proteinPer100g:.13, carbsPer100g:81.73, fatPer100g:0, fiberPer100g:0, source:'TURKOMP', sourceId:'10.02.0002', sourceUrl:TURKOMP+'food-bal-cam-287', confidence:'verified' },
  yogurt: { key:'yogurt', name:'Sade yoğurt', kcalPer100g:61, proteinPer100g:3.5, carbsPer100g:4.7, fatPer100g:3.3, fiberPer100g:0, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  milk: { key:'milk', name:'İnek sütü', kcalPer100g:61, proteinPer100g:3.2, carbsPer100g:4.8, fatPer100g:3.3, fiberPer100g:0, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  lemon: { key:'lemon', name:'Limon suyu', kcalPer100g:22, proteinPer100g:.35, carbsPer100g:6.9, fatPer100g:.24, fiberPer100g:.3, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  strawberry: { key:'strawberry', name:'Çilek', kcalPer100g:32, proteinPer100g:.67, carbsPer100g:7.68, fatPer100g:.3, fiberPer100g:2, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  apple: { key:'apple', name:'Elma', kcalPer100g:52, proteinPer100g:.26, carbsPer100g:13.81, fatPer100g:.17, fiberPer100g:2.4, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  mango: { key:'mango', name:'Mango', kcalPer100g:60, proteinPer100g:.82, carbsPer100g:14.98, fatPer100g:.38, fiberPer100g:1.6, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  berries: { key:'berries', name:'Orman meyveleri', kcalPer100g:50, proteinPer100g:.8, carbsPer100g:12, fatPer100g:.3, fiberPer100g:4, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  ginger: { key:'ginger', name:'Taze zencefil', kcalPer100g:80, proteinPer100g:1.82, carbsPer100g:17.77, fatPer100g:.75, fiberPer100g:2, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  cinnamon: { key:'cinnamon', name:'Tarçın', kcalPer100g:247, proteinPer100g:3.99, carbsPer100g:80.59, fatPer100g:1.24, fiberPer100g:53.1, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  coffee: { key:'coffee', name:'Çekilmiş kahve', kcalPer100g:2, proteinPer100g:.12, carbsPer100g:.04, fatPer100g:.02, fiberPer100g:0, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  tea: { key:'tea', name:'Demlenmiş çay', kcalPer100g:1, proteinPer100g:.06, carbsPer100g:.17, fatPer100g:0, fiberPer100g:0, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  herbs: { key:'herbs', name:'Taze ot/bitki', kcalPer100g:28, proteinPer100g:2.5, carbsPer100g:5, fatPer100g:.5, fiberPer100g:3, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  sugar: { key:'sugar', name:'Toz şeker', kcalPer100g:387, proteinPer100g:0, carbsPer100g:100, fatPer100g:0, fiberPer100g:0, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  oats: { key:'oats', name:'Yulaf', kcalPer100g:389, proteinPer100g:16.9, carbsPer100g:66.3, fatPer100g:6.9, fiberPer100g:10.6, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  protein: { key:'protein', name:'Protein tozu', kcalPer100g:400, proteinPer100g:80, carbsPer100g:8, fatPer100g:6, fiberPer100g:2, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
  // Salt contributes negligible macronutrients at recipe quantities; it is kept
  // as an explicit reference ingredient so nutrition provenance remains complete.
  salt: { key:'salt', name:'İyotlu tuz', kcalPer100g:0, proteinPer100g:0, carbsPer100g:0, fatPer100g:0, fiberPer100g:0, source:'USDA_FDC_REFERENCE', sourceUrl:USDA, confidence:'reference' },
};

export function calculateNutrition(ingredients: RecipeIngredient[], volumeMl: number): CalculatedNutrition {
  let calories=0, protein=0, carbs=0, fat=0, fiber=0;
  const provenance = ingredients.map(item => {
    const n=INGREDIENTS[item.key];
    if(!n) throw new Error(`Nutrition ingredient not found: ${item.key}`);
    const f=item.grams/100;
    calories += n.kcalPer100g*f;
    protein += n.proteinPer100g*f;
    carbs += n.carbsPer100g*f;
    fat += n.fatPer100g*f;
    fiber += n.fiberPer100g*f;
    return {key:item.key, grams:item.grams, source:n.source, sourceId:n.sourceId};
  });
  const confidence = ingredients.every(i=>INGREDIENTS[i.key]?.confidence==='verified') ? 'verified' : 'reference';
  const source = ingredients.every(i=>INGREDIENTS[i.key]?.source==='TURKOMP') ? 'TURKOMP' : 'USDA_FDC_REFERENCE';
  return {
    calories:Math.round(calories), protein:Math.round(protein*10)/10, carbs:Math.round(carbs*10)/10,
    fat:Math.round(fat*10)/10, fiber:Math.round(fiber*10)/10,
    kcalPer100ml: volumeMl ? Math.round(calories/volumeMl*100*10)/10 : 0,
    provenance:{source,confidence,ingredients:provenance}
  };
}

export function nutritionAudit(ingredients: RecipeIngredient[]) {
  return ingredients.map(item=>({
    ingredient:item.name,
    grams:item.grams,
    source:INGREDIENTS[item.key]?.source ?? 'MISSING',
    sourceId:INGREDIENTS[item.key]?.sourceId ?? null,
    confidence:INGREDIENTS[item.key]?.confidence ?? 'missing'
  }));
}