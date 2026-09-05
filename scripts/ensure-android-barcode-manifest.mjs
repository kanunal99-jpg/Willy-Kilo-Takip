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

const dependencyName = 'com.google.mlkit.vision.DEPENDENCIES';
const escapedDependencyName = dependencyName.replace(/\./g, '\\.');
const metadataRegex = new RegExp(
  `<meta-data\\b[^>]*android:name=["']${escapedDependencyName}["'][^>]*/>`
);

if (metadataRegex.test(xml)) {
  xml = xml.replace(metadataRegex, (tag) => {
    if (/android:value=["']barcode_ui["']/.test(tag)) return tag;
    if (/android:value=["'][^"']*["']/.test(tag)) {
      return tag.replace(/android:value=["'][^"']*["']/, 'android:value="barcode_ui"');
    }
    return tag.replace(/\s*\/>$/, ' android:value="barcode_ui" />');
  });
} else {
  const applicationTag = xml.match(/<application\b[^>]*>/);
  if (!applicationTag || applicationTag.index === undefined) {
    throw new Error('Could not locate <application> in AndroidManifest.xml');
  }
  const insertAt = applicationTag.index + applicationTag[0].length;
  const metadata = '\n        <meta-data android:name="com.google.mlkit.vision.DEPENDENCIES" android:value="barcode_ui" />';
  xml = xml.slice(0, insertAt) + metadata + xml.slice(insertAt);
}

fs.writeFileSync(manifestPath, xml.endsWith('\n') ? xml : xml + '\n');

const finalXml = fs.readFileSync(manifestPath, 'utf8');
if (!/android:name=["']android\.permission\.CAMERA["']/.test(finalXml)) {
  throw new Error('CAMERA permission verification failed');
}
if (!finalXml.includes(`android:name="${dependencyName}"`) || !finalXml.includes('android:value="barcode_ui"')) {
  throw new Error('ML Kit barcode_ui metadata verification failed');
}

console.log('Android barcode manifest PASS: CAMERA + barcode_ui declared.');
