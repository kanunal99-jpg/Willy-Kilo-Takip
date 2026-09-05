import fs from 'node:fs';
import { parseStringPromise, Builder } from 'xml2js';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';

if (!fs.existsSync(manifestPath)) {
  throw new Error(`AndroidManifest.xml not found at ${manifestPath}`);
}

const xml = fs.readFileSync(manifestPath, 'utf8');
const manifest = await parseStringPromise(xml, { explicitArray: true });
const root = manifest.manifest;
const androidNs = 'http://schemas.android.com/apk/res/android';

if (!root) throw new Error('Invalid AndroidManifest.xml: missing manifest root');

root.$ ??= {};
root.$['xmlns:android'] ??= androidNs;
root['uses-permission'] ??= [];
root.application ??= [{ $: {} }];
root.application[0].$ ??= {};
root.application[0]['meta-data'] ??= [];

const permissions = root['uses-permission'];
if (!permissions.some((p) => p.$?.['android:name'] === 'android.permission.CAMERA')) {
  permissions.push({ $: { 'android:name': 'android.permission.CAMERA' } });
}

const metadata = root.application[0]['meta-data'];
const barcodeDependency = metadata.find(
  (m) => m.$?.['android:name'] === 'com.google.mlkit.vision.DEPENDENCIES',
);

if (barcodeDependency) {
  barcodeDependency.$['android:value'] = 'barcode_ui';
} else {
  metadata.push({
    $: {
      'android:name': 'com.google.mlkit.vision.DEPENDENCIES',
      'android:value': 'barcode_ui',
    },
  });
}

const builder = new Builder({ renderOpts: { pretty: true, indent: '   ', newline: '\n' } });
fs.writeFileSync(manifestPath, builder.buildObject(manifest) + '\n');

const finalXml = fs.readFileSync(manifestPath, 'utf8');
if (!finalXml.includes('android.permission.CAMERA')) {
  throw new Error('CAMERA permission verification failed');
}
if (!finalXml.includes('com.google.mlkit.vision.DEPENDENCIES') || !finalXml.includes('barcode_ui')) {
  throw new Error('ML Kit barcode_ui metadata verification failed');
}

console.log('Android barcode manifest PASS: CAMERA + barcode_ui declared.');
