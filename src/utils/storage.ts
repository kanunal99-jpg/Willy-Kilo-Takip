import { DailyData, FastingSession, Recipe, UserProfile, WeightRecord } from '../types';
import { INITIAL_USER_PROFILE, RECIPES_DATABASE } from '../data/mockData';

const STORAGE_KEYS = {
  PROFILE: 'willy_user_profile',
  DAILY_LOGS: 'willy_daily_logs',
  FASTING_SESSIONS: 'willy_fasting_sessions',
  WEIGHT_RECORDS: 'willy_weight_records',
  CUSTOM_RECIPES: 'willy_custom_recipes',
  ACTIVE_FAST: 'willy_active_fast',
  LAST_SYNC: 'willy_last_sync_timestamp',
};

export const getTodayKey = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Initial state helpers
export const loadUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile:', e);
  }
  return INITIAL_USER_PROFILE;
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
};

export const loadDailyLogs = (): Record<string, DailyData> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load daily logs:', e);
  }

  // Initial sample log for today to give realistic Yazio experience
  const today = getTodayKey();
  return {
    [today]: {
      date: today,
      entries: [
        {
          id: 'init-1',
          name: 'Haşlanmış Yumurta (2 Adet)',
          mealType: 'breakfast',
          servingAmount: 2,
          servingUnit: 'adet',
          calories: 156,
          carbs: 1.2,
          protein: 12.6,
          fat: 10.6,
          fiber: 0,
          healthScore: 95,
          pros: ['İyi protein kaynağı', 'Sıfır şeker'],
          timestamp: Date.now() - 3600 * 4000,
        },
        {
          id: 'init-2',
          name: 'Beyaz Peynir & Yeşillik',
          mealType: 'breakfast',
          servingAmount: 40,
          servingUnit: 'gram',
          calories: 124,
          carbs: 1.5,
          protein: 8.5,
          fat: 9.6,
          fiber: 1.2,
          healthScore: 88,
          pros: ['Kalsiyum deposu'],
          timestamp: Date.now() - 3600 * 3900,
        },
        {
          id: 'init-3',
          name: 'Izgara Tavuklu Kinoa Salatası',
          mealType: 'lunch',
          servingAmount: 1,
          servingUnit: 'porsiyon',
          calories: 460,
          carbs: 38,
          protein: 42,
          fat: 14,
          fiber: 6.5,
          healthScore: 98,
          pros: ['Yüksek protein', 'Kompleks karbonhidrat'],
          timestamp: Date.now() - 3600 * 1000,
        },
      ],
      waterIntakeMl: 1750,
      steps: 6420,
      exercises: [
        {
          id: 'ex-1',
          title: 'Tempolu Yürüyüş',
          durationMinutes: 35,
          caloriesBurned: 185,
          steps: 4200,
          timestamp: Date.now() - 3600 * 2000,
        },
      ],
      notes: 'Enerjim bugün çok yüksekti!',
    },
  };
};

export const saveDailyLogs = (logs: Record<string, DailyData>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save daily logs:', e);
  }
};

export const loadWeightRecords = (): WeightRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load weight records:', e);
  }

  // Sample progress matching sustainable weight loss
  const now = Date.now();
  const oneDay = 86400 * 1000;
  return [
    { id: 'w-1', date: '14 Gün Önce', weightKg: 72.0, bodyFat: 26.5, waistCm: 82, timestamp: now - oneDay * 14 },
    { id: 'w-2', date: '10 Gün Önce', weightKg: 71.2, bodyFat: 26.0, waistCm: 81, timestamp: now - oneDay * 10 },
    { id: 'w-3', date: '7 Gün Önce', weightKg: 70.4, bodyFat: 25.4, waistCm: 80, timestamp: now - oneDay * 7 },
    { id: 'w-4', date: '3 Gün Önce', weightKg: 69.3, bodyFat: 24.8, waistCm: 79, timestamp: now - oneDay * 3 },
    { id: 'w-5', date: 'Bugün', weightKg: 68.5, bodyFat: 24.2, waistCm: 78, timestamp: now },
  ];
};

export const saveWeightRecords = (records: WeightRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save weight records:', e);
  }
};

export const loadActiveFast = (): FastingSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_FAST);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load active fast:', e);
  }
  // Default fast running 13 hours 41 mins (similar to Yazio screenshot!)
  const now = Date.now();
  const startTime = now - (13 * 3600 + 41 * 60) * 1000;
  return {
    id: 'fast-ongoing',
    plan: '16:8',
    startTime,
    targetDurationHours: 16,
    completed: false,
  };
};

export const saveActiveFast = (fast: FastingSession | null): void => {
  try {
    if (fast) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_FAST, JSON.stringify(fast));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_FAST);
    }
  } catch (e) {
    console.error('Failed to save active fast:', e);
  }
};

export const loadFastingHistory = (): FastingSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FASTING_SESSIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load fasting history:', e);
  }
  const now = Date.now();
  const oneDay = 86400 * 1000;
  return [
    { id: 'fh-1', plan: '16:8', startTime: now - oneDay * 3 - 16 * 3600 * 1000, endTime: now - oneDay * 3, targetDurationHours: 16, completed: true },
    { id: 'fh-2', plan: '16:8', startTime: now - oneDay * 2 - 16.5 * 3600 * 1000, endTime: now - oneDay * 2, targetDurationHours: 16, completed: true },
    { id: 'fh-3', plan: '16:8', startTime: now - oneDay - 16 * 3600 * 1000, endTime: now - oneDay, targetDurationHours: 16, completed: true },
  ];
};

export const saveFastingHistory = (history: FastingSession[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.FASTING_SESSIONS, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save fasting history:', e);
  }
};

export const loadRecipes = (): Recipe[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_RECIPES);
    if (raw) {
      const custom = JSON.parse(raw);
      return [...RECIPES_DATABASE, ...custom];
    }
  } catch (e) {
    console.error('Failed to load recipes:', e);
  }
  return RECIPES_DATABASE;
};

// ---------------- CLOUD SYNCHRONIZATION ----------------
export interface SyncResult {
  success: boolean;
  message: string;
  timestamp?: number;
  dataUpdated?: boolean;
}

export const syncWithCloud = async (
  profile: UserProfile,
  dailyLogs: Record<string, DailyData>,
  fastingHistory: FastingSession[],
  weightRecords: WeightRecord[],
  forcePull = false
): Promise<SyncResult> => {
  try {
    const userId = profile.cloudSyncKey || profile.id;

    if (forcePull) {
      // Pull remote data
      const res = await fetch(`/api/sync/${userId}`);
      const json = await res.json();
      if (json.success && json.found && json.data) {
        return {
          success: true,
          message: 'Buluttan veriler başarıyla çekildi.',
          timestamp: json.data.lastUpdated,
          dataUpdated: true,
        };
      }
    }

    // Push local state to cloud
    const res = await fetch(`/api/sync/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile,
        dailyLogs,
        fastingHistory,
        weightRecords,
      }),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(data.timestamp || Date.now()));
      return {
        success: true,
        message: 'Tüm verileriniz güvenli buluta senkronize edildi.',
        timestamp: data.timestamp,
      };
    }
    return {
      success: false,
      message: data.error || 'Senkronizasyon hatası.',
    };
  } catch (err: any) {
    console.warn('Cloud sync offline or error:', err);
    return {
      success: false,
      message: 'Sunucuya ulaşılamadı. Verileriniz yerel hafızada güvende.',
    };
  }
};
