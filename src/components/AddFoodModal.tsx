import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, Barcode, Plus, Sparkles, X, Check, AlertCircle, ArrowRight, Loader2, UploadCloud, Database, ShieldCheck } from 'lucide-react';
import { FoodItem, MealFoodEntry, MealType } from '../types';
import { loadFoods, saveFoods } from '../utils/storage';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMeal: MealType;
  onAddFood: (entry: MealFoodEntry) => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  targetMeal,
  onAddFood,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'ai' | 'barcode' | 'custom'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingAmount, setServingAmount] = useState<number>(1);
  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>(() => loadFoods());

  // Refresh foods whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setFoodDatabase(loadFoods());
    }
  }, [isOpen]);

  // AI Photo Scanning state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiPromptNote, setAiPromptNote] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Barcode state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeResult, setBarcodeResult] = useState<FoodItem | null>(null);

  // Custom food manual state
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  if (!isOpen) return null;

  const mealTitles: Record<MealType, string> = {
    breakfast: 'Kahvaltıya Ekle',
    lunch: 'Öğle Yemeğine Ekle',
    dinner: 'Akşam Yemeğine Ekle',
    snack: 'Atıştırmalıklara Ekle',
  };

  const foodCategories = [
    'Tümü',
    'Kahvaltı',
    'Öğle & Akşam',
    'Meyve & Sebze',
    'Bakliyat & Tahıl',
    'Kuruyemiş & Tohum',
    'Deniz Ürünleri',
    'İçecek & Çorba',
    'Süper Gıdalar',
    'Atıştırmalık',
  ];

  // Filter food database (385+ items)
  const filteredFoods = foodDatabase.filter(f => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      (f.barcode && f.barcode.includes(q)) ||
      (f.pros && f.pros.some(p => p.toLowerCase().includes(q)));

    const matchesCategory =
      selectedCategory === 'Tümü' ||
      f.category === selectedCategory ||
      (selectedCategory === 'Süt & Şarküteri' && (f.category.includes('Süt') || f.category.includes('Yoğurt')));

    return matchesSearch && matchesCategory;
  });

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiError(null);
    setAiResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setImagePreview(b64);
    };
    reader.readAsDataURL(file);
  };

  // Run AI food recognition via Gemini backend
  const runAiAnalysis = async () => {
    if (!imagePreview && !aiPromptNote) return;

    setIsAnalyzing(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          description: aiPromptNote,
          mealType: targetMeal,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAiResult(json.data);
      } else {
        setAiError(json.error || 'Yemek taranamadı.');
      }
    } catch (err: any) {
      setAiError('Sunucu bağlantı hatası.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Confirm adding AI recognized meal
  const confirmAiEntry = () => {
    if (!aiResult) return;

    const entry: MealFoodEntry = {
      id: 'food-' + Date.now(),
      name: aiResult.name || 'AI ile Taranan Yemek',
      mealType: targetMeal,
      servingAmount: 1,
      servingUnit: 'porsiyon',
      calories: Number(aiResult.calories) || 0,
      carbs: Number(aiResult.carbs) || 0,
      protein: Number(aiResult.protein) || 0,
      fat: Number(aiResult.fat) || 0,
      fiber: Number(aiResult.fiber) || 0,
      healthScore: Number(aiResult.healthScore) || 90,
      pros: aiResult.pros || [],
      cons: aiResult.cons || [],
      timestamp: Date.now(),
      aiDetected: true,
    };

    onAddFood(entry);
    onClose();
  };

  // Confirm database item
  const confirmDbItem = (item: FoodItem) => {
    const multiplier = servingAmount;
    const entry: MealFoodEntry = {
      id: 'food-' + Date.now(),
      foodId: item.id,
      name: item.name,
      mealType: targetMeal,
      servingAmount: servingAmount,
      servingUnit: item.unit,
      calories: Math.round(item.calories * multiplier),
      carbs: Math.round(item.carbs * multiplier),
      protein: Math.round(item.protein * multiplier),
      fat: Math.round(item.fat * multiplier),
      fiber: item.fiber ? Math.round(item.fiber * multiplier) : undefined,
      healthScore: item.healthScore,
      pros: item.pros,
      cons: item.cons,
      timestamp: Date.now(),
    };

    onAddFood(entry);
    onClose();
  };

  // Confirm custom manual item
  const confirmCustomItem = () => {
    if (!customName.trim()) return;
    const entry: MealFoodEntry = {
      id: 'food-' + Date.now(),
      name: customName,
      mealType: targetMeal,
      servingAmount: 1,
      servingUnit: 'porsiyon',
      calories: Number(customCal) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      timestamp: Date.now(),
    };

    onAddFood(entry);
    onClose();
  };

  // Barcode lookup
  const handleBarcodeLookup = (code: string) => {
    const found = COMMON_FOOD_DATABASE.find(f => f.barcode === code);
    if (found) {
      setBarcodeResult(found);
    } else {
      // Create mock scanned item
      setBarcodeResult({
        id: 'scanned-' + code,
        name: `Barkodlu Ürün (${code})`,
        category: 'Atıştırmalık',
        calories: 195,
        protein: 14,
        carbs: 22,
        fat: 5,
        defaultServing: 1,
        unit: 'paket',
        healthScore: 84,
        pros: ['Pratik atıştırmalık'],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700 max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{mealTitles[targetMeal]}</h3>
              <p className="text-[11px] text-emerald-400 font-medium">Tüm PRO Özellikler Ücretsiz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-4 p-2 bg-slate-950/60 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl transition ${
              activeTab === 'ai'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Tara</span>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl transition ${
              activeTab === 'search'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Arama</span>
          </button>
          <button
            onClick={() => setActiveTab('barcode')}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl transition ${
              activeTab === 'barcode'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Barkod</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl transition ${
              activeTab === 'custom'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Manuel</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: AI FOTOĞRAF TARAMA */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Yazio PRO AI Fotoğraf Tarayıcısı</strong>
                  Tabağınızın fotoğrafını çekin veya yükleyin. Willy AI malzemeleri ve kalorileri anında hesaplar.
                </div>
              </div>

              {/* Upload box */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-3xl p-6 text-center cursor-pointer transition bg-slate-950/40 hover:bg-slate-900 flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">Fotoğraf Çek veya Yükle</span>
                    <span className="text-xs text-slate-400">Kamera ile çekin veya galeriden seçin</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-56">
                    <img src={imagePreview} alt="Yemek" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setAiResult(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      İsteğe Bağlı Not (örn. "Zeytinyağlı salata ve 2 yumurta")
                    </label>
                    <input
                      type="text"
                      value={aiPromptNote}
                      onChange={(e) => setAiPromptNote(e.target.value)}
                      placeholder="Yemek hakkında ipucu yazabilirsiniz..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {!aiResult && (
                    <button
                      onClick={runAiAnalysis}
                      disabled={isAnalyzing}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Willy AI Tabağınızı İnceliyor...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>AI ile Kalori ve Besinleri Analiz Et</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {aiError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* AI Recognition Result Card */}
              {aiResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-in zoom-in-95">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">AI Tespit Etti</span>
                      <h4 className="text-base font-bold text-white">{aiResult.name}</h4>
                    </div>
                    {aiResult.healthScore && (
                      <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        Skor: {aiResult.healthScore}/100
                      </div>
                    )}
                  </div>

                  {/* Macro tiles */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Kalori</span>
                      <strong className="text-sm text-emerald-400 font-extrabold">{aiResult.calories}</strong>
                      <span className="text-[10px] text-slate-400 block">kcal</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Protein</span>
                      <strong className="text-sm text-white font-bold">{aiResult.protein}g</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Karb</span>
                      <strong className="text-sm text-amber-400 font-bold">{aiResult.carbs}g</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Yağ</span>
                      <strong className="text-sm text-rose-400 font-bold">{aiResult.fat}g</strong>
                    </div>
                  </div>

                  {aiResult.advice && (
                    <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      "{aiResult.advice}"
                    </p>
                  )}

                  <button
                    onClick={confirmAiEntry}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Öğünü Günlüğe Ekle</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ARAMA */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Yumurta, tavuk, muz, çorba ara..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {selectedFood ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-700 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase">{selectedFood.category}</span>
                      <h4 className="text-base font-bold text-white">{selectedFood.name}</h4>
                      <p className="text-xs text-slate-400">{selectedFood.calories} kcal ({selectedFood.defaultServing} {selectedFood.unit})</p>
                    </div>
                    <button
                      onClick={() => setSelectedFood(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Geri
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Porsiyon Miktarı</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0.25"
                        step="0.25"
                        value={servingAmount}
                        onChange={(e) => setServingAmount(parseFloat(e.target.value) || 1)}
                        className="w-24 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-bold"
                      />
                      <span className="text-xs text-slate-400">{selectedFood.unit}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 text-xs flex justify-between">
                    <span>Toplam: <strong className="text-emerald-400 font-bold">{Math.round(selectedFood.calories * servingAmount)} kcal</strong></span>
                    <span>Prot: <strong>{Math.round(selectedFood.protein * servingAmount)}g</strong></span>
                    <span>Karb: <strong>{Math.round(selectedFood.carbs * servingAmount)}g</strong></span>
                    <span>Yağ: <strong>{Math.round(selectedFood.fat * servingAmount)}g</strong></span>
                  </div>

                  <button
                    onClick={() => confirmDbItem(selectedFood)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Günlüğe Ekle</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFoods.map(food => (
                    <div
                      key={food.id}
                      onClick={() => {
                        setSelectedFood(food);
                        setServingAmount(1);
                      }}
                      className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <h5 className="text-sm font-semibold text-white">{food.name}</h5>
                        <p className="text-xs text-slate-400">
                          {food.calories} kcal • P: {food.protein}g • K: {food.carbs}g • Y: {food.fat}g ({food.defaultServing} {food.unit})
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BARKOD */}
          {activeTab === 'barcode' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-start gap-2.5">
                <Barcode className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Barkod Tarama (PRO)</strong>
                  Paketli ürünlerin arkasındaki barkodu okutun veya numarasını girin.
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Barkod girin (örn. 8690123456789)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleBarcodeLookup(barcodeInput || '8690123456789')}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Sorgula
                </button>
              </div>

              {/* Quick sample barcodes */}
              <div>
                <span className="text-xs text-slate-400 block mb-2">Hızlı Test Barkodları:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setBarcodeInput('8690123456789');
                      handleBarcodeLookup('8690123456789');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                  >
                    🥜 Fıstık Ezmeli Protein Bar
                  </button>
                  <button
                    onClick={() => {
                      setBarcodeInput('8690555123456');
                      handleBarcodeLookup('8690555123456');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                  >
                    🍫 Çikolatalı Gofret
                  </button>
                </div>
              </div>

              {barcodeResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-cyan-400 uppercase font-bold">Barkod Eşleşti</span>
                      <h4 className="text-sm font-bold text-white">{barcodeResult.name}</h4>
                      <p className="text-xs text-slate-400">{barcodeResult.calories} kcal • 1 {barcodeResult.unit}</p>
                    </div>
                    {barcodeResult.healthScore && (
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                        {barcodeResult.healthScore}/100
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => confirmDbItem(barcodeResult)}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Günlüğe Ekle</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MANUEL EKLE */}
          {activeTab === 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Besin veya Yemek Adı *</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Örn. Ev Yapımı Köfte & Pilav"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Kalori (kcal) *</label>
                  <input
                    type="number"
                    value={customCal}
                    onChange={(e) => setCustomCal(e.target.value)}
                    placeholder="350"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    placeholder="25"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Karbonhidrat (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    placeholder="30"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Yağ (g)</label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    placeholder="12"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                onClick={confirmCustomItem}
                disabled={!customName || !customCal}
                className="w-full mt-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Manuel Öğünü Kaydet</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
