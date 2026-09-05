import fs from 'node:fs';

const API_BASE = 'https://willy-kilo-takip.onrender.com';

const foodPath = 'src/components/AddFoodModal.tsx';
let food = fs.readFileSync(foodPath, 'utf8');

if (!food.includes('const WILLY_API_BASE')) {
  const marker = "export const AddFoodModal";
  food = food.replace(
    marker,
    `const WILLY_API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '${API_BASE}' : '');\n\n${marker}`
  );
}

food = food.replace(
  "const res = await fetch('/api/ai/analyze-food', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: imagePreview, description: aiPromptNote, mealType: targetMeal }) });",
  "const mimeType = imagePreview?.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';\n      const res = await fetch(`${WILLY_API_BASE}/api/ai/analyze-food`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ imageBase64: imagePreview, mimeType, description: aiPromptNote, mealType: targetMeal }) });"
);

fs.writeFileSync(foodPath, food);

const serverPath = 'server.ts';
let server = fs.readFileSync(serverPath, 'utf8');

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
      }
    }
    if (!response?.text) throw lastError || new Error('Gemini AI boş yanıt döndürdü');`;

if (server.includes(oldAiLine)) {
  server = server.replace(oldAiLine, newAiBlock);
} else if (!server.includes("const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-2.5-flash'];")) {
  throw new Error('AI food generateContent target not found; refusing unsafe patch');
}

fs.writeFileSync(serverPath, server);
console.log('Production AI patch PASS: native API base + image MIME + Gemini fallback applied.');
