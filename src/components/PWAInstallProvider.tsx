"use client";

import { useEffect, useState } from 'react';

export default function PWAInstallProvider() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed: ', err));
    }

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // Check if iOS
    const isIosDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(isIosDevice);
    if (isIosDevice) {
      // iOS doesn't support beforeinstallprompt, so we just show an info toast if not installed
      const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasDismissed) {
        // Show after a slight delay
        setTimeout(() => setShowInstall(true), 3000);
      }
    }

    // 2. Handle Android/Chrome Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasDismissed) setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-4 flex gap-4 animate-in slide-in-from-bottom-5">
      <div className="w-12 h-12 bg-maroon rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
        A
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 text-sm">Install App</h3>
        {isIOS ? (
          <p className="text-xs text-gray-500 mt-1">
            Tap <span className="font-bold">Share</span> below and select <span className="font-bold">Add to Home Screen</span>.
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            Install this app on your home screen for quick and easy access.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 justify-center ml-1">
        {!isIOS && (
          <button onClick={handleInstallClick} className="bg-maroon text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
            Install
          </button>
        )}
        <button onClick={handleDismiss} className="text-gray-400 text-xs font-bold hover:text-gray-600">
          Dismiss
        </button>
      </div>
    </div>
  );
}
