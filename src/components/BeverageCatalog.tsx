import React,{useMemo,useState} from 'react';
import {Droplets,Filter,GlassWater,Plus,X,Minus,Star,Clock,Lightbulb} from 'lucide-react';
import {MealFoodEntry,MealType,Recipe} from '../types';

type Cat='Ayran'|'Limonata'|'Şerbet'|'Smoothie'|'Komposto'|'Milkshake'|'Kahve'|'Çay'|'Bitki Çayı'|'Meyve İçecekleri'|'Detoks'|'Protein İçecekleri'|'Yöresel İçecekler';
type Purpose='Ferahlatıcı'|'Düşük Kalori'|'Enerji'|'Bağışıklık'|'Sindirim'|'Tok Tutar';
type Detail={description:string;prep:string;tip:string;alternative:string;storage:string;serving:string;temperature:string};
const CATS:Cat[]=['Ayran','Limonata','Şerbet','Smoothie','Komposto','Milkshake','Kahve','Çay','Bitki Çayı','Meyve İçecekleri','Detoks','Protein İçecekleri','Yöresel İçecekler'];
const FLAVORS=['Klasik','Naneli','Çilekli','Zencefilli','Elmalı','Orman Meyveli','Tarçınlı','Limonlu','Mango','Yöresel'];
const VARIANTS=['Ev Usulü','Fit','Şekersiz','Proteinli','Lifli','Kremamsı','Baharatlı','Vitaminli','Hafif','Ferah'];
const VOL=[100,200,250,330,500,750,1000,1500,2000,3000];
const BASE=[35,32,48,75,55,115,25,2,3,45,18,95,60];
const IMAGE_IDS=['1601050690597-df0568f70950','1621263764928-df1444c5e859','1544145945-f90425340c7e','1553530666-ba11a7da3888','1547592180-85f173990554','1572490122747-3968b75cc699','1495474472287-4d71bcdd2085','1544787219-7f47ccb76574','1597318181409-cf64d0d5a59d','1551024709-8f23befc6f87','1556881286-fc6915169721','1553530666-ba11a7da3888','1563636619-e9143da7973b'];
const TOTAL=14000;
const vl=(n:number)=>n>=1000?`${n/1000} L`:`${n} ml`;
const scaled=(n:number,f:number)=>Math.round(n*f*10)/10;

function make(i:number):Recipe&{volumeMl:number;cat:Cat;purposes:Purpose[];sugarFree:boolean;highProtein:boolean;vegan:boolean;detail:Detail;proFeature:boolean}{
 const ci=i%CATS.length,fi=Math.floor(i/CATS.length)%FLAVORS.length,vi=Math.floor(i/(CATS.length*FLAVORS.length))%VOL.length,ri=Math.floor(i/(CATS.length*FLAVORS.length*VOL.length))%VARIANTS.length;
 const c=CATS[ci],f=FLAVORS[fi],v=VOL[vi],variant=VARIANTS[ri];
 const sugarFree=variant==='Şekersiz'||c==='Çay'||c==='Bitki Çayı'||c==='Detoks'||i%11===0;
 const highProtein=c==='Protein İçecekleri'||variant==='Proteinli'||(c==='Ayran'&&i%9===0);
 const vegan=!['Ayran','Milkshake','Protein İçecekleri'].includes(c)&&variant!=='Kremamsı'&&i%5!==0;
 const cal=Math.max(2,Math.round(BASE[ci]*(v/250)*(sugarFree?.72:1)*(variant==='Fit'?.9:variant==='Kremamsı'?1.08:1)));
 const protein=Math.round(((highProtein?12:c==='Ayran'?2.2:1)*(v/250)*(variant==='Proteinli'?1.35:1))*10)/10;
 const carbs=Math.round(cal*.18*10)/10,fat=Math.round(cal*.09*10)/10;
 const purposes:Purpose[]=[];
 if(sugarFree||cal<=100)purposes.push('Düşük Kalori');
 if(['Ayran','Limonata','Detoks','Çay','Bitki Çayı'].includes(c))purposes.push('Ferahlatıcı');
 if(['Kahve','Protein İçecekleri'].includes(c))purposes.push('Enerji');
 if(['Meyve İçecekleri','Smoothie','Detoks'].includes(c))purposes.push('Bağışıklık');
 if(['Çay','Bitki Çayı','Komposto'].includes(c))purposes.push('Sindirim');
 if(highProtein||c==='Smoothie')purposes.push('Tok Tutar');
 const baseName=c==='Ayran'?'yoğurt':c==='Limonata'?'limon':c==='Şerbet'?'meyve/şerbetlik aroma':c==='Kahve'?'çekilmiş kahve':c==='Çay'?'çay':c==='Bitki Çayı'?'bitki karışımı':c==='Milkshake'?'süt':f.toLowerCase();
 const liquid=c==='Ayran'?'soğuk su':c==='Kahve'||c==='Çay'||c==='Bitki Çayı'?'sıcak su':'soğuk su veya süt';
 const sweet=sugarFree?'tatlandırıcı gerekmiyor':'bal veya doğal tatlandırıcı';
 const ingredients=[
  {name:baseName,amount:c==='Kahve'||c==='Çay'||c==='Bitki Çayı'?'5 g':`${Math.max(10,Math.round(120*v/250))} g`},
  {name:liquid,amount:`${Math.max(30,Math.round(v*.75))} ml`},
  {name:sweet,amount:sugarFree?'0 g':`${Math.max(5,Math.round(v*.04))} g`},
  {name:f==='Naneli'?'taze nane':f==='Zencefilli'?'taze zencefil':f==='Tarçınlı'?'tarçın':f==='Limonlu'||c==='Limonata'?'limon suyu':'buz',amount:`${Math.max(3,Math.round(v*.02))} g`}
 ];
 const steps=[
  `Malzemeleri ${vl(v)} hedef hacme göre hassas ölçün; meyve ve taze ürünleri yıkayıp hazırlayın.`,
  `${baseName} ile sıvı bazı birleştirin ve ${f} aromasını ekleyin.`,
  c==='Kahve'||c==='Çay'||c==='Bitki Çayı'?'Uygun sıcaklıkta demleyin; kahvede 3–4 dakika, çayda 3–5 dakika aralığını aşmadan süzün.':'Karışımı 30–60 saniye blenderdan geçirin veya homojen olana kadar kuvvetlice karıştırın.',
  sugarFree?'Şeker eklemeden tadı kontrol edin; gerekirse limon, baharat veya taze ot ile aromayı dengeleyin.':'Tatlandırıcıyı azar azar ekleyip tamamen çözünene kadar karıştırın.',
  `${vl(v)} toplam hacmi kontrol edin, gerekiyorsa su/süt ile tamamlayın; servis öncesi soğutun veya uygun sıcaklıkta tutun.`
 ];
 const detail:Detail={
  description:`${f} aromalı ${c.toLowerCase()} için ${variant.toLowerCase()} hazırlanış. Tarif hacmi ${vl(v)} olup seçilen miktara göre tüm malzeme ve besin değerleri otomatik ölçeklenir.`,
  prep:c==='Kahve'||c==='Çay'||c==='Bitki Çayı'?'Demleme sırasında kaynar suyu doğrudan hassas yaprakların üzerine uzun süre bırakmayın.':'Malzemeleri önceden soğutmak daha dengeli ve berrak bir sonuç verir.',
  tip:`${f} aromasını baskılamamak için tatlandırıcıyı en son ekleyin. ${variant} sonuç için kıvamı son 30 saniyede kontrol edin.`,
  alternative:sugarFree?'Tatlandırıcı yerine tarçın, vanilya veya taze nane kullanılabilir.':'Bal yerine hurma özü veya ölçülü doğal tatlandırıcı kullanılabilir.',
  storage:'Kapalı cam şişede buzdolabında saklayın; taze meyve/süt içeren tarifleri mümkünse aynı gün tüketin.',
  serving:`${vl(v)} hacmi 1 standart porsiyondur. Buz miktarı toplam sıvı hacmini aşmayacak şekilde ayarlanmalıdır.`,
  temperature:c==='Kahve'||c==='Çay'||c==='Bitki Çayı'?'60–75 °C servis':'4–8 °C servis'
 };
 const tags=['Alkolsüz',c,f,variant,...purposes];
 if(sugarFree)tags.push('Şekersiz');
 if(highProtein)tags.push('Yüksek Protein');
 if(vegan)tags.push('Vegan');
 return {id:`bev-${String(i+1).padStart(5,'0')}`,title:`${f} ${c} — ${variant} — ${vl(v)}`,category:'snack',calories:cal,carbs,protein,fat,prepTimeMinutes:ci<6?10:7,difficulty:ci<5?'Kolay':'Orta',servings:1,tags,ingredients,steps,imageUrl:`https://images.unsplash.com/photo-${IMAGE_IDS[(ci*FLAVORS.length+fi)%IMAGE_IDS.length]}?w=900&auto=format&fit=crop&q=85`,proFeature:true,volumeMl:v,cat:c,purposes,sugarFree,highProtein,vegan,detail};
}

const INDEX=Array.from({length:TOTAL},(_,i)=>i);

export const BeverageCatalog:React.FC<{onAddRecipeToDiary:(e:MealFoodEntry)=>void}>=({onAddRecipeToDiary})=>{
 const [cat,setCat]=useState<Cat|'Tümü'>('Tümü'),[vol,setVol]=useState<number|null>(null),[purpose,setPurpose]=useState<Purpose|null>(null),[cal,setCal]=useState<number|null>(null),[time,setTime]=useState<number|null>(null),[sugarFree,setSugarFree]=useState(false),[highProtein,setHighProtein]=useState(false),[vegan,setVegan]=useState(false),[active,setActive]=useState<ReturnType<typeof make>|null>(null),[meal,setMeal]=useState<MealType>('snack'),[added,setAdded]=useState(false),[quantity,setQuantity]=useState(1);
 const results=useMemo(()=>INDEX.map(make).filter(r=>(cat==='Tümü'||r.cat===cat)&&(vol===null||r.volumeMl===vol)&&(purpose===null||r.purposes.includes(purpose))&&(cal===null||r.calories<=cal)&&(time===null||r.prepTimeMinutes<=time)&&(!sugarFree||r.sugarFree)&&(!highProtein||r.highProtein)&&(!vegan||r.vegan)).slice(0,24),[cat,vol,purpose,cal,time,sugarFree,highProtein,vegan]);
 const clear=()=>{setCat('Tümü');setVol(null);setPurpose(null);setCal(null);setTime(null);setSugarFree(false);setHighProtein(false);setVegan(false)};
 const openRecipe=(r:ReturnType<typeof make>)=>{setActive(r);setQuantity(1);setAdded(false)};
 const factor=quantity;
 const currentCalories=active?scaled(active.calories,factor):0,currentProtein=active?scaled(active.protein,factor):0,currentCarbs=active?scaled(active.carbs,factor):0,currentFat=active?scaled(active.fat,factor):0,currentVolume=active?active.volumeMl*factor:0;
 const currentIngredients=active?active.ingredients.map(x=>{const m=x.amount.match(/([0-9]+(?:\.[0-9]+)?)/);if(!m)return x.amount;return `${scaled(Number(m[1]),factor)}${x.amount.slice(m[0].length)}`;}):[];
 const add=()=>{if(!active)return;onAddRecipeToDiary({id:'bev-food-'+Date.now(),name:active.title,mealType:meal,servingAmount:quantity,servingUnit:currentVolume>=1000?`${currentVolume/1000} L`:`${currentVolume} ml`,calories:currentCalories,carbs:currentCarbs,protein:currentProtein,fat:currentFat,healthScore:96,pros:active.tags,timestamp:Date.now()});setAdded(true);setTimeout(()=>{setAdded(false);setActive(null)},900)};
 return <div className="space-y-4">
  <div className="rounded-3xl bg-gradient-to-br from-cyan-950/70 via-slate-900 to-emerald-950/50 border border-cyan-500/25 p-4"><div className="flex justify-between gap-3"><div><span className="text-[10px] font-bold text-cyan-300 uppercase">Yemek Tarifleri • Alkolsüz</span><h2 className="text-xl font-extrabold text-white mt-1">🥤 10.000+ Alkolsüz İçecek Tarifi</h2><p className="text-xs text-slate-300 mt-1">Willy Tarif • Tür, amaç, kalori, süre ve miktar filtreleri; ayrıca şekersiz, yüksek protein ve vegan seçenekleri.</p></div><GlassWater className="w-9 h-9 text-cyan-300"/></div><div className="grid grid-cols-3 gap-2 mt-4 text-center"><div className="rounded-xl bg-slate-950/70 p-2"><b>14.000</b><span className="block text-[10px] text-slate-400">Varyant</span></div><div className="rounded-xl bg-slate-950/70 p-2"><b>13</b><span className="block text-[10px] text-slate-400">Tür</span></div><div className="rounded-xl bg-slate-950/70 p-2"><b>100 ml–3 L+</b><span className="block text-[10px] text-slate-400">Miktar</span></div></div></div>
  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 space-y-3"><div className="flex justify-between text-sm font-bold"><span className="flex gap-2 items-center"><Filter className="w-4 h-4 text-emerald-400"/> Filtre</span><button onClick={clear} className="text-[11px] text-cyan-300">Temizle</button></div>
   <Facet title="Tür">{['Tümü',...CATS].map(x=><Chip key={x} onClick={()=>setCat(x as Cat|'Tümü')} active={cat===x}>{x}</Chip>)}</Facet>
   <Facet title="Amaç">{(['Ferahlatıcı','Düşük Kalori','Enerji','Bağışıklık','Sindirim','Tok Tutar'] as Purpose[]).map(x=><Chip key={x} onClick={()=>setPurpose(purpose===x?null:x)} active={purpose===x}>{x}</Chip>)}</Facet>
   <Facet title="Kalori">{[[50,'0–50'],[100,'51–100'],[200,'101–200'],[10000,'200+']].map(([m,l])=><Chip key={l} onClick={()=>setCal(cal===m?null:m as number)} active={cal===m}>{l} kcal</Chip>)}</Facet>
   <Facet title="Süre">{[5,10,15,30].map(x=><Chip key={x} onClick={()=>setTime(time===x?null:x)} active={time===x}>{x} dk altı</Chip>)}</Facet>
   <Facet title="Miktar">{VOL.map(x=><Chip key={x} onClick={()=>setVol(vol===x?null:x)} active={vol===x}>{x===3000?'3 L+':vl(x)}</Chip>)}</Facet>
   <Facet title="Özellik"><Chip onClick={()=>setSugarFree(v=>!v)} active={sugarFree}>Şekersiz</Chip><Chip onClick={()=>setHighProtein(v=>!v)} active={highProtein}>Yüksek Protein</Chip><Chip onClick={()=>setVegan(v=>!v)} active={vegan}>Vegan</Chip></Facet>
  </div>
  <div className="flex justify-between text-xs"><span className="text-slate-300"><b className="text-white">{results.length}</b> tarif gösteriliyor</span><span className="text-emerald-400 flex gap-1 items-center"><Droplets className="w-3.5 h-3.5"/> Alkolsüz</span></div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{results.map(r=><button key={r.id} onClick={()=>openRecipe(r)} className="text-left rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-cyan-500/40"><div className="relative h-40"><img src={r.imageUrl} alt={`${r.cat} ${r.title}`} loading="lazy" className="w-full h-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"/><span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold">ALKOLSÜZ</span><span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 text-white text-[10px]">{r.volumeMl===3000?'3 L+':vl(r.volumeMl)}</span><h3 className="absolute bottom-2 left-3 right-3 text-sm font-bold text-white">{r.title}</h3></div><div className="p-3 flex justify-between text-[11px]"><b className="text-emerald-400">{r.calories} kcal</b><span className="text-slate-400">P {r.protein}g • {r.prepTimeMinutes} dk</span><span className="text-cyan-300">Aç →</span></div></button>)}</div>
  {active&&<div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"><div className="w-full max-w-lg max-h-[94vh] overflow-y-auto bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-700"><div className="relative h-56"><img src={active.imageUrl} alt={`${active.cat} ${active.title}`} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"/><button onClick={()=>setActive(null)} className="absolute top-3 right-3 p-2 rounded-full bg-black/60"><X className="w-5 h-5"/></button><div className="absolute bottom-4 left-5 right-5"><div className="flex items-center gap-2"><span className="text-[10px] font-bold text-emerald-300">WILLY TARİF • {active.cat}</span><span className="text-[10px] font-bold text-yellow-300 flex items-center gap-1"><Star className="w-3 h-3"/> PRO</span></div><h2 className="text-xl font-extrabold text-white">{active.title}</h2></div></div><div className="p-5 space-y-4"><div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4"><h3 className="font-bold text-white">Willy Tarif — Detaylı İnceleme</h3><p className="text-xs text-slate-300 mt-2">{active.detail.description}</p></div><div className="grid grid-cols-4 gap-2 text-center"><Stat label="Kalori" value={`${currentCalories}`} unit="kcal"/><Stat label="Protein" value={`${currentProtein}`} unit="g"/><Stat label="Karbonhidrat" value={`${currentCarbs}`} unit="g"/><Stat label="Yağ" value={`${currentFat}`} unit="g"/></div><div className="flex items-center justify-between rounded-2xl bg-slate-950/60 p-3"><div><span className="text-xs text-slate-400">Miktar</span><b className="block text-white">{currentVolume>=1000?`${currentVolume/1000} L`:`${currentVolume} ml`}</b></div><div className="flex items-center gap-3"><button onClick={()=>setQuantity(q=>Math.max(1,q-1))} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center"><Minus className="w-4 h-4"/></button><b className="text-white min-w-6 text-center">{quantity}×</b><button onClick={()=>setQuantity(q=>Math.min(12,q+1))} className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center"><Plus className="w-4 h-4"/></button></div></div><section><h3 className="font-bold text-white mb-2">Malzemeler</h3><div className="space-y-2">{active.ingredients.map((x,n)=><div key={n} className="flex justify-between text-sm border-b border-slate-800 pb-2"><span className="text-slate-300">{x.name}</span><b className="text-white">{currentIngredients[n]}</b></div>)}</div></section><section><h3 className="font-bold text-white mb-2">Hazırlanışı</h3><ol className="space-y-3">{active.steps.map((s,n)=><li key={n} className="flex gap-3 text-sm text-slate-300"><span className="w-6 h-6 shrink-0 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center text-xs font-bold">{n+1}</span><span>{s}</span></li>)}</ol></section><div className="grid gap-2 sm:grid-cols-2"><Info icon={<Lightbulb className="w-4 h-4"/>} title="Willy püf noktası" text={active.detail.tip}/><Info icon={<Clock className="w-4 h-4"/>} title="Hazırlık / servis" text={`${active.prep} ${active.detail.temperature}.`}/><Info title="Alternatif" text={active.detail.alternative}/><Info title="Saklama" text={active.detail.storage}/></div><div className="rounded-2xl bg-slate-950/70 p-3"><span className="text-xs text-slate-400">Servis</span><p className="text-sm text-slate-200 mt-1">{active.detail.serving}</p></div><div className="grid grid-cols-2 gap-2"><select value={meal} onChange={e=>setMeal(e.target.value as MealType)} className="rounded-xl bg-slate-800 border border-slate-700 p-3 text-sm text-white"><option value="breakfast">Kahvaltı</option><option value="lunch">Öğle</option><option value="dinner">Akşam</option><option value="snack">Ara Öğün</option></select><button onClick={add} disabled={added} className="rounded-xl bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center gap-2">{added?'Eklendi ✓':'Günlüğe Ekle'}</button></div></div></div></div>}
 </div>;
};

const Facet:React.FC<{title:string;children:React.ReactNode}>=({title,children})=><div><div className="text-[10px] uppercase font-bold text-slate-500 mb-2">{title}</div><div className="flex gap-2 overflow-x-auto pb-1">{children}</div></div>;
const Chip:React.FC<{active:boolean;onClick:()=>void;children:React.ReactNode}>=({active,onClick,children})=><button onClick={onClick} className={`shrink-0 rounded-full px-3 py-1.5 text-xs border ${active?'bg-emerald-500 text-slate-950 border-emerald-400':'bg-slate-950 text-slate-300 border-slate-700'}`}>{children}</button>;
const Stat:React.FC<{label:string;value:string;unit:string}>=({label,value,unit})=><div className="rounded-xl bg-slate-950/70 p-2"><b className="block text-white text-sm">{value}</b><span className="text-[10px] text-slate-500">{label} {unit}</span></div>;
const Info:React.FC<{title:string;text:string;icon?:React.ReactNode}>=({title,text,icon})=><div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3"><div className="flex gap-2 items-center text-xs font-bold text-cyan-300">{icon}{title}</div><p className="text-[11px] text-slate-400 mt-1">{text}</p></div>;
