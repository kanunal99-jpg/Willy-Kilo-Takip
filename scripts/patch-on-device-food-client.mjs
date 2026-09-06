import fs from 'node:fs';

const file = 'src/components/AddFoodModal.tsx';
let source = fs.readFileSync(file, 'utf8');

if (!source.includes("from '../utils/onDeviceFoodVision'")) {
  source = source.replace("import { loadFoods } from '../utils/storage';", "import { loadFoods } from '../utils/storage';\nimport { analyzeFoodOnDevice } from '../utils/onDeviceFoodVision';");
}

const old = [
  '  const runAiAnalysis = async () => {',
  '    if (!imagePreview && !aiPromptNote) return;',
  '    setIsAnalyzing(true); setAiError(null);',
  '    try {',
  "      const res = await fetch('/api/ai/analyze-food', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: imagePreview, description: aiPromptNote, mealType: targetMeal }) });",
  '      const json = await res.json();',
  "      if (json.success && json.data) setAiResult(json.data); else setAiError(json.error || 'Yemek taranamadı.');",
  "    } catch { setAiError('Sunucu bağlantı hatası.'); } finally { setIsAnalyzing(false); }",
  '  };',
].join('\n');

const replacement = [
  '  const runAiAnalysis = async () => {',
  '    if (!imagePreview && !aiPromptNote) return;',
  '    setIsAnalyzing(true); setAiError(null);',
  '    try {',
  "      let visionNote = '';",
  '      if (imagePreview) {',
  "        const mimeType = imagePreview.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';",
  '        const onDevice = await analyzeFoodOnDevice(imagePreview, mimeType);',
  '        if (onDevice?.labels?.length) {',
  "          visionNote = 'On-device vision labels: ' + onDevice.labels.map(label => label.text + ' (' + Math.round(label.confidence * 100) + '%)').join(', ');",
  '        }',
  '      }',
  "      const description = [aiPromptNote.trim(), visionNote].filter(Boolean).join(' | ').slice(0, 500);",
  "      const res = await fetch('/api/ai/analyze-food', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: imagePreview, description, mealType: targetMeal }) });",
  '      const json = await res.json();',
  '      if (json.success && json.data) {',
  "        if (visionNote && json.provider === 'local') {",
  "          json.data.note = (json.data.note || '') + ' Cihaz içi ML Kit etiketleri: ' + visionNote.replace('On-device vision labels: ', '');",
  "          json.data.analysisMode = 'on-device-vision+local-nutrition';",
  '          json.data.visualAnalyzed = true;',
  '        }',
  '        setAiResult(json.data);',
  "      } else setAiError(json.error || 'Yemek taranamadı.');",
  "    } catch { setAiError('Yemek fotoğrafı analiz zinciri başarısız oldu.'); } finally { setIsAnalyzing(false); }",
  '  };',
].join('\n');

if (!source.includes('On-device vision labels:')) {
  if (!source.includes(old)) throw new Error('AddFoodModal AI analysis block not found; refusing unsafe patch');
  source = source.replace(old, replacement);
}

fs.writeFileSync(file, source, 'utf8');
console.log('On-device food vision client wiring PASS.');
