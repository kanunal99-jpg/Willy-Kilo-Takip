import fs from 'node:fs';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';

if (!fs.existsSync(manifestPath)) {
  throw new Error(`AndroidManifest.xml not found at ${manifestPath}`);
}

let xml = fs.readFileSync(manifestPath, 'utf8');

if (!/android:name=["']android\.permission\.CAMERA["']/.test(xml)) {
  const usesSdk = xml.match(/\s*<uses-sdk\b[^>]*\/?>/);
  const permission = '    <uses-permission android:name="android.permission.CAMERA" />\n';
  if (usesSdk?.index !== undefined) {
    xml = xml.slice(0, usesSdk.index) + permission + xml.slice(usesSdk.index);
  } else {
    const manifestEnd = xml.indexOf('>') + 1;
    xml = xml.slice(0, manifestEnd) + '\n' + permission + xml.slice(manifestEnd);
  }
}

const dependencyName = 'com.google.mlkit.vision.DEPENDENCIES';
const metadataRegex = new RegExp(
  `<meta-data\\b[^>]*android:name=["']${dependencyName.replace(/\./g, '\\.') }["'][^>]*/>`
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
