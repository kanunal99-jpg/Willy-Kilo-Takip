import React, { useState } from 'react';
import { UserProfile, UserGoal, ActivityLevel, FastingPlanType } from '../types';
import { X, Check, Calculator, Sparkles, User, RefreshCw } from 'lucide-react';
import { APP_VERSION } from '../version';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onOpenUpdateModal?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onOpenUpdateModal,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });

  if (!isOpen) return null;

  // Auto calculate daily calories (Mifflin-St Jeor formula)
  const calculateRecommendedCalories = () => {
    const { gender, currentWeightKg, heightCm, age, goal, activityLevel } = formData;
    let bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * age;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);
    let target = tdee;
    if (goal === 'lose_weight') {
      target = Math.max(1200, tdee - 450); // Safe caloric deficit
    } else if (goal === 'build_muscle') {
      target = tdee + 250;
    }

    setFormData((prev) => ({
      ...prev,
      dailyCalorieTarget: target,
      macroTargets: {
        carbs: Math.round((target * 0.4) / 4),
        protein: Math.round((target * 0.3) / 4),
        fat: Math.round((target * 0.3) / 9),
      },
    }));
  };

  const handleSave = () => {
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Profil & Hedef Ayarları</h3>
              <p className="text-xs text-emerald-400">Kişiselleştirilmiş Kalori ve Makrolar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Personal Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Adınız</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Cinsiyet</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
              >
                <option value="female">Kadın</option>
                <option value="male">Erkek</option>
                <option value="other">Diğer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Yaş</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Boy (cm)</label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Güncel Kilo (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.currentWeightKg}
                onChange={(e) => setFormData({ ...formData, currentWeightKg: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Goal & Target Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Hedef Kilo (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.targetWeightKg}
                onChange={(e) => setFormData({ ...formData, targetWeightKg: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Ana Hedef</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value as UserGoal })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
              >
                <option value="lose_weight">Kilo Vermek (Yağ Yakımı)</option>
                <option value="maintain">Kiloyu Korumak</option>
                <option value="build_muscle">Kas Kazanmak</option>
              </select>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Günlük Hareket Seviyesi</label>
            <select
              value={formData.activityLevel}
              onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
            >
              <option value="sedentary">Hareketsiz (Masa başı iş)</option>
              <option value="light">Hafif Hareketli (Haftada 1-2 egzersiz)</option>
              <option value="moderate">Orta Hareketli (Haftada 3-5 egzersiz)</option>
              <option value="active">Çok Hareketli (Ağır antrenman / aktif iş)</option>
            </select>
          </div>

          {/* Auto Calculate Button */}
          <button
            onClick={calculateRecommendedCalories}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Kişiselleştirilmiş İdeal Kalori & Makroyu Otomatik Hesapla</span>
          </button>

          {/* Daily Calorie & Water Targets */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Günlük Kalori Hedefi (kcal)</label>
              <input
                type="number"
                value={formData.dailyCalorieTarget}
                onChange={(e) => setFormData({ ...formData, dailyCalorieTarget: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Günlük Su Hedefi (ml)</label>
              <input
                type="number"
                step="250"
                value={formData.waterTargetMl}
                onChange={(e) => setFormData({ ...formData, waterTargetMl: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sky-400 font-bold"
              />
            </div>
          </div>

          {/* Macros */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Makro Hedefleri (Gram)</label>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Karbonhidrat (g)</span>
                <input
                  type="number"
                  value={formData.macroTargets.carbs}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      macroTargets: { ...formData.macroTargets, carbs: Number(e.target.value) },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold text-center"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Protein (g)</span>
                <input
                  type="number"
                  value={formData.macroTargets.protein}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      macroTargets: { ...formData.macroTargets, protein: Number(e.target.value) },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold text-center"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Yağ (g)</span>
                <input
                  type="number"
                  value={formData.macroTargets.fat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      macroTargets: { ...formData.macroTargets, fat: Number(e.target.value) },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-rose-400 font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* App Version & OTA Update Section */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Uygulama Bilgisi</span>
                <span className="text-white font-bold">Willy Kilo Takip v{APP_VERSION.versionName}</span>
                <span className="text-slate-500 text-[11px] ml-1">(Derleme: {APP_VERSION.versionCode})</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PRO
              </span>
            </div>

            {onOpenUpdateModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUpdateModal();
                }}
                className="w-full mt-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>🔄 Güncellemeleri Kontrol Et</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
          >
            Vazgeç
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
          >
            Kaydet & Güncelle
          </button>
        </div>
      </div>
    </div>
  );
};
