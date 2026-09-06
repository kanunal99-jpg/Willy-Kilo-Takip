import fs from 'node:fs';

const file = 'src/components/AddFoodModal.tsx';
let source = fs.readFileSync(file, 'utf8');
const marker = '// FREE_AI_CLIENT_HARDENED';
if (source.includes(marker)) {
  console.log('Free AI client hardening already applied.');
  process.exit(0);
}

source = source.replace(
  "const [imagePreview, setImagePreview] = useState<string | null>(null);",
  "const [imagePreview, setImagePreview] = useState<string | null>(null);\n  const [imageMimeType, setImageMimeType] = useState('image/jpeg');\n  const [aiWarning, setAiWarning] = useState<string | null>(null);"
);

source = source.replace(
  "setAiError(null); setAiResult(null);\n    const reader = new FileReader(); reader.onload = event => setImagePreview(event.target?.result as string); reader.readAsDataURL(file);",
  "setAiError(null); setAiWarning(null); setAiResult(null);\n    setImageMimeType(file.type || 'image/jpeg');\n    const reader = new FileReader(); reader.onload = event => setImagePreview(event.target?.result as string); reader.readAsDataURL(file);"
);

source = source.replace(
  "body: JSON.stringify({ imageBase64: imagePreview, description: aiPromptNote, mealType: targetMeal })",
  "body: JSON.stringify({ imageBase64: imagePreview, mimeType: imageMimeType, description: aiPromptNote, mealType: targetMeal })"
);

source = source.replace(
  "if (json.success && json.data) setAiResult(json.data); else setAiError(json.error || 'Yemek taranamadı.');",
  "if (json.success && json.data) { setAiResult(json.data); setAiWarning(json.warning || null); } else setAiError(json.error || 'Yemek taranamadı.');"
);

source = source.replace(
  "setImagePreview(null); setAiResult(null);",
  "setImagePreview(null); setAiResult(null); setAiWarning(null);"
);

source = source.replace(
  "{aiError && <div className=\"p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2\"><AlertCircle className=\"w-4 h-4\" />{aiError}</div>}",
  "{aiError && <div className=\"p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2\"><AlertCircle className=\"w-4 h-4\" />{aiError}</div>}{aiWarning && <div className=\"p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200\">{aiWarning}</div>}"
);

source = source.replace(
  "<span className=\"text-[10px] font-bold text-emerald-400 uppercase\">AI Tespit Etti</span>",
  "<span className={`text-[10px] font-bold uppercase ${aiWarning ? 'text-amber-300' : 'text-emerald-400'}`}>{aiWarning ? 'Ücretsiz Yerel Tahmin' : 'AI Tespit Etti'}</span>"
);

source = source.replace("import { loadFoods } from '../utils/storage';", "import { loadFoods } from '../utils/storage';\n\n// FREE_AI_CLIENT_HARDENED");

fs.writeFileSync(file, source, 'utf8');
console.log('Free AI client hardening applied: original image MIME is sent and fallback status is visible to the user.');
