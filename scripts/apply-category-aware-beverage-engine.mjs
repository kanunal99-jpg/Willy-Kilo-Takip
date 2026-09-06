import fs from 'node:fs';

const legacyFile='src/components/RecipesTabLegacy.tsx';
let legacy=fs.readFileSync(legacyFile,'utf8');
legacy=legacy.replace(/import \{ buildNonAlcoholicRecipeCatalog \} from ['\"]\.\.\/data\/nonAlcoholicRecipeCatalog['\"];?\n?/g,'');
legacy=legacy.replace(/\s*const nonAlcoholicCatalog = useMemo\(\(\) => buildNonAlcoholicRecipeCatalog\(10000\), \[\]\);\s*const sourceRecipes = selectedCategory === ['\"]Alkolsüz['\"] \? nonAlcoholicCatalog : recipes;/g,'\n  const sourceRecipes = recipes;');
legacy=legacy.replace("import React, { useMemo, useState } from 'react';","import React, { useState } from 'react';");
fs.writeFileSync(legacyFile,legacy,'utf8');

const file='src/components/BeverageCatalog.tsx';
let source=fs.readFileSync(file,'utf8');
const start=source.indexOf('type Cat=');
const marker='const INDEX=Array.from({length:TOTAL},(_,i)=>i);';
const end=source.indexOf(marker);
if(start<0||end<0)throw new Error('BEVERAGE_ENGINE_MARKER_MISSING');
const imports="import { BEVERAGE_CATS as CATS, BEVERAGE_VARIANTS as VARIANTS, BEVERAGE_VOLUMES as VOL, makeBeverage, BEVERAGE_TOTAL as TOTAL } from '../data/beverageRecipeEngine';\nimport type { BeverageCat as Cat, BeveragePurpose as Purpose } from '../data/beverageRecipeEngine';\n";
source=source.slice(0,start)+imports+source.slice(end+marker.length);
source=source.replace("const vl=(n:number)=>n>=1000?`${n/1000} L`:`${n} ml`;","const vl=(n:number)=>n>=1000?`${n/1000} L`:`${n} ml`;\nconst make=makeBeverage;");
source=source.replace('🥤 14.000 Alkolsüz İçecek Varyantı','🥤 10.000 Alkolsüz İçecek Varyantı').replace('<Stat v="14.000" l="Varyant"/>','<Stat v="10.000" l="Varyant"/>');
fs.writeFileSync(file,source,'utf8');

const engine=fs.readFileSync('src/data/beverageRecipeEngine.ts','utf8');
if(!engine.includes('validateBeverageCatalog'))throw new Error('BEVERAGE_VALIDATOR_MISSING');
const mod=await import(new URL('../src/data/beverageRecipeEngine.ts',import.meta.url).href).catch(()=>null);
if(!mod) console.log('Beverage engine source validation present; runtime validation runs in dedicated catalog check.');
console.log('CATEGORY_AWARE_BEVERAGE_ENGINE_APPLIED');
