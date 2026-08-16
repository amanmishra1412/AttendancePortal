'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Download, X } from 'lucide-react';

export default function PwaManager() {
  const [isOffline, setIsOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New update available
                  console.log('[PWA] New content available. Update ready.');
                }
              };
            }
          };
        } catch (error) {
          console.warn('[PWA] Service Worker registration failed:', error);
        }
      };

      if (document.readyState === 'complete') {
        registerServiceWorker();
      } else {
        window.addEventListener('load', registerServiceWorker);
        return () => window.removeEventListener('load', registerServiceWorker);
      }
    }
  }, []);

  useEffect(() => {
    // 2. Offline / Online Connectivity Listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // 3. PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if not already running in standalone mode
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      if (!isStandalone) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-rose-600 text-white px-4 py-3 rounded-2xl shadow-xl border border-rose-500 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <WifiOff className="w-5 h-5 shrink-0 animate-pulse" />
          <div className="text-xs">
            <p className="font-bold">You are currently offline</p>
            <p className="text-rose-100 text-[11px]">
              Internet connection is required to mark attendance & sync records.
            </p>
          </div>
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstallBanner && deferredPrompt && (
        <div className="fixed top-3 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-indigo-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-indigo-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md">
              HR
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">Install AttendancePro</p>
              <p className="text-[11px] text-indigo-200 truncate">Fast access from your home screen</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-white text-indigo-900 hover:bg-indigo-50 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-indigo-300 hover:text-white p-1.5 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
