import fs from 'node:fs';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';

if (!fs.existsSync(manifestPath)) {
  throw new Error(`AndroidManifest.xml not found at ${manifestPath}`);
}

let xml = fs.readFileSync(manifestPath, 'utf8');

if (!/android:name=["']android\.permission\.CAMERA["']/.test(xml)) {
  const manifestOpen = xml.match(/<manifest\b[^>]*>/);
  if (!manifestOpen || manifestOpen.index === undefined) {
    throw new Error('Could not locate <manifest> in AndroidManifest.xml');
  }
  const insertAt = manifestOpen.index + manifestOpen[0].length;
  const permission = '\n    <uses-permission android:name="android.permission.CAMERA" />';
  xml = xml.slice(0, insertAt) + permission + xml.slice(insertAt);
}

// Remove every existing ML Kit dependency declaration, including ones injected by
// Capacitor/ML Kit, then add exactly one deterministic barcode_ui declaration.
const metadataRegex = /\s*<meta-data\b[^>]*android:name=["']com\.google\.mlkit\.vision\.DEPENDENCIES["'][^>]*\/?>/g;
xml = xml.replace(metadataRegex, '');

const applicationTag = xml.match(/<application\b[^>]*>/);
if (!applicationTag || applicationTag.index === undefined) {
  throw new Error('Could not locate <application> in AndroidManifest.xml');
}
const insertAt = applicationTag.index + applicationTag[0].length;
const metadata = '\n        <meta-data android:name="com.google.mlkit.vision.DEPENDENCIES" android:value="barcode_ui" />';
xml = xml.slice(0, insertAt) + metadata + xml.slice(insertAt);

fs.writeFileSync(manifestPath, xml.endsWith('\n') ? xml : xml + '\n');

const finalXml = fs.readFileSync(manifestPath, 'utf8');
const cameraCount = (finalXml.match(/android:name=["']android\.permission\.CAMERA["']/g) || []).length;
const metadataCount = (finalXml.match(/android:name=["']com\.google\.mlkit\.vision\.DEPENDENCIES["']/g) || []).length;
if (cameraCount < 1) throw new Error('CAMERA permission verification failed');
if (metadataCount !== 1 || !finalXml.includes('android:value="barcode_ui"')) {
  throw new Error(`ML Kit barcode_ui metadata verification failed: expected 1 declaration, found ${metadataCount}`);
}

console.log(`Android barcode manifest PASS: CAMERA + exactly one barcode_ui declaration (camera=${cameraCount}, metadata=${metadataCount}).`);
