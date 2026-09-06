import { USDA } from './nutritionSources';

export type NutritionIngredient = {
  key:string; name:string; kcalPer100g:number; proteinPer100g:number; carbsPer100g:number; fatPer100g:number; fiberPer100g:number; source:string; sourceUrl:string; confidence:'reference'|'estimated'
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
  coffee:{key:'coffee',name:'Kahve',kcalPer100g:2,proteinPer100g:.1,carbsPer100g:.3,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  tea:{key:'tea',name:'Çay',kcalPer100g:1,proteinPer100g:0,carbsPer100g:.2,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  herbs:{key:'herbs',name:'Taze Otlar',kcalPer100g:30,proteinPer100g:2,carbsPer100g:5,fatPer100g:.5,fiberPer100g:3,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  sugar:{key:'sugar',name:'Şeker',kcalPer100g:387,proteinPer100g:0,carbsPer100g:100,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  oats:{key:'oats',name:'Yulaf',kcalPer100g:389,proteinPer100g:16.9,carbsPer100g:66.3,fatPer100g:6.9,fiberPer100g:10.6,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  protein:{key:'protein',name:'Protein Tozu',kcalPer100g:400,proteinPer100g:80,carbsPer100g:8,fatPer100g:6,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  salt:{key:'salt',name:'İyotlu tuz',kcalPer100g:0,proteinPer100g:0,carbsPer100g:0,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  rose:{key:'rose',name:'Gül',kcalPer100g:0,proteinPer100g:0,carbsPer100g:0,fatPer100g:0,fiberPer100g:0,source:'USDA_REFERENCE',sourceUrl:USDA,confidence:'estimated'},
  mint:{key:'mint',name:'Nane',kcalPer100g:44,proteinPer100g:3.3,carbsPer100g:8.4,fatPer100g:.7,fiberPer100g:6.8,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  vanilla:{key:'vanilla',name:'Vanilya',kcalPer100g:288,proteinPer100g:.1,carbsPer100g:12.7,fatPer100g:.1,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  cocoa:{key:'cocoa',name:'Kakao',kcalPer100g:228,proteinPer100g:19.6,carbsPer100g:57.9,fatPer100g:13.1,fiberPer100g:33.2,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  banana:{key:'banana',name:'Muz',kcalPer100g:89,proteinPer100g:1.1,carbsPer100g:22.8,fatPer100g:.3,fiberPer100g:2.6,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  orange:{key:'orange',name:'Portakal',kcalPer100g:47,proteinPer100g:.9,carbsPer100g:11.8,fatPer100g:.1,fiberPer100g:2.4,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  peach:{key:'peach',name:'Şeftali',kcalPer100g:39,proteinPer100g:.9,carbsPer100g:9.5,fatPer100g:.3,fiberPer100g:1.5,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  pomegranate:{key:'pomegranate',name:'Nar',kcalPer100g:83,proteinPer100g:1.7,carbsPer100g:18.7,fatPer100g:1.2,fiberPer100g:4,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  grape:{key:'grape',name:'Üzüm',kcalPer100g:69,proteinPer100g:.7,carbsPer100g:18.1,fatPer100g:.2,fiberPer100g:.9,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  carrot:{key:'carrot',name:'Havuç',kcalPer100g:41,proteinPer100g:.9,carbsPer100g:9.6,fatPer100g:.2,fiberPer100g:2.8,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  cucumber:{key:'cucumber',name:'Salatalık',kcalPer100g:15,proteinPer100g:.7,carbsPer100g:3.6,fatPer100g:.1,fiberPer100g:.5,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  lime:{key:'lime',name:'Misket limonu',kcalPer100g:30,proteinPer100g:.7,carbsPer100g:10.5,fatPer100g:.2,fiberPer100g:2.8,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  watermelon:{key:'watermelon',name:'Karpuz',kcalPer100g:30,proteinPer100g:.6,carbsPer100g:7.6,fatPer100g:.2,fiberPer100g:.4,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  chocolate:{key:'chocolate',name:'Bitter çikolata',kcalPer100g:598,proteinPer100g:7.8,carbsPer100g:45.9,fatPer100g:42.6,fiberPer100g:10.9,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  almond:{key:'almond',name:'Badem',kcalPer100g:579,proteinPer100g:21.2,carbsPer100g:21.6,fatPer100g:49.9,fiberPer100g:12.5,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  peanut:{key:'peanut',name:'Yer fıstığı',kcalPer100g:567,proteinPer100g:25.8,carbsPer100g:16.1,fatPer100g:49.2,fiberPer100g:8.5,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  hazelnut:{key:'hazelnut',name:'Fındık',kcalPer100g:628,proteinPer100g:14.9,carbsPer100g:16.7,fatPer100g:60.8,fiberPer100g:9.7,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  date:{key:'date',name:'Hurma',kcalPer100g:282,proteinPer100g:2.5,carbsPer100g:75,fatPer100g:.4,fiberPer100g:8,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  chia:{key:'chia',name:'Chia',kcalPer100g:486,proteinPer100g:16.5,carbsPer100g:42.1,fatPer100g:30.7,fiberPer100g:34.4,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  flaxseed:{key:'flaxseed',name:'Keten tohumu',kcalPer100g:534,proteinPer100g:18.3,carbsPer100g:28.9,fatPer100g:42.2,fiberPer100g:27.3,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  avocado:{key:'avocado',name:'Avokado',kcalPer100g:160,proteinPer100g:2,carbsPer100g:8.5,fatPer100g:14.7,fiberPer100g:6.7,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  beet:{key:'beet',name:'Pancar',kcalPer100g:43,proteinPer100g:1.6,carbsPer100g:9.6,fatPer100g:.2,fiberPer100g:2.8,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  spinach:{key:'spinach',name:'Ispanak',kcalPer100g:23,proteinPer100g:2.9,carbsPer100g:3.6,fatPer100g:.4,fiberPer100g:2.2,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  celery:{key:'celery',name:'Kereviz',kcalPer100g:16,proteinPer100g:.7,carbsPer100g:3,fatPer100g:.2,fiberPer100g:1.6,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  parsley:{key:'parsley',name:'Maydanoz',kcalPer100g:36,proteinPer100g:3,carbsPer100g:6.3,fatPer100g:.8,fiberPer100g:3.3,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  lemon_peel:{key:'lemon_peel',name:'Limon kabuğu',kcalPer100g:47,proteinPer100g:1.5,carbsPer100g:16,fatPer100g:.3,fiberPer100g:10.6,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  rosewater:{key:'rosewater',name:'Gül suyu',kcalPer100g:0,proteinPer100g:0,carbsPer100g:0,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  sparkling_water:{key:'sparkling_water',name:'Maden suyu',kcalPer100g:0,proteinPer100g:0,carbsPer100g:0,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  ice:{key:'ice',name:'Buz',kcalPer100g:0,proteinPer100g:0,carbsPer100g:0,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  turmeric:{key:'turmeric',name:'Zerdeçal',kcalPer100g:312,proteinPer100g:9.7,carbsPer100g:67.1,fatPer100g:3.2,fiberPer100g:22.7,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  cardamom:{key:'cardamom',name:'Kakule',kcalPer100g:311,proteinPer100g:10.8,carbsPer100g:68.5,fatPer100g:6.7,fiberPer100g:28,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  clove:{key:'clove',name:'Karanfil',kcalPer100g:274,proteinPer100g:6,carbsPer100g:65.5,fatPer100g:13,fiberPer100g:33.9,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  black_pepper:{key:'black_pepper',name:'Karabiber',kcalPer100g:251,proteinPer100g:10.4,carbsPer100g:63.9,fatPer100g:3.3,fiberPer100g:25.3,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  coconut:{key:'coconut',name:'Hindistan cevizi',kcalPer100g:354,proteinPer100g:3.3,carbsPer100g:15.2,fatPer100g:33.5,fiberPer100g:9,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  coconut_milk:{key:'coconut_milk',name:'Hindistan cevizi sütü',kcalPer100g:230,proteinPer100g:2.3,carbsPer100g:5.5,fatPer100g:23.8,fiberPer100g:2.2,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  tahini:{key:'tahini',name:'Tahin',kcalPer100g:595,proteinPer100g:17,carbsPer100g:21.2,fatPer100g:53.8,fiberPer100g:9.3,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  molasses:{key:'molasses',name:'Pekmez',kcalPer100g:290,proteinPer100g:0,carbsPer100g:74,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  boza:{key:'boza',name:'Boza',kcalPer100g:87,proteinPer100g:3.5,carbsPer100g:17,fatPer100g:.5,fiberPer100g:1,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  black_tea:{key:'black_tea',name:'Siyah çay',kcalPer100g:1,proteinPer100g:0,carbsPer100g:.2,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  green_tea:{key:'green_tea',name:'Yeşil çay',kcalPer100g:1,proteinPer100g:0,carbsPer100g:.2,fatPer100g:0,fiberPer100g:0,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'},
  protein_plant:{key:'protein_plant',name:'Bitkisel protein',kcalPer100g:380,proteinPer100g:75,carbsPer100g:10,fatPer100g:5,fiberPer100g:2,source:'USDA_FDC_REFERENCE',sourceUrl:USDA,confidence:'reference'}
};

export type NutritionInput={key:string;grams:number};
export type NutritionResult={kcal:number;protein:number;carbs:number;fat:number;fiber:number;provenance:NutritionIngredient[]};
export function calculateNutrition(items:NutritionInput[]):NutritionResult{const provenance:NutritionIngredient[]=[];const totals={kcal:0,protein:0,carbs:0,fat:0,fiber:0};for(const item of items){const n=INGREDIENTS[item.key];if(!n)throw new Error(`Nutrition ingredient not found: ${item.key}`);const f=item.grams/100;totals.kcal+=n.kcalPer100g*f;totals.protein+=n.proteinPer100g*f;totals.carbs+=n.carbsPer100g*f;totals.fat+=n.fatPer100g*f;totals.fiber+=n.fiberPer100g*f;if(!provenance.some(p=>p.key===n.key))provenance.push(n)}return{kcal:Math.round(totals.kcal*10)/10,protein:Math.round(totals.protein*10)/10,carbs:Math.round(totals.carbs*10)/10,fat:Math.round(totals.fat*10)/10,fiber:Math.round(totals.fiber*10)/10,provenance};}
export function nutritionAudit(items:NutritionInput[]):NutritionResult{return calculateNutrition(items)}
