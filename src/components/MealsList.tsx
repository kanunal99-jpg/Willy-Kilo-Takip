import React from 'react';
import { Coffee, Sun, Moon, Apple, Plus, Camera, Barcode, Trash2, Sparkles, CheckCircle } from 'lucide-react';
import { MealFoodEntry, MealType } from '../types';

interface MealsListProps {
  entries: MealFoodEntry[];
  onOpenAddModal: (meal: MealType) => void;
  onDeleteEntry: (id: string) => void;
}

export const MealsList: React.FC<MealsListProps> = ({
  entries,
  onOpenAddModal,
  onDeleteEntry,
}) => {
  const mealSections: {
    type: MealType;
    title: string;
    icon: React.ReactNode;
    color: string;
    badgeColor: string;
  }[] = [
    {
      type: 'breakfast',
      title: 'Kahvaltı',
      icon: <Coffee className="w-4 h-4" />,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      type: 'lunch',
      title: 'Öğle Yemeği',
      icon: <Sun className="w-4 h-4" />,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      type: 'dinner',
      title: 'Akşam Yemeği',
      icon: <Moon className="w-4 h-4" />,
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      type: 'snack',
      title: 'Atıştırmalık & Diğer',
      icon: <Apple className="w-4 h-4" />,
      color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400',
      badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-white tracking-wide">Öğünler</h3>
        <span className="text-xs text-slate-400">Günlük Öğün Takibi</span>
      </div>

      <div className="space-y-3">
        {mealSections.map((sec) => {
          const mealEntries = entries.filter((e) => e.mealType === sec.type);
          const totalCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);

          return (
            <div
              key={sec.type}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 transition hover:border-slate-700"
            >
              {/* Meal Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${sec.color} flex items-center justify-center border shadow-sm`}>
                    {sec.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{sec.title}</h4>
                    <span className="text-xs text-slate-400">
                      {mealEntries.length > 0 ? `${mealEntries.length} besin` : 'Henüz besin yok'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white">
                      {totalCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
                    </span>
                  </div>

                  {/* Add Food Button */}
                  <button
                    onClick={() => onOpenAddModal(sec.type)}
                    id={`btn-add-food-${sec.type}`}
                    className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                    title="Besin Ekle"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Entries list */}
              {mealEntries.length > 0 ? (
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  {mealEntries.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 transition"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-100 truncate block">
                            {item.name}
                          </span>
                          {item.aiDetected && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Sparkles className="w-2.5 h-2.5" />
                              AI
                            </span>
                          )}
                          {item.healthScore && (
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              ★{item.healthScore}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{item.servingAmount} {item.servingUnit}</span>
                          <span>•</span>
                          <span className="text-amber-400/90 font-medium">K: {item.carbs}g</span>
                          <span className="text-emerald-400/90 font-medium">P: {item.protein}g</span>
                          <span className="text-rose-400/90 font-medium">Y: {item.fat}g</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">
                          {item.calories} <span className="text-[10px] text-slate-400">kcal</span>
                        </span>
                        <button
                          onClick={() => onDeleteEntry(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                  <span className="text-slate-400">Bu öğünde henüz kayıt yok.</span>
                  <button
                    onClick={() => onOpenAddModal(sec.type)}
                    className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 text-xs"
                  >
                    <span>Hızlı Ekle</span>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
