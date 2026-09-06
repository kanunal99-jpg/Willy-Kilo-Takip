import React,{useMemo,useState} from 'react';
import {Filter,GlassWater,Plus,X,Minus,ExternalLink,ShieldCheck} from 'lucide-react';
import {MealFoodEntry,MealType,Recipe} from '../types';
import {calculateNutrition,RecipeIngredient,nutritionAudit} from '../data/nutritionEngine';

type Cat='Ayran'|'Limonata'|'Şerbet'|'Smoothie'|'Komposto'|'Milkshake'|'Kahve'|'Çay'|'Bitki Çayı'|'Meyve İçecekleri'|'Detoks'|'Protein İçecekleri'|'Yöresel İçecekler';
type Purpose='Ferahlatıcı'|'Düşük Kalori'|'Enerji'|'Bağışıklık'|'Sindirim'|'Tok Tutar';
type Detail={description:string;prep:string;tip:string;alternative:string;storage:string;serving:string;temperature:string};

const CATS:Cat[]=['Ayran','Limonata','Şerbet','Smoothie','Komposto','Milkshake','Kahve','Çay','Bitki Çayı','Meyve İçecekleri','Detoks','Protein İçecekleri','Yöresel İçecekler'];
const FLAVORS=['Klasik','Naneli','Çilekli','Zencefilli','Elmalı','Orman Meyveli','Tarçınlı','Limonlu','Mango','Yöresel'];
const VARIANTS=['Ev Usulü','Fit','Şekersiz','Proteinli','Lifli','Kremamsı','Baharatlı','Vitaminli','Hafif','Ferah'];
const VOL=[100,200,250,330,500,750,1000,1500,2000,3000];
const TOTAL=14000;
const IMAGE_IDS=['1601050690597-df0568f70950','1621263764928-df1444c5e859','1544145945-f90425340c7e','1553530666-ba11a7da3888','1547592180-85f173990554','1572490122747-3968b75cc699','1495474472287-4d71bcdd2085','1544787219-7f47ccb76574','1597318181409-cf64d0d5a59d','1551024709-8f23befc6f87'];
const vl=(n:number)=>n>=1000?`${n/1000} L`:`${n} ml`;
const round=(n:number)=>Math.round(n*10)/10;

function template(c:Cat,f:string,v:number,variant:string):RecipeIngredient[]{
  const sweet=variant==='Şekersiz'?0:Math.max(5,Math.round(v*.04));
  const flavorKey=f==='Çilekli'?'strawberry':f==='Elmalı'?'apple':f==='Mango'?'mango':f==='Orman Meyveli'?'berries':f==='Zencefilli'?'ginger':f==='Tarçınlı'?'cinnamon':f==='Limonlu'||c==='Limonata'?'lemon':null;
  const out:RecipeIngredient[]=[];
  if(c==='Ayran') out.push({key:'yogurt',name:'Sade yoğurt',grams:Math.round(v*.40)},{key:'water',name:'İçme suyu',grams:Math.round(v*.55)});
  else if(c==='Kahve') out.push({key:'coffee',name:'Çekilmiş kahve',grams:Math.min(18,Math.max(5,Math.round(v*.04)))},{key:'water',name:'İçme suyu',grams:Math.round(v*.96)});
  else if(c==='Çay'||c==='Bitki Çayı') out.push({key:c==='Çay'?'tea':'herbs',name:c==='Çay'?'Demlenmiş çay':'Taze ot/bitki',grams:Math.max(2,Math.round(v*.01))},{key:'water',name:'İçme suyu',grams:Math.round(v*.99)});
  else if(c==='Milkshake') out.push({key:'milk',name:'İnek sütü',grams:Math.round(v*.65)},{key:flavorKey||'strawberry',name:f==='Klasik'?'Çilek':f,grams:Math.round(v*.25)});
  else if(c==='Protein İçecekleri') out.push({key:'milk',name:'İnek sütü',grams:Math.round(v*.65)},{key:'protein',name:'Protein tozu',grams:Math.round(v*.08)},{key:flavorKey||'strawberry',name:f==='Klasik'?'Çilek':f,grams:Math.round(v*.20)});
  else if(c==='Smoothie'||c==='Meyve İçecekleri'||c==='Detoks') out.push({key:flavorKey||'apple',name:f==='Klasik'?'Elma':f,grams:Math.round(v*.30)},{key:'water',name:'İçme suyu',grams:Math.round(v*.66)});
  else if(c==='Limonata') out.push({key:'lemon',name:'Limon suyu',grams:Math.round(v*.16)},{key:'water',name:'İçme suyu',grams:Math.round(v*.80)});
  else if(c==='Şerbet'||c==='Komposto') out.push({key:flavorKey||'apple',name:f==='Klasik'?'Elma':f,grams:Math.round(v*.22)},{key:'water',name:'İçme suyu',grams:Math.round(v*.72)});
  else out.push({key:flavorKey||'apple',name:f==='Klasik'?'Elma':f,grams:Math.round(v*.28)},{key:'water',name:'İçme suyu',grams:Math.round(v*.68)});
  if(sweet>0) out.push({key:'honey',name:'Çam balı',grams:sweet});
  if(variant==='Proteinli'&&c!=='Protein İçecekleri') out.push({key:'protein',name:'Protein tozu',grams:Math.max(10,Math.round(v*.04))});
  if(variant==='Lifli') out.push({key:'oats',name:'Yulaf',grams:Math.max(8,Math.round(v*.025))});
  if(variant==='Fit'||variant==='Hafif'||variant==='Ferah') return out.filter(x=>x.key!=='honey');
  return out;
}

function make(i:number):Recipe&{volumeMl:number;cat:Cat;purposes:Purpose[];sugarFree:boolean;highProtein:boolean;vegan:boolean;detail:Detail;proFeature:boolean;nutritionSource:string;nutritionConfidence:string;nutritionAudit:ReturnType<typeof nutritionAudit>}{
 const ci=i%CATS.length,fi=Math.floor(i/CATS.length)%FLAVORS.length,vi=Math.floor(i/(CATS.length*FLAVORS.length))%VOL.length,ri=Math.floor(i/(CATS.length*FLAVORS.length*VOL.length))%VARIANTS.length;
 const c=CATS[ci],f=FLAVORS[fi],v=VOL[vi],variant=VARIANTS[ri];
 const sugarFree=variant==='Şekersiz'||variant==='Fit'||variant==='Hafif'||variant==='Ferah'||c==='Çay'||c==='Bitki Çayı'||c==='Detoks';
 const highProtein=c==='Protein İçecekleri'||variant==='Proteinli';
 const vegan=!['Ayran','Milkshake','Protein İçecekleri'].includes(c)&&variant!=='Kremamsı';
 const ingredients=template(c,f,v,variant);
 const nutrition=calculateNutrition(ingredients,v);
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
  description:`${f} aromalı ${c.toLowerCase()} • ${variant}. Tarif ${vl(v)} hedef hacim için hesaplanır; kalori ve makrolar malzeme gramajlarından yeniden hesaplanır.`,
  prep:'Malzemeleri tartın, sıvı ve katıları tarif sırasına göre karıştırın; son hacmi ölçerek gerektiğinde su ile tamamlayın.',
  tip:'Besin değerini korumak için kullanılan gerçek marka/ürün etiketini ayrıca kontrol edin; ürünler arasında fark olabilir.',
  alternative:sugarFree?'Tatlandırıcı eklemeden tarçın, limon veya taze otlarla aroma verilebilir.':'Bal yerine tarifte belirtilen eşdeğer bir tatlandırıcı kullanılabilir; kcal yeniden hesaplanmalıdır.',
  storage:'Kapalı cam şişede buzdolabında saklayın. Süt veya taze meyve içeren tarifleri mümkünse aynı gün tüketin.',
  serving:`${vl(v)} toplam tarif hacmidir. Günlüğe eklenen miktar seçilen katsayıyla tüm besin değerlerini orantılı ölçekler.`,
  temperature:c==='Kahve'||c==='Çay'||c==='Bitki Çayı'?'60–75 °C':'4–8 °C'
 };
 return {id:`bev-${String(i+1).padStart(5,'0')}`,title:`${f} ${c} — ${variant} — ${vl(v)}`,category:'snack',calories:nutrition.calories,carbs:nutrition.carbs,protein:nutrition.protein,fat:nutrition.fat,prepTimeMinutes:ci<6?10:7,difficulty:ci<5?'Kolay':'Orta',servings:1,tags,ingredients:ingredientsForRecipe,steps:['Malzemeleri hassas tartın.',detail.prep,'Homojen kıvam elde edin.','Servis hacmini ölçün.'],imageUrl:`https://images.unsplash.com/photo-${IMAGE_IDS[(ci*FLAVORS.length+fi)%IMAGE_IDS.length]}?w=900&auto=format&fit=crop&q=85`,proFeature:true,volumeMl:v,cat:c,purposes,sugarFree,highProtein,vegan,detail,nutritionSource:nutrition.provenance.source,nutritionConfidence:nutrition.provenance.confidence,nutritionAudit:nutritionAudit(ingredients)};
}

const INDEX=Array.from({length:TOTAL},(_,i)=>i);

export const BeverageCatalog:React.FC<{onAddRecipeToDiary:(e:MealFoodEntry)=>void}>=({onAddRecipeToDiary})=>{
 const [cat,setCat]=useState<Cat|'Tümü'>('Tümü'),[vol,setVol]=useState<number|null>(null),[purpose,setPurpose]=useState<Purpose|null>(null),[cal,setCal]=useState<number|null>(null),[time,setTime]=useState<number|null>(null),[sugarFree,setSugarFree]=useState(false),[highProtein,setHighProtein]=useState(false),[vegan,setVegan]=useState(false),[active,setActive]=useState<ReturnType<typeof make>|null>(null),[meal,setMeal]=useState<MealType>('snack'),[quantity,setQuantity]=useState(1),[added,setAdded]=useState(false);
 const results=useMemo(()=>INDEX.map(make).filter(r=>(cat==='Tümü'||r.cat===cat)&&(vol===null||r.volumeMl===vol)&&(purpose===null||r.purposes.includes(purpose))&&(cal===null||r.calories<=cal)&&(time===null||r.prepTimeMinutes<=time)&&(!sugarFree||r.sugarFree)&&(!highProtein||r.highProtein)&&(!vegan||r.vegan)).slice(0,24),[cat,vol,purpose,cal,time,sugarFree,highProtein,vegan]);
 const clear=()=>{setCat('Tümü');setVol(null);setPurpose(null);setCal(null);setTime(null);setSugarFree(false);setHighProtein(false);setVegan(false)};
 const scaled=(n:number)=>round(n*quantity);
 const add=()=>{if(!active)return;const n=make(Number(active.id.replace('bev-',''))-1);onAddRecipeToDiary({id:'bev-food-'+Date.now(),name:n.title,mealType:meal,servingAmount:quantity,servingUnit:n.volumeMl*quantity>=1000?`${n.volumeMl*quantity/1000} L`:`${n.volumeMl*quantity} ml`,calories:scaled(n.calories),carbs:scaled(n.carbs),protein:scaled(n.protein),fat:scaled(n.fat),healthScore:96,pros:[...n.tags,`Kaynak: ${n.nutritionSource}`],timestamp:Date.now()});setAdded(true);setTimeout(()=>{setAdded(false);setActive(null)},800)};
 return <div className="space-y-4">
  <div className="rounded-3xl bg-gradient-to-br from-cyan-950/70 via-slate-900 to-emerald-950/50 border border-cyan-500/25 p-4"><div className="flex justify-between gap-3"><div><span className="text-[10px] font-bold text-cyan-300 uppercase">Yemek Tarifleri • Alkolsüz</span><h2 className="text-xl font-extrabold text-white mt-1">🥤 14.000 Alkolsüz İçecek Varyantı</h2><p className="text-xs text-slate-300 mt-1">Malzeme gramajlarından hesaplanan kcal • kaynak/provenance kaydı • miktar ölçekleme</p></div><GlassWater className="w-9 h-9 text-cyan-300"/></div><div className="grid grid-cols-3 gap-2 mt-4 text-center"><Stat v="14.000" l="Varyant"/><Stat v="13" l="Tür"/><Stat v="100 ml–3 L+" l="Miktar"/></div></div>
  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 space-y-3"><div className="flex justify-between text-sm font-bold"><span className="flex gap-2 items-center"><Filter className="w-4 h-4 text-emerald-400"/> Filtre</span><button onClick={clear} className="text-[11px] text-cyan-300">Temizle</button></div><Facet title="Tür">{['Tümü',...CATS].map(x=><Chip key={x} onClick={()=>setCat(x as Cat|'Tümü')} active={cat===x}>{x}</Chip>)}</Facet><Facet title="Amaç">{(['Ferahlatıcı','Düşük Kalori','Enerji','Bağışıklık','Sindirim','Tok Tutar'] as Purpose[]).map(x=><Chip key={x} onClick={()=>setPurpose(purpose===x?null:x)} active={purpose===x}>{x}</Chip>)}</Facet><Facet title="Kalori">{[[50,'0–50'],[100,'51–100'],[200,'101–200'],[10000,'200+']].map(([m,l])=><Chip key={l} onClick={()=>setCal(cal===m?null:m as number)} active={cal===m}>{l} kcal</Chip>)}</Facet><Facet title="Süre">{[5,10,15,30].map(x=><Chip key={x} onClick={()=>setTime(time===x?null:x)} active={time===x}>{x} dk altı</Chip>)}</Facet><Facet title="Miktar">{VOL.map(x=><Chip key={x} onClick={()=>setVol(vol===x?null:x)} active={vol===x}>{vl(x)}</Chip>)}</Facet><div className="flex flex-wrap gap-2"><Chip onClick={()=>setSugarFree(!sugarFree)} active={sugarFree}>Şekersiz</Chip><Chip onClick={()=>setHighProtein(!highProtein)} active={highProtein}>Yüksek Protein</Chip><Chip onClick={()=>setVegan(!vegan)} active={vegan}>Vegan</Chip></div></div>
  <div className="grid grid-cols-2 gap-3">{results.map(r=><button key={r.id} onClick={()=>{setActive(r);setQuantity(1)}} className="text-left rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-cyan-500/50"><img src={r.imageUrl} alt={r.title} className="w-full h-28 object-cover" loading="lazy"/><div className="p-3"><div className="text-[10px] text-cyan-300">{r.cat} • {vl(r.volumeMl)}</div><div className="font-bold text-white text-sm mt-1">{r.title}</div><div className="text-xs text-slate-300 mt-2">{r.calories} kcal • P {r.protein}g • K {r.carbs}g • Y {r.fat}g</div><div className="text-[10px] text-emerald-300 mt-2">{r.nutritionConfidence==='verified'?'✓ Doğrulanmış kaynak':'Kaynaklı referans veri'}</div></div></button>)}</div>
  {active&&<div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-3"><div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-950 border border-slate-800 p-4"><div className="flex justify-between"><div><div className="text-xs text-cyan-300">{active.cat} • {vl(active.volumeMl)}</div><h3 className="text-lg font-extrabold text-white">{active.title}</h3></div><button onClick={()=>setActive(null)}><X/></button></div><div className="grid grid-cols-4 gap-2 my-4">{[['kcal',active.calories],['protein',active.protein+'g'],['karb',active.carbs+'g'],['yağ',active.fat+'g']].map(([a,b])=><div key={a} className="rounded-xl bg-slate-900 p-2 text-center"><b className="text-white">{b}</b><span className="block text-[10px] text-slate-400">{a}</span></div>)}</div><div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 mb-3"><div className="flex items-center gap-2 text-sm font-bold text-emerald-300"><ShieldCheck className="w-4 h-4"/> Besin kaynağı ve hesaplama izi</div><p className="text-xs text-slate-300 mt-1">Kcal malzeme gramajı × 100 g başına enerji üzerinden yeniden hesaplanır. Kaynak: {active.nutritionSource}. Güven seviyesi: {active.nutritionConfidence==='verified'?'doğrulanmış':'referans'}.</p><div className="mt-2 text-[10px] text-cyan-300 flex items-center gap-1">Resmî veri açıklaması <ExternalLink className="w-3 h-3"/></div></div><h4 className="font-bold text-white mb-2">Malzemeler</h4><ul className="space-y-1 mb-4">{active.nutritionAudit.map(x=><li key={x.ingredient} className="text-xs text-slate-300 flex justify-between"><span>{x.ingredient}</span><span>{x.grams} g</span></li>)}</ul><p className="text-xs text-slate-300 mb-4">{active.detail.description}</p><div className="flex items-center justify-between rounded-2xl bg-slate-900 p-3 mb-3"><span className="text-sm text-slate-300">Miktar</span><div className="flex items-center gap-4"><button onClick={()=>setQuantity(Math.max(1,quantity-1))} className="p-2 rounded-xl bg-slate-800"><Minus className="w-4 h-4"/></button><b className="text-white">{quantity}×</b><button onClick={()=>setQuantity(quantity+1)} className="p-2 rounded-xl bg-slate-800"><Plus className="w-4 h-4"/></button></div></div><div className="text-xs text-slate-300 mb-3">Seçilen miktar: <b className="text-white">{active.volumeMl*quantity>=1000?`${active.volumeMl*quantity/1000} L`:`${active.volumeMl*quantity} ml`}</b> • <b className="text-white">{scaled(active.calories)} kcal</b></div><select value={meal} onChange={e=>setMeal(e.target.value as MealType)} className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-white mb-3"><option value="breakfast">Kahvaltı</option><option value="lunch">Öğle</option><option value="dinner">Akşam</option><option value="snack">Ara Öğün</option></select><button onClick={add} className="w-full rounded-xl bg-emerald-500 text-slate-950 font-extrabold p-3">{added?'✓ Günlüğe eklendi':'Günlüğe Ekle'}</button><p className="text-[10px] text-slate-500 mt-3">Ürün/marka değişirse etiket değerleri esas alınmalıdır. Referans veri tıbbi beslenme önerisi değildir.</p></div></div>}
 </div>;
};

const Chip:React.FC<{children:React.ReactNode;active?:boolean;onClick:()=>void}>=({children,active,onClick})=><button onClick={onClick} className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border ${active?'bg-cyan-400 text-slate-950 border-cyan-300':'bg-slate-950 text-slate-300 border-slate-700'}`}>{children}</button>;
const Facet:React.FC<{title:string;children:React.ReactNode}>=({title,children})=><div><div className="text-[10px] uppercase text-slate-500 mb-1">{title}</div><div className="flex flex-wrap gap-1.5">{children}</div></div>;
const Stat:React.FC<{v:string;l:string}>=({v,l})=><div className="rounded-xl bg-slate-950/70 p-2"><b className="text-white">{v}</b><span className="block text-[10px] text-slate-400">{l}</span></div>;
