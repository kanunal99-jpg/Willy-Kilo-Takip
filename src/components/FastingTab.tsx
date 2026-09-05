import React, { useState, useEffect } from 'react';
import { Timer, Play, Square, Flame, Sparkles, CheckCircle2, ChevronRight, Info, Award } from 'lucide-react';
import { FastingPlanType, FastingSession, FastingStage } from '../types';
import { FASTING_STAGES } from '../data/mockData';

interface FastingTabProps {
  activeFast: FastingSession | null;
  onStartFast: (plan: FastingPlanType) => void;
  onEndFast: () => void;
  fastingHistory: FastingSession[];
}

export const FastingTab: React.FC<FastingTabProps> = ({
  activeFast,
  onStartFast,
  onEndFast,
  fastingHistory,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<FastingPlanType>(activeFast?.plan || '16:8');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [selectedStage, setSelectedStage] = useState<FastingStage | null>(null);

  // Update timer every second
  useEffect(() => {
    if (!activeFast || !activeFast.startTime) {
      setElapsedSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.max(0, Math.floor((now - activeFast.startTime) / 1000));
      setElapsedSeconds(elapsed);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeFast]);

  // Calculations
  const targetDurationSeconds = (activeFast?.targetDurationHours || 16) * 3600;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / targetDurationSeconds) * 100));
  const remainingSeconds = Math.max(0, targetDurationSeconds - elapsedSeconds);

  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const elapsedHours = elapsedSeconds / 3600;

  // Determine current stage
  const currentStage = FASTING_STAGES.find(
    s => elapsedHours >= s.startHour && elapsedHours < s.endHour
  ) || FASTING_STAGES[FASTING_STAGES.length - 1];

  const planOptions: { type: FastingPlanType; label: string; desc: string; hours: number }[] = [
    { type: '14:10', label: '14:10', desc: 'Yeni Başlayanlar için ideal', hours: 14 },
    { type: '16:8', label: '16:8', desc: 'En popüler altın oran', hours: 16 },
    { type: '18:6', label: '18:6', desc: 'Hızlı yağ yakımı ve ketozis', hours: 18 },
    { type: '20:4', label: '20:4', desc: 'Savaşçı diyeti (İleri düzey)', hours: 20 },
  ];

  // SVG Circular progress
  const size = 220;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-5">
      {/* Header card with Willy Mascot */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Aralıklı Oruç Takipçisi (PRO)
            </span>
            <h2 className="text-xl font-extrabold text-white mt-0.5">
              {activeFast ? 'Oruç Tutuyorsun!' : 'Oruç Penceresi'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              {activeFast
                ? `${activeFast.plan} planı aktif. Vücudun şu an metabolik yenilenme modunda.`
                : 'Yağ yakımını hızlandırmak ve insülini sıfırlamak için yeni bir oruç başlatın.'}
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-1 shrink-0 flex items-center justify-center">
            <img src="/icon.svg" alt="Willy Fasting" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Circular Fasting Timer */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#1e293b"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <defs>
                <linearGradient id="fastGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#fastGrad)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Timer Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {activeFast ? (
                <>
                  <span className="text-3xl font-black text-white tracking-wider font-mono">
                    {formatTime(elapsedSeconds)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase mt-1">
                    Hedef: {formatTime(targetDurationSeconds)}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Kalan: {formatTime(remainingSeconds)}
                  </span>
                  <div className="mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    %{progressPercent} Tamamlandı
                  </div>
                </>
              ) : (
                <>
                  <Timer className="w-10 h-10 text-emerald-400 mb-1" />
                  <span className="text-base font-bold text-white">Hazır</span>
                  <span className="text-xs text-slate-400 mt-0.5">Plan: {selectedPlan}</span>
                </>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="mt-5 w-full max-w-xs">
            {activeFast ? (
              <button
                onClick={onEndFast}
                className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Orucu Bitir ve Kaydet</span>
              </button>
            ) : (
              <button
                onClick={() => onStartFast(selectedPlan)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Orucu Başlat ({selectedPlan})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plan selector if not fasting */}
      {!activeFast && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white px-1">Oruç Planı Seçin</h3>
          <div className="grid grid-cols-2 gap-3">
            {planOptions.map((opt) => (
              <div
                key={opt.type}
                onClick={() => setSelectedPlan(opt.type)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedPlan === opt.type
                    ? 'bg-emerald-500/10 border-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-base font-extrabold text-white">{opt.label}</span>
                  {selectedPlan === opt.type && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metabolic Stages Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white">Metabolik Aşamalar Rehberi</h3>
          <span className="text-xs text-emerald-400 font-medium">Bilimsel Analiz</span>
        </div>

        <div className="space-y-2.5">
          {FASTING_STAGES.map((stg) => {
            const isCurrent = activeFast && elapsedHours >= stg.startHour && elapsedHours < stg.endHour;
            const isCompleted = activeFast && elapsedHours >= stg.endHour;

            return (
              <div
                key={stg.id}
                onClick={() => setSelectedStage(stg)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-950/40 border-emerald-400/80 shadow-lg shadow-emerald-500/10'
                    : isCompleted
                    ? 'bg-slate-900/90 border-emerald-800/40 opacity-90'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ backgroundColor: `${stg.accentColor}20`, color: stg.accentColor }}
                    >
                      {stg.startHour}-{stg.endHour}s
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{stg.name}</h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold animate-pulse">
                            Şu Anki Aşama
                          </span>
                        )}
                        {isCompleted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{stg.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 mt-2" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex justify-between items-start mb-3">
              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: `${selectedStage.accentColor}20`, color: selectedStage.accentColor }}
              >
                {selectedStage.startHour} - {selectedStage.endHour}. Saatler
              </div>
              <button
                onClick={() => setSelectedStage(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <h3 className="text-base font-bold text-white mb-2">{selectedStage.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">{selectedStage.description}</p>

            <div className="space-y-2 mb-5">
              <span className="text-xs font-bold text-slate-200 block">Vücuttaki Faydaları:</span>
              {selectedStage.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedStage(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* Fasting History */}
      {fastingHistory.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white px-1">Geçmiş Oruçlar</h3>
          <div className="space-y-2">
            {fastingHistory.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {item.plan}
                  </div>
                  <div>
                    <span className="font-semibold text-white block">
                      {new Date(item.startTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.targetDurationHours} saatlik oruç tamamlandı
                    </span>
                  </div>
                </div>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
