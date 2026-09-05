export interface AppVersionInfo {
  versionName: string;
  versionCode: number;
  releaseDate: string;
  minSupportedVersion: string;
  apkUrl: string;
  githubReleaseUrl: string;
  releaseNotes: string[];
}

export const APP_VERSION: AppVersionInfo = {
  versionName: '1.0.5',
  versionCode: 6,
  releaseDate: '2026-09-05',
  minSupportedVersion: '1.0.3',
  apkUrl: 'https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases/latest/download/WillyKiloTakip.apk',
  githubReleaseUrl: 'https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases/latest',
  releaseNotes: [
    "Android native AI requests now use Capacitor's bundled native HTTP transport",
    'WebView CORS/origin restriction is bypassed for the production Render API',
    'Gerçek Gemini AI Koçu için APK → Render → Gemini bağlantısı düzeltildi',
    'Kalıcı release imzası ile OTA güncelleme zinciri korunuyor',
  ],
};