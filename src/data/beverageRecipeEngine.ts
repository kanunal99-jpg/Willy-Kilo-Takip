import { Recipe } from '../types';
import { calculateNutrition, RecipeIngredient, nutritionAudit } from './nutritionEngine';

export type BeverageCat='Ayran'|'Limonata'|'Şerbet'|'Smoothie'|'Komposto'|'Milkshake'|'Kahve'|'Çay'|'Bitki Çayı'|'Meyve İçecekleri'|'Detoks'|'Protein İçecekleri'|'Yöresel İçecekler';
export type BeveragePurpose='Ferahlatıcı'|'Düşük Kalori'|'Enerji'|'Bağışıklık'|'Sindirim'|'Tok Tutar';
export type BeverageDetail={description:string;prep:string;tip:string;alternative:string;storage:string;serving:string;temperature:string};
export const BEVERAGE_CATS:BeverageCat[]=['Ayran','Limonata','Şerbet','Smoothie','Komposto','Milkshake','Kahve','Çay','Bitki Çayı','Meyve İçecekleri','Detoks','Protein İçecekleri','Yöresel İçecekler'];
export const BEVERAGE_VOLUMES=[100,200,250,330,500,750,1000,1500,2000,3000];
export const BEVERAGE_VARIANTS=['Ev Usulü','Fit','Şekersiz','Proteinli','Lifli','Kremamsı','Baharatlı','Vitaminli','Hafif','Ferah'];
const alcohol=['alkol','alkollü','şarap','bira','votka','rom','viski','visky','cin','gin','tekila','likör','likor','şampanya','sampanya','vermut','amaretto','brendi','konyak','rakı','raki'];
const norm=(s:string)=>s.toLocaleLowerCase('tr-TR');
const assertAlcoholFree=(parts:string[])=>{const text=norm(parts.join(' '));const hit=alcohol.find(x=>text.includes(x));if(hit)throw new Error(`ALCOHOL_CONTENT_BLOCKED:${hit}`)};
const ml=(n:number)=>n>=1000?`${n/1000} L`:`${n} ml`;
const round=(n:number)=>Math.round(n*10)/10;
type Spec={name:string;key:string;grams:(v:number)=>number;roles?:string[]};
const S=(key:string,name:string,factor:number):Spec=>({key,name,grams:v=>Math.max(1,Math.round(v*factor))});

const flavorByCat:Record<BeverageCat,Spec[]>={
'Ayran':[S('mint','Taze nane',.006),S('cucumber','Salatalık',.12),S('ginger','Taze zencefil',.004),S('lemon','Limon suyu',.025),S('classic','Deniz tuzu',.002)],
'Limonata':[S('lemon','Limon suyu',.16),S('mint','Taze nane',.006),S('ginger','Taze zencefil',.006),S('strawberry','Çilek',.18),S('apple','Elma',.16),S('berries','Orman meyveleri',.16),S('peach','Şeftali',.16),S('ginger','Zencefil',.008)],
'Şerbet':[S('rose','Gül suyu',.08),S('tamarind','Demirhindi',.12),S('cherry','Vişne',.20),S('tamarind','Demirhindi',.18),S('cinnamon','Tarçın',.006),S('hibiscus','Hibiskus',.012),S('sourcherry','Ekşi vişne',.18)],
'Smoothie':[S('strawberry','Çilek',.25),S('banana','Muz',.25),S('apple','Elma',.24),S('blueberry','Yaban mersini',.22),S('raspberry','Ahududu',.22),S('peach','Şeftali',.24),S('kiwi','Kivi',.22),S('mango','Mango',.24),S('pineapple','Ananas',.24),S('pear','Armut',.24)],
'Komposto':[S('apple','Elma',.22),S('pear','Armut',.22),S('peach','Şeftali',.22),S('cherry','Vişne',.22),S('apricot','Kayısı',.22),S('plum','Erik',.22)],
'Milkshake':[S('strawberry','Çilek',.25),S('banana','Muz',.25),S('cocoa','Kakao',.025),S('vanilla','Vanilya',.003),S('peach','Şeftali',.22),S('mango','Mango',.22),S('cherry','Vişne',.22)],
'Kahve':[S('cocoa','Kakao',.018),S('cinnamon','Tarçın',.004),S('vanilla','Vanilya',.002),S('cardamom','Kakule',.003),S('classic','Klasik',0)],
'Çay':[S('lemon','Limon',.035),S('mint','Nane',.008),S('ginger','Zencefil',.006),S('peach','Şeftali',.12),S('berries','Orman meyveleri',.10),S('apple','Elma',.10),S('cinnamon','Tarçın',.004)],
'Bitki Çayı':[S('mint','Nane',.008),S('ginger','Zencefil',.006),S('lemon','Limon',.035),S('chamomile','Papatya',.008),S('linden','Ihlamur',.008),S('sage','Adaçayı',.006),S('rosehip','Kuşburnu',.012),S('cinnamon','Tarçın',.004)],
'Meyve İçecekleri':[S('orange','Portakal',.22),S('apple','Elma',.22),S('peach','Şeftali',.22),S('pineapple','Ananas',.22),S('pomegranate','Nar',.20),S('sourcherry','Vişne',.22),S('grape','Üzüm',.22),S('berries','Orman meyveleri',.20)],
'Detoks':[S('cucumber','Salatalık',.16),S('lemon','Limon',.06),S('mint','Nane',.008),S('ginger','Zencefil',.006),S('apple','Elma',.12),S('celery','Kereviz',.08),S('parsley','Maydanoz',.025)],
'Protein İçecekleri':[S('banana','Muz',.22),S('strawberry','Çilek',.22),S('cocoa','Kakao',.018),S('peanut','Fıstık ezmesi',.025),S('blueberry','Yaban mersini',.20),S('apple','Elma',.20),S('mango','Mango',.20)],
'Yöresel İçecekler':[S('boza','Boza',.28),S('salep','Salep',.035),S('ayran','Ayran',.40),S('şalgam','Şalgam suyu',.28),S('rose','Gül şerbeti',.18),S('compote','Ev kompostosu',.22),S('tamarind','Demirhindi şerbeti',.18)]
};

const forbidden:Partial<Record<BeverageCat,string[]>>={
'Ayran':['mango','çilek','orman','elma','muz','şeftali','kakao','kahve','boza'],
'Kahve':['çilek','mango','orman meyveleri','salatalık'],
'Milkshake':['limon','zencefil','salatalık','kereviz','maydanoz'],
'Çay':['fıstık ezmesi','salatalık','kereviz'],
'Bitki Çayı':['fıstık ezmesi','muz','mango'],
'Detoks':['bal','protein tozu','süt','yoğurt'],
'Komposto':['süt','yoğurt','protein tozu'],
'Şerbet':['süt','yoğurt','protein tozu'],
'Yöresel İçecekler':['votka','rom','viski','şarap','bira']};

function variantExtras(c:BeverageCat,v:number,variant:string):RecipeIngredient[]{
 const out:RecipeIngredient[]=[]; const add=(key:string,name:string,g:number)=>out.push({key,name,grams:Math.max(1,Math.round(g))});
 const dairy=['Smoothie','Milkshake','Protein İçecekleri'].includes(c);
 if(dairy && variant==='Kremamsı') add('milk','Süt',v*.30);
 if(variant==='Proteinli' && c!=='Protein İçecekleri') add('protein','Protein tozu',Math.max(10,v*.04));
 if(variant==='Lifli' && dairy) add('oats','Yulaf ezmesi',Math.max(8,v*.025));
 if(variant==='Baharatlı' && !['Ayran','Detoks'].includes(c)) add('cinnamon','Tarçın',Math.max(1,v*.003));
 return out;
}

function makeIngredients(c:BeverageCat, flavor:Spec, v:number, variant:string):RecipeIngredient[]{
 const out:RecipeIngredient[]=[]; const add=(key:string,name:string,g:number)=>out.push({key,name,grams:Math.max(1,Math.round(g))});
 const sugarless=['Şekersiz','Fit','Hafif','Ferah'].includes(variant);
 if(c==='Ayran'){
   add('yogurt','Sade yoğurt',v*.38); add('water','İçme suyu',v*.61); add('salt','İyotlu tuz',Math.max(1,v*.002));
 } else if(c==='Kahve'){
   add('coffee','Çekilmiş kahve',Math.min(18,Math.max(8,v*.035))); add('water','İçme suyu',v-Math.min(18,Math.max(8,v*.035)));
 } else if(c==='Çay'||c==='Bitki Çayı'){
   add(c==='Çay'?'tea':'herbs',c==='Çay'?'Siyah/yeşil çay':'Kurutulmuş bitki karışımı',Math.max(2,v*.008)); add('water','İçme suyu',v*.96);
 } else if(c==='Milkshake'){
   add('milk','Süt',v*.62); add(flavor.key,flavor.name,v*.24); if(!sugarless)add('honey','Bal',v*.035); add('ice','Buz',v*.08);
 } else if(c==='Protein İçecekleri'){
   add('milk','Süt veya şekersiz bitkisel içecek',v*.62); add('protein','Protein tozu',Math.max(18,v*.075)); add(flavor.key,flavor.name,v*.18); add('water','İçme suyu',v*.10);
 } else if(c==='Smoothie'){
   add('yogurt','Yoğurt veya kefir',v*.28); add(flavor.key,flavor.name,v*.27); add('water','İçme suyu',v*.39); if(!sugarless)add('honey','Bal',v*.025);
 } else if(c==='Detoks'){
   add(flavor.key,flavor.name,v*.30); add('lemon','Limon suyu',v*.06); add('water','İçme suyu',v*.62); if(flavor.key!=='mint')add('mint','Taze nane',Math.max(1,v*.006));
 } else if(c==='Limonata'){
   add('lemon','Limon suyu',v*.16); add('water','İçme suyu',v*.79); if(!sugarless)add('honey','Bal',v*.04); if(flavor.key!=='lemon')add(flavor.key,flavor.name,v*.06);
 } else if(c==='Komposto'){
   add(flavor.key,flavor.name,v*.22); add('water','İçme suyu',v*.76); add('cinnamon','Tarçın',Math.max(1,v*.002));
 } else if(c==='Şerbet'){
   add(flavor.key,flavor.name,v*.20); add('water','İçme suyu',v*.75); if(!sugarless)add('honey','Bal',v*.035); add('lemon','Limon suyu',v*.015);
 } else if(c==='Meyve İçecekleri'){
   add(flavor.key,flavor.name,v*.28); add('water','İçme suyu',v*.68); if(!sugarless)add('honey','Bal',v*.025);
 } else if(c==='Yöresel İçecekler'){
   if(flavor.key==='ayran'){add('yogurt','Yoğurt',v*.38);add('water','İçme suyu',v*.60);add('salt','Tuz',Math.max(1,v*.002));}
   else if(flavor.key==='salep'){add('milk','Süt',v*.86);add('salep','Salep',Math.max(2,v*.015));add('cinnamon','Tarçın',Math.max(1,v*.002));}
   else {add(flavor.key,flavor.name,v*.20);add('water','İçme suyu',v*.76);if(!sugarless)add('honey','Bal',v*.025);}
 } else { add(flavor.key,flavor.name,v*.28); add('water','İçme suyu',v*.68); if(!sugarless)add('honey','Bal',v*.025); }
 out.push(...variantExtras(c,v,variant));
 return out.filter((x,i,a)=>i===a.findIndex(y=>y.key===x.key));
}

export function makeBeverage(i:number){
 const ci=i%BEVERAGE_CATS.length;
 const c=BEVERAGE_CATS[ci];
 const flavors=flavorByCat[c]; const fi=Math.floor(i/BEVERAGE_CATS.length)%flavors.length;
 const flavor=flavors[fi]; const vi=Math.floor(i/(BEVERAGE_CATS.length*flavors.length))%BEVERAGE_VOLUMES.length;
 const v=BEVERAGE_VOLUMES[vi]; const ri=Math.floor(i/(BEVERAGE_CATS.length*flavors.length*BEVERAGE_VOLUMES.length))%BEVERAGE_VARIANTS.length;
 const variant=BEVERAGE_VARIANTS[ri];
 const ingredients=makeIngredients(c,flavor,v,variant);
 const forbiddenTerms=forbidden[c]||[]; const joined=ingredients.map(x=>x.name).join(' ').toLocaleLowerCase('tr-TR');
 if(forbiddenTerms.some(x=>joined.includes(x))) throw new Error(`CATEGORY_COMPATIBILITY_BLOCKED:${c}`);
 assertAlcoholFree([c,flavor.name,variant,...ingredients.map(x=>x.name)]);
 const nutrition=calculateNutrition(ingredients,v);
 if(!Number.isFinite(nutrition.calories)||!Number.isFinite(nutrition.protein)||!Number.isFinite(nutrition.carbs)||!Number.isFinite(nutrition.fat))throw new Error(`NUTRITION_INVALID:${i}`);
 const sugarFree=!ingredients.some(x=>x.key==='honey'); const highProtein=c==='Protein İçecekleri'||variant==='Proteinli';
 const vegan=!['Ayran','Milkshake','Protein İçecekleri'].includes(c)&&!ingredients.some(x=>['yogurt','milk'].includes(x.key));
 const purposes:BeveragePurpose[]=[];
 if(sugarFree||nutrition.calories<=100)purposes.push('Düşük Kalori');
 if(['Ayran','Limonata','Detoks','Çay','Bitki Çayı','Meyve İçecekleri'].includes(c))purposes.push('Ferahlatıcı');
 if(['Kahve','Protein İçecekleri'].includes(c))purposes.push('Enerji');
 if(['Meyve İçecekleri','Smoothie','Detoks','Limonata'].includes(c))purposes.push('Bağışıklık');
 if(['Çay','Bitki Çayı','Komposto'].includes(c))purposes.push('Sindirim');
 if(highProtein||c==='Smoothie')purposes.push('Tok Tutar');
 const tags=['Alkolsüz',c,flavor.name,variant,...purposes]; if(sugarFree)tags.push('Şekersiz');if(highProtein)tags.push('Yüksek Protein');if(vegan)tags.push('Vegan');
 const detail:BeverageDetail={description:`${flavor.name} ${c} — ${variant}. Kategoriye uygun malzeme ailesinden oluşturulmuş, ${ml(v)} hedef hacimli alkolsüz reçetedir.`,prep:'Malzemeleri ölçün. Sıvı bazını hazırlayın, katı/aroma bileşenlerini ekleyin ve homojen olana kadar karıştırın. Son hacmi ölçerek suyla tamamlayın.',tip:'Paketli ürün kullanılıyorsa ürün etiketindeki besin değerini ayrıca kontrol edin.',alternative:'Tatlandırıcı içeren varyantlarda miktarı damak tadına göre değiştirmeden önce besin değerini yeniden hesaplayın.',storage:'Kapalı kapta buzdolabında saklayın; taze süt/meyve içerenleri aynı gün tüketmek en güvenlisidir.',serving:`Toplam tarif hacmi ${ml(v)}. Günlüğe eklenen miktar aynı oranla ölçeklenir.`,temperature:['Kahve','Çay','Bitki Çayı','Salep'].includes(c)?'60–75 °C':'4–8 °C'};
 const ingredientsForRecipe=ingredients.map(x=>({name:x.name,amount:`${round(x.grams)} g`}));
 return {id:`bev-${String(i+1).padStart(5,'0')}`,title:`${flavor.name} ${c} — ${variant} — ${ml(v)}`,category:'snack',calories:nutrition.calories,carbs:nutrition.carbs,protein:nutrition.protein,fat:nutrition.fat,prepTimeMinutes:['Komposto','Şerbet','Yöresel İçecekler'].includes(c)?20:10,difficulty:['Şerbet','Yöresel İçecekler'].includes(c)?'Orta':'Kolay',servings:1,tags,ingredients:ingredientsForRecipe,steps:['Malzemeleri hassas tartın.',detail.prep,'Homojen kıvam elde edin ve servis sıcaklığını kontrol edin.',`Tarifi ${ml(v)} hacimde servis edin.`],imageUrl:`https://images.unsplash.com/photo-${['1544145945-f90425340c7e','1553530666-ba11a7da3888','1547592180-85f173990554','1572490122747-3968b75cc699','1495474472287-4d71bcdd2085','1544787219-7f47ccb76574','1597318181409-cf64d0d5a59d','1551024709-8f23befc6f87'][i%8]}?w=900&auto=format&fit=crop&q=85`,proFeature:true,volumeMl:v,cat:c,purposes,sugarFree,highProtein,vegan,detail,nutritionSource:nutrition.provenance.source,nutritionConfidence:nutrition.provenance.confidence,nutritionAudit:nutritionAudit(ingredients)};
}

export const BEVERAGE_TOTAL=10000;
export function buildBeverageCatalog(limit=BEVERAGE_TOTAL){
 const out=[];const signatures=new Set<string>();
 for(let i=0;out.length<limit&&i<200000;i++){
   const r=makeBeverage(i);const sig=`${r.cat}|${r.title}|${r.ingredients.map(x=>x.name+':'+x.amount).join(',')}`;
   if(signatures.has(sig))continue;signatures.add(sig);out.push(r);
 }
 if(out.length!==limit)throw new Error(`BEVERAGE_CATALOG_COUNT_INVALID:${out.length}`);
 const alcoholHit=out.find(r=>alcohol.some(t=>norm([r.title,...r.tags,...r.ingredients.map(x=>x.name),...r.steps].join(' ')).includes(t)));
 if(alcoholHit)throw new Error(`ALCOHOL_CONTENT_BLOCKED:${alcoholHit.id}`);
 return out;
}

export function validateBeverageCatalog(limit=BEVERAGE_TOTAL){
 const catalog=buildBeverageCatalog(limit);
 if(new Set(catalog.map(x=>x.id)).size!==limit)throw new Error('BEVERAGE_IDS_NOT_UNIQUE');
 if(catalog.some(x=>x.ingredients.length<2||x.steps.length<3||x.volumeMl<=0||!x.imageUrl))throw new Error('BEVERAGE_STRUCTURE_INVALID');
 return {count:catalog.length,uniqueIds:new Set(catalog.map(x=>x.id)).size,categories:new Set(catalog.map(x=>x.cat)).size};
}
