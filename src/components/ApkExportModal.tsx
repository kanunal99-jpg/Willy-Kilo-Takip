import React, { useState } from 'react';
import { Download, Smartphone, Globe, ExternalLink, QrCode, Check, Copy, Package, ShieldCheck, X, Terminal, FileCode2, Play, RefreshCw } from 'lucide-react';
import { APP_VERSION } from '../version';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpdateModal?: () => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({ isOpen, onClose, onOpenUpdateModal }) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'pwabuilder' | 'webapk' | 'capacitor' | 'qr'>('terminal');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://willy-kilo-takip.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(currentUrl)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const terminalDevCommands = `# 1. Proje klasörüne girin:
cd willy-kilo-takip

# 2. Bağımlılıkları yükleyin:
npm install

# 3. Ortam değişkenini ayarlayın (Opsiyonel - AI için):
cp .env.example .env
# .env dosyasını açıp GEMINI_API_KEY ekleyebilirsiniz.

# 4. Geliştirme sunucusunu başlatın:
npm run dev

# Uygulama http://localhost:3000 adresinde anında açılır!`;

  const terminalBubblewrapCommands = `# Google'ın resmi Bubblewrap CLI aracı ile terminalden tek adımda APK derleme:
# 1. Bubblewrap CLI kurulumu (Node.js gerektirir):
npm install -g @bubblewrap/cli

# 2. Canlı manifest adresinizden projeyi başlatın:
npx @bubblewrap/cli init --manifest="${currentUrl}/manifest.webmanifest"

# 3. İmzalı APK'yı tek komutla oluşturun:
npx @bubblewrap/cli build

# Çıktı: Klasörünüzde doğrudan yüklenebilir 'app-release-signed.apk' üretilir!`;

  const capacitorCommands = `# Capacitor ile yerel Android Studio projesi oluşturup APK alma:
npm install @capacitor/core @capacitor/cli @capacitor/android

# Projeyi başlatın:
npx cap init "Willy Kilo Takip" com.willy.kilotakip --web-dir dist

# Android platformunu ekleyin:
npx cap add android

# Projeyi derleyin ve Android klasörüne kopyalayın:
npm run build
npx cap sync android

# Android Studio'yu açıp APK üretin (Build > Build APK):
npx cap open android`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}&bgcolor=0f172a&color=34d399&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-emerald-400">
                <Terminal className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Terminal Kurulum & APK Merkezi
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CLI & Android
                </span>
              </h3>
              <p className="text-xs text-slate-400">Projeyi bilgisayarınızda veya terminalde çalıştırma rehberi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live OTA & Direct APK Banner */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-slate-300 font-medium">
              Sürüm: <strong className="text-white">v{APP_VERSION.versionName}</strong> (Derleme: {APP_VERSION.versionCode})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenUpdateModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUpdateModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Güncellemeleri Kontrol Et</span>
              </button>
            )}

            <a
              href={APP_VERSION.apkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Resmi APK İndir</span>
            </a>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
              activeTab === 'terminal'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            💻 1. Terminal Kurulumu
          </button>

          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
              activeTab === 'pwabuilder'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ 2. Hızlı APK (PWABuilder)
          </button>

          <button
            onClick={() => setActiveTab('webapk')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
              activeTab === 'webapk'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📱 3. Doğrudan WebAPK
          </button>

          <button
            onClick={() => setActiveTab('capacitor')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
              activeTab === 'capacitor'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🛠️ 4. Terminalden APK Derleme
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
              activeTab === 'qr'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📷 5. QR Tara
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* TAB 1: TERMINAL KURULUMU */}
          {activeTab === 'terminal' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Terminal className="w-4 h-4" />
                    <span>Lokal Bilgisayarda Terminal Kurulum Adımları</span>
                  </div>
                  <button
                    onClick={() => copyText(terminalDevCommands, 'dev')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center gap-1 transition"
                  >
                    {copiedCode === 'dev' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'dev' ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  Projeyi sağ üst köşedeki menüden <strong>Export to ZIP</strong> ile bilgisayarınıza indirdikten sonra veya terminalinizde şu komutları sırayla çalıştırın:
                </p>

                <pre className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed select-all">
                  {terminalDevCommands}
                </pre>
              </div>

              {/* Requirements */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-white font-bold block">Sistem Gereksinimleri & Notlar:</span>
                <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                  <li><strong className="text-slate-200">Node.js:</strong> v18.0.0 veya üzeri (v20+ tavsiye edilir).</li>
                  <li><strong className="text-slate-200">Port:</strong> Uygulama varsayılan olarak <code className="text-cyan-400">http://localhost:3000</code> portunda başlar.</li>
                  <li><strong className="text-slate-200">Üretim Derlemesi:</strong> <code className="text-emerald-400">npm run build</code> komutu hem Vite frontend'i hem de Node backend'i tek tıkla derler.</li>
                  <li><strong className="text-slate-200">Üretim Başlatma:</strong> <code className="text-emerald-400">npm start</code> ile canlıya alınabilir.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: PWABUILDER */}
          {activeTab === 'pwabuilder' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Package className="w-4 h-4" />
                  <span>PWABuilder ile Doğrudan .APK Dosyası Üretin</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Willy Kilo Takip, tüm Android gereksinimlerini ve Manifest / Servis Çalışanı (Service Worker) standartlarını karşılamaktadır. <strong>PWABuilder</strong> resmi aracı ile tek tıkla imzalı <code>.apk</code> veya Google Play Store için <code>.aab</code> paketi indirebilirsiniz.
                </p>

                <div className="space-y-2 pt-1">
                  <label className="text-slate-400 block font-medium">Uygulamanızın Canlı URL Bağlantısı:</label>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-700">
                    <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="flex-1 font-mono text-cyan-300 truncate select-all">{currentUrl}</span>
                    <button
                      onClick={handleCopyUrl}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 transition"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUrl ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                </div>

                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition"
                >
                  <span>PWABuilder'da APK Oluştur & İndir</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-white font-bold block">Adım Adım APK İndirme:</span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
                  <li>Yukarıdaki butona tıklayarak PWABuilder'ı açın (URL'niz otomatik doldurulacaktır).</li>
                  <li>Sayfanın üstündeki <strong>"Package for Stores"</strong> veya <strong>"Android"</strong> sekmesine tıklayın.</li>
                  <li><strong>"Generate APK"</strong> butonuna basın; birkaç saniye içinde <code>Willy-Kilo-Takip.apk</code> cihazınıza inecektir.</li>
                  <li>İnen APK dosyasını Android telefonunuza kurup kullanmaya başlayın!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: WEBAPK */}
          {activeTab === 'webapk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>Google Chrome Otomatik WebAPK Teknolojisi</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Android cihazlarda Google Chrome ve Samsung Internet tarayıcıları, PWA uygulamalarını doğrudan işletim sistemi düzeyinde gerçek bir <strong>WebAPK</strong> paketine dönüştürür.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                    <p className="text-slate-300">
                      Android telefonunuzda Chrome tarayıcısını açıp bu uygulamanın bağlantısını açın.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                    <p className="text-slate-300">
                      Üst bardaki <strong>"APK İndir"</strong> butonuna veya tarayıcı menüsünden <strong>"Uygulamayı Yükle"</strong> seçeneğine dokunun.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                    <p className="text-slate-300">
                      Android Play Services telefonunuza yerel bir APK paketi kurar. Uygulama bildirim çekmecesinde, uygulama çekmecesinde ve ayarlar menüsünde bağımsız bir yerel Android uygulaması olarak çalışır!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TERMINAL APK BUILD (Bubblewrap & Capacitor) */}
          {activeTab === 'capacitor' && (
            <div className="space-y-4">
              {/* Option A: Bubblewrap CLI */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-900 border border-cyan-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Terminal className="w-4 h-4" />
                    <span>A) Google Bubblewrap CLI ile Tek Komutta APK</span>
                  </div>
                  <button
                    onClick={() => copyText(terminalBubblewrapCommands, 'bubblewrap')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center gap-1 transition"
                  >
                    {copiedCode === 'bubblewrap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'bubblewrap' ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
                <p className="text-slate-300">Android Studio kurmaya gerek kalmadan, doğrudan terminal üzerinden imzalı APK üretir:</p>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                  {terminalBubblewrapCommands}
                </pre>
              </div>

              {/* Option B: Capacitor CLI */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Package className="w-4 h-4" />
                    <span>B) Capacitor & Android Studio ile APK Derleme</span>
                  </div>
                  <button
                    onClick={() => copyText(capacitorCommands, 'capacitor')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center gap-1 transition"
                  >
                    {copiedCode === 'capacitor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'capacitor' ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {capacitorCommands}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: QR CODE */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-2">
              <div className="p-3 bg-slate-950 rounded-3xl border border-emerald-500/30 shadow-xl">
                <img
                  src={qrImageUrl}
                  alt="Willy Kilo Takip QR Code"
                  className="w-48 h-48 rounded-2xl object-contain"
                />
              </div>

              <div className="text-center max-w-sm">
                <h4 className="text-sm font-bold text-white mb-1">Telefonunuzun Kamerasıyla Tarayın</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Android veya iPhone kameranızı bu QR koda tutarak uygulamayı doğrudan telefonunuzda açabilir ve tek tıkla ana ekranınıza APK / PWA olarak yükleyebilirsiniz.
                </p>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300 font-mono select-all text-[11px]">{currentUrl}</span>
                <button
                  onClick={handleCopyUrl}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Kopyala"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Terminal & Node.js v18+ Uyumlu</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
