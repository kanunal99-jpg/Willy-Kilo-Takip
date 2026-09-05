import React from 'react';
import { Flame, Utensils, Zap } from 'lucide-react';
import { MacroTarget } from '../types';

interface CalorieRingProps {
  calorieTarget: number;
  consumedCalories: number;
  burnedCalories: number;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  macroTargets: MacroTarget;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  calorieTarget,
  consumedCalories,
  burnedCalories,
  macros,
  macroTargets,
}) => {
  const netCalories = consumedCalories - burnedCalories;
  const remainingCalories = Math.max(0, calorieTarget - netCalories);
  const progressPercent = Math.min(100, Math.round((consumedCalories / (calorieTarget + burnedCalories)) * 100)) || 0;

  // SVG circle calculation
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">
      {/* Top summary row */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Kalori Özeti</h3>
            <p className="text-xs text-slate-400">Hedef: {calorieTarget.toLocaleString('tr-TR')} kcal</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">ALINAN</span>
            <span className="font-bold text-slate-200">{consumedCalories} kcal</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">YAKILAN</span>
            <span className="font-bold text-orange-400">-{burnedCalories} kcal</span>
          </div>
        </div>
      </div>

      {/* Main Ring Display */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#1e293b"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Active progress ring with emerald-to-cyan gradient */}
            <defs>
              <linearGradient id="calorieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#calorieGrad)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {remainingCalories}
            </span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Kalan Kcal
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              %{progressPercent} Tamamlandı
            </span>
          </div>
        </div>

        {/* Macro breakdown bars */}
        <div className="flex-1 w-full space-y-3.5">
          {/* Karbonhidrat */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Karbonhidrat</span>
              <span className="text-slate-400">
                <strong className="text-white">{Math.round(macros.carbs)}</strong> / {macroTargets.carbs}g
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (macros.carbs / (macroTargets.carbs || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Protein</span>
              <span className="text-slate-400">
                <strong className="text-white">{Math.round(macros.protein)}</strong> / {macroTargets.protein}g
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (macros.protein / (macroTargets.protein || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Yağ */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Yağ</span>
              <span className="text-slate-400">
                <strong className="text-white">{Math.round(macros.fat)}</strong> / {macroTargets.fat}g
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (macros.fat / (macroTargets.fat || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
