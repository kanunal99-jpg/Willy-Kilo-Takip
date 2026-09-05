export type UserGoal = 'lose_weight' | 'maintain' | 'build_muscle';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MacroTarget {
  carbs: number; // grams
  protein: number; // grams
  fat: number; // grams
}

export interface UserProfile {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'other';
  age: number;
  heightCm: number;
  currentWeightKg: number;
  startingWeightKg: number;
  targetWeightKg: number;
  goal: UserGoal;
  activityLevel: ActivityLevel;
  dailyCalorieTarget: number;
  macroTargets: MacroTarget;
  waterTargetMl: number;
  fastingPlan: FastingPlanType;
  cloudSyncKey: string;
  syncEmail?: string;
  lastSyncedAt?: string;
  diamonds: number;
  streakDays: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  defaultServing: number;
  unit: string;
  category: string;
  pros?: string[];
  cons?: string[];
  healthScore?: number;
}

export interface MealFoodEntry {
  id: string;
  foodId?: string;
  name: string;
  mealType: MealType;
  servingAmount: number;
  servingUnit: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber?: number;
  barcode?: string;
  healthScore?: number;
  pros?: string[];
  cons?: string[];
  timestamp: number;
  aiDetected?: boolean;
}

export type FastingPlanType = '16:8' | '14:10' | '18:6' | '20:4' | '5:2';

export interface FastingSession {
  id: string;
  plan: FastingPlanType;
  startTime: number;
  endTime?: number;
  targetDurationHours: number;
  completed: boolean;
}

export interface WeightRecord {
  id: string;
  date: string;
  weightKg: number;
  bodyFat?: number;
  waistCm?: number;
  hipCm?: number;
  note?: string;
  timestamp: number;
}

export interface ExerciseEntry {
  id: string;
  title: string;
  durationMinutes: number;
  caloriesBurned: number;
  steps?: number;
  timestamp: number;
}

export interface Recipe {
  id: string;
  title: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  prepTimeMinutes: number;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  servings: number;
  tags: string[];
  ingredients: { name: string; amount: string }[];
  steps: string[];
  imageUrl: string;
  proFeature: boolean;
}

export interface DailyData {
  date: string; // YYYY-MM-DD
  entries: MealFoodEntry[];
  waterIntakeMl: number;
  steps: number;
  exercises: ExerciseEntry[];
  notes?: string;
}

export interface FastingStage {
  id: string;
  name: string;
  startHour: number;
  endHour: number;
  description: string;
  benefits: string[];
  accentColor: string;
}
