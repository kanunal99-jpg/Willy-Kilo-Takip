import React,{useMemo,useState} from 'react';
import {Filter,GlassWater,Plus,X,Minus,ExternalLink,ShieldCheck} from 'lucide-react';
import {MealFoodEntry,MealType,Recipe} from '../types';
import {calculateNutrition,RecipeIngredient,nutritionAudit} from '../data/nutritionEngine';

type Cat='Ayran'|'Limonata'|'Şerbet'|'Smoothie'|'Komposto'|'Milkshake'|'Kahve'|'Çay'|'Bitki Çayı'|'Meyve İçecekleri'|'Detoks'|'Protein İçecekleri'|'Yöresel İçecekler';
type Purpose='Ferahlatıcı'|'Düşük Kalori'|'Enerji'|'Bağışıklık'|'Sindirim'|'Tok Tutar';
type Detail={description:string;prep:string;tip:string;alternative:string;storage:string;serving:string;temperature:string};
type CalRange=[number,number|Infinity];

const CATS:Cat[]=['Ayran','Limonata','Şerbet','Smoothie','Komposto','Milkshake','Kahve','Çay','Bitki Çayı','Meyve İçecekleri','Detoks','Protein İçecekleri','Yöresel İçecekler'];
const FLAVORS=['Klasik','Naneli','Çilekli','Zencefilli','Elmalı','Orman Meyveli','Tarçınlı','Limonlu','Mango','Yöresel'];
const VARIANTS=['Ev Usulü','Fit','Şekersiz','Proteinli','Lifli','Kremamsı','Baharatlı','Vitaminli','Hafif','Ferah'];
const VOL=[100,200,250,330,500,750,1000,1500,2000,3000];
const TOTAL=14000;
const IMAGE_IDS=['1601050690597-df0568f70950','1621263764928-df1444c5e859','1544145945-f90425340c7e','1553530666-ba11a7da3888','1547592180-85f173990554','1572490122747-3968b75cc699','1495474472287-4d71bcdd2085','1544787219-7f47ccb76574','1597318181409-cf64d0d5a59d','1551024709-8f23befc6f87'];
const vl=(n:number)=>n>=1000?`${n/1000} L`:`${n} ml`;
const round=(n:number)=>Math.round(n*10)/10;

function template(c:Cat,f:string,v:number,variant:string):RecipeIngredient[]{
  const flavorKey=f==='Çilekli'?'strawberry':f==='Elmalı'?'apple':f==='Mango'?'mango':f==='Orman Meyveli'?'berries':f==='Zencefilli'?'ginger':f==='Tarçınlı'?'cinnamon':f==='Limonlu'||c==='Limonata'?'lemon':null;
  const out:RecipeIngredient[]=[];
  const add=(key:string,name:string,grams:number)=>out.push({key,name,grams:Math.max(0,Math.round(grams))});
  if(c==='Ayran'){
    add('yogurt','Sade yoğurt',v*.40); add('water','İçme suyu',v*.60);
  } else if(c==='Kahve'){
    const coffee=Math.min(18,Math.max(5,v*.04)); add('coffee','Çekilmiş kahve',coffee); add('water','İçme suyu',v-coffee);
  } else if(c==='Çay'||c==='Bitki Çayı'){
    const base=Math.max(2,v*.01); add(c==='Çay'?'tea':'herbs',c==='Çay'?'Demlenmiş çay':'Taze ot/bitki',base); add('water','İçme suyu',v-base);
  } else if(c==='Milkshake'){
    add('milk','İnek sütü',v*.70); add(flavorKey||'strawberry',f==='Klasik'?'Çilek':f,v*.25); add('honey','Çam balı',v*.05);
  } else if(c==='Protein İçecekleri'){
    add('milk','İnek sütü',v*.65); add('protein','Protein tozu',v*.08); add(flavorKey||'strawberry',f==='Klasik'?'Çilek':f,v*.20); add('water','İçme suyu',v*.07);
  } else if(c==='Smoothie'||c==='Meyve İçecekleri'||c==='Detoks'){
    const honeyAllowed=c!=='Detoks'&&variant!=='Şekersiz'&&variant!=='Fit'&&variant!=='Hafif'&&variant!=='Ferah';
    const fruit=v*.30; const honey=honeyAllowed?v*.04:0; add(flavorKey||'apple',f==='Klasik'?'Elma':f,fruit); add('honey','Çam balı',honey); add('water','İçme suyu',v-fruit-honey);
  } else if(c==='Limonata'){
    const honey=variant==='Şekersiz'||variant==='Fit'||variant==='Hafif'||variant==='Ferah'?0:v*.04; add('lemon','Limon suyu',v*.16); add('honey','Çam balı',honey); add('water','İçme suyu',v-v*.16-honey);
  } else if(c==='Şerbet'||c==='Komposto'){
    const honey=variant==='Şekersiz'||variant==='Fit'||variant==='Hafif'||variant==='Ferah'?0:(c==='Komposto'?v*.02:v*.04); const fruit=v*.22; add(flavorKey||'apple',f==='Klasik'?'Elma':f,fruit); add('honey','Çam balı',honey); add('water','İçme suyu',v-fruit-honey);
  } else {
    const honey=variant==='Şekersiz'||variant==='Fit'||variant==='Hafif'||variant==='Ferah'?0:v*.02; const fruit=v*.28; add(flavorKey||'apple',f==='Klasik'?'Elma':f,fruit); add('honey','Çam balı',honey); add('water','İçme suyu',v-fruit-honey);
  }
  if(variant==='Proteinli'&&c!=='Protein İçecekleri') add('protein','Protein tozu',Math.max(10,v*.04));
  if(variant==='Lifli') add('oats','Yulaf',Math.max(8,v*.025));
  if(['Şekersiz','Fit','Hafif','Ferah'].includes(variant)) return out.filter(x=>x.key!=='honey');
  return out;
}

function make(i:number):Recipe&{volumeMl:number;cat:Cat;purposes:Purpose[];sugarFree:boolean;highProtein:boolean;vegan:boolean;detail:Detail;proFeature:boolean;nutritionSource:string;nutritionConfidence:'verified'|'reference';nutritionAudit:ReturnType<typeof nutritionAudit>}{
 const ci=i%CATS.length,fi=Math.floor(i/CATS.length)%FLAVORS.length,vi=Math.floor(i/(CATS.length*FLAVORS.length))%VOL.length,ri=Math.floor(i/(CATS.length*FLAVORS.length*VOL.length))%VARIANTS.length;
 const c=CATS[ci],f=FLAVORS[fi],v=VOL[vi],variant=VARIANTS[ri];
 const ingredients=template(c,f,v,variant);
 const nutrition=calculateNutrition(ingredients,v);
 const sugarFree=!ingredients.some(x=>x.key==='honey');
 const highProtein=c==='Protein İçecekleri'||variant==='Proteinli';
 const vegan=!['Ayran','Milkshake','Protein İçecekleri'].includes(c)&&variant!=='Kremamsı';
 const purposes:Purpose[]=[];
 if(sugarFree||nutrition.calories<=100) purposes.push('Düşük Kalori');
 if(['Ayran','Limonata','Detoks','Çay','Bitki Çayı'].includes(c)) purposes.push('Ferahlatıcı');
 if(['Kahve','Protein İçecekleri'].includes(c)) purposes.push('Enerji');
 if(['Meyve İçecekleri','Smoothie','Detoks'].includes(c)) purposes.push('Bağışıklık');
 if(['Çay','Bitki Çayı','Komposto'].includes(c)) purposes.push('Sindirim');
 if(highProtein||c==='Smoothie') purposes.push('Tok Tutar');
 const tags=['Alkolsüz',c,f,variant,...purposes];
 if(sugarFree)tags.push('Şekersiz'); if(highProtein)tags.push('Yüksek Protein'); if(vegan)tags.push('Vegan');
 const ingredientsForRecipe=ingredients.map(x=>({name:x.name,amount:`${round(x.grams)} g`}));
 const detail:Detail={
  description:`${f} aromalı ${c.toLowerCase()} • ${variant}. Tarif ${vl(v)} hedef hacim için hazırlanır; kalori ve makrolar malzeme gramajlarından yeniden hesaplanır.`,
  prep:'Malzemeleri tartın, sıvı ve katıları tarif sırasına göre karıştırın; son hacmi ölçerek gerektiğinde su ile tamamlayın.',
  tip:'Besin değerini korumak için kullanılan gerçek marka/ürün etiketini ayrıca kontrol edin; ürünler arasında fark olabilir.',
  alternative:sugarFree?'Tatlandırıcı eklemeden tarçın, limon veya taze otlarla aroma verilebilir.':'Bal yerine tarifte belirtilen eşdeğer bir tatlandırıcı kullanılabilir; kcal yeniden hesaplanmalıdır.',
  storage:'Kapalı cam şişede buzdolabında saklayın. Süt veya taze meyve içeren tarifleri mümkünse aynı gün tüketin.',
  serving:`${vl(v)} toplam tarif hacmidir. Günlüğe eklenen miktar seçilen katsayıyla tüm besin değerlerini orantılı ölçekler.`,
  temperature:c==='Kahve'||c==='Çay'||c==='Bitki Çayı'?'60–75 °C':'4–8 °C'
 };
 return {id:`bev-${String(i+1).padStart(5,'0')}`,title:`${f} ${c} — ${variant} — ${vl(v)}`,category:'snack',calories:nutrition.calories,carbs:nutrition.carbs,protein:nutrition.protein,fat:nutrition.fat,prepTimeMinutes:ci<6?10:7,difficulty:ci<5?'Kolay':'Orta',servings:1,tags,ingredients:ingredientsForRecipe,steps:['Malzemeleri hassas tartın.',detail.prep,'Homojen kıvam elde edin.','Servis hacmini ölçün.'],imageUrl:`https://images.unsplash.com/photo-${IMAGE_IDS[(ci*FLAVORS.length+fi)%IMAGE_IDS.length]}?w=900&auto=format&fit=crop&q=85`,proFeature:true,volumeMl:v,cat:c,purposes,sugarFree,highProtein,vegan,detail,nutritionSource:nutrition.provenance.source,nutritionConfidence:nutrition.provenance.confidence>=1?'verified':'reference',nutritionAudit:nutritionAudit(ingredients)};
}

const INDEX=Array.from({length:TOTAL},(_,i)=>i);

export const BeverageCatalog:React.FC<{onAddRecipeToDiary:(e:MealFoodEntry)=>void}>=({onAddRecipeToDiary})=>{
 const [cat,setCat]=useState<Cat|'Tümü'>('Tümü'),[vol,setVol]=useState<number|null>(null),[purpose,setPurpose]=useState<Purpose|null>(null),[cal,setCal]=useState<CalRange|null>(null),[time,setTime]=useState<number|null>(null),[sugarFree,setSugarFree]=useState(false),[highProtein,setHighProtein]=useState(false),[vegan,setVegan]=useState(false),[active,setActive]=useState<ReturnType<typeof make>|null>(null),[meal,setMeal]=useState<MealType>('snack'),[quantity,setQuantity]=useState(1),[added,setAdded]=useState(false);
 const results=useMemo(()=>INDEX.map(make).filter(r=>{
   const calOk=!cal||(r.calories>=cal[0]&&r.calories<=cal[1]);
   return (cat==='Tümü'||r.cat===cat)&&(vol===null||r.volumeMl===vol)&&(purpose===null||r.purposes.includes(purpose))&&calOk&&(time===null||r.prepTimeMinutes<=time)&&(!sugarFree||r.sugarFree)&&(!highProtein||r.highProtein)&&(!vegan||r.vegan);
 }).slice(0,24),[cat,vol,purpose,cal,time,sugarFree,highProtein,vegan]);
 const clear=()=>{setCat('Tümü');setVol(null);setPurpose(null);setCal(null);setTime(null);setSugarFree(false);setHighProtein(false);setVegan(false)};
 const scaled=(n:number)=>round(n*quantity);
 const add=()=>{if(!active)return;const n=make(Number(active.id.replace('bev-',''))-1);onAddRecipeToDiary({id:'bev-food-'+Date.now(),name:n.title,mealType:meal,servingAmount:quantity,servingUnit:n.volumeMl*quantity>=1000?`${n.volumeMl*quantity/1000} L`:`${n.volumeMl*quantity} ml`,calories:scaled(n.calories),carbs:scaled(n.carbs),protein:scaled(n.protein),fat:scaled(n.fat),healthScore:96,pros:[...n.tags,`Kaynak: ${n.nutritionSource}`],timestamp:Date.now()});setAdded(true);setTimeout(()=>{setAdded(false);setActive(null)},800)};
 return <div className="space-y-4">
  <div className="rounded-3xl bg-gradient-to-br from-cyan-950/70 via-slate-900 to-emerald-950/50 border border-cyan-500/25 p-4"><div className="flex justify-between gap-3"><div><span className="text-[10px] font-bold text-cyan-300 uppercase">Yemek Tarifleri • Alkolsüz</span><h2 className="text-xl font-extrabold text-white mt-1">🥤 14.000 Alkolsüz İçecek Varyantı</h2><p className="text-xs text-slate-300 mt-1">Malzeme gramajlarından hesaplanan kcal • kaynak/provenance kaydı • miktar ölçekleme</p></div><GlassWater className="w-9 h-9 text-cyan-300"/></div><div className="grid grid-cols-3 gap-2 mt-4 text-center"><Stat v="14.000" l="Varyant"/><Stat v="13" l="Tür"/><Stat v="100 ml–3 L+" l="Miktar"/></div></div>
  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 space-y-3"><div className="flex justify-between text-sm font-bold"><span className="flex gap-2 items-center"><Filter className="w-4 h-4 text-emerald-400"/> Filtre</span><button onClick={clear} className="text-[11px] text-cyan-300">Temizle</button></div><Facet title="Tür">{['Tümü',...CATS].map(x=><Chip key={x} onClick={()=>setCat(x as Cat|'Tümü')} active={cat===x}>{x}</Chip>)}</Facet><Facet title="Amaç">{(['Ferahlatıcı','Düşük Kalori','Enerji','Bağışıklık','Sindirim','Tok Tutar'] as Purpose[]).map(x=><Chip key={x} onClick={()=>setPurpose(purpose===x?null:x)} active={purpose===x}>{x}</Chip>)}</Facet><Facet title="Kalori">{([[0,50],[51,100],[101,200],[201,Infinity]] as CalRange[]).map(([min,max])=>{const label=max===Infinity?'200+':`${min}–${max}`;return <Chip key={label} onClick={()=>setCal(cal?.[0]===min?null:[min,max])} active={cal?.[0]===min}>{label} kcal</Chip>})}</Facet><Facet title="Süre">{[5,10,15,30].map(x=><Chip key={x} onClick={()=>setTime(time===x?null:x)} active={time===x}>{x} dk altı</Chip>)}</Facet><Facet title="Miktar">{VOL.map(x=><Chip key={x} onClick={()=>setVol(vol===x?null:x)} active={vol===x}>{vl(x)}</Chip>)}</Facet><div className="flex flex-wrap gap-2"><Chip onClick={()=>setSugarFree(!sugarFree)} active={sugarFree}>Şekersiz</Chip><Chip onClick={()=>setHighProtein(!highProtein)} active={highProtein}>Yüksek Protein</Chip><Chip onClick={()=>setVegan(!vegan)} active={vegan}>Vegan</Chip></div></div>
  <div className="grid grid-cols-2 gap-3">{results.map(r=><button key={r.id} onClick={()=>{setActive(r);setQuantity(1)}} className="text-left rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-cyan-500/50"><img src={r.imageUrl} alt={r.title} className="w-full h-28 object-cover" loading="lazy"/><div className="p-3"><div className="text-[10px] text-cyan-300">{r.cat} • {vl(r.volumeMl)}</div><div className="font-bold text-white text-sm mt-1">{r.title}</div><div className="text-xs text-slate-300 mt-2">{r.calories} kcal • P {r.protein}g • K {r.carbs}g • Y {r.fat}g</div><div className="text-[10px] text-emerald-300 mt-2">{r.nutritionConfidence==='verified'?'✓ Doğrulanmış kaynak':'Kaynaklı referans veri'}</div></div></button>)}</div>
  {active&&<div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-3"><div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-950 border border-slate-800 p-4"><div className="flex justify-between"><div><div className="text-xs text-cyan-300">{active.cat} • {vl(active.volumeMl)}</div><h3 className="text-lg font-extrabold text-white">{active.title}</h3></div><button onClick={()=>setActive(null)}><X/></button></div><div className="grid grid-cols-4 gap-2 my-4">{[['kcal',active.calories],['protein',active.protein+'g'],['karb',active.carbs+'g'],['yağ',active.fat+'g']].map(([a,b])=><div key={a} className="rounded-xl bg-slate-900 p-2 text-center"><b className="text-white">{b}</b><span className="block text-[10px] text-slate-400">{a}</span></div>)}</div><div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 mb-3"><div className="flex items-center gap-2 text-sm font-bold text-emerald-300"><ShieldCheck className="w-4 h-4"/> Besin kaynağı ve hesaplama izi</div><p className="text-xs text-slate-300 mt-1">Kcal malzeme gramajı × 100 g başına enerji üzerinden yeniden hesaplanır. Kaynak: {active.nutritionSource}. Güven seviyesi: {active.nutritionConfidence==='verified'?'doğrulanmış':'referans'}.</p><div className="mt-2 text-[10px] text-cyan-300 flex items-center gap-1">Resmî veri açıklaması <ExternalLink className="w-3 h-3"/></div></div><h4 className="font-bold text-white mb-2">Malzemeler</h4><ul className="space-y-1 mb-4">{active.nutritionAudit.ingredients.map(x=><li key={x.key} className="text-xs text-slate-300 flex justify-between"><span>{x.name}</span><span>{round(x.amount)} g</span></li>)}</ul><p className="text-xs text-slate-300 mb-4">{active.detail.description}</p><div className="flex items-center justify-between rounded-2xl bg-slate-900 p-3 mb-3"><span className="text-sm text-slate-300">Miktar</span><div className="flex items-center gap-4"><button onClick={()=>setQuantity(Math.max(1,quantity-1))} className="p-2 rounded-xl bg-slate-800"><Minus className="w-4 h-4"/></button><b className="text-white">{quantity}×</b><button onClick={()=>setQuantity(quantity+1)} className="p-2 rounded-xl bg-slate-800"><Plus className="w-4 h-4"/></button></div></div><div className="text-xs text-slate-300 mb-3">Seçilen miktar: <b className="text-white">{active.volumeMl*quantity>=1000?`${active.volumeMl*quantity/1000} L`:`${active.volumeMl*quantity} ml`}</b> • <b className="text-white">{scaled(active.calories)} kcal</b></div><select value={meal} onChange={e=>setMeal(e.target.value as MealType)} className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-white mb-3"><option value="breakfast">Kahvaltı</option><option value="lunch">Öğle</option><option value="dinner">Akşam</option><option value="snack">Ara Öğün</option></select><button onClick={add} className="w-full rounded-xl bg-emerald-500 text-slate-950 font-extrabold p-3">{added?'✓ Günlüğe eklendi':'Günlüğe Ekle'}</button><p className="text-[10px] text-slate-500 mt-3">Ürün/marka değişirse etiket değerleri esas alınmalıdır. Referans veri tıbbi beslenme önerisi değildir.</p></div></div>}
 </div>;
};

const Chip:React.FC<{children:React.ReactNode;active?:boolean;onClick:()=>void}>=({children,active,onClick})=><button onClick={onClick} className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border ${active?'bg-cyan-400 text-slate-950 border-cyan-300':'bg-slate-950 text-slate-300 border-slate-700'}`}>{children}</button>;
const Facet:React.FC<{title:string;children:React.ReactNode}>=({title,children})=><div><div className="text-[10px] uppercase text-slate-500 mb-1">{title}</div><div className="flex flex-wrap gap-1.5">{children}</div></div>;
const Stat:React.FC<{v:string;l:string}>=({v,l})=><div className="rounded-xl bg-slate-950/50 p-2"><b className="text-white text-sm">{v}</b><span className="block text-[10px] text-slate-400">{l}</span></div>;
