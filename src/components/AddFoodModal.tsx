import React, { useState, useRef, useEffect } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Camera, Search, Barcode, Plus, Sparkles, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { FoodItem, MealFoodEntry, MealType } from '../types';
import { loadFoods } from '../utils/storage';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMeal: MealType;
  onAddFood: (entry: MealFoodEntry) => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({ isOpen, onClose, targetMeal, onAddFood }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'ai' | 'barcode' | 'custom'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingAmount, setServingAmount] = useState(1);
  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>(() => loadFoods());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiPromptNote, setAiPromptNote] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeResult, setBarcodeResult] = useState<FoodItem | null>(null);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const barcodeListenerRef = useRef<{ remove: () => Promise<void> } | null>(null);
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  useEffect(() => { if (isOpen) setFoodDatabase(loadFoods()); }, [isOpen]);

  const stopBarcodeScanner = async () => {
    document.body.classList.remove('barcode-scanner-active');
    try { await barcodeListenerRef.current?.remove(); } catch { /* listener may already be removed */ }
    barcodeListenerRef.current = null;
    try { await BarcodeScanner.stopScan(); } catch { /* scanner may already be stopped */ }
    setIsScanning(false);
  };

  useEffect(() => () => { void stopBarcodeScanner(); }, []);

  if (!isOpen) return null;

  const mealTitles: Record<MealType, string> = {
    breakfast: 'Kahvaltıya Ekle', lunch: 'Öğle Yemeğine Ekle', dinner: 'Akşam Yemeğine Ekle', snack: 'Atıştırmalıklara Ekle',
  };
  const filteredFoods = foodDatabase.filter(f => {
    const q = searchQuery.toLowerCase().trim();
    return !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || (f.barcode && f.barcode.includes(q)) || (f.pros && f.pros.some(p => p.toLowerCase().includes(q)));
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setAiError(null); setAiResult(null);
    const reader = new FileReader(); reader.onload = event => setImagePreview(event.target?.result as string); reader.readAsDataURL(file);
  };

  const runAiAnalysis = async () => {
    if (!imagePreview && !aiPromptNote) return;
    setIsAnalyzing(true); setAiError(null);
    try {
      const res = await fetch('/api/ai/analyze-food', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: imagePreview, description: aiPromptNote, mealType: targetMeal }) });
      const json = await res.json();
      if (json.success && json.data) setAiResult(json.data); else setAiError(json.error || 'Yemek taranamadı.');
    } catch { setAiError('Sunucu bağlantı hatası.'); } finally { setIsAnalyzing(false); }
  };

  const confirmAiEntry = () => {
    if (!aiResult) return;
    onAddFood({ id: 'food-' + Date.now(), name: aiResult.name || 'AI ile Taranan Yemek', mealType: targetMeal, servingAmount: 1, servingUnit: 'porsiyon', calories: Number(aiResult.calories) || 0, carbs: Number(aiResult.carbs) || 0, protein: Number(aiResult.protein) || 0, fat: Number(aiResult.fat) || 0, fiber: Number(aiResult.fiber) || 0, healthScore: Number(aiResult.healthScore) || 90, pros: aiResult.pros || [], cons: aiResult.cons || [], timestamp: Date.now(), aiDetected: true });
    onClose();
  };

  const confirmDbItem = (item: FoodItem) => {
    const multiplier = servingAmount;
    onAddFood({ id: 'food-' + Date.now(), foodId: item.id, name: item.name, mealType: targetMeal, servingAmount, servingUnit: item.unit, calories: Math.round(item.calories * multiplier), carbs: Math.round(item.carbs * multiplier), protein: Math.round(item.protein * multiplier), fat: Math.round(item.fat * multiplier), fiber: item.fiber ? Math.round(item.fiber * multiplier) : undefined, healthScore: item.healthScore, pros: item.pros, cons: item.cons, timestamp: Date.now() });
    onClose();
  };

  const confirmCustomItem = () => {
    if (!customName.trim()) return;
    onAddFood({ id: 'food-' + Date.now(), name: customName, mealType: targetMeal, servingAmount: 1, servingUnit: 'porsiyon', calories: Number(customCal) || 0, protein: Number(customProtein) || 0, carbs: Number(customCarbs) || 0, fat: Number(customFat) || 0, timestamp: Date.now() });
    onClose();
  };

  const handleBarcodeLookup = (code: string) => {
    const normalizedCode = code.trim();
    if (!normalizedCode) return;
    const found = foodDatabase.find(f => f.barcode === normalizedCode);
    if (found) setBarcodeResult(found);
    else setBarcodeResult({ id: 'scanned-' + normalizedCode, name: `Barkodlu Ürün (${normalizedCode})`, category: 'Atıştırmalık', calories: 195, protein: 14, carbs: 22, fat: 5, defaultServing: 1, unit: 'paket', healthScore: 84, pros: ['Pratik atıştırmalık'] });
  };

  const startBarcodeScanner = async () => {
    if (isScanning) return;
    setBarcodeError(null);
    setBarcodeResult(null);
    try {
      const { supported } = await BarcodeScanner.isSupported();
      if (!supported) throw new Error('Bu cihazda kamera barkod taraması desteklenmiyor.');

      const { camera } = await BarcodeScanner.checkPermissions();
      if (camera !== 'granted') {
        const requested = await BarcodeScanner.requestPermissions();
        if (requested.camera !== 'granted') throw new Error('Kamera izni verilmedi. Android ayarlarından kamera iznini açın.');
      }

      document.body.classList.add('barcode-scanner-active');
      setIsScanning(true);

      const listener = await BarcodeScanner.addListener('barcodesScanned', async ({ barcodes }) => {
        const value = barcodes.find(barcode => barcode.rawValue)?.rawValue;
        if (!value) return;
        setBarcodeInput(value);
        await stopBarcodeScanner();
        handleBarcodeLookup(value);
      });
      barcodeListenerRef.current = listener;
      await BarcodeScanner.startScan();
    } catch (error) {
      await stopBarcodeScanner();
      setBarcodeError(error instanceof Error ? error.message : 'Kamera barkod taraması başlatılamadı.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700 max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold"><Plus className="w-4 h-4" /></div><div><h3 className="text-base font-bold text-white">{mealTitles[targetMeal]}</h3><p className="text-[11px] text-emerald-400 font-medium">Tüm PRO Özellikler Ücretsiz</p></div></div><button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"><X className="w-5 h-5" /></button></div>
        <div className="grid grid-cols-4 p-2 bg-slate-950/60 border-b border-slate-800 text-xs">
          {([['ai', Sparkles, 'AI Tara'], ['search', Search, 'Arama'], ['barcode', Barcode, 'Barkod'], ['custom', Plus, 'Manuel']] as const).map(([tab, Icon, label]) => <button key={tab} onClick={() => { if (isScanning) void stopBarcodeScanner(); setActiveTab(tab); }} className={`flex flex-col items-center gap-1 py-2 rounded-xl transition ${activeTab === tab ? 'bg-emerald-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'}`}><Icon className="w-4 h-4" /><span>{label}</span></button>)}
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'ai' && <div className="space-y-4"><div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300"><strong className="text-white block">Willy AI Fotoğraf Tarayıcısı</strong>Tabağınızın fotoğrafını çekin veya yükleyin. Willy AI malzemeleri ve kalorileri hesaplar.</div><input type="file" ref={fileInputRef} accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />{!imagePreview ? <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-3xl p-6 text-center cursor-pointer transition"><Camera className="w-7 h-7 mx-auto text-emerald-400" /><span className="text-sm font-semibold text-white block mt-2">Fotoğraf Çek veya Yükle</span><span className="text-xs text-slate-400">Kamera veya galeri</span></div> : <div className="space-y-3"><div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-56"><img src={imagePreview} alt="Yemek" className="w-full h-full object-cover" /><button onClick={() => { setImagePreview(null); setAiResult(null); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white"><X className="w-4 h-4" /></button></div><input type="text" value={aiPromptNote} onChange={e => setAiPromptNote(e.target.value)} placeholder="Yemek hakkında ipucu..." className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white" />{!aiResult && <button onClick={runAiAnalysis} disabled={isAnalyzing} className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">{isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" />Willy AI inceliyor...</> : <><Sparkles className="w-4 h-4" />AI ile Analiz Et</>}</button>}</div>}{aiError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{aiError}</div>}{aiResult && <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3"><div><span className="text-[10px] font-bold text-emerald-400 uppercase">AI Tespit Etti</span><h4 className="text-base font-bold text-white">{aiResult.name}</h4></div><div className="grid grid-cols-4 gap-2 text-center text-xs"><div>Kalori<br/><b>{aiResult.calories}</b></div><div>Protein<br/><b>{aiResult.protein}g</b></div><div>Karb<br/><b>{aiResult.carbs}g</b></div><div>Yağ<br/><b>{aiResult.fat}g</b></div></div><button onClick={confirmAiEntry} className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"><Check className="w-4 h-4" />Öğünü Günlüğe Ekle</button></div>}</div>}
          {activeTab === 'search' && <div className="space-y-4"><div className="relative"><Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Yumurta, tavuk, muz, çorba ara..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white" /></div>{selectedFood ? <div className="p-4 rounded-2xl bg-slate-950 border border-slate-700 space-y-4"><div className="flex justify-between"><div><span className="text-[10px] text-emerald-400 font-semibold uppercase">{selectedFood.category}</span><h4 className="text-base font-bold text-white">{selectedFood.name}</h4><p className="text-xs text-slate-400">{selectedFood.calories} kcal ({selectedFood.defaultServing} {selectedFood.unit})</p></div><button onClick={() => setSelectedFood(null)} className="text-xs text-slate-400">Geri</button></div><input type="number" min="0.25" step="0.25" value={servingAmount} onChange={e => setServingAmount(parseFloat(e.target.value) || 1)} className="w-24 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-bold" /><div className="p-3 rounded-xl bg-slate-900 text-xs">Toplam: <strong className="text-emerald-400">{Math.round(selectedFood.calories * servingAmount)} kcal</strong> · Prot: {Math.round(selectedFood.protein * servingAmount)}g · Karb: {Math.round(selectedFood.carbs * servingAmount)}g · Yağ: {Math.round(selectedFood.fat * servingAmount)}g</div><button onClick={() => confirmDbItem(selectedFood)} className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"><Check className="w-4 h-4 inline mr-2" />Günlüğe Ekle</button></div> : <div className="space-y-2">{filteredFoods.map(food => <div key={food.id} onClick={() => { setSelectedFood(food); setServingAmount(1); }} className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 cursor-pointer flex items-center justify-between"><div><h5 className="text-sm font-semibold text-white">{food.name}</h5><p className="text-xs text-slate-400">{food.calories} kcal • P: {food.protein}g • K: {food.carbs}g • Y: {food.fat}g</p></div><Plus className="w-4 h-4 text-emerald-400" /></div>)}</div>}</div>}
          {activeTab === 'barcode' && <div className="space-y-4"><div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300"><strong className="text-white block">Kamera ile Barkod Tarama</strong>Telefon kamerasını açın ve ürün barkodunu kadraja alın. Kod otomatik okunur.</div><button onClick={startBarcodeScanner} disabled={isScanning} className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"><Camera className="w-5 h-5" />{isScanning ? 'Barkod taranıyor...' : 'Kamerayı Aç ve Barkodu Tara'}</button>{isScanning && <button onClick={() => void stopBarcodeScanner()} className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-200 font-semibold text-sm">Taramayı Durdur</button>}<div className="flex gap-2"><input type="text" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} placeholder="Barkodu elle girin" className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white" /><button onClick={() => handleBarcodeLookup(barcodeInput)} disabled={!barcodeInput.trim()} className="px-4 py-2.5 rounded-xl bg-slate-700 text-white font-bold text-xs disabled:opacity-50">Sorgula</button></div>{barcodeError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{barcodeError}</div>}{barcodeResult && <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3"><h4 className="text-sm font-bold text-white">{barcodeResult.name}</h4><p className="text-xs text-slate-400">{barcodeResult.calories} kcal • 1 {barcodeResult.unit}</p><button onClick={() => confirmDbItem(barcodeResult)} className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm"><Check className="w-4 h-4 inline mr-2" />Günlüğe Ekle</button></div>}</div>}
          {activeTab === 'custom' && <div className="space-y-3"><input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Besin veya Yemek Adı *" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white" /><div className="grid grid-cols-2 gap-3">{[['Kalori (kcal) *', customCal, setCustomCal], ['Protein (g)', customProtein, setCustomProtein], ['Karbonhidrat (g)', customCarbs, setCustomCarbs], ['Yağ (g)', customFat, setCustomFat]].map(([label, value, setter]) => <div key={label as string}><label className="text-xs font-semibold text-slate-300 block mb-1">{label as string}</label><input type="number" value={value as string} onChange={e => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white" /></div>)}</div><button onClick={confirmCustomItem} disabled={!customName || !customCal} className="w-full mt-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm disabled:opacity-50"><Check className="w-4 h-4 inline mr-2" />Manuel Öğünü Kaydet</button></div>}
        </div>
      </div>
    </div>
  );
};
