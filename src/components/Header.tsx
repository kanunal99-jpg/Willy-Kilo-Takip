import React, { useState } from 'react';
import { Flame, Diamond, Cloud, ChevronLeft, ChevronRight, Settings, Smartphone, Award, User, RefreshCw, Package } from 'lucide-react';
import { UserProfile } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  profile: UserProfile;
  currentDateStr: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onOpenSyncModal: () => void;
  onOpenProfileModal: () => void;
  onOpenApkModal: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentDateStr,
  onPrevDay,
  onNextDay,
  onToday,
  onOpenSyncModal,
  onOpenProfileModal,
  onOpenApkModal,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Willy Mascot + Title */}
        <div className="flex items-center gap-2.5">
          <div
            onClick={onOpenProfileModal}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95 transition"
            title="Profil ve Hedef Ayarları"
          >
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden">
              <img src="/icon.svg" alt="Willy" className="w-8 h-8 object-contain" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold text-white tracking-tight leading-none">
                Willy
              </h1>
              <span className="text-xs font-bold text-emerald-400 leading-none">Kilo Takip</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
              <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                <Flame className="w-3 h-3 fill-current" />
                {profile.streakDays} gün seri
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-cyan-400 font-semibold">
                <Diamond className="w-3 h-3 fill-current" />
                {profile.diamonds}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Date, Cloud & PWA/APK install */}
        <div className="flex items-center gap-2">
          {/* Cloud sync button */}
          <button
            onClick={onOpenSyncModal}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Bulut Senkronizasyonu"
          >
            <Cloud className={`w-4 h-4 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Bulut</span>
          </button>

          {/* APK Export & Install button */}
          <button
            onClick={onOpenApkModal}
            id="btn-header-apk-export"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            title="APK İndir / Telefona Yükle"
          >
            <Package className="w-3.5 h-3.5" />
            <span>APK İndir</span>
          </button>

          {/* Profile settings button */}
          <button
            onClick={onOpenProfileModal}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Profil Ayarları"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Switcher row */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-xs">
        <button
          onClick={onPrevDay}
          className="p-1 text-slate-400 hover:text-white transition flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Önceki</span>
        </button>

        <button
          onClick={onToday}
          className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold transition"
        >
          {currentDateStr}
        </button>

        <button
          onClick={onNextDay}
          className="p-1 text-slate-400 hover:text-white transition flex items-center gap-1"
        >
          <span className="hidden xs:inline">Sonraki</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
