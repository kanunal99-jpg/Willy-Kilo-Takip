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

  // Filter food database
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

  // Barcode lookup against the currently loaded database
  const handleBarcodeLookup = (code: string) => {
    const normalizedCode = code.trim();
    const found = foodDatabase.find(f => f.barcode === normalizedCode);
    if (found) {
      setBarcodeResult(found);
    } else {
      // Keep the scan usable when the product is not in the local database.
      setBarcodeResult({
        id: 'scanned-' + normalizedCode,
        name: `Barkodlu Ürün (${normalizedCode})`,
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