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
  versionName: '1.0.6',
  versionCode: 7,
  releaseDate: '2026-09-05',
  minSupportedVersion: '1.0.3',
  apkUrl: 'https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases/latest/download/WillyKiloTakip.apk',
  githubReleaseUrl: 'https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases/latest',
  releaseNotes: [
    "Android native AI requests use Capacitor's bundled native HTTP transport",
    'Production Render API bağlantısı ve gerçek Gemini AI Koçu güçlendirildi',
    'Bulut senkronizasyon anahtarları yeni cihazlarda yüksek entropili hale getirildi',
    'Bulut senkronizasyonu için istek hız sınırlaması ve veri doğrulaması eklendi',
    'Senkronizasyon JSON yazımları atomik hale getirildi',
    'Kalıcı release imzası ile OTA güncelleme zinciri korunuyor',
  ],
};