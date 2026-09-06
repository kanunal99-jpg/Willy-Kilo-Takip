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
console.log('10k non-alcoholic catalog wiring PASS.');
