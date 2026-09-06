import fs from 'node:fs';
const file = 'src/components/AddFoodModal.tsx';
let source = fs.readFileSync(file, 'utf8');
if (!source.includes("/api/products/barcode/")) {
  const old = /  const handleBarcodeLookup = \(code: string\) => \{[\s\S]*?\n  \};/;
  const replacement = [
    '  const handleBarcodeLookup = async (code: string) => {',
    '    const normalizedCode = code.trim().replace(/\\D/g, "");',
    '    if (!normalizedCode) return;',
    '    setBarcodeError(null);',
    '    try {',
    "      const local = foodDatabase.find(f => f.barcode === normalizedCode);",
    '      if (local) { setBarcodeResult(local); return; }',
    "      const response = await fetch('/api/products/barcode/' + encodeURIComponent(normalizedCode));",
    '      const json = await response.json();',
    '      if (json.success && json.found && json.data) {',
    '        setBarcodeResult(json.data);',
    '        return;',
    '      }',
    "      setBarcodeError('Bu barkod katalogda bulunamadı. Ürünü manuel olarak ekleyin; doğrulanmamış kalori tahmini kullanılmayacak.');",
    '      setBarcodeResult(null);',
    '    } catch {',
    "      setBarcodeError('Ürün kataloğuna erişilemedi. İnternet yoksa yerel katalogdaki ürünler yine çalışır.');",
    '      setBarcodeResult(null);',
    '    }',
    '  };',
  ].join('\n');
  if (!old.test(source)) throw new Error('barcode handler not found; refusing unsafe patch');
  source = source.replace(old, replacement);
  source = source.replace('handleBarcodeLookup(value);', 'void handleBarcodeLookup(value);');
}
fs.writeFileSync(file, source, 'utf8');
console.log('Packaged product barcode client PASS.');
