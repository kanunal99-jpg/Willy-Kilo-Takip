import { USDA } from './nutritionSources';

export type NutritionIngredient = {
  key:string; name:string; kcalPer100g:number; proteinPer100g:number; carbsPer100g:number; fatPer100g:number; fiberPer100g:number; source:string; sourceUrl:string; confidence:'reference'|'estimated';
};

export const INGREDIENTS: Record<string,NutritionIngredient> = {
  water:{key:'water',name:'Su',kcalPer100g:0,proteinPer100g:0,carbsPer100g:0,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  honey:{key:'honey',name:'Bal',kcalPer100g:304,proteinPer100g:.3,carbsPer100g:82.4,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  yogurt:{key:'yogurt',name:'Yoğurt',kcalPer100g:61,proteinPer100g:3.5,carbsPer100g:4.7,fatPer100g:3.3,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  milk:{key:'milk',name:'Süt',kcalPer100g:61,proteinPer100g:3.2,carbsPer100g:4.8,fatPer100g:3.3,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  lemon:{key:'lemon',name:'Limon',kcalPer100g:29,proteinPer100g:1.1,carbsPer100g:9.3,fatPer100g:.3,fiberPer100g:2.8,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  strawberry:{key:'strawberry',name:'Çilek',kcalPer100g:32,proteinPer100g:.7,carbsPer100g:7.7,fatPer100g:.3,fiberPer100g:2,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  apple:{key:'apple',name:'Elma',kcalPer100g:52,proteinPer100g:.3,carbsPer100g:13.8,fatPer100g:.2,fiberPer100g:2.4,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  mango:{key:'mango',name:'Mango',kcalPer100g:60,proteinPer100g:.8,carbsPer100g:15,fatPer100g:.4,fiberPer100g:1.6,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  berries:{key:'berries',name:'Orman Meyveleri',kcalPer100g:57,proteinPer100g:.7,carbsPer100g:13.8,fatPer100g:.3,fiberPer100g:4,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  ginger:{key:'ginger',name:'Zencefil',kcalPer100g:80,proteinPer100g:1.8,carbsPer100g:17.8,fatPer100g:.8,fiberPer100g:2,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  cinnamon:{key:'cinnamon',name:'Tarçın',kcalPer100g:247,proteinPer100g:4,carbsPer100g:80.6,fatPer100g:1.2,fiberPer100g:53.1,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  coffee:{key:'coffee',name:'Kahve',kcalPer100g:2,proteinPer100g:.1,carbsPer100g:0.3,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  tea:{key:'tea',name:'Çay',kcalPer100g:1,proteinPer100g:0,carbsPer100g:.2,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  herbs:{key:'herbs',name:'Taze Otlar',kcalPer100g:30,proteinPer100g:2,carbsPer100g:5,fatPer100g:.5,fiberPer100g:3,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  sugar:{key:'sugar',name:'Şeker',kcalPer100g:387,proteinPer100g:0,carbsPer100g:100,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  oats:{key:'oats',name:'Yulaf',kcalPer100g:389,proteinPer100g:16.9,carbsPer100g:66.3,fatPer100g:6.9,fiberPer100g:10.6,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  protein:{key:'protein',name:'Protein Tozu',kcalPer100g:400,proteinPer100g:80,carbsPer100g:8,fatPer100g:6,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  salt:{key:'salt',name:'İyotlu tuz',kcalPer100g:0,proteinPer100g:0,carbsPer100g:0,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  rose:{key:'rose',name:'Gül',kcalPer100g:0,proteinPer100g:0,carbsPer100g:0,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'estimated'},
};
