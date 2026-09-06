import { buildSync } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'willy-beverage-'));
const outfile = join(dir, 'beverage-engine.mjs');
const alcohol = ['alkol','alkollü','şarap','bira','votka','rom','viski','visky','cin','gin','tekila','likör','likor','şampanya','sampanya','vermut','amaretto','brendi','konyak','rakı','raki'];
const variantsKnown = ['Ev Usulü','Fit','Şekersiz','Proteinli','Lifli','Kremamsı','Baharatlı','Vitaminli','Hafif','Ferah'];
const forbidden = [
  ['Ayran', ['mango','çilek','orman','elma','muz','şeftali','kakao','kahve','boza']],
  ['Kahve', ['çilek','mango','orman meyveleri','salatalık']],
  ['Milkshake', ['limon','zencefil','salatalık','kereviz','maydanoz']],
  ['Çay', ['fıstık ezmesi','salatalık','kereviz']],
  ['Bitki Çayı', ['fıstık ezmesi','muz','mango']],
  ['Detoks', ['bal','protein tozu','süt','yoğurt']],
  ['Komposto', ['süt','yoğurt','protein tozu']],
  ['Şerbet', ['süt','yoğurt','protein tozu']],
  ['Yöresel İçecekler', ['votka','rom','viski','şarap','bira']]
];

try {
  buildSync({ entryPoints: ['src/data/beverageRecipeEngine.ts'], bundle: true, platform: 'node', format: 'esm', outfile, sourcemap: false });
  const mod = await import(outfile);
  const catalog = mod.buildBeverageCatalog(10000);
  if (!Array.isArray(catalog) || catalog.length !== 10000) throw new Error(`COUNT:${catalog?.length}`);

  const ids = new Set();
  const signatures = new Set();
  const categories = new Set();
  const variants = new Set();
  const volumes = new Set();

  for (const r of catalog) {
    const category = r?.cat ?? r?.category;
    const variant = r?.variant ?? variantsKnown.find((name) => String(r?.title ?? '').includes(`— ${name} —`));
    if (!r?.id || ids.has(r.id)) throw new Error(`DUPLICATE_ID:${r?.id}`);
    ids.add(r.id);
    if (!category || !r.ingredients?.length || r.ingredients.length < 2) throw new Error(`RECIPE_STRUCTURE:${r?.id}`);
    if (!Array.isArray(r.steps) || r.steps.length < 3) throw new Error(`STEPS:${r?.id}`);
    if (!Number.isFinite(r.volumeMl) || r.volumeMl < 100 || r.volumeMl > 3000) throw new Error(`VOLUME:${r?.id}`);
    if (!Number.isFinite(r.nutrition?.calories) || !Number.isFinite(r.nutrition?.protein) || !Number.isFinite(r.nutrition?.carbs) || !Number.isFinite(r.nutrition?.fat)) throw new Error(`NUTRITION:${r?.id}`);
    if (!variant) throw new Error(`VARIANT:${r?.id}`);
    const text = `${category} ${r.title ?? ''} ${(r.ingredients ?? []).map(x => `${x.key ?? ''} ${x.name ?? ''} ${x.amount ?? x.grams ?? ''}`).join(' ')}`.toLocaleLowerCase('tr-TR');
    const hit = alcohol.find(x => text.includes(x));
    if (hit) throw new Error(`ALCOHOL:${r?.id}:${hit}`);
    const rule = forbidden.find(([cat]) => cat === category);
    if (rule) {
      for (const term of rule[1]) if (text.includes(term)) throw new Error(`COMPATIBILITY:${r?.id}:${category}:${term}`);
    }
    categories.add(category);
    variants.add(variant);
    volumes.add(r.volumeMl);
    const ingredientSignature = (r.ingredients ?? []).map(x => `${x.key ?? x.name ?? ''}:${x.grams ?? x.amount ?? ''}`).sort().join(',');
    const sig = `${category}|${r.title}|${variant}|${r.volumeMl}|${ingredientSignature}`;
    if (signatures.has(sig)) throw new Error(`DUPLICATE_RECIPE_SIGNATURE:${r?.id}`);
    signatures.add(sig);
  }

  if (categories.size < 13) throw new Error(`CATEGORY_COVERAGE:${categories.size}`);
  if (variants.size < 10) throw new Error(`VARIANT_COVERAGE:${variants.size}`);
  if (volumes.size < 10) throw new Error(`VOLUME_COVERAGE:${volumes.size}`);
  console.log(`BEVERAGE_CATALOG_QUALITY_GATE_PASS count=${catalog.length} categories=${categories.size} variants=${variants.size} volumes=${volumes.size} uniqueIds=${ids.size} uniqueSignatures=${signatures.size}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
