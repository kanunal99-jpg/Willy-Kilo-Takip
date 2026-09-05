import React, { useState, useEffect, useCallback } from 'react';
import { DailyData, ExerciseEntry, FastingPlanType, FastingSession, MealFoodEntry, MealType, Recipe, UserProfile, WeightRecord } from './types';
import {
  getTodayKey,
  loadActiveFast,
  loadDailyLogs,
  loadFastingHistory,
  loadRecipes,
  loadUserProfile,
  loadWeightRecords,
  saveActiveFast,
  saveDailyLogs,
  saveFastingHistory,
  saveUserProfile,
  saveWeightRecords,
  syncWithCloud,
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { CalorieRing } from './components/CalorieRing';
import { MealsList } from './components/MealsList';
import { WaterTracker } from './components/WaterTracker';
import { ActivityCard } from './components/ActivityCard';
import { AddFoodModal } from './components/AddFoodModal';
import { FastingTab } from './components/FastingTab';
import { RecipesTab } from './components/RecipesTab';
import { WeightTab } from './components/WeightTab';
import { WillyCoachTab } from './components/WillyCoachTab';
import { CloudSyncModal } from './components/CloudSyncModal';
import { ProfileModal } from './components/ProfileModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('diary');

  // Date selection
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateKey = getTodayKey(selectedDate);

  // App core states
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyData>>(loadDailyLogs);
  const [activeFast, setActiveFast] = useState<FastingSession | null>(loadActiveFast);
  const [fastingHistory, setFastingHistory] = useState<FastingSession[]>(loadFastingHistory);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>(loadWeightRecords);
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes);

  // Modals state
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [targetMeal, setTargetMeal] = useState<MealType>('breakfast');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number>(Date.now());

  // Current day data accessor
  const todayData: DailyData = dailyLogs[dateKey] || {
    date: dateKey,
    entries: [],
    waterIntakeMl: 0,
    steps: 0,
    exercises: [],
  };

  // Persist states to local storage
  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveDailyLogs(dailyLogs);
  }, [dailyLogs]);

  useEffect(() => {
    saveActiveFast(activeFast);
  }, [activeFast]);

  useEffect(() => {
    saveFastingHistory(fastingHistory);
  }, [fastingHistory]);

  useEffect(() => {
    saveWeightRecords(weightRecords);
  }, [weightRecords]);

  // Cloud Auto-Sync (Debounced)
  const triggerCloudSync = useCallback(
    async (forcePull = false) => {
      setIsSyncing(true);
      const res = await syncWithCloud(profile, dailyLogs, fastingHistory, weightRecords, forcePull);
      setIsSyncing(false);
      if (res.timestamp) {
        setLastSyncTimestamp(res.timestamp);
      }
      return res;
    },
    [profile, dailyLogs, fastingHistory, weightRecords]
  );

  // Initial cloud sync on mount
  useEffect(() => {
    triggerCloudSync(false);
  }, []);

  // Date switchers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = getTodayKey(new Date()) === dateKey;
  const dateFormatted = isToday
    ? 'Bugün'
    : selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' });

  // ---------------- DIARY ACTIONS ----------------
  const handleOpenAddFood = (meal: MealType) => {
    setTargetMeal(meal);
    setIsAddFoodOpen(true);
  };

  const handleAddFoodEntry = (entry: MealFoodEntry) => {
    setDailyLogs((prev) => {
      const current = prev[dateKey] || {
        date: dateKey,
        entries: [],
        waterIntakeMl: 0,
        steps: 0,
        exercises: [],
      };
      return {
        ...prev,
        [dateKey]: {
          ...current,
          entries: [entry, ...current.entries],
        },
      };
    });

    // Reward diamonds & streak
    setProfile((prev) => ({ ...prev, diamonds: prev.diamonds + 20 }));
  };

  const handleDeleteFoodEntry = (id: string) => {
    setDailyLogs((prev) => {
      const current = prev[dateKey];
      if (!current) return prev;
      return {
        ...prev,
        [dateKey]: {
          ...current,
          entries: current.entries.filter((e) => e.id !== id),
        },
      };
    });
  };

  const handleUpdateWater = (newMl: number) => {
    setDailyLogs((prev) => {
      const current = prev[dateKey] || {
        date: dateKey,
        entries: [],
        waterIntakeMl: 0,
        steps: 0,
        exercises: [],
      };
      return {
        ...prev,
        [dateKey]: {
          ...current,
          waterIntakeMl: newMl,
        },
      };
    });
  };

  const handleUpdateSteps = (newSteps: number) => {
    setDailyLogs((prev) => {
      const current = prev[dateKey] || {
        date: dateKey,
        entries: [],
        waterIntakeMl: 0,
        steps: 0,
        exercises: [],
      };
      return {
        ...prev,
        [dateKey]: {
          ...current,
          steps: newSteps,
        },
      };
    });
  };

  const handleAddExercise = (exercise: ExerciseEntry) => {
    setDailyLogs((prev) => {
      const current = prev[dateKey] || {
        date: dateKey,
        entries: [],
        waterIntakeMl: 0,
        steps: 0,
        exercises: [],
      };
      return {
        ...prev,
        [dateKey]: {
          ...current,
          exercises: [exercise, ...current.exercises],
        },
      };
    });
    setProfile((prev) => ({ ...prev, diamonds: prev.diamonds + 30 }));
  };

  const handleDeleteExercise = (id: string) => {
    setDailyLogs((prev) => {
      const current = prev[dateKey];
      if (!current) return prev;
      return {
        ...prev,
        [dateKey]: {
          ...current,
          exercises: current.exercises.filter((e) => e.id !== id),
        },
      };
    });
  };

  // ---------------- FASTING ACTIONS ----------------
  const handleStartFast = (plan: FastingPlanType) => {
    const hours = plan === '14:10' ? 14 : plan === '16:8' ? 16 : plan === '18:6' ? 18 : 20;
    const newFast: FastingSession = {
      id: 'fast-' + Date.now(),
      plan,
      startTime: Date.now(),
      targetDurationHours: hours,
      completed: false,
    };
    setActiveFast(newFast);
  };

  const handleEndFast = () => {
    if (!activeFast) return;
    const completedSession: FastingSession = {
      ...activeFast,
      endTime: Date.now(),
      completed: true,
    };
    setFastingHistory((prev) => [completedSession, ...prev]);
    setActiveFast(null);
    setProfile((prev) => ({ ...prev, diamonds: prev.diamonds + 50 }));
  };

  // ---------------- WEIGHT ACTIONS ----------------
  const handleAddWeight = (record: WeightRecord) => {
    setWeightRecords((prev) => [...prev, record]);
    setProfile((prev) => ({
      ...prev,
      currentWeightKg: record.weightKg,
      diamonds: prev.diamonds + 25,
    }));
  };

  const handleDeleteWeight = (id: string) => {
    setWeightRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // ---------------- JSON BACKUP & IMPORT ----------------
  const handleExportJson = () => {
    const fullBackup = {
      profile,
      dailyLogs,
      fastingHistory,
      weightRecords,
      exportedAt: new Date().toISOString(),
      appName: 'Willy Kilo Takip',
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `willy-kilo-takip-yedek-${dateKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.dailyLogs) setDailyLogs(parsed.dailyLogs);
        if (parsed.fastingHistory) setFastingHistory(parsed.fastingHistory);
        if (parsed.weightRecords) setWeightRecords(parsed.weightRecords);
        alert('Yedek başarıyla geri yüklendi!');
        setIsSyncModalOpen(false);
      } catch (err) {
        alert('Geçersiz yedek dosyası!');
      }
    };
    reader.readAsText(file);
  };

  // Aggregate macros and calories for current day
  const consumedCalories = todayData.entries.reduce((sum, e) => sum + e.calories, 0);
  const burnedCalories = todayData.exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
  const macros = todayData.entries.reduce(
    (acc, e) => {
      acc.carbs += e.carbs || 0;
      acc.protein += e.protein || 0;
      acc.fat += e.fat || 0;
      return acc;
    },
    { carbs: 0, protein: 0, fat: 0 }
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        profile={profile}
        currentDateStr={dateFormatted}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onToday={handleToday}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-4">
        {activeTab === 'diary' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Calorie & Macro Ring */}
            <CalorieRing
              calorieTarget={profile.dailyCalorieTarget}
              consumedCalories={consumedCalories}
              burnedCalories={burnedCalories}
              macros={macros}
              macroTargets={profile.macroTargets}
            />

            {/* Meals Sections (Breakfast, Lunch, Dinner, Snack) */}
            <MealsList
              entries={todayData.entries}
              onOpenAddModal={handleOpenAddFood}
              onDeleteEntry={handleDeleteFoodEntry}
            />

            {/* Water Tracker */}
            <WaterTracker
              currentMl={todayData.waterIntakeMl}
              targetMl={profile.waterTargetMl}
              onUpdateWater={handleUpdateWater}
            />

            {/* Exercise & Step Tracker */}
            <ActivityCard
              exercises={todayData.exercises}
              steps={todayData.steps}
              onUpdateSteps={handleUpdateSteps}
              onAddExercise={handleAddExercise}
              onDeleteExercise={handleDeleteExercise}
            />

            {/* Install card on mobile browser */}
            <PWAInstallButton variant="card" />
          </div>
        )}

        {activeTab === 'fasting' && (
          <div className="animate-in fade-in duration-300">
            <FastingTab
              activeFast={activeFast}
              onStartFast={handleStartFast}
              onEndFast={handleEndFast}
              fastingHistory={fastingHistory}
            />
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="animate-in fade-in duration-300">
            <RecipesTab
              recipes={recipes}
              onAddRecipeToDiary={handleAddFoodEntry}
            />
          </div>
        )}

        {activeTab === 'weight' && (
          <div className="animate-in fade-in duration-300">
            <WeightTab
              profile={profile}
              weightRecords={weightRecords}
              onAddWeight={handleAddWeight}
              onDeleteWeight={handleDeleteWeight}
            />
          </div>
        )}

        {activeTab === 'coach' && (
          <div className="animate-in fade-in duration-300">
            <WillyCoachTab
              profile={profile}
              todayData={todayData}
              activeFast={activeFast}
              onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Add Food Modal (AI photo scanner, barcode, search) */}
      <AddFoodModal
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        targetMeal={targetMeal}
        onAddFood={handleAddFoodEntry}
      />

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        profile={profile}
        onUpdateSyncKey={(newKey) => setProfile((prev) => ({ ...prev, cloudSyncKey: newKey }))}
        onManualSync={triggerCloudSync}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        lastSyncedTimestamp={lastSyncTimestamp}
      />

      {/* Profile & Target Setting Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={(updated) => setProfile(updated)}
      />

      {/* PWA Offline indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default App;
