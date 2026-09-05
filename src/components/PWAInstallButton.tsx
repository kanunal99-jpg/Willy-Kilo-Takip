import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Apple, X, CheckCircle2, Share2, PlusSquare, Package } from 'lucide-react';
import { ApkExportModal } from './ApkExportModal';

interface PWAInstallProps {
  variant?: 'badge' | 'button' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallProps> = ({ variant = 'badge' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [showApkExport, setShowApkExport] = useState(false);

  const handleClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowApkExport(true);
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
          <span>APK / Yükle</span>
        </button>
      ) : variant === 'card' ? (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">APK & Mobil Kurulum</h4>
              <p className="text-xs text-slate-400">Android APK indirme ve iPhone Safari tam ekran desteği</p>
            </div>
          </div>
          <button
            onClick={() => setShowApkExport(true)}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition active:scale-95"
          >
            APK İndir
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowApkExport(true)}
          id="btn-pwa-install-main"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>APK İhracat / İndir</span>
        </button>
      )}

      {/* APK Export & Download Modal */}
      <ApkExportModal isOpen={showApkExport} onClose={() => setShowApkExport(false)} />
    </>
  );
};
