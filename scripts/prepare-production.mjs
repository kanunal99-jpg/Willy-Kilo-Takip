import fs from 'node:fs';

const API_BASE = 'https://willy-kilo-takip.onrender.com';

const foodPath = 'src/components/AddFoodModal.tsx';
let food = fs.readFileSync(foodPath, 'utf8');

if (!food.includes('const WILLY_API_BASE')) {
  const marker = "export const AddFoodModal";
  if (!food.includes(marker)) throw new Error('AddFoodModal export marker not found; refusing unsafe patch');
  food = food.replace(
    marker,
    `const WILLY_API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '${API_BASE}' : '');\n\n${marker}`
  );
}

// Patch the real multiline fetch safely. Escape the generated template expression so this script does not evaluate it.
const fetchNeedle = /const res = await fetch\(\s*['"]\/api\/ai\/analyze-food['"]\s*,\s*\{[\s\S]*?\}\s*\);/;
if (fetchNeedle.test(food)) {
  food = food.replace(fetchNeedle, `const mimeType = imagePreview?.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';\n      const res = await fetch(\`\${WILLY_API_BASE}/api/ai/analyze-food\`, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },\n        body: JSON.stringify({ imageBase64: imagePreview, mimeType, description: aiPromptNote, mealType: targetMeal })\n      });`);
} else if (!food.includes('fetch(`${WILLY_API_BASE}/api/ai/analyze-food`')) {
  throw new Error('AI food fetch target not found; refusing unsafe patch');
}

fs.writeFileSync(foodPath, food);

const serverPath = 'server.ts';
let server = fs.readFileSync(serverPath, 'utf8');

const quotaHelper = `function isGeminiQuotaExhaustedError(err: any): boolean {\n  const message = String(err?.message || err || '').toLowerCase();\n  return message.includes('prepayment credits are depleted') ||\n    message.includes('prepayment') && message.includes('depleted') ||\n    message.includes('resource_exhausted') && message.includes('credit');\n}\n\nfunction geminiQuotaResponse(res: express.Response) {\n  return res.status(429).json({\n    success: false,\n    error: 'Gemini AI kredisi tükenmiş. AI Studio projesinin billing/prepay bakiyesini yenileyin.',\n    code: 'AI_QUOTA_EXHAUSTED'\n  });\n}\n\n`;
if (!server.includes('function isGeminiQuotaExhaustedError')) {
  const helperMarker = 'app.get(\'/api/health\'';
  if (!server.includes(helperMarker)) throw new Error('AI helper insertion marker not found; refusing unsafe patch');
  server = server.replace(helperMarker, quotaHelper + helperMarker);
}

const oldAiLine = "const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents, config: { responseMimeType: 'application/json' } });";
const newAiBlock = `const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-2.5-flash'];
    let response: any = null;
    let lastError: any = null;
    const rawImage = String(imageBase64 || '');
    const dataUrlMatch = rawImage.match(/^data:([^;]+);base64,(.*)$/s);
    const detectedMimeType = dataUrlMatch?.[1] || mimeType || 'image/jpeg';
    const imageData = dataUrlMatch?.[2] || rawImage.replace(/^data:[^,]+,/, '');
    if (imageData) {
      contents[0] = { inlineData: { mimeType: detectedMimeType, data: imageData } };
    }
    for (const model of models) {
      try {
        response = await ai.models.generateContent({ model, contents, config: { responseMimeType: 'application/json' } });
        if (response?.text) {
          console.log(\`AI Food Analysis success model=\${model}\`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.error(\`AI Food Analysis model=\${model} failed:\`, err?.message || err);
        if (isGeminiQuotaExhaustedError(err)) return geminiQuotaResponse(res);
      }
    }
    if (!response?.text) throw lastError || new Error('Gemini AI boş yanıt döndürdü');`;

if (server.includes(oldAiLine)) {
  server = server.replace(oldAiLine, newAiBlock);
} else if (!server.includes("const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-2.5-flash'];")) {
  throw new Error('AI food generateContent target not found; refusing unsafe patch');
}

// Make AI Coach stop immediately on the same depleted-credit condition instead of burning through every fallback model.
const coachCatchNeedle = /      } catch \(err: any\) \{\n        lastError = err;\n        console\.error\(`AI Coach model=\$\{model\} failed:`, err\?\.message \|\| err\);\n      \}/;
const coachCatchReplacement = `      } catch (err: any) {
        lastError = err;
        console.error(\`AI Coach model=\${model} failed:\`, err?.message || err);
        if (isGeminiQuotaExhaustedError(err)) return geminiQuotaResponse(res);
      }`;
if (coachCatchNeedle.test(server)) {
  server = server.replace(coachCatchNeedle, coachCatchReplacement);
}

// Surface quota exhaustion cleanly if the final fallback throws it outside the loop.
const coachFinalNeedle = "return res.status(502).json({ success: false, error: 'Gemini AI yanıt üretemedi: ' + (lastError?.message || 'Bilinmeyen hata'), code: 'AI_REQUEST_FAILED' });";
if (server.includes(coachFinalNeedle)) {
  server = server.replace(coachFinalNeedle, "if (isGeminiQuotaExhaustedError(lastError)) return geminiQuotaResponse(res);\n    " + coachFinalNeedle);
}

fs.writeFileSync(serverPath, server);
console.log('Production AI patch PASS: native API base + image MIME + Gemini fallback + quota classification applied.');