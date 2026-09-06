import React,{useState} from 'react';
import {GlassWater,Utensils} from 'lucide-react';
import {MealFoodEntry,Recipe} from '../types';
import {BeverageCatalog} from './BeverageCatalog';
import {RecipesTab as LegacyRecipesTab} from './RecipesTabLegacy';

interface Props{recipes:Recipe[];onAddRecipeToDiary:(entry:MealFoodEntry)=>void}

export const RecipesTab:React.FC<Props>=({recipes,onAddRecipeToDiary})=>{
 const [view,setView]=useState<'recipes'|'beverages'>('recipes');
 return <div className="space-y-4">
  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-900 border border-slate-800 p-1.5">
   <button onClick={()=>setView('recipes')} className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${view==='recipes'?'bg-emerald-500 text-slate-950':'text-slate-400'}`}><Utensils className="w-4 h-4"/> Yemek Tarifleri</button>
   <button onClick={()=>setView('beverages')} className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${view==='beverages'?'bg-cyan-400 text-slate-950':'text-slate-400'}`}><GlassWater className="w-4 h-4"/> Alkolsüz İçecekler</button>
  </div>
  {view==='recipes'?<LegacyRecipesTab recipes={recipes} onAddRecipeToDiary={onAddRecipeToDiary}/>:<BeverageCatalog onAddRecipeToDiary={onAddRecipeToDiary}/>} 
 </div>;
};
