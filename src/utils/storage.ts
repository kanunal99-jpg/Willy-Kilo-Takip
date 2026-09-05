import { DailyData, FastingSession, FoodItem, Recipe, UserProfile, WeightRecord } from '../types';
import { INITIAL_USER_PROFILE, RECIPES_DATABASE } from '../data/mockData';
import { runDataMigration } from './dataMigration';

const STORAGE_KEYS = {
  PROFILE: 'willy_user_profile', DAILY_LOGS: 'willy_daily_logs', FASTING_SESSIONS: 'willy_fasting_sessions',
  WEIGHT_RECORDS: 'willy_weight_records', CUSTOM_RECIPES: 'willy_custom_recipes', FOOD_DATABASE: 'willy_food_database',
  ACTIVE_FAST: 'willy_active_fast', LAST_SYNC: 'willy_last_sync_timestamp',
};

export const getTodayKey = (date: Date = new Date()): string => {
  const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const loadUserProfile = (): UserProfile => {
  try { const raw = localStorage.getItem(STORAGE_KEYS.PROFILE); if (raw) return JSON.parse(raw); } catch (e) { console.error('Failed to load profile:', e); }
  return { ...INITIAL_USER_PROFILE, id: crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}-${Math.random().toString(36).slice(2)}`, cloudSyncKey: `WILLY-${Math.floor(100000 + Math.random() * 900000)}`, diamonds: 0, streakDays: 0 };
};
export const saveUserProfile = (profile: UserProfile): void => { try { localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)); } catch (e) { console.error('Failed to save profile:', e); } };

export const loadDailyLogs = (): Record<string, DailyData> => {
  try { const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS); if (raw) return JSON.parse(raw); } catch (e) { console.error('Failed to load daily logs:', e); }
  return {};
};
export const saveDailyLogs = (logs: Record<string, DailyData>): void => { try { localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs)); } catch (e) { console.error('Failed to save daily logs:', e); } };

export const loadWeightRecords = (): WeightRecord[] => {
  try { const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_RECORDS); if (raw) return JSON.parse(raw); } catch (e) { console.error('Failed to load weight records:', e); }
  return [];
};
export const saveWeightRecords = (records: WeightRecord[]): void => { try { localStorage.setItem(STORAGE_KEYS.WEIGHT_RECORDS, JSON.stringify(records)); } catch (e) { console.error('Failed to save weight records:', e); } };

export const loadActiveFast = (): FastingSession | null => {
  try { const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_FAST); if (raw) return JSON.parse(raw); } catch (e) { console.error('Failed to load active fast:', e); }
  return null;
};
export const saveActiveFast = (fast: FastingSession | null): void => {
  try { if (fast) localStorage.setItem(STORAGE_KEYS.ACTIVE_FAST, JSON.stringify(fast)); else localStorage.removeItem(STORAGE_KEYS.ACTIVE_FAST); } catch (e) { console.error('Failed to save active fast:', e); }
};

export const loadFastingHistory = (): FastingSession[] => {
  try { const raw = localStorage.getItem(STORAGE_KEYS.FASTING_SESSIONS); if (raw) return JSON.parse(raw); } catch (e) { console.error('Failed to load fasting history:', e); }
  return [];
};
export const saveFastingHistory = (history: FastingSession[]): void => { try { localStorage.setItem(STORAGE_KEYS.FASTING_SESSIONS, JSON.stringify(history)); } catch (e) { console.error('Failed to save fasting history:', e); } };

export const loadFoods = (): FoodItem[] => {
  try { const raw = localStorage.getItem(STORAGE_KEYS.FOOD_DATABASE); if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed) && parsed.length > 0) return parsed; } } catch (e) { console.error('Failed to load foods:', e); }
  runDataMigration();
  try { const raw = localStorage.getItem(STORAGE_KEYS.FOOD_DATABASE); if (raw) return JSON.parse(raw); } catch {}
  return [];
};
export const saveFoods = (foods: FoodItem[]): void => { try { localStorage.setItem(STORAGE_KEYS.FOOD_DATABASE, JSON.stringify(foods)); } catch (e) { console.error('Failed to save foods:', e); } };

export const loadRecipes = (): Recipe[] => {
  try { const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_RECIPES); if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed) && parsed.length > 0) return parsed; } } catch (e) { console.error('Failed to load recipes:', e); }
  runDataMigration();
  try { const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_RECIPES); if (raw) return JSON.parse(raw); } catch {}
  return RECIPES_DATABASE;
};
export const saveRecipes = (recipes: Recipe[]): void => { try { localStorage.setItem(STORAGE_KEYS.CUSTOM_RECIPES, JSON.stringify(recipes)); } catch (e) { console.error('Failed to save recipes:', e); } };

export interface SyncResult { success: boolean; message: string; timestamp?: number; dataUpdated?: boolean; data?: any; }

export const syncWithCloud = async (
  profile: UserProfile, dailyLogs: Record<string, DailyData>, fastingHistory: FastingSession[], weightRecords: WeightRecord[], customRecipes: Recipe[] = [], forcePull = false
): Promise<SyncResult> => {
  try {
    const userId = profile.cloudSyncKey || profile.id;
    if (!userId) return { success: false, message: 'Bulut senkronizasyon anahtarı bulunamadı.' };
    if (forcePull) {
      const res = await fetch(`/api/sync/${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error(`Cloud GET failed: ${res.status}`);
      const json = await res.json();
      if (json.success && json.found && json.data) return { success: true, message: 'Buluttan veriler başarıyla çekildi.', timestamp: json.data.lastUpdated, dataUpdated: true, data: json.data };
    }
    const res = await fetch(`/api/sync/${encodeURIComponent(userId)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, dailyLogs, fastingHistory, weightRecords, customRecipes }),
    });
    if (!res.ok) throw new Error(`Cloud POST failed: ${res.status}`);
    const data = await res.json();
    if (data.success) {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(data.timestamp || Date.now()));
      return { success: true, message: 'Tüm verileriniz güvenli buluta senkronize edildi.', timestamp: data.timestamp };
    }
    return { success: false, message: data.error || 'Senkronizasyon hatası.' };
  } catch (err) {
    console.warn('Cloud sync offline or error:', err);
    return { success: false, message: 'Sunucuya ulaşılamadı. Verileriniz yerel hafızada güvende.' };
  }
};
