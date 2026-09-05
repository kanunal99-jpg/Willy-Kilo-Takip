import React, { useState } from 'react';
import { Activity, Footprints, Flame, Plus, Trash2, Dumbbell, Bike, X } from 'lucide-react';
import { ExerciseEntry } from '../types';

interface ActivityCardProps {
  exercises: ExerciseEntry[];
  steps: number;
  onUpdateSteps: (newSteps: number) => void;
  onAddExercise: (exercise: ExerciseEntry) => void;
  onDeleteExercise: (id: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  exercises,
  steps,
  onUpdateSteps,
  onAddExercise,
  onDeleteExercise,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activityTitle, setActivityTitle] = useState('Tempolu Yürüyüş');
  const [durationMin, setDurationMin] = useState(30);
  const [calBurned, setCalBurned] = useState(150);

  const totalBurned = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

  const predefinedActivities = [
    { title: 'Tempolu Yürüyüş', calsPerMin: 5 },
    { title: 'Koşu / Jogging', calsPerMin: 10 },
    { title: 'Ağırlık Antrenmanı / Fitness', calsPerMin: 7 },
    { title: 'Bisiklet Sürme', calsPerMin: 8 },
    { title: 'Yüzme', calsPerMin: 9 },
    { title: 'Yoga & Esneme', calsPerMin: 3.5 },
  ];

  const handleSelectPredefined = (item: { title: string; calsPerMin: number }) => {
    setActivityTitle(item.title);
    setCalBurned(Math.round(durationMin * item.calsPerMin));
  };

  const handleDurationChange = (min: number) => {
    setDurationMin(min);
    const matched = predefinedActivities.find((a) => a.title === activityTitle);
    const rate = matched ? matched.calsPerMin : 6;
    setCalBurned(Math.round(min * rate));
  };

  const handleSave = () => {
    const entry: ExerciseEntry = {
      id: 'ex-' + Date.now(),
      title: activityTitle,
      durationMinutes: durationMin,
      caloriesBurned: calBurned,
      timestamp: Date.now(),
    };
    onAddExercise(entry);
    setShowAddModal(false);
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Aktivite & Egzersiz</h4>
            <p className="text-xs text-slate-400">Toplam -{totalBurned} kcal yakıldı</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="p-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 transition cursor-pointer"
          title="Aktivite Ekle"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Step Counter Widget */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Footprints className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-xs font-semibold text-white">Adım Takibi</span>
            <span className="text-[11px] text-slate-400 block">Hedef: 10,000 adım</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateSteps(Math.max(0, steps - 500))}
            className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold"
          >
            -
          </button>
          <span className="text-xs font-bold text-emerald-400 min-w-[50px] text-center">
            {steps.toLocaleString('tr-TR')}
          </span>
          <button
            onClick={() => onUpdateSteps(steps + 500)}
            className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Exercise list */}
      {exercises.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 text-xs border border-slate-800/60"
            >
              <div>
                <span className="font-semibold text-white">{ex.title}</span>
                <span className="text-slate-400 block text-[11px]">{ex.durationMinutes} dakika</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-orange-400">-{ex.caloriesBurned} kcal</span>
                <button
                  onClick={() => onDeleteExercise(ex.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal to add activity */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Egzersiz / Aktivite Ekle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {predefinedActivities.map((act) => (
                <button
                  key={act.title}
                  onClick={() => handleSelectPredefined(act)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition ${
                    activityTitle === act.title
                      ? 'bg-orange-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {act.title}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Süre (Dakika)</label>
              <input
                type="number"
                value={durationMin}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Yakılan Kalori (kcal)</label>
              <input
                type="number"
                value={calBurned}
                onChange={(e) => setCalBurned(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-orange-400 font-bold"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20"
            >
              Aktiviteyi Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
