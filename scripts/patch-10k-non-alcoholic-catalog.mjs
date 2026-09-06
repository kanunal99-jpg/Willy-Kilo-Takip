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

beverage = beverage.replace('const TOTAL=14000;', 'const TOTAL=10000;');
beverage = beverage.replace('🥤 14.000 Alkolsüz İçecek Varyantı', '🥤 10.000 Alkolsüz İçecek Varyantı');
beverage = beverage.replace('<Stat v="14.000" l="Varyant"/>', '<Stat v="10.000" l="Varyant"/>');

// Defense-in-depth: match alcohol as a standalone term; never treat "Alkolsüz" as alcoholic.
const guard = `\nconst ALCOHOL_BLACKLIST = ['alkol','alkollü','şarap','bira','votka','rom','viski','visky','cin','gin','tekila','likör','likor','şampanya','sampanya','vermut','amaretto','brendi','konyak','rakı','raki'];\nconst hasAlcoholTerm = (text:string) => { const normalized=text.toLocaleLowerCase('tr-TR'); return ALCOHOL_BLACKLIST.some(term => new RegExp('(^|[^a-zçğıöşü])' + term + '([^a-zçğıöşü]|$)').test(normalized)); };\nconst assertAlcoholFree = (text:string) => { const normalized=text.toLocaleLowerCase('tr-TR'); const hit=ALCOHOL_BLACKLIST.find(term => new RegExp('(^|[^a-zçğıöşü])' + term + '([^a-zçğıöşü]|$)').test(normalized)); if(hit) throw new Error('ALCOHOL_CONTENT_BLOCKED:'+hit); };\n`;
if (!beverage.includes('const ALCOHOL_BLACKLIST =')) {
  beverage = beverage.replace("const vl=(n:number)=>n>=1000?`${n/1000} L`:`${n} ml`;", "const vl=(n:number)=>n>=1000?`${n/1000} L`:`${n} ml`;" + guard);
}

const beforeGuard = " const tags=['Alkolsüz',c,f,variant,...purposes];";
const afterGuard = " const tags=['Alkolsüz',c,f,variant,...purposes];\n assertAlcoholFree([c,f,variant,...ingredients.map(x=>x.name),...tags].join(' '));";
if (beverage.includes(beforeGuard) && !beverage.includes(afterGuard)) {
  beverage = beverage.replace(beforeGuard, afterGuard);
}

fs.writeFileSync(beverageFile, beverage, 'utf8');

// The generated engine has a second catalog-level alcohol guard. Its old substring
// check interpreted the legitimate tag "Alkolsüz" as "alkol". Patch it at build time
// so the protection remains active without creating a false positive.
const engineFile = 'src/data/beverageRecipeEngine.ts';
let engine = fs.readFileSync(engineFile, 'utf8');
const oldAssert = "const assertAlcoholFree=(parts:string[])=>{const text=norm(parts.join(' '));const hit=alcohol.find(x=>text.includes(x));if(hit)throw new Error(`ALCOHOL_CONTENT_BLOCKED:${hit}`)};";
const newAssert = "const assertAlcoholFree=(parts:string[])=>{const text=norm(parts.join(' '));const hit=alcohol.find(x=>new RegExp('(^|[^a-zçğıöşü])'+x+'([^a-zçğıöşü]|$)').test(text));if(hit)throw new Error(`ALCOHOL_CONTENT_BLOCKED:${hit}`)};";
if (engine.includes(oldAssert)) engine = engine.replace(oldAssert, newAssert);

const oldCatalogGuard = "const alcoholHit=out.find(r=>alcohol.some(t=>norm([r.title,...r.tags,...r.ingredients.map(x=>x.name),...r.steps].join(' ')).includes(t)));";
const newCatalogGuard = "const alcoholHit=out.find(r=>alcohol.some(t=>new RegExp('(^|[^a-zçğıöşü])'+t+'([^a-zçğıöşü]|$)').test(norm([r.title,...r.tags,...r.ingredients.map(x=>x.name),...r.steps].join(' ')))));";
if (engine.includes(oldCatalogGuard)) engine = engine.replace(oldCatalogGuard, newCatalogGuard);

if (engine.includes(oldAssert) || engine.includes(oldCatalogGuard)) throw new Error('ALCOHOL_GUARD_PATCH_INCOMPLETE');
fs.writeFileSync(engineFile, engine, 'utf8');

console.log('10k non-alcoholic catalog + word-aware alcohol safety guard PASS.');
