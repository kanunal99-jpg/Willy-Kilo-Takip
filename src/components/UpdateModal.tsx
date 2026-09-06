import React, { useEffect, useState } from 'react';
import { X, RefreshCw, CheckCircle2, Download, AlertCircle, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { APP_VERSION } from '../version';

interface Manifest { success: boolean; versionName: string; versionCode: number; releaseDate: string; releaseNotes: string[] | string; apkUrl: string; githubReleaseUrl: string; mandatory: boolean; hasUpdate: boolean; error?: string; }
interface Props { isOpen: boolean; onClose: () => void; autoCheckOnOpen?: boolean; }
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim() || 'https://willy-kilo-takip.onrender.com';

async function getManifest(path: string) {
  const url = `${API_BASE_URL}${path}`;
  const r = await fetch(url, { cache: 'no-store' });
  const text = await r.text();
  let data: any;
  try { data = JSON.parse(text); } catch { throw new Error(`OTA sunucusu JSON yerine geçersiz yanıt döndürdü (HTTP ${r.status}).`); }
  return { status: r.status, data };
}

export const UpdateModal: React.FC<Props> = ({ isOpen, onClose, autoCheckOnOpen = true }) => {
  const [status, setStatus] = useState<'idle'|'checking'|'up_to_date'|'update_available'|'error'>('idle');
  const [data, setData] = useState<Manifest | null>(null);
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(false);

  const checkForUpdates = async () => {
    setStatus('checking'); setError(''); setOpened(false);
    try {
      const q = new URLSearchParams({ currentVersion: APP_VERSION.versionName, currentCode: String(APP_VERSION.versionCode) });
      const r = await getManifest(`/api/app-version?${q.toString()}`);
      if (r.status < 200 || r.status >= 300) throw new Error(`OTA HTTP ${r.status}`);
      const m = r.data as Manifest;
      if (!m?.success || !m.apkUrl) throw new Error(m?.error || 'Geçersiz OTA manifesti.');
      setData(m); setStatus(m.hasUpdate ? 'update_available' : 'up_to_date');
    } catch (e: any) { console.error('OTA check failed:', e); setStatus('error'); setError(e?.message || 'Güncelleme kontrolü başarısız.'); }
  };

  useEffect(() => { if (isOpen && autoCheckOnOpen) void checkForUpdates(); }, [isOpen, autoCheckOnOpen]);
  if (!isOpen) return null;

  const startUpdate = () => {
    if (!data?.apkUrl) return;
    try {
      // Navigate the Android device to the APK URL directly. This lets the system
      // browser/download manager handle the application/octet-stream attachment.
      setOpened(true);
      window.location.assign(data.apkUrl);
    } catch (e: any) {
      setStatus('error');
      setError(e?.message || 'APK indirme ekranı açılamadı.');
    }
  };
  const notes = Array.isArray(data?.releaseNotes) ? data!.releaseNotes : String(data?.releaseNotes || '').split('\n').map(x => x.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800"><div><h3 className="text-base font-bold text-white">Yazılım Güncellemesi</h3><p className="text-xs text-slate-400">OTA Canlı Güncelleme Sistemi</p></div><button onClick={onClose} className="p-2 text-slate-400"><X className="w-5 h-5" /></button></div>
      <div className="p-6 space-y-5">
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex justify-between"><span className="text-xs text-slate-400">Yüklü Sürüm</span><b className="text-sm text-white">v{APP_VERSION.versionName} <small className="text-slate-500">({APP_VERSION.versionCode})</small></b></div>
        {status === 'checking' && <div className="py-8 text-center"><RefreshCw className="w-8 h-8 mx-auto text-cyan-400 animate-spin" /><p className="text-sm text-white mt-3">Canlı OTA manifesti kontrol ediliyor...</p></div>}
        {status === 'up_to_date' && <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center"><CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" /><h4 className="text-sm font-bold text-emerald-300 mt-2">Uygulamanız Güncel</h4><p className="text-xs text-slate-300 mt-1">Sunucu manifesti geçerli ve sürüm kontrolü başarılı.</p></div>}
        {status === 'update_available' && data && <div className="space-y-4"><div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30"><div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /><b className="text-sm text-white">Yeni sürüm: v{data.versionName}</b></div><p className="text-xs text-slate-400 mt-2">Yayın: {data.releaseDate}</p></div><ul className="space-y-2 text-xs text-slate-300">{notes.map((n,i)=><li key={i}>• {n}</li>)}</ul><button onClick={startUpdate} className="w-full py-3 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center gap-2"><Download className="w-4 h-4" />APK'yı Aç / İndir</button>{opened && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex gap-2"><ShieldCheck className="w-4 h-4" />APK indirme başlatıldı; indirme bitince APK'yı kur.</div>}</div>}
        {status === 'error' && <div className="space-y-4"><div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center"><AlertCircle className="w-8 h-8 mx-auto text-rose-400" /><h4 className="text-sm font-bold text-rose-300 mt-2">Kontrol Başarısız</h4><p className="text-xs text-rose-200/80 mt-1 break-words">{error}</p></div></div>}
      </div>
      <div className="px-6 py-3 border-t border-slate-800 flex justify-between"><button onClick={() => void checkForUpdates()} disabled={status==='checking'} className="text-xs text-cyan-400 font-semibold flex gap-1.5 items-center"><RefreshCw className="w-3.5 h-3.5" />Tekrar Dene</button><a href="https://github.com/kanunal99-jpg/Willy-Kilo-Takip/releases" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 flex gap-1 items-center">Sürüm Geçmişi <ExternalLink className="w-3 h-3" /></a></div>
    </div>
  </div>;
};
