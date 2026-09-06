import fs from 'node:fs';
import path from 'node:path';

const gradlePath = 'android/app/build.gradle';
const mainActivityPath = 'android/app/src/main/java/com/willy/kilotakip/MainActivity.java';
const manifestPath = 'android/app/src/main/AndroidManifest.xml';
const pluginDir = 'android/app/src/main/java/com/willy/kilotakip/foodvision';

if (!fs.existsSync(gradlePath)) throw new Error('Android project not generated');

let gradle = fs.readFileSync(gradlePath, 'utf8');
if (!gradle.includes("com.google.mlkit:image-labeling:17.0.9")) {
  const marker = 'dependencies {';
  if (!gradle.includes(marker)) throw new Error('Gradle dependencies block not found');
  gradle = gradle.replace(marker, `${marker}\n    implementation 'com.google.mlkit:image-labeling:17.0.9'`);
  fs.writeFileSync(gradlePath, gradle);
}

fs.mkdirSync(pluginDir, { recursive: true });
const pluginJava = `package com.willy.kilotakip.foodvision;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.label.ImageLabel;
import com.google.mlkit.vision.label.ImageLabeler;
import com.google.mlkit.vision.label.ImageLabeling;
import com.google.mlkit.vision.label.defaults.ImageLabelerOptions;

import java.util.List;

@CapacitorPlugin(name = "OnDeviceFoodVision")
public class OnDeviceFoodVisionPlugin extends Plugin {
    @PluginMethod
    public void processImage(PluginCall call) {
        String raw = call.getString("imageBase64", "");
        if (raw.isEmpty()) { call.reject("imageBase64 is required"); return; }
        try {
            String encoded = raw.contains(",") ? raw.substring(raw.indexOf(',') + 1) : raw;
            byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
            if (bitmap == null) { call.reject("Could not decode image"); return; }
            InputImage image = InputImage.fromBitmap(bitmap, 0);
            ImageLabelerOptions options = ImageLabelerOptions.DEFAULT_OPTIONS;
            ImageLabeler labeler = ImageLabeling.getClient(options);
            labeler.process(image)
                    .addOnSuccessListener(labels -> resolve(call, labels))
                    .addOnFailureListener(error -> call.reject("ML Kit image labeling failed", error));
        } catch (Exception error) {
            call.reject("On-device image analysis failed", error);
        }
    }

    private void resolve(PluginCall call, List<ImageLabel> labels) {
        JSArray result = new JSArray();
        for (ImageLabel label : labels) {
            JSObject item = new JSObject();
            item.put("text", label.getText());
            item.put("confidence", label.getConfidence());
            item.put("index", label.getIndex());
            result.put(item);
        }
        JSObject out = new JSObject();
        out.put("labels", result);
        out.put("onDevice", true);
        out.put("model", "ML Kit bundled image-labeling 17.0.9");
        call.resolve(out);
    }
}
`;
fs.writeFileSync(path.join(pluginDir, 'OnDeviceFoodVisionPlugin.java'), pluginJava);

if (!fs.existsSync(mainActivityPath)) throw new Error(`MainActivity not found: ${mainActivityPath}`);
let mainActivity = fs.readFileSync(mainActivityPath, 'utf8');
if (!mainActivity.includes('OnDeviceFoodVisionPlugin')) {
  mainActivity = mainActivity.replace(/^(package [^;]+;\n)/, `$1\nimport com.willy.kilotakip.foodvision.OnDeviceFoodVisionPlugin;\n`);
  const classMarker = 'public class MainActivity extends BridgeActivity {';
  if (!mainActivity.includes(classMarker)) throw new Error('Unexpected MainActivity shape');
  mainActivity = mainActivity.replace(classMarker, `${classMarker}\n    @Override\n    public void onCreate(android.os.Bundle savedInstanceState) {\n        registerPlugin(OnDeviceFoodVisionPlugin.class);\n        super.onCreate(savedInstanceState);\n    }`);
  fs.writeFileSync(mainActivityPath, mainActivity);
}

if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  if (!manifest.includes('android.permission.CAMERA')) {
    if (!manifest.includes('xmlns:android=')) {
      manifest = manifest.replace('<manifest', '<manifest xmlns:android="http://schemas.android.com/apk/res/android"');
    }
    manifest = manifest.replace('>\n', '>\n    <uses-permission android:name="android.permission.CAMERA" />\n', 1);
    fs.writeFileSync(manifestPath, manifest);
  }
}

console.log('On-device ML Kit food vision bridge PASS.');
