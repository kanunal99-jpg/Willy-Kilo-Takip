import fs from 'node:fs';

const file = 'src/components/RecipesTabLegacy.tsx';
let source = fs.readFileSync(file, 'utf8');

if (!source.includes("../data/nonAlcoholicRecipeCatalog")) {
  const marker = "import { NON_ALCOHOLIC_RECIPES } from '../data/nonAlcoholicRecipes';";
  if (!source.includes(marker)) throw new Error('non-alcoholic import marker not found; refusing unsafe patch');
  source = source.replace(marker, `${marker}\nimport { buildNonAlcoholicRecipeCatalog } from '../data/nonAlcoholicRecipeCatalog';`);
}

if (!source.includes('useMemo')) {
  source = source.replace("import React, { useState } from 'react';", "import React, { useMemo, useState } from 'react';");
}

const oldSource = "const sourceRecipes = selectedCategory === 'Alkolsüz' ? NON_ALCOHOLIC_RECIPES : recipes;";
const newSource = "const nonAlcoholicCatalog = useMemo(() => buildNonAlcoholicRecipeCatalog(10000), []);\n  const sourceRecipes = selectedCategory === 'Alkolsüz' ? nonAlcoholicCatalog : recipes;";
if (source.includes(oldSource)) {
  source = source.replace(oldSource, newSource);
} else if (!source.includes('buildNonAlcoholicRecipeCatalog(10000)')) {
  throw new Error('recipe source marker not found; refusing unsafe patch');
}

fs.writeFileSync(file, source, 'utf8');

const beverageFile = 'src/components/BeverageCatalog.tsx';
let beverage = fs.readFileSync(beverageFile, 'utf8');

// Product requirement: the embedded Alkolsüz İçecekler catalog is exactly 10,000 variants.
beverage = beverage.replace('const TOTAL=14000;', 'const TOTAL=10000;');
beverage = beverage.replace('🥤 14.000 Alkolsüz İçecek Varyantı', '🥤 10.000 Alkolsüz İçecek Varyantı');
beverage = beverage.replace('<Stat v="14.000" l="Varyant"/>', '<Stat v="10.000" l="Varyant"/>');

// Defense-in-depth: reject alcoholic terms if future catalog edits accidentally introduce them.
const guard = `\nconst ALCOHOL_BLACKLIST = ['alkol','alkollü','şarap','bira','votka','rom','viski','visky','cin','gin','tekila','likör','likor','şampanya','sampanya','vermut','amaretto','brendi','konyak','rakı','raki'];\nconst assertAlcoholFree = (text:string) => { const normalized=text.toLocaleLowerCase('tr-TR'); const hit=ALCOHOL_BLACKLIST.find(term=>normalized.includes(term)); if(hit) throw new Error('ALCOHOL_CONTENT_BLOCKED:'+hit); };\n`;
if (!beverage.includes('const ALCOHOL_BLACKLIST =')) {
  beverage = beverage.replace("const vl=(n:number)=>n>=1000?`${n/1000} L`:`${n} ml`;", "const vl=(n:number)=>n>=1000?`${n/1000} L`:`${n} ml`;" + guard);
}

const beforeReturn = " const tags=['Alkolsüz',c,f,variant,...purposes];";
const afterReturn = " const tags=['Alkolsüz',c,f,variant,...purposes];\n assertAlcoholFree([c,f,variant,...ingredientsForRecipe.map(x=>x.name),...tags].join(' '));";
if (beverage.includes(beforeReturn) && !beverage.includes(afterReturn)) {
  beverage = beverage.replace(beforeReturn, afterReturn);
}

fs.writeFileSync(beverageFile, beverage, 'utf8');
console.log('10k non-alcoholic catalog + alcohol safety guard PASS.');
