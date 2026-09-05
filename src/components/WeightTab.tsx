import React, { useState } from 'react';
import { Scale, TrendingDown, Plus, Target, CheckCircle2, Trash2, Calendar, Award, Activity } from 'lucide-react';
import { UserProfile, WeightRecord } from '../types';

interface WeightTabProps {
  profile: UserProfile;
  weightRecords: WeightRecord[];
  onAddWeight: (record: WeightRecord) => void;
  onDeleteWeight: (id: string) => void;
}

export const WeightTab: React.FC<WeightTabProps> = ({
  profile,
  weightRecords,
  onAddWeight,
  onDeleteWeight,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [inputWeight, setInputWeight] = useState(String(profile.currentWeightKg));
  const [inputBodyFat, setInputBodyFat] = useState('');
  const [inputWaist, setInputWaist] = useState('');
  const [inputNote, setInputNote] = useState('');

  // Latest stats
  const latestWeight = weightRecords[weightRecords.length - 1]?.weightKg || profile.currentWeightKg;
  const startWeight = profile.startingWeightKg;
  const targetWeight = profile.targetWeightKg;
  const totalChange = Number((latestWeight - startWeight).toFixed(1));
  const remainingToGoal = Number((latestWeight - targetWeight).toFixed(1));

  // BMI Calculation
  const heightM = profile.heightCm / 100;
  const bmi = Number((latestWeight / (heightM * heightM)).toFixed(1));

  let bmiCategory = 'Normal';
  let bmiColor = 'text-emerald-400';
  if (bmi < 18.5) {
    bmiCategory = 'Zayıf';
    bmiColor = 'text-amber-400';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Fazla Kilolu';
    bmiColor = 'text-amber-400';
  } else if (bmi >= 30) {
    bmiCategory = 'Obezite';
    bmiColor = 'text-rose-400';
  }

  const handleSaveWeight = () => {
    const val = parseFloat(inputWeight);
    if (!val || isNaN(val)) return;

    const newRecord: WeightRecord = {
      id: 'w-' + Date.now(),
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      weightKg: val,
      bodyFat: inputBodyFat ? parseFloat(inputBodyFat) : undefined,
      waistCm: inputWaist ? parseFloat(inputWaist) : undefined,
      note: inputNote || undefined,
      timestamp: Date.now(),
    };

    onAddWeight(newRecord);
    setShowAddModal(false);
    setInputNote('');
  };

  // SVG Chart points calculation
  const chartHeight = 130;
  const chartWidth = 320;
  const weights = weightRecords.map((r) => r.weightKg);
  const minW = Math.min(...weights, targetWeight) - 1;
  const maxW = Math.max(...weights, startWeight) + 1;
  const range = maxW - minW || 1;

  const points = weightRecords.map((rec, i) => {
    const x = (i / Math.max(1, weightRecords.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - ((rec.weightKg - minW) / range) * (chartHeight - 30) - 15;
    return { x, y, weight: rec.weightKg, date: rec.date };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Kilo ve Vücut Analizi
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h2 className="text-3xl font-black text-white">{latestWeight}</h2>
              <span className="text-sm font-semibold text-slate-400">kg</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Başlangıçtan bu yana:{' '}
              <strong className={totalChange <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {totalChange > 0 ? `+${totalChange}` : totalChange} kg
              </strong>
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Kilo Ekle</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Hedef Kilo</span>
            <strong className="text-sm text-white font-extrabold">{targetWeight} kg</strong>
            <span className="text-[10px] text-emerald-400 block">
              {remainingToGoal > 0 ? `${remainingToGoal} kg kaldı` : 'Ulaşıldı!'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">VKİ (BMI)</span>
            <strong className="text-sm text-white font-extrabold">{bmi}</strong>
            <span className={`text-[10px] font-bold block ${bmiColor}`}>{bmiCategory}</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Başlangıç</span>
            <strong className="text-sm text-white font-extrabold">{startWeight} kg</strong>
            <span className="text-[10px] text-slate-400 block">Boy: {profile.heightCm} cm</span>
          </div>
        </div>
      </div>

      {/* Weight Progress Chart */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Kilo Gelişim Grafiği</h3>
          </div>
          <span className="text-xs text-slate-400">{weightRecords.length} ölçüm</span>
        </div>

        {/* Chart SVG */}
        <div className="relative overflow-hidden pt-2 pb-1 flex justify-center">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full max-w-md overflow-visible">
            {/* Target line */}
            <line
              x1="20"
              y1={chartHeight - ((targetWeight - minW) / range) * (chartHeight - 30) - 15}
              x2={chartWidth - 20}
              y2={chartHeight - ((targetWeight - minW) / range) * (chartHeight - 30) - 15}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
            <text
              x={chartWidth - 55}
              y={chartHeight - ((targetWeight - minW) / range) * (chartHeight - 30) - 20}
              fill="#10b981"
              fontSize="9"
              fontWeight="bold"
            >
              Hedef {targetWeight}kg
            </text>

            {/* Gradient fill underneath */}
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {points.length > 1 && (
              <polygon
                points={`20,${chartHeight - 5} ${polylineStr} ${chartWidth - 20},${chartHeight - 5}`}
                fill="url(#chartGrad)"
              />
            )}

            {/* Line */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />
            )}

            {/* Points */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="5" fill="#0f172a" stroke="#34d399" strokeWidth="2.5" />
                <text
                  x={p.x}
                  y={p.y - 8}
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {p.weight}
                </text>
                <text
                  x={p.x}
                  y={chartHeight - 2}
                  fill="#64748b"
                  fontSize="8"
                  textAnchor="middle"
                >
                  {p.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* History Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-white px-1">Ölçüm Geçmişi</h3>
        <div className="space-y-2">
          {[...weightRecords].reverse().map((rec) => (
            <div
              key={rec.id}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                  <Scale className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-white">{rec.weightKg} kg</strong>
                    {rec.bodyFat && (
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        %{rec.bodyFat} Yağ
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 block">{rec.date} {rec.note ? `• "${rec.note}"` : ''}</span>
                </div>
              </div>

              <button
                onClick={() => onDeleteWeight(rec.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Weight Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-base font-bold text-white">Yeni Kilo Kaydı Ekle</h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Kilo (kg) *</label>
              <input
                type="number"
                step="0.1"
                value={inputWeight}
                onChange={(e) => setInputWeight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-lg font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Vücut Yağ Oranı (%)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="24.5"
                  value={inputBodyFat}
                  onChange={(e) => setInputBodyFat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Bel Çevresi (cm)</label>
                <input
                  type="number"
                  placeholder="78"
                  value={inputWaist}
                  onChange={(e) => setInputWaist(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Not</label>
              <input
                type="text"
                placeholder="Örn. Sabah aç karnına tartıldım"
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                İptal
              </button>
              <button
                onClick={handleSaveWeight}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
