import React, { useState } from 'react';
import { Utensils, Clock, Flame, ChefHat, Sparkles, Check, Search, Plus, Filter, X, ArrowRight } from 'lucide-react';
import { MealFoodEntry, MealType, Recipe } from '../types';

interface RecipesTabProps {
  recipes: Recipe[];
  onAddRecipeToDiary: (entry: MealFoodEntry) => void;
}

export const RecipesTab: React.FC<RecipesTabProps> = ({
  recipes,
  onAddRecipeToDiary,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [maxCalories, setMaxCalories] = useState<number>(600);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [targetMeal, setTargetMeal] = useState<MealType>('lunch');
  const [showAddedSuccess, setShowAddedSuccess] = useState(false);

  // AI Recipe generator state
  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [fridgeIngredients, setFridgeIngredients] = useState('');
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);

  const categories = [
    'Tümü',
    'Kahvaltı',
    'Öğle Yemeği',
    'Akşam Yemeği',
    'Düşük Karbonhidrat',
    'Proteinden Zengin',
    'Çabuk Hazırlanan',
    'Tatlı',
  ];

  // Filter recipes
  const filtered = recipes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCalories = r.calories <= maxCalories;

    if (selectedCategory === 'Tümü') return matchesSearch && matchesCalories;
    return (
      matchesSearch &&
      matchesCalories &&
      (r.tags.includes(selectedCategory) ||
        (selectedCategory === 'Kahvaltı' && r.category === 'breakfast') ||
        (selectedCategory === 'Öğle Yemeği' && r.category === 'lunch') ||
        (selectedCategory === 'Akşam Yemeği' && r.category === 'dinner') ||
        (selectedCategory === 'Tatlı' && r.category === 'dessert'))
    );
  });

  const handleAddCurrentRecipe = () => {
    if (!activeRecipe) return;

    const entry: MealFoodEntry = {
      id: 'rec-food-' + Date.now(),
      name: activeRecipe.title,
      mealType: targetMeal,
      servingAmount: 1,
      servingUnit: 'porsiyon',
      calories: activeRecipe.calories,
      carbs: activeRecipe.carbs,
      protein: activeRecipe.protein,
      fat: activeRecipe.fat,
      healthScore: 96,
      pros: activeRecipe.tags,
      timestamp: Date.now(),
    };

    onAddRecipeToDiary(entry);
    setShowAddedSuccess(true);
    setTimeout(() => {
      setShowAddedSuccess(false);
      setActiveRecipe(null);
    }, 1200);
  };

  // Generate recipe via AI
  const handleGenerateAiRecipe = async () => {
    if (!fridgeIngredients.trim()) return;
    setIsGeneratingRecipe(true);

    try {
      // Simulate/request AI recipe
      setTimeout(() => {
        const newRec: Recipe = {
          id: 'ai-rec-' + Date.now(),
          title: 'Willy Özel: ' + fridgeIngredients.slice(0, 20) + ' Sote',
          category: 'lunch',
          calories: 380,
          carbs: 24,
          protein: 34,
          fat: 14,
          prepTimeMinutes: 15,
          difficulty: 'Kolay',
          servings: 1,
          tags: ['AI Üretti', 'Proteinden Zengin', 'Çabuk Hazırlanan'],
          ingredients: fridgeIngredients.split(',').map((item) => ({
            name: item.trim(),
            amount: '1 porsiyon',
          })),
          steps: [
            'Tüm malzemeleri uygun boyutlarda doğrayın.',
            'Tavaya 1 tatlı kaşığı zeytinyağı ekleyip malzemeleri yüksek ateşte 7-8 dakika soteleyin.',
            'Dilediğiniz baharatları ekleyip sıcak servis yapın.',
          ],
          imageUrl:
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
          proFeature: true,
        };
        setGeneratedRecipe(newRec);
        setIsGeneratingRecipe(false);
      }, 1500);
    } catch {
      setIsGeneratingRecipe(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/20 p-4 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Yazio PRO Tarif Kataloğu
          </span>
          <h2 className="text-lg font-extrabold text-white">Fit & Lezzetli Tarifler</h2>
          <p className="text-xs text-slate-300">Tüm PRO tarifler ücretsiz olarak açık.</p>
        </div>
        <button
          onClick={() => setShowAiGenModal(true)}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Tarif Üret</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tarif adı veya malzeme ara (somon, kinoa, chia)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Category horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Calorie Filter Slider */}
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300 font-medium">Maks. Kalori:</span>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <input
            type="range"
            min="200"
            max="800"
            step="50"
            value={maxCalories}
            onChange={(e) => setMaxCalories(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <span className="font-bold text-white whitespace-nowrap">{maxCalories} kcal</span>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => setActiveRecipe(recipe)}
            className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 overflow-hidden cursor-pointer group transition flex flex-col justify-between shadow-lg"
          >
            <div className="relative h-44 overflow-hidden bg-slate-950">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Badges */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-slate-950 font-extrabold text-[10px] shadow">
                  PRO (Ücretsiz)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-medium text-[10px] border border-slate-700">
                  {recipe.difficulty}
                </span>
              </div>

              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{recipe.prepTimeMinutes} dk</span>
              </div>

              <div className="absolute bottom-2.5 left-3 right-3">
                <h4 className="text-sm font-bold text-white line-clamp-1">{recipe.title}</h4>
              </div>
            </div>

            {/* Recipe card footer */}
            <div className="p-3.5 flex items-center justify-between text-xs border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-400 text-sm">{recipe.calories} kcal</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-medium">P: {recipe.protein}g</span>
                <span className="text-slate-400">K: {recipe.carbs}g</span>
              </div>
              <span className="text-emerald-400 font-semibold text-xs flex items-center gap-0.5">
                İncele <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {activeRecipe && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700 max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
            {/* Header image */}
            <div className="relative h-56 bg-slate-950 shrink-0">
              <img
                src={activeRecipe.imageUrl}
                alt={activeRecipe.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/50" />
              <button
                onClick={() => setActiveRecipe(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-5 right-5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                  PRO Tarif
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">{activeRecipe.title}</h3>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Macro pills */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Kalori</span>
                  <strong className="text-base text-emerald-400 font-extrabold">{activeRecipe.calories}</strong>
                  <span className="text-[9px] text-slate-400 block">kcal</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Protein</span>
                  <strong className="text-base text-white font-extrabold">{activeRecipe.protein}g</strong>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Karb</span>
                  <strong className="text-base text-amber-400 font-extrabold">{activeRecipe.carbs}g</strong>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Yağ</span>
                  <strong className="text-base text-rose-400 font-extrabold">{activeRecipe.fat}g</strong>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="text-sm font-bold text-white mb-2">Malzemeler ({activeRecipe.servings} Porsiyon)</h4>
                <div className="space-y-1.5">
                  {activeRecipe.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 text-xs border border-slate-800/80"
                    >
                      <span className="text-slate-200">{ing.name}</span>
                      <span className="text-slate-400 font-medium">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <h4 className="text-sm font-bold text-white mb-2">Hazırlanış Adımları</h4>
                <div className="space-y-2">
                  {activeRecipe.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal select & add to diary */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <span className="text-xs font-bold text-white block">Hangi öğüne eklemek istersiniz?</span>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setTargetMeal(m)}
                      className={`py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                        targetMeal === m
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m === 'breakfast'
                        ? 'Kahvaltı'
                        : m === 'lunch'
                        ? 'Öğle'
                        : m === 'dinner'
                        ? 'Akşam'
                        : 'Ara'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleAddCurrentRecipe}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
                >
                  {showAddedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Günlüğe Eklendi!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Bu Tarifi Günlüğüme Ekle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recipe Generator Modal */}
      {showAiGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => {
                setShowAiGenModal(false);
                setGeneratedRecipe(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Tarif Asistanı (PRO)</h3>
                <p className="text-xs text-emerald-400">Buzdolabındaki Malzemelerle Özel Tarif</p>
              </div>
            </div>

            {!generatedRecipe ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  Elinizdeki malzemeleri virgülle yazın (örn. yumurta, ıspanak, mantar, kaşar). Willy sizin için kalorisi ve makroları hesaplanmış bir tarif üretsin.
                </p>

                <textarea
                  rows={3}
                  value={fridgeIngredients}
                  onChange={(e) => setFridgeIngredients(e.target.value)}
                  placeholder="2 yumurta, lor peyniri, domates, zeytinyağı..."
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />

                <button
                  onClick={handleGenerateAiRecipe}
                  disabled={isGeneratingRecipe || !fridgeIngredients.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingRecipe ? 'Willy Şef Hazırlıyor...' : 'Kişisel Tarifimi Üret'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40">
                  <h4 className="text-sm font-bold text-white">{generatedRecipe.title}</h4>
                  <div className="flex gap-3 text-xs mt-1">
                    <span className="text-emerald-400 font-bold">{generatedRecipe.calories} kcal</span>
                    <span>P: {generatedRecipe.protein}g</span>
                    <span>K: {generatedRecipe.carbs}g</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">{generatedRecipe.steps[1]}</p>
                </div>

                <button
                  onClick={() => {
                    setActiveRecipe(generatedRecipe);
                    setShowAiGenModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
                >
                  Tarif Detayını Aç & Günlüğe Ekle
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
