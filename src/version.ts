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
  versionName: '1.0.22',
  versionCode: 23,
  releaseDate: '2026-09-07',
  minSupportedVersion: '1.0.3',
  apkUrl: 'https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases/download/v1.0.22/WillyKiloTakip-v1.0.22.apk',
  githubReleaseUrl: 'https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases/latest',
  releaseNotes: [
    'OTA güncelleme akışı Android cihazlarda sistem tarayıcısı/indirme yöneticisine yönlendirildi',
    'Uygulama içi sürüm bilgisi Android release sürümüyle hizalandı',
    'APK indirme bağlantısı sürüme özel imzalı release varlığına sabitlendi',
    'Önceki sürüm metadata uyuşmazlığı giderildi',
  ],
};
