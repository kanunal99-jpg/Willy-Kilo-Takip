import React, { useState } from 'react';
import { Cloud, Check, Copy, RefreshCw, Download, Upload, ShieldCheck, X, Smartphone, Globe, Key } from 'lucide-react';
import { UserProfile } from '../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateSyncKey: (newKey: string) => void;
  onManualSync: (pullFromRemote?: boolean) => Promise<{ success: boolean; message: string }>;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  lastSyncedTimestamp?: number;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateSyncKey,
  onManualSync,
  onExportJson,
  onImportJson,
  lastSyncedTimestamp,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(profile.cloudSyncKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePushNow = async () => {
    setIsSyncing(true);
    setFeedback(null);
    const res = await onManualSync(false);
    setIsSyncing(false);
    setFeedback({ text: res.message, isError: !res.success });
  };

  const handlePullFromKey = async () => {
    if (!inputKey.trim()) return;
    setIsSyncing(true);
    setFeedback(null);
    onUpdateSyncKey(inputKey.trim());
    const res = await onManualSync(true);
    setIsSyncing(false);
    setFeedback({ text: res.message, isError: !res.success });
  };

  const formatLastSync = () => {
    if (!lastSyncedTimestamp) return 'Henüz senkronize edilmedi';
    const diffMin = Math.round((Date.now() - lastSyncedTimestamp) / 60000);
    if (diffMin < 1) return 'Az önce';
    return `${diffMin} dakika önce`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Güvenli Bulut Senkronizasyonu</h3>
              <p className="text-xs text-slate-400">Tüm cihazlarınız arasında anında eşitleme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live sync badge */}
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Bulut Durumu:</span>
            <strong className="text-emerald-400 font-bold">Aktif & Bağlı</strong>
          </div>
          <span className="text-slate-400 text-[11px]">{formatLastSync()}</span>
        </div>

        {/* User's Current Cloud Key */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Cihaz Eşitleme Anahtarınız (Sync Key)
          </label>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-700">
            <Key className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="flex-1 font-mono font-bold text-sm text-cyan-300 select-all">
              {profile.cloudSyncKey}
            </span>
            <button
              onClick={handleCopyKey}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            iPhone Safari veya Android telefonunuzda bu anahtarı girerek tüm kilonuzu ve öğünlerinizi aynı anda senkronize edebilirsiniz.
          </p>
        </div>

        {/* Push to cloud button */}
        <button
          onClick={handlePushNow}
          disabled={isSyncing}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Buluta Eşitleniyor...' : 'Şimdi Buluta Eşitle (Cloud Push)'}</span>
        </button>

        {/* Pull from other device */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Başka Bir Cihazdaki Verileri Getir
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Örn: WILLY-837492"
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handlePullFromKey}
              disabled={isSyncing || !inputKey.trim()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs disabled:opacity-40 transition"
            >
              Getir & Eşitle
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              feedback.isError
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            }`}
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* JSON Backup & Restore */}
        <div className="pt-2 border-t border-slate-800 flex gap-2">
          <button
            onClick={onExportJson}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Yedek İndir (JSON)</span>
          </button>

          <label className="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Yedek Yükle</span>
            <input type="file" accept=".json" onChange={onImportJson} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
