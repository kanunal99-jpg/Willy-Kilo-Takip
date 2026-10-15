# Willy-Kilo-Takip — KANITLI TEKNİK DENETİM

**Tarih:** 15.10.2026  
**Kapsam:** GitHub dosya ağacı, seçili kaynak kodları, CI logları, Releases. Bu belge gerçek cihaz uçtan uca testi yerine geçmez.  
**Dosya sayısı (denetim anında):** 94  
**CI gözlemi:** 15.10.2026 Production AI Smoke başarısız; Android build upstream AI quality gate'te başarısız.  
**Anayasa:** [PROJE_ANAYASASI_VE_DUZELTILECEKLER.md](https://github.com/kanunal99-jpg/Willy-Kilo-Takip/blob/main/PROJE_ANAYASASI_VE_DUZELTILECEKLER.md)

## Kanıtlarla Düzeltilmesi Gerekenler

### 1. Gerçek Gemini testi yerel fallback alıyor — P0 (DOĞRULANMIŞ ÜRETİM TEST HATASI)
- **Dosya/kanıt:** [.github/workflows/production-ai-smoke.yml#L49-L69](https://github.com/kanunal99-jpg/Willy-Kilo-Takip/blob/main/.github/workflows/production-ai-smoke.yml#L49-L69); [CI koşusu](https://github.com/kanunal99-jpg/Willy-Kilo-Takip/actions/runs/38673145656)
- **Gözlem:** E2E test provider=gemini, fallback=false bekliyor; canlı test 'provider=local; deterministic-free-fallback' yanıtı aldı ve hata verdi.
- **Somut örnek / etkisi:** Dört farklı koç sorusunda gerçek Gemini yanıtının geldiği kanıtlanamadı.
- **Düzeltme öncesi kabul kriteri:** Render deploy commit, anahtar/kota, model, endpoint ve hata kodu ayrı kontrol edilip AI=gerçek ve fallback=yerel için farklı iki smoke; ücretli kaynak artırımı onaysız yok.
- **Durum:** ARAŞTIRILDI — henüz kaynak kod düzeltmesi veya cihaz testi yapılmadı.

### 2. Android yayın kalite kapısında duruyor — P0 (DOĞRULANMIŞ RELEASE BLOKAJI)
- **Dosya/kanıt:** [actions/runs/38673145671](https://github.com/kanunal99-jpg/Willy-Kilo-Takip/actions/runs/38673145671); [CI koşusu](https://github.com/kanunal99-jpg/Willy-Kilo-Takip/actions/runs/38673145656)
- **Gözlem:** 15.10.2026 build-and-release işi 'Verify upstream AI quality gate' aşamasında başarısız.
- **Somut örnek / etkisi:** Yeni doc commit'i için bile APK Release oluşmuyor.
- **Düzeltme öncesi kabul kriteri:** AI smoke sağlanmalı, değişiklik bazlı release üretimi tekrar başarılı olmalı.
- **Durum:** ARAŞTIRILDI — henüz kaynak kod düzeltmesi veya cihaz testi yapılmadı.

### 3. OTA sürüm dosyası ve indirilebilir sürümler tutarsız olabilir — P1 (KAYNAK KODU / SÜRÜM UYUŞMAZLIĞI)
- **Dosya/kanıt:** [version.json#L2-L7](https://github.com/kanunal99-jpg/Willy-Kilo-Takip/blob/main/version.json#L2-L7); [CI koşusu](https://github.com/kanunal99-jpg/Willy-Kilo-Takip/actions/runs/38673145656)
- **Gözlem:** version.json v1.0.23 ve v1.0.23 APK URL'sini gösteriyor; ilk Releases kontrolünde son listelenen sürüm v1.0.22 idi.
- **Somut örnek / etkisi:** Uygulama 'güncelle' deyip var olmayan APK'ya gönderebilir.
- **Düzeltme öncesi kabul kriteri:** GitHub Release v1.0.23 asset URL'sini ayrıca doğrula; versionCode/versionName ve SHA tutarlılığı için test ekle.
- **Durum:** ARAŞTIRILDI — henüz kaynak kod düzeltmesi veya cihaz testi yapılmadı.

### 4. Senkronizasyon anahtarı ve sağlık profilinin erişim modeli — P1 (GÜVENLİK TEST GEREK)
- **Dosya/kanıt:** [server.ts#L85-L103](https://github.com/kanunal99-jpg/Willy-Kilo-Takip/blob/main/server.ts#L85-L103); [CI koşusu](https://github.com/kanunal99-jpg/Willy-Kilo-Takip/actions/runs/38673145656)
- **Gözlem:** Bulut eşitleme userId/sync anahtarı biçimine göre kabul ediliyor; yetkilendirme ve erişim sınırları derin test istiyor.
- **Somut örnek / etkisi:** Başka bir cihaz aynı ID ile kayıt okumaya çalıştığında nasıl reddedildiğini ölç.
- **Düzeltme öncesi kabul kriteri:** Rate-limit, tahmin edilebilir kod riski, auth, yetkisiz okuma/yazma ve kişisel veri silme testleri.
- **Durum:** ARAŞTIRILDI — henüz kaynak kod düzeltmesi veya cihaz testi yapılmadı.

### 5. Görsel analiz fallback sonucu gerçek görüntü teşhisi değildir — P2 (DOĞRULUK RİSKİ)
- **Dosya/kanıt:** [server.ts#L218-L247](https://github.com/kanunal99-jpg/Willy-Kilo-Takip/blob/main/server.ts#L218-L247); [CI koşusu](https://github.com/kanunal99-jpg/Willy-Kilo-Takip/actions/runs/38673145656)
- **Gözlem:** Yerel beslenme tahmini yalnızca açıklama metnini/öğün tipini kullanabilir ve visualAnalyzed=false döndürmelidir.
- **Somut örnek / etkisi:** Sadece resim yükleyip kota yokken modelin görüntü analiz ettiğini ima etmemeli.
- **Düzeltme öncesi kabul kriteri:** Kaynak/analiz modu UI etiketleri, kalori tahmini belirsizliği ve barkod veri birimi testleri.
- **Durum:** ARAŞTIRILDI — henüz kaynak kod düzeltmesi veya cihaz testi yapılmadı.

## 4 Fazlı Geliştirme ve Doğrulama Kapıları

1. **Faz 1 — Araştır:** Tam modül/dosya ve bağımlılık envanteri, doğrulanmış/farklılaşmış hatalar, etki analizi. **Bu rapor ilk kaynak/CI kanıtıdır; bütün işlevlerin çalıştığını iddia etmez.**
2. **Faz 2 — Düzelt:** Önce P0/P1, en küçük güvenli kod değişimi, gizli anahtar/ücret/erişim izinlerini güvenli yöntemlerle ele al.
3. **Faz 3 — Uygulama ve test:** Unit, integrasyon, UI, offline, yetki reddi, yanlış veri, servis kesintisi, gerçek fallback, CI + Android gerçek cihaz varsa.
4. **Faz 4 — Yayın:** CI yeşil → Android ise SHA-256'lı indirilebilir Release APK → kullanıcı akışları smoke → kanıt linkleri.

## Kapatma Kriteri
Her bulgu için issue veya değişiklik ID'si, önce/sonra kanıtı, ilgili satır, test raporu, CI koşu bağlantısı, release/dağıtım bağlantısı, sonuç tarihi zorunludur. **Yalnızca belgenin eklenmiş olması sorun giderildi anlamına gelmez.**
