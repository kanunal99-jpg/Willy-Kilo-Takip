# Willy Kilo Takip 🍏🏋️

Willy Kilo Takip; modern React 19, TypeScript, Tailwind CSS ve Node.js Express ile geliştirilmiş, aralıklı oruç takipçisi, yapay zeka destekli yemek analizi ve kalori günlüğü uygulamasıdır.

---

## 💻 Terminal Kurulum Adımları (Geliştirme Ortamı)

### 1. Gereksinimler
- **Node.js**: v18.0.0 veya üzeri (`node -v` ile kontrol edebilirsiniz)
- **npm**: v9.0.0 veya üzeri (`npm -v`)

### 2. Bağımlılıkları Yükleme
Terminalinizi açıp proje klasörüne gidin ve paketleri kurun:
```bash
npm install
```

### 3. Ortam Değişkeni (.env) Ayarı (Opsiyonel)
Yapay Zeka (Gemini) beslenme koçu ve fotoğraf tarama özelliklerini aktifleştirmek için `.env.example` dosyasını `.env` olarak kopyalayın:
```bash
cp .env.example .env
```
Ardından `.env` dosyasını açıp Google AI Studio API anahtarınızı ekleyin:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Geliştirme Sunucusunu Başlatma
```bash
npm run dev
```
Sunucu başladığında tarayıcınızda şu adresi açın:
👉 **`http://localhost:3000`**

---

## 🚀 Üretim (Production) Derlemesi ve Çalıştırma

Projeyi canlı sunucuda veya Docker/Cloud Run konteynerinde çalıştırmak için:

```bash
# 1. Frontend ve Backend'i tek komutla derleyin:
npm run build

# 2. Üretim sunucusunu başlatın:
npm start
```

---

## 📱 Terminalden Doğrudan Android APK Üretme

### Yöntem A: Google Bubblewrap CLI (En Hızlı)
Android Studio kurmadan doğrudan terminal üzerinden imzalı `.apk` dosyası üretmek için:

```bash
# 1. Bubblewrap CLI aracını küresel olarak yükleyin:
npm install -g @bubblewrap/cli

# 2. Canlı uygulamanızın manifest dosyasıyla projeyi oluşturun:
bubblewrap init --manifest="https://ais-dev-dvnvts6sqeqpm2rx53m2ma-627591680405.europe-west2.run.app/manifest.webmanifest"

# 3. İmzalı APK'yı derleyin:
bubblewrap build
```
Bu işlem sonunda bulunduğunuz dizinde doğrudan Android cihazlara yüklenebilir `app-release-signed.apk` dosyası oluşur.

---

### Yöntem B: Capacitor & Android Studio ile APK Derleme

```bash
# 1. Capacitor paketlerini yükleyin:
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Capacitor'ı başlatın:
npx cap init "Willy Kilo Takip" com.willy.kilotakip --web-dir dist

# 3. Android platform klasörünü ekleyin:
npx cap add android

# 4. Projeyi derleyip Android'e aktarın:
npm run build
npx cap sync android

# 5. Android Studio'yu açıp APK üretin:
npx cap open android
```
Android Studio açıldığında menüden **Build > Build Bundle(s) / APK(s) > Build APK(s)** seçeneğine basarak APK dosyanızı elde edebilirsiniz.

---

## 🛠️ Komut Özeti

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusunu başlatır (Vite + Express) |
| `npm run build` | Hem frontend hem sunucu kodunu `dist/` klasörüne derler |
| `npm start` | Derlenmiş üretim sunucusunu çalıştırır |
| `npm run lint` | TypeScript tip kontrollerini gerçekleştirir |
