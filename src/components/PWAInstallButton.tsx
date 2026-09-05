import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Apple, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';

interface PWAInstallProps {
  variant?: 'badge' | 'button' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallProps> = ({ variant = 'badge' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed and running standalone
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Uygulama Yüklü</span>
      </div>
    );
  }

  const handleClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {variant === 'badge' ? (
        <button
          onClick={handleClick}
          id="btn-pwa-install-badge"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          title="Uygulamayı APK veya iOS olarak yükle"
        >
          <Download className="w-3.5 h-3.5" />
          <span>APK / Uygulamayı Yükle</span>
        </button>
      ) : variant === 'card' ? (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Telefona Uygulama Olarak Kur</h4>
              <p className="text-xs text-slate-400">Android APK ve iPhone Safari tam ekran desteği</p>
            </div>
          </div>
          <button
            onClick={handleClick}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition active:scale-95"
          >
            Yükle
          </button>
        </div>
      ) : (
        <button
          onClick={handleClick}
          id="btn-pwa-install-main"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Telefona Yükle (APK / Safari)</span>
        </button>
      )}

      {/* Guide Modal for iOS Safari & Android instructions */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 flex items-center justify-center">
                <img src="/icon.svg" alt="Willy" className="w-full h-full rounded-[14px]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Willy Kilo Takip Kurulumu</h3>
                <p className="text-xs text-emerald-400">Android APK & Apple Safari Uyumlu PWA</p>
              </div>
            </div>

            <div className="space-y-4 my-4">
              {/* iOS Safari instructions */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                  <Apple className="w-4 h-4 text-emerald-400" />
                  <span>iPhone / iPad (Apple Safari):</span>
                </div>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1">
                  <li className="leading-relaxed">
                    Safari alt çubuğundaki <span className="inline-flex items-center gap-1 font-semibold text-white"><Share2 className="w-3.5 h-3.5 text-blue-400" /> Paylaş</span> butonuna dokunun.
                  </li>
                  <li className="leading-relaxed">
                    Açılan menüde aşağı kaydırıp <span className="inline-flex items-center gap-1 font-semibold text-emerald-400"><PlusSquare className="w-3.5 h-3.5" /> Ana Ekrana Ekle</span> seçeneğine basın.
                  </li>
                  <li className="leading-relaxed">
                    Sağ üstteki <strong className="text-white">"Ekle"</strong> düğmesine dokunun. Willy tam bir iOS uygulaması olarak açılacaktır!
                  </li>
                </ol>
              </div>

              {/* Android instructions */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Android (Chrome / Samsung Internet):</span>
                </div>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1">
                  <li className="leading-relaxed">
                    Chrome sağ üstündeki <strong className="text-white">üç noktaya (⋮)</strong> dokunun.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-cyan-400">"Uygulamayı Yükle"</strong> veya <strong className="text-cyan-400">"Ana Ekrana Ekle"</strong> seçeneğini seçin.
                  </li>
                  <li className="leading-relaxed">
                    Willy doğrudan ana ekranınızda bağımsız APK / WebApp olarak çalışmaya başlar.
                  </li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition"
            >
              Anladım, Harika!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
