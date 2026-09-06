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
  versionName: '1.0.11',
  versionCode: 12,
  releaseDate: '2026-09-06',
  minSupportedVersion: '1.0.3',
  apkUrl: 'https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases/latest/download/WillyKiloTakip.apk',
  githubReleaseUrl: 'https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases/latest',
  releaseNotes: [
    'Yemek Tarifleri bölümüne Alkolsüz Tarifler filtresi eklendi',
    'Alkolsüz katalogda 7 hazır tarif ve detayları eklendi',
    'Alkolsüz tarifler çevrimdışı çalışacak şekilde yerel katalog olarak eklendi',
    'Mevcut AI Tarif Üret akışı ve tarif kataloğu korunur',
    'Üretim API ve ML Kit barkod kamera desteği korunur',
  ],
};
