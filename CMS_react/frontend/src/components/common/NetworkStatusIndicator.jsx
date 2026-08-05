import React, { useState, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

const NetworkStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);
  const { mutate } = useSWRConfig();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      // Revalidate all active SWR caches when network returns
      if (mutate) {
        mutate(() => true, undefined, { revalidate: true });
      }
      const timer = setTimeout(() => setShowRestored(false), 4500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [mutate]);

  if (isOnline && !showRestored) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-md transition-all duration-500 ease-out transform translate-y-0">
      {!isOnline ? (
        <div className="flex items-center gap-3 bg-slate-900/90 border border-amber-500/50 text-amber-300 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-pulse">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <WifiOff className="w-5 h-5 text-amber-400 animate-bounce" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-wide text-white">Offline Mode Active</span>
            <span className="text-xs text-amber-200/80 leading-relaxed">
              Unstable network detected. Serving cached courses & dashboards seamlessly via PWA Service Worker.
            </span>
          </div>
          <div className="ml-auto pl-2 flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-500/30 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
            PWA Cache
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-slate-900/90 border border-emerald-500/50 text-emerald-300 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Wifi className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-wide text-white">Network Restored</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-200/80 leading-relaxed">
              Connection stabilized. Automatically resynchronizing live dashboard & state via SWR...
            </span>
          </div>
          <div className="ml-auto pl-2">
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkStatusIndicator;
