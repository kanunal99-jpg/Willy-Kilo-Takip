import { FoodItem, Recipe } from '../types';
import { HEALTHY_FOODS_CATALOG, HEALTHY_RECIPES_CATALOG, HEALTHY_DATABASE_STATS } from '../data/healthyDatabase';

export const MIGRATION_STORAGE_KEYS = {
  FOOD_DATABASE: 'willy_food_database',
  RECIPES_DATABASE: 'willy_custom_recipes',
  MIGRATION_VERSION: 'willy_data_migration_version',
  MIGRATION_STATS: 'willy_data_migration_stats',
};

export const CURRENT_MIGRATION_VERSION = '1.2.0';

export interface MigrationResult {
  success: boolean;
  version: string;
  foodsCount: number;
  recipesCount: number;
  totalEntries: number;
  isFirstMigration: boolean;
  message: string;
}

export interface MigrationStatus {
  isMigrated: boolean;
  version: string | null;
  foodCount: number;
  recipeCount: number;
  totalEntries: number;
  lastMigratedAt: string | null;
}

/**
 * Executes or verifies the data migration, injecting 500+ healthy foods and recipes into LocalStorage.
 * Preserves user-created custom entries by merging them.
 */
export function runDataMigration(options?: { force?: boolean }): MigrationResult {
  try {
    const existingVersion = localStorage.getItem(MIGRATION_STORAGE_KEYS.MIGRATION_VERSION);
    const hasFoods = localStorage.getItem(MIGRATION_STORAGE_KEYS.FOOD_DATABASE);
    const hasRecipes = localStorage.getItem(MIGRATION_STORAGE_KEYS.RECIPES_DATABASE);

    const isAlreadyMigrated = existingVersion === CURRENT_MIGRATION_VERSION && hasFoods && hasRecipes;

    if (isAlreadyMigrated && !options?.force) {
      const statsRaw = localStorage.getItem(MIGRATION_STORAGE_KEYS.MIGRATION_STATS);
      const parsedStats = statsRaw ? JSON.parse(statsRaw) : null;
      return {
        success: true,
        version: CURRENT_MIGRATION_VERSION,
        foodsCount: parsedStats?.foodCount || HEALTHY_DATABASE_STATS.foodCount,
        recipesCount: parsedStats?.recipeCount || HEALTHY_DATABASE_STATS.recipeCount,
        totalEntries: parsedStats?.totalEntries || HEALTHY_DATABASE_STATS.totalEntries,
        isFirstMigration: false,
        message: 'Veri tabanı güncel (520+ sağlıklı gıda ve tarif hazır).',
      };
    }

    // Load existing items if any to preserve user customizations
    let existingFoods: FoodItem[] = [];
    if (hasFoods) {
      try {
        existingFoods = JSON.parse(hasFoods);
      } catch (e) {
        console.warn('Error reading existing foods during migration:', e);
      }
    }

    let existingRecipes: Recipe[] = [];
    if (hasRecipes) {
      try {
        existingRecipes = JSON.parse(hasRecipes);
      } catch (e) {
        console.warn('Error reading existing recipes during migration:', e);
      }
    }

    // Merge foods: user-created foods (which might have custom IDs) preserved
    const foodMap = new Map<string, FoodItem>();
    HEALTHY_FOODS_CATALOG.forEach((f) => foodMap.set(f.id, f));
    existingFoods.forEach((f) => {
      // If user modified or added, preserve user item
      foodMap.set(f.id, f);
    });
    const mergedFoods = Array.from(foodMap.values());

    // Merge recipes:
    const recipeMap = new Map<string, Recipe>();
    HEALTHY_RECIPES_CATALOG.forEach((r) => recipeMap.set(r.id, r));
    existingRecipes.forEach((r) => {
      recipeMap.set(r.id, r);
    });
    const mergedRecipes = Array.from(recipeMap.values());

    // Write to LocalStorage JSON structure
    localStorage.setItem(MIGRATION_STORAGE_KEYS.FOOD_DATABASE, JSON.stringify(mergedFoods));
    localStorage.setItem(MIGRATION_STORAGE_KEYS.RECIPES_DATABASE, JSON.stringify(mergedRecipes));
    localStorage.setItem(MIGRATION_STORAGE_KEYS.MIGRATION_VERSION, CURRENT_MIGRATION_VERSION);

    const stats = {
      version: CURRENT_MIGRATION_VERSION,
      foodCount: mergedFoods.length,
      recipeCount: mergedRecipes.length,
      totalEntries: mergedFoods.length + mergedRecipes.length,
      migratedAt: new Date().toISOString(),
    };
    localStorage.setItem(MIGRATION_STORAGE_KEYS.MIGRATION_STATS, JSON.stringify(stats));

    return {
      success: true,
      version: CURRENT_MIGRATION_VERSION,
      foodsCount: mergedFoods.length,
      recipesCount: mergedRecipes.length,
      totalEntries: mergedFoods.length + mergedRecipes.length,
      isFirstMigration: !existingVersion,
      message: `Başarıyla ${mergedFoods.length} gıda ve ${mergedRecipes.length} tarif yerel hafızaya enjekte edildi (Toplam: ${mergedFoods.length + mergedRecipes.length} kayıt).`,
    };
  } catch (err: any) {
    console.error('Data migration error:', err);
    return {
      success: false,
      version: CURRENT_MIGRATION_VERSION,
      foodsCount: 0,
      recipesCount: 0,
      totalEntries: 0,
      isFirstMigration: false,
      message: 'Veri tabanı enjeksiyonu sırasında hata: ' + (err?.message || 'Bilinmeyen hata'),
    };
  }
}

/**
 * Gets current data migration and database statistics from LocalStorage
 */
export function getMigrationStatus(): MigrationStatus {
  try {
    const version = localStorage.getItem(MIGRATION_STORAGE_KEYS.MIGRATION_VERSION);
    const statsRaw = localStorage.getItem(MIGRATION_STORAGE_KEYS.MIGRATION_STATS);
    const foodsRaw = localStorage.getItem(MIGRATION_STORAGE_KEYS.FOOD_DATABASE);
    const recipesRaw = localStorage.getItem(MIGRATION_STORAGE_KEYS.RECIPES_DATABASE);

    let foodCount = 0;
    let recipeCount = 0;

    if (foodsRaw) {
      try {
        foodCount = JSON.parse(foodsRaw).length;
      } catch {}
    }
    if (recipesRaw) {
      try {
        recipeCount = JSON.parse(recipesRaw).length;
      } catch {}
    }

    let lastMigratedAt = null;
    if (statsRaw) {
      try {
        const stats = JSON.parse(statsRaw);
        lastMigratedAt = stats.migratedAt;
      } catch {}
    }

    return {
      isMigrated: Boolean(version && foodCount >= 300),
      version,
      foodCount,
      recipeCount,
      totalEntries: foodCount + recipeCount,
      lastMigratedAt,
    };
  } catch {
    return {
      isMigrated: false,
      version: null,
      foodCount: 0,
      recipeCount: 0,
      totalEntries: 0,
      lastMigratedAt: null,
    };
  }
}

/**
 * Exports the full healthy database and custom recipes as a formatted JSON file
 */
export function exportHealthyDatabaseJson(): void {
  try {
    const foods = localStorage.getItem(MIGRATION_STORAGE_KEYS.FOOD_DATABASE) || '[]';
    const recipes = localStorage.getItem(MIGRATION_STORAGE_KEYS.RECIPES_DATABASE) || '[]';
    const stats = localStorage.getItem(MIGRATION_STORAGE_KEYS.MIGRATION_STATS) || '{}';

    const payload = {
      appName: 'Willy Kilo Takip',
      catalogVersion: CURRENT_MIGRATION_VERSION,
      exportedAt: new Date().toISOString(),
      metadata: JSON.parse(stats),
      foods: JSON.parse(foods),
      recipes: JSON.parse(recipes),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `willy-saglikli-gida-tarif-veritabani-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export healthy database:', err);
  }
}
