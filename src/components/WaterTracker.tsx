import React from 'react';
import { Droplets, Plus, Minus, Check } from 'lucide-react';

interface WaterTrackerProps {
  currentMl: number;
  targetMl: number;
  onUpdateWater: (newMl: number) => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  currentMl,
  targetMl,
  onUpdateWater,
}) => {
  const glassVolume = 250; // 250 ml per glass
  const totalGlasses = Math.max(8, Math.round(targetMl / glassVolume));
  const filledGlasses = Math.floor(currentMl / glassVolume);
  const percent = Math.min(100, Math.round((currentMl / targetMl) * 100));

  const handleGlassClick = (index: number) => {
    // If clicking a filled glass, remove up to this glass; if clicking unfilled, fill up to this glass
    const newCount = index + 1 === filledGlasses ? index : index + 1;
    onUpdateWater(newCount * glassVolume);
  };

  const addAmount = (ml: number) => {
    onUpdateWater(Math.max(0, currentMl + ml));
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Su Takipçisi</h4>
            <p className="text-xs text-slate-400">
              {(currentMl / 1000).toFixed(2)} L / {(targetMl / 1000).toFixed(2)} L
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
            %{percent}
          </span>
          <button
            onClick={() => addAmount(-250)}
            disabled={currentMl <= 0}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition"
            title="250ml Çıkar"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => addAmount(250)}
            className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition shadow-md shadow-sky-500/20"
            title="250ml Ekle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>250 ml</span>
          </button>
        </div>
      </div>

      {/* Glasses grid (tap to fill) */}
      <div className="flex items-center justify-between gap-1.5 pt-1 overflow-x-auto py-1">
        {Array.from({ length: totalGlasses }).map((_, idx) => {
          const isFilled = idx < filledGlasses;
          return (
            <button
              key={idx}
              onClick={() => handleGlassClick(idx)}
              className={`flex-1 min-w-[28px] h-10 rounded-xl border flex flex-col items-center justify-end p-1 transition-all cursor-pointer ${
                isFilled
                  ? 'bg-sky-500/20 border-sky-400 shadow-sm shadow-sky-500/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
              title={`${(idx + 1) * 250} ml`}
            >
              <div
                className={`w-full rounded-md transition-all duration-300 ${
                  isFilled ? 'h-6 bg-gradient-to-t from-sky-500 to-sky-400' : 'h-1.5 bg-slate-800'
                }`}
              />
            </button>
          );
        })}
      </div>

      {percent >= 100 && (
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Tebrikler! Günlük su hedefinizi başarıyla tamamladınız.</span>
        </div>
      )}
    </div>
  );
};
