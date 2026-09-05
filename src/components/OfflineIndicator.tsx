import React, { useEffect, useState } from 'react';
import { WifiOff, Cloud } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 z-50 flex items-center gap-2 rounded-2xl bg-amber-500/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-xl border border-amber-300/30">
      <WifiOff className="h-4 w-4" />
      <span>Çevrimdışı Mod — Veriler yerel olarak kaydediliyor, bağlanınca bulutla eşitlenecek.</span>
    </div>
  );
};
