import React, { useMemo, useState } from 'react';
import { Scale, TrendingDown, Plus, Trash2, Calendar } from 'lucide-react';
import { UserProfile, WeightRecord } from '../types';

interface WeightTabProps { profile: UserProfile; weightRecords: WeightRecord[]; onAddWeight: (record: WeightRecord) => void; onDeleteWeight: (id: string) => void; }
type RangeFilter = '7d' | '30d' | '1y' | 'all';
const inputDate = (ts: number) => { const d = new Date(ts); return new Date(ts - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

export const WeightTab: React.FC<WeightTabProps> = ({ profile, weightRecords, onAddWeight, onDeleteWeight }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [weight, setWeight] = useState(String(profile.currentWeightKg));
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(inputDate(Date.now()));
  const [filter, setFilter] = useState<RangeFilter>('all');

  const sorted = useMemo(() => [...weightRecords].sort((a,b) => a.timestamp - b.timestamp), [weightRecords]);
  const visible = useMemo(() => {
    if (filter === 'all') return sorted;
    const days = filter === '7d' ? 7 : filter === '30d' ? 30 : 365;
    const cutoff = Date.now() - days * 86400000;
    return sorted.filter(r => r.timestamp >= cutoff);
  }, [sorted, filter]);
  const latest = sorted[sorted.length - 1];
  const latestWeight = latest?.weightKg ?? profile.currentWeightKg;
  const totalChange = Number((latestWeight - profile.startingWeightKg).toFixed(1));
  const remaining = Number((latestWeight - profile.targetWeightKg).toFixed(1));
  const height = profile.heightCm / 100;
  const bmi = height > 0 ? Number((latestWeight / (height * height)).toFixed(1)) : 0;
  const bmiCategory = bmi < 18.5 ? 'Zayıf' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Fazla Kilolu' : 'Obezite';
  const fmt = (ts: number) => new Date(ts).toLocaleDateString('tr-TR', { day:'2-digit', month:'short', year:'numeric' });

  const save = () => {
    const kg = parseFloat(weight);
    if (!Number.isFinite(kg) || kg <= 0 || !date) return;
    const selected = new Date(`${date}T12:00:00`);
    onAddWeight({ id:'w-' + Date.now(), date:selected.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}), weightKg:kg, bodyFat:bodyFat ? parseFloat(bodyFat) : undefined, waistCm:waist ? parseFloat(waist) : undefined, note:note || undefined, timestamp:selected.getTime() });
    setShowAddModal(false); setBodyFat(''); setWaist(''); setNote(''); setDate(inputDate(Date.now()));
  };

  const chartH=130, chartW=320, vals=visible.map(r=>r.weightKg), minW=Math.min(...vals, profile.targetWeightKg)-1, maxW=Math.max(...vals, profile.startingWeightKg)+1, span=maxW-minW||1;
  const points=visible.map((r,i)=>{const x=(i/Math.max(1,visible.length-1))*(chartW-40)+20; const y=chartH-((r.weightKg-minW)/span)*(chartH-30)-15; return {x,y,w:r.weightKg};});
  const line=points.map(p=>`${p.x},${p.y}`).join(' ');

  return <div className="space-y-4">
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4"><div><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Kilo ve Vücut Analizi</span><div className="flex items-baseline gap-2"><h2 className="text-3xl font-black text-white">{latestWeight}</h2><span className="text-sm text-slate-400">kg</span></div><p className="text-xs text-slate-300">Başlangıçtan bu yana: <strong className={totalChange<=0?'text-emerald-400':'text-rose-400'}>{totalChange>0?`+${totalChange}`:totalChange} kg</strong></p></div><button onClick={()=>setShowAddModal(true)} className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"><Plus className="w-4 h-4"/>Kilo Ekle</button></div>
      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800"><div className="p-2 rounded-xl bg-slate-950/60"><span className="text-[10px] text-slate-400 block">Hedef</span><strong className="text-sm text-white">{profile.targetWeightKg} kg</strong><span className="text-[10px] text-emerald-400 block">{remaining>0?`${remaining} kg kaldı`:'Ulaşıldı!'}</span></div><div className="p-2 rounded-xl bg-slate-950/60"><span className="text-[10px] text-slate-400 block">VKİ</span><strong className="text-sm text-white">{bmi}</strong><span className="text-[10px] text-emerald-400 block">{bmiCategory}</span></div><div className="p-2 rounded-xl bg-slate-950/60"><span className="text-[10px] text-slate-400 block">Başlangıç</span><strong className="text-sm text-white">{profile.startingWeightKg} kg</strong><span className="text-[10px] text-slate-400 block">Boy: {profile.heightCm} cm</span></div></div>
    </div>
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-emerald-400"/><h3 className="text-sm font-bold text-white">Kilo Gelişim Grafiği</h3></div><span className="text-xs text-slate-400">{visible.length}/{weightRecords.length} ölçüm</span></div><div className="flex gap-1.5">{([['7d','7 Gün'],['30d','30 Gün'],['1y','1 Yıl'],['all','Tümü']] as const).map(([k,l])=><button key={k} onClick={()=>setFilter(k)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold ${filter===k?'bg-emerald-500 text-slate-950':'bg-slate-800 text-slate-400'}`}>{l}</button>)}</div>{visible.length?<svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full"><polyline fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" points={line}/>{points.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="4" fill="#0f172a" stroke="#34d399" strokeWidth="2"/> )}</svg>:<p className="text-center text-xs text-slate-500 py-6">Bu aralıkta ölçüm yok.</p>}</div>
    <div className="space-y-2"><div className="flex items-center justify-between px-1"><h3 className="text-sm font-bold text-white">Ölçüm Geçmişi</h3><span className="text-[10px] text-slate-500">Kalıcı geçmiş • {weightRecords.length} kayıt</span></div>{[...visible].reverse().map(r=><div key={r.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center"><Scale className="w-4 h-4 text-emerald-400"/></div><div><strong className="text-sm font-bold text-white">{r.weightKg} kg</strong><span className="text-xs text-slate-400 block">{fmt(r.timestamp)} {r.note?`• "${r.note}"`:''}</span></div></div><button onClick={()=>onDeleteWeight(r.id)} className="p-1.5 text-slate-500 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5"/></button></div>)}{!visible.length&&<div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center text-xs text-slate-500">Kayıt bulunamadı.</div>}</div>
    {showAddModal&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4"><h3 className="text-base font-bold text-white">Yeni Kilo Kaydı Ekle</h3><label className="text-xs font-semibold text-slate-300 block">Tarih *<div className="relative mt-1"><Calendar className="absolute left-3 top-3 w-4 h-4 text-emerald-400"/><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"/></div></label><label className="text-xs font-semibold text-slate-300 block">Kilo (kg) *<input type="number" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-lg font-bold text-white"/></label><div className="grid grid-cols-2 gap-3"><input type="number" step="0.1" placeholder="Yağ %" value={bodyFat} onChange={e=>setBodyFat(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"/><input type="number" placeholder="Bel cm" value={waist} onChange={e=>setWaist(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"/></div><input type="text" placeholder="Not" value={note} onChange={e=>setNote(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"/><div className="flex gap-2"><button onClick={()=>setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs">İptal</button><button onClick={save} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">Kaydet</button></div></div></div>}
  </div>;
};
