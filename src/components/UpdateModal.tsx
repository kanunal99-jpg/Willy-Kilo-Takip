import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, Download, AlertCircle, Sparkles, ExternalLink, ShieldCheck, ArrowUpCircle } from 'lucide-react';
import { APP_VERSION } from '../version';

interface UpdateManifestResponse {
  success: boolean;
  versionName: string;
  versionCode: number;
  releaseDate: string;
  releaseNotes: string[] | string;
  apkUrl: string;
  githubReleaseUrl: string;
  mandatory: boolean;
  hasUpdate: boolean;
  checkedAt?: string;
  error?: string;
}

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCheckOnOpen?: boolean;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, autoCheckOnOpen = true }) => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'up_to_date' | 'update_available' | 'error'>('idle');
  const [updateData, setUpdateData] = useState<UpdateManifestResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const checkForUpdates = async () => {
    setStatus('checking');
    setErrorMessage('');
    setDownloadSuccess(false);
    try {
      const query = new URLSearchParams({ currentVersion: APP_VERSION.versionName, currentCode: String(APP_VERSION.versionCode) });
      const response = await fetch(`/api/app-version?${query.toString()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Güncelleme sunucusundan yanıt alınamadı (HTTP ${response.status})`);
      const data: UpdateManifestResponse = await response.json();
      if (!data.success || !data.apkUrl) throw new Error(data.error || 'Geçersiz güncelleme manifesti.');
      setUpdateData(data);
      setStatus(data.hasUpdate ? 'update_available' : 'up_to_date');
    } catch (err: any) {
      console.error('Update check failed:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Güncelleme kontrolü sırasında bir hata oluştu.');
    }
  };

  useEffect(() => {
    if (isOpen && autoCheckOnOpen) checkForUpdates();
  }, [isOpen, autoCheckOnOpen]);

  if (!isOpen) return null;

  const handleStartUpdate = () => {
    if (!updateData?.apkUrl) return;
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      // GitHub's release asset is intentionally opened directly. Android can then
      // hand the APK to its Download Manager / package installer.
      const opened = window.open(updateData.apkUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        const link = document.createElement('a');
        link.href = updateData.apkUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Download start error:', err);
      setErrorMessage('APK indirme ekranı açılamadı. Sürüm geçmişinden APK dosyasını açmayı deneyin.');
      setStatus('error');
    } finally {
      setTimeout(() => setIsDownloading(false), 1500);
    }
  };

  const parseReleaseNotes = (notes: string[] | string | undefined): string[] => {
    if (!notes) return ['Genel kararlılık ve performans iyileştirmeleri'];
    if (Array.isArray(notes)) return notes;
    return notes.split('\n').map(l => l.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><RefreshCw className={`w-5 h-5 ${status === 'checking' ? 'animate-spin text-cyan-400' : ''}`} /></div><div><h3 className="text-base font-bold text-white">Yazılım Güncellemesi</h3><p className="text-xs text-slate-400">OTA Canlı Güncelleme Sistemi</p></div></div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between"><div><span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Yüklü Sürüm</span><span className="text-sm font-bold text-white">v{APP_VERSION.versionName}</span><span className="text-xs text-slate-500 ml-2">(Kod: {APP_VERSION.versionCode})</span></div><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-emerald-400 border border-slate-700">Aktif</span></div>

          {status === 'checking' && <div className="py-8 text-center space-y-3"><div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse"><RefreshCw className="w-7 h-7 animate-spin" /></div><h4 className="text-sm font-bold text-white">Güncellemeler Taranıyor...</h4><p className="text-xs text-slate-400 max-w-xs mx-auto">Canlı sunucu manifesti ve GitHub Release üzerinden en son sürüm doğrulanıyor.</p></div>}

          {status === 'up_to_date' && <div className="space-y-4"><div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2"><div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400"><CheckCircle2 className="w-6 h-6" /></div><h4 className="text-sm font-bold text-emerald-300">✓ Uygulamanız Güncel!</h4><p className="text-xs text-slate-300">Willy Kilo Takip en son kararlı sürümde (v{APP_VERSION.versionName}) çalışıyor.</p></div><div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs"><div className="flex justify-between text-slate-400"><span>Yayın Tarihi:</span><span className="text-slate-200 font-medium">{updateData?.releaseDate || APP_VERSION.releaseDate}</span></div><div className="flex justify-between text-slate-400"><span>Kontrol Zamanı:</span><span className="text-slate-200 font-medium">Az önce</span></div></div></div>}

          {status === 'update_available' && updateData && <div className="space-y-4"><div className="bg-gradient-to-br from-cyan-950/50 to-emerald-950/30 border border-cyan-500/40 rounded-2xl p-4 space-y-3"><div className="flex items-center justify-between"><span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Yeni Sürüm Mevcut!</span><span className="text-xs text-slate-400">{updateData.releaseDate}</span></div><div className="flex items-center justify-between pt-1"><div><span className="text-xs text-slate-400">Mevcut:</span><span className="text-sm font-bold text-slate-300 ml-1">v{APP_VERSION.versionName}</span></div><div className="text-cyan-400 font-bold">→</div><div><span className="text-xs text-emerald-400 font-semibold">Yeni Sürüm:</span><span className="text-base font-extrabold text-emerald-300 ml-1">v{updateData.versionName}</span></div></div></div><div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5"><h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"><ArrowUpCircle className="w-4 h-4 text-cyan-400" />Değişiklikler & Yenilikler:</h5><ul className="space-y-1.5 text-xs text-slate-300">{parseReleaseNotes(updateData.releaseNotes).map((note, index) => <li key={index} className="flex items-start gap-2"><span className="text-emerald-400 font-bold mt-0.5">•</span><span>{note}</span></li>)}</ul></div><div className="space-y-2"><button onClick={handleStartUpdate} disabled={isDownloading} className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition disabled:opacity-50 cursor-pointer">{isDownloading ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Güncelleme ekranı açılıyor...</span></> : <><Download className="w-4 h-4" /><span>Hemen Güncelle (APK İndir)</span></>}</button>{downloadSuccess && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-fadeIn"><ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" /><span>APK indirme başlatıldı. Android indirme tamamlandığında APK'yı açıp yüklemeyi onaylayın.</span></div>}</div></div>}

          {status === 'error' && <div className="space-y-4"><div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-center space-y-2"><div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/20 text-rose-400"><AlertCircle className="w-6 h-6" /></div><h4 className="text-sm font-bold text-rose-300">Kontrol Başarısız</h4><p className="text-xs text-rose-200/80">{errorMessage}</p></div><button onClick={checkForUpdates} className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"><RefreshCw className="w-3.5 h-3.5" />Tekrar Dene</button></div>}
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400"><button onClick={checkForUpdates} disabled={status === 'checking'} className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold transition disabled:opacity-50 cursor-pointer"><RefreshCw className={`w-3.5 h-3.5 ${status === 'checking' ? 'animate-spin' : ''}`} /><span>🔄 Güncellemeleri Kontrol Et</span></button><a href="https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition"><span>Sürüm Geçmişi</span><ExternalLink className="w-3 h-3" /></a></div>
      </div>
    </div>
  );
};
