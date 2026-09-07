import fs from 'node:fs';

const file = 'server.ts';
let source = fs.readFileSync(file, 'utf8');

if (source.includes('// COACH_RESILIENCE_PATCH_V2')) {
  console.log('Coach resilience patch already applied.');
  process.exit(0);
}

const marker = "app.post('/api/ai/coach', async (req, res) => {";
if (!source.includes(marker)) throw new Error('coach route anchor not found');

const cursorAnchor = "let aiClient: GoogleGenAI | null = null;";
if (!source.includes(cursorAnchor)) throw new Error('AI client anchor not found');
source = source.replace(cursorAnchor, `${cursorAnchor}\nlet coachModelCursor = 0; // COACH_RESILIENCE_PATCH_V2`);

const oldStart = "      for (let round = 0; round < 2; round++) {\n        for (const model of models) {";
const oldEnd = "      if (!hasOpenAI() && lastError) throw lastError;";
const start = source.indexOf(oldStart);
const end = source.indexOf(oldEnd, start);
if (start < 0 || end < 0) throw new Error('existing coach retry block not found');

const replacement = `      const startIndex = coachModelCursor++ % models.length;\n      const orderedModels = [...models.slice(startIndex), ...models.slice(0, startIndex)];\n      let transientRetry = false;\n      for (const model of orderedModels) {\n        try {\n          const response = await ai.models.generateContent({ model, contents: systemPrompt });\n          const reply = String(response.text || '').trim();\n          if (!reply) throw new Error('Gemini boş yanıt döndürdü.');\n          console.log(\`AI Coach success provider=gemini model=\${model} durationMs=\${Date.now() - startedAt}\`);\n          return res.json({ success: true, reply, model, provider: 'gemini', fallback: false });\n        } catch (err: any) {\n          lastError = err;\n          const quotaError = isGeminiQuotaError(err);\n          const transient503 = /(?:\\b503\\b|service unavailable|high demand|temporarily unavailable)/i.test(String(err?.message || err));\n          console.error(\`AI Coach Gemini model=\${model} failed\${quotaError ? ' (quota/billing)' : ''}:\`, err?.message || err);\n          // 429 quota errors are model/project rate-limit signals: do not hammer the same quota with immediate retries.\n          // Rotate to the next model. A single delayed retry is reserved for transient 503/high-demand failures.\n          if (transient503 && !quotaError && !transientRetry) {\n            transientRetry = true;\n            await new Promise((resolve) => setTimeout(resolve, 1500));\n          }\n        }\n      }\n      if (transientRetry) {\n        for (const model of orderedModels) {\n          try {\n            const response = await ai.models.generateContent({ model, contents: systemPrompt });\n            const reply = String(response.text || '').trim();\n            if (!reply) throw new Error('Gemini boş yanıt döndürdü.');\n            console.log(\`AI Coach success provider=gemini model=\${model} retry=503 durationMs=\${Date.now() - startedAt}\`);\n            return res.json({ success: true, reply, model, provider: 'gemini', fallback: false });\n          } catch (err: any) {\n            lastError = err;\n            console.error(\`AI Coach Gemini retry model=\${model} failed\${isGeminiQuotaError(err) ? ' (quota/billing)' : ''}:\`, err?.message || err);\n          }\n        }\n      }\n`;
source = source.slice(0, start) + replacement + source.slice(end);
fs.writeFileSync(file, source, 'utf8');
console.log('Coach resilience patch applied.');
