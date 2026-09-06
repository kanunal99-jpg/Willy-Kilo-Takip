import fs from 'node:fs';

const file = 'src/data/beverageRecipeEngine.ts';
let source = fs.readFileSync(file, 'utf8');

const marker = 'nutritionSource:nutrition.provenance.source,';
if (source.includes('nutrition:{calories:nutrition.calories')) {
  console.log('Beverage nutrition contract already present.');
  process.exit(0);
}

if (!source.includes(marker)) throw new Error('BEVERAGE_NUTRITION_CONTRACT_MARKER_MISSING');

source = source.replace(
  marker,
  'nutrition:{calories:nutrition.calories,protein:nutrition.protein,carbs:nutrition.carbs,fat:nutrition.fat,fiber:nutrition.fiber,source:nutrition.source,confidence:nutrition.confidence},' + marker
);

if (!source.includes('nutrition:{calories:nutrition.calories')) throw new Error('BEVERAGE_NUTRITION_CONTRACT_PATCH_FAILED');
fs.writeFileSync(file, source, 'utf8');
console.log('Beverage nutrition contract patch PASS.');
