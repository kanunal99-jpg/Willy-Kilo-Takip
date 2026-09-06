import { Recipe } from '../types';

/**
 * Deterministic, offline-first catalog engine for the Alkolsüz section.
 *
 * The combinations are deliberately generated from explicit ingredient/family
 * definitions instead of AI output. Nutrition is marked as an estimate in the
 * recipe metadata because variant nutrition is calculated from ingredient
 * profiles. This keeps the UI fast while allowing the source dataset to be
 * replaced by fully curated/imported records later without changing the UI.
 */

type Profile = { name: string; kcal: number; protein: number; carbs: number; fat: number; fiber: number; amount: string };
type Family = { prefix: string; category: Recipe['category']; base: Profile; tags: string[]; steps: string[]; imageUrl: string };

const yogurts: Profile[] = [
  { name: 'Süzme yoğurt', kcal: 146, protein: 10, carbs: 4, fat: 8, fiber: 0, amount: '150 g' },
  { name: 'Yoğurt', kcal: 92, protein: 5, carbs: 7, fat: 4, fiber: 0, amount: '180 g' },
  { name: 'Kefir', kcal: 105, protein: 6, carbs: 8, fat: 5, fiber: 0, amount: '200 ml' },
  { name: 'Ayran', kcal: 74, protein: 4, carbs: 5, fat: 4, fiber: 0, amount: '250 ml' },
  { name: 'Laktozsuz yoğurt', kcal: 90, protein: 5, carbs: 7, fat: 4, fiber: 0, amount: '180 g' },
  { name: 'Skyr', kcal: 110, protein: 18, carbs: 7, fat: 0.5, fiber: 0, amount: '150 g' },
  { name: 'Hindistan cevizi yoğurdu', kcal: 130, protein: 2, carbs: 8, fat: 10, fiber: 1, amount: '150 g' },
  { name: 'Yoğurtlu protein karışımı', kcal: 125, protein: 16, carbs: 8, fat: 2, fiber: 1, amount: '150 g' },
  { name: 'Kefirli yoğurt', kcal: 98, protein: 6, carbs: 8, fat: 4, fiber: 0, amount: '180 g' },
  { name: 'Süzme yoğurt light', kcal: 105, protein: 12, carbs: 5, fat: 3, fiber: 0, amount: '150 g' },
];

const fruits: Profile[] = [
  { name: 'Çilek', kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, amount: '100 g' },
  { name: 'Muz', kcal: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, amount: '100 g' },
  { name: 'Elma', kcal: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, amount: '120 g' },
  { name: 'Yaban mersini', kcal: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, amount: '80 g' },
  { name: 'Ahududu', kcal: 52, protein: 1.2, carbs: 12, fat: 0.7, fiber: 6.5, amount: '80 g' },
  { name: 'Şeftali', kcal: 39, protein: 0.9, carbs: 10, fat: 0.3, fiber: 1.5, amount: '120 g' },
  { name: 'Kivi', kcal: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3, amount: '100 g' },
  { name: 'Mango', kcal: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, amount: '100 g' },
  { name: 'Armut', kcal: 57, protein: 0.4, carbs: 15, fat: 0.1, fiber: 3.1, amount: '120 g' },
  { name: 'Ananas', kcal: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, amount: '100 g' },
];

const bases: Profile[] = [
  { name: 'Yulaf ezmesi', kcal: 140, protein: 4.8, carbs: 24, fat: 2.7, fiber: 4, amount: '35 g' },
  { name: 'Chia tohumu', kcal: 90, protein: 3, carbs: 8, fat: 5.5, fiber: 7, amount: '15 g' },
  { name: 'Kinoa', kcal: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, amount: '100 g pişmiş' },
  { name: 'Tam buğday ekmeği', kcal: 140, protein: 6, carbs: 24, fat: 2, fiber: 4, amount: '2 dilim' },
  { name: 'Bulgur', kcal: 120, protein: 4, carbs: 27, fat: 0.3, fiber: 5, amount: '100 g pişmiş' },
  { name: 'Nohut', kcal: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 7.6, amount: '100 g haşlanmış' },
  { name: 'Yeşil mercimek', kcal: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, amount: '100 g haşlanmış' },
  { name: 'Esmer pirinç', kcal: 112, protein: 2.3, carbs: 23, fat: 0.8, fiber: 1.8, amount: '100 g pişmiş' },
  { name: 'Karabuğday', kcal: 92, protein: 3.4, carbs: 20, fat: 0.6, fiber: 2.7, amount: '100 g pişmiş' },
  { name: 'Mısır', kcal: 96, protein: 3.4, carbs: 21, fat: 1.5, fiber: 2.4, amount: '100 g' },
];

const extras: Profile[] = [
  { name: 'Ceviz', kcal: 65, protein: 1.5, carbs: 1.4, fat: 6.5, fiber: 0.7, amount: '10 g' },
  { name: 'Badem', kcal: 58, protein: 2.1, carbs: 2.2, fat: 5, fiber: 1.2, amount: '10 g' },
  { name: 'Fındık', kcal: 63, protein: 1.5, carbs: 1.7, fat: 6.1, fiber: 1, amount: '10 g' },
  { name: 'Fıstık ezmesi', kcal: 59, protein: 2.5, carbs: 2, fat: 5, fiber: 0.6, amount: '10 g' },
  { name: 'Tahin', kcal: 60, protein: 1.7, carbs: 2, fat: 5.4, fiber: 0.9, amount: '10 g' },
  { name: 'Kabak çekirdeği', kcal: 56, protein: 3, carbs: 1.5, fat: 4.7, fiber: 0.6, amount: '10 g' },
  { name: 'Hindistan cevizi', kcal: 66, protein: 0.7, carbs: 2.4, fat: 6.4, fiber: 1.6, amount: '10 g' },
  { name: 'Kakao', kcal: 23, protein: 2, carbs: 3, fat: 1.4, fiber: 2, amount: '5 g' },
  { name: 'Tarçın', kcal: 6, protein: 0.1, carbs: 2, fat: 0.1, fiber: 1.1, amount: '2 g' },
  { name: 'Keten tohumu', kcal: 53, protein: 1.8, carbs: 2.9, fat: 4.2, fiber: 2.7, amount: '10 g' },
];

const families: Family[] = [
  { prefix: 'Meyveli Yoğurt Kasesi', category: 'breakfast', base: yogurts[0], tags: ['Kahvaltı', 'Çabuk Hazırlanan', 'Alkolsüz'], steps: ['Yoğurdu kaseye alın.', 'Seçilen meyveyi yıkayıp doğrayın ve ekleyin.', 'Baz ve ekstra malzemeyi üzerine serpin; karıştırıp servis edin.'], imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80' },
  { prefix: 'Yulaflı Meyve Kasesi', category: 'breakfast', base: yogurts[1], tags: ['Kahvaltı', 'Çabuk Hazırlanan', 'Alkolsüz'], steps: ['Yoğurt ve yulafı karıştırın.', 'Meyveyi ekleyin.', 'Kuruyemiş veya tohum ile tamamlayıp servis edin.'], imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80' },
  { prefix: 'Kefirli Meyve Kasesi', category: 'breakfast', base: yogurts[2], tags: ['Kahvaltı', 'Probiyotik', 'Alkolsüz'], steps: ['Kefiri kaseye alın.', 'Meyveyi doğrayıp ekleyin.', 'Yulaf veya tohum ile kıvamlandırıp servis edin.'], imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&auto=format&fit=crop&q=80' },
  { prefix: 'Kinoa Protein Kasesi', category: 'lunch', base: yogurts[5], tags: ['Öğle Yemeği', 'Proteinden Zengin', 'Alkolsüz'], steps: ['Kinoayı kaseye alın.', 'Meyve veya sebze bileşenini ekleyin.', 'Yoğurt ve seçilen ekstra ile tamamlayın.'], imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80' },
  { prefix: 'Bulgurlu Nohut Kasesi', category: 'lunch', base: bases[4], tags: ['Öğle Yemeği', 'Lifli', 'Alkolsüz'], steps: ['Bulguru hazırlayın.', 'Nohudu ekleyin ve karıştırın.', 'Seçilen meyve yerine uygun taze ürünle tamamlayın ve servis edin.'], imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80' },
  { prefix: 'Mercimekli Tahıl Kasesi', category: 'lunch', base: bases[6], tags: ['Öğle Yemeği', 'Proteinden Zengin', 'Alkolsüz'], steps: ['Mercimeği ve tahılı birleştirin.', 'Taze bileşeni doğrayıp ekleyin.', 'Ekstra malzemeyi ilave edip harmanlayın.'], imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80' },
  { prefix: 'Tam Tahıllı Kahvaltı Tabağı', category: 'breakfast', base: bases[3], tags: ['Kahvaltı', 'Dengeli', 'Alkolsüz'], steps: ['Ekmeği hafifçe kızartın.', 'Seçilen yoğurt ve taze bileşeni hazırlayın.', 'Ekstra malzemeyi ekleyip servis edin.'], imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80' },
  { prefix: 'Chia Meyveli Puding', category: 'dessert', base: bases[1], tags: ['Tatlı', 'Çabuk Hazırlanan', 'Alkolsüz'], steps: ['Chia tohumunu yoğurt ile karıştırın.', 'En az 20 dakika, tercihen gece boyunca bekletin.', 'Meyve ve ekstra ile servis edin.'], imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&auto=format&fit=crop&q=80' },
  { prefix: 'Karabuğdaylı Yoğurt Kasesi', category: 'dinner', base: bases[8], tags: ['Akşam Yemeği', 'Lifli', 'Alkolsüz'], steps: ['Karabuğdayı hazırlayın.', 'Yoğurt ile karıştırın.', 'Taze bileşen ve ekstra ile tamamlayın.'], imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80' },
  { prefix: 'Nohutlu Hafif Kase', category: 'dinner', base: bases[5], tags: ['Akşam Yemeği', 'Proteinden Zengin', 'Alkolsüz'], steps: ['Nohudu kaseye alın.', 'Taze bileşeni doğrayıp ekleyin.', 'Yoğurt ve ekstra ile harmanlayıp servis edin.'], imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80' },
];

function sum(a: Profile, b: Profile, c: Profile, d: Profile) {
  return {
    calories: Math.round(a.kcal + b.kcal + c.kcal + d.kcal),
    protein: Math.round((a.protein + b.protein + c.protein + d.protein) * 10) / 10,
    carbs: Math.round((a.carbs + b.carbs + c.carbs + d.carbs) * 10) / 10,
    fat: Math.round((a.fat + b.fat + c.fat + d.fat) * 10) / 10,
    fiber: Math.round((a.fiber + b.fiber + c.fiber + d.fiber) * 10) / 10,
  };
}

export function buildNonAlcoholicRecipeCatalog(limit = 10000): Recipe[] {
  const out: Recipe[] = [];
  let ordinal = 0;
  outer: for (let f = 0; f < families.length; f++) {
    for (let y = 0; y < yogurts.length; y++) {
      for (let fr = 0; fr < fruits.length; fr++) {
        for (let b = 0; b < bases.length; b++) {
          for (let e = 0; e < extras.length; e++) {
            if (ordinal >= limit) break outer;
            const family = families[f];
            const yogurt = yogurts[y];
            const fruit = fruits[fr];
            const base = bases[b];
            const extra = extras[e];
            const n = sum(yogurt, fruit, base, extra);
            const title = `${family.prefix} — ${fruit.name} & ${extra.name}`;
            out.push({
              id: `na-${String(ordinal + 1).padStart(5, '0')}`,
              title,
              category: family.category,
              calories: n.calories,
              carbs: n.carbs,
              protein: n.protein,
              fat: n.fat,
              prepTimeMinutes: family.category === 'dessert' ? 10 : 15,
              difficulty: 'Kolay',
              servings: 1,
              tags: [...family.tags, `Tahmini Lif ${n.fiber} g`],
              ingredients: [
                { name: yogurt.name, amount: yogurt.amount },
                { name: fruit.name, amount: fruit.amount },
                { name: base.name, amount: base.amount },
                { name: extra.name, amount: extra.amount },
              ],
              steps: family.steps,
              imageUrl: family.imageUrl,
              proFeature: true,
            });
            ordinal++;
          }
        }
      }
    }
  }
  return out;
}

export const NON_ALCOHOLIC_RECIPE_CATALOG_SIZE = families.length * yogurts.length * fruits.length * bases.length * extras.length;
