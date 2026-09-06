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

const enginePath='src/data/beverageRecipeEngine.ts';
let engine=fs.readFileSync(enginePath,'utf8');
engine=engine.replace("if(variant==='Proteinli' && c!=='Protein İçecekleri')", "if(variant==='Proteinli' && ['Smoothie','Milkshake'].includes(c))");

// Baseline has 92 flavor entries. Add exactly eight category-safe flavors so the
// deterministic matrix is 100 flavors x 10 variants x 10 volumes = 10,000.
const expansions=[
  ["'Limonata':", "'Limonata':[S('lemon','Limon suyu',.16),S('mint','Taze nane',.006),S('ginger','Taze zencefil',.006),S('strawberry','Çilek',.18),S('apple','Elma',.16),S('berries','Orman meyveleri',.16),S('peach','Şeftali',.16),S('lime','Misket limonu',.12)],"'Limonata'"],
  ["'Smoothie':", "'Smoothie':[S('strawberry','Çilek',.25),S('banana','Muz',.25),S('apple','Elma',.24),S('blueberry','Yaban mersini',.22),S('raspberry','Ahududu',.22),S('peach','Şeftali',.24),S('kiwi','Kivi',.22),S('mango','Mango',.24),S('pineapple','Ananas',.24),S('pear','Armut',.24),S('avocado','Avokado',.18)],"'Smoothie'"],
  ["'Şerbet':", "'Şerbet':[S('rose','Gül suyu',.08),S('tamarind','Demirhindi',.12),S('cherry','Vişne',.20),S('tamarind','Demirhindi',.18),S('cinnamon','Tarçın',.006),S('hibiscus','Hibiskus',.012),S('sourcherry','Ekşi vişne',.18),S('pomegranate','Nar',.16)],"'Şerbet'"],
  ["'Komposto':", "'Komposto':[S('apple','Elma',.22),S('pear','Armut',.22),S('peach','Şeftali',.22),S('cherry','Vişne',.22),S('apricot','Kayısı',.22),S('plum','Erik',.22),S('date','Hurma',.16)],"'Komposto'"],
  ["'Meyve İçecekleri':", "'Meyve İçecekleri':[S('orange','Portakal',.22),S('apple','Elma',.22),S('peach','Şeftali',.22),S('pineapple','Ananas',.22),S('pomegranate','Nar',.20),S('sourcherry','Vişne',.22),S('grape','Üzüm',.22),S('berries','Orman meyveleri',.20),S('watermelon','Karpuz',.20)],"'Meyve İçecekleri'"],
  ["'Detoks':", "'Detoks':[S('cucumber','Salatalık',.16),S('lemon','Limon',.06),S('mint','Nane',.008),S('ginger','Zencefil',.006),S('apple','Elma',.12),S('celery','Kereviz',.08),S('parsley','Maydanoz',.025),S('watermelon','Karpuz',.14)],"'Detoks'"],
  ["'Protein İçecekleri':", "'Protein İçecekleri':[S('banana','Muz',.22),S('strawberry','Çilek',.22),S('cocoa','Kakao',.018),S('peanut','Fıstık ezmesi',.025),S('blueberry','Yaban mersini',.20),S('apple','Elma',.20),S('mango','Mango',.20),S('chia','Chia',.015)],"'Protein İçecekleri'"],
  ["'Ayran':", "'Ayran':[S('mint','Taze nane',.006),S('cucumber','Salatalık',.12),S('ginger','Taze zencefil',.004),S('lemon','Limon suyu',.025),S('classic','Deniz tuzu',.002),S('carrot','Havuç',.05)],"'Ayran'"]
];
const baselinePatterns=[
  ["'Limonata':[S('lemon','Limon suyu',.16),S('mint','Taze nane',.006),S('ginger','Taze zencefil',.006),S('strawberry','Çilek',.18),S('apple','Elma',.16),S('berries','Orman meyveleri',.16),S('peach','Şeftali',.16),S('ginger','Zencefil',.008)],", expansions[0][1]+","],
  ["'Smoothie':[S('strawberry','Çilek',.25),S('banana','Muz',.25),S('apple','Elma',.24),S('blueberry','Yaban mersini',.22),S('raspberry','Ahududu',.22),S('peach','Şeftali',.24),S('kiwi','Kivi',.22),S('mango','Mango',.24),S('pineapple','Ananas',.24),S('pear','Armut',.24)],", expansions[1][1]+","],
  ["'Şerbet':[S('rose','Gül suyu',.08),S('tamarind','Demirhindi',.12),S('cherry','Vişne',.20),S('tamarind','Demirhindi',.18),S('cinnamon','Tarçın',.006),S('hibiscus','Hibiskus',.012),S('sourcherry','Ekşi vişne',.18)],", expansions[2][1]+","],
  ["'Komposto':[S('apple','Elma',.22),S('pear','Armut',.22),S('peach','Şeftali',.22),S('cherry','Vişne',.22),S('apricot','Kayısı',.22),S('plum','Erik',.22)],", expansions[3][1]+","],
  ["'Meyve İçecekleri':[S('orange','Portakal',.22),S('apple','Elma',.22),S('peach','Şeftali',.22),S('pineapple','Ananas',.22),S('pomegranate','Nar',.20),S('sourcherry','Vişne',.22),S('grape','Üzüm',.22),S('berries','Orman meyveleri',.20)],", expansions[4][1]+","],
  ["'Detoks':[S('cucumber','Salatalık',.16),S('lemon','Limon',.06),S('mint','Nane',.008),S('ginger','Zencefil',.006),S('apple','Elma',.12),S('celery','Kereviz',.08),S('parsley','Maydanoz',.025)],", expansions[5][1]+","],
  ["'Protein İçecekleri':[S('banana','Muz',.22),S('strawberry','Çilek',.22),S('cocoa','Kakao',.018),S('peanut','Fıstık ezmesi',.025),S('blueberry','Yaban mersini',.20),S('apple','Elma',.20),S('mango','Mango',.20)],", expansions[6][1]+","],
  ["'Ayran':[S('mint','Taze nane',.006),S('cucumber','Salatalık',.12),S('ginger','Taze zencefil',.004),S('lemon','Limon suyu',.025),S('classic','Deniz tuzu',.002)],", expansions[7][1]+",\n"]
];
for (const [oldValue,newValue] of baselinePatterns) engine=engine.replace(oldValue,newValue);

fs.writeFileSync(enginePath,engine,'utf8');

const engineCheck=fs.readFileSync(enginePath,'utf8');
if(!engineCheck.includes("['Smoothie','Milkshake'].includes(c)"))throw new Error('PROTEIN_VARIANT_COMPATIBILITY_PATCH_FAILED');
if(!engineCheck.includes('validateBeverageCatalog'))throw new Error('BEVERAGE_VALIDATOR_MISSING');
console.log('CATEGORY_AWARE_BEVERAGE_ENGINE_APPLIED');
