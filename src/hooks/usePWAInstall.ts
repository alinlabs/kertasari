import { useState, useEffect } from 'react';

// Store it globally so even if the component is mounted later, it can access it.
let globalDeferredPrompt: any = null;
let listeners: ((prompt: any) => void)[] = [];

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    listeners.forEach((listener) => listener(globalDeferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    listeners.forEach((listener) => listener(globalDeferredPrompt));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // Also check typical iOS detection for standalone
    const isIOSStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    setIsInstalled(isStandalone || isIOSStandalone);

    const checkIsIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(checkIsIOS);

    const updatePrompt = (prompt: any) => {
      setDeferredPrompt(prompt);
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches || isIOSStandalone);
    };

    listeners.push(updatePrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      listeners = listeners.filter((l) => l !== updatePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (isIOS) {
      alert("Untuk menginstall aplikasi di iOS: Tekan ikon 'Share' (Bagikan) di menu bawah Safari, lalu pilih 'Tambahkan ke Layar Utama' (Add to Home Screen).");
      return;
    }
    if (!deferredPrompt) {
      alert("Aplikasi sudah terinstall atau browser Anda tidak mendukung instalasi langsung.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // It's installable if we have a prompt (Android/Chrome) OR if it's iOS (since we show a custom alert message)
  return { isInstalled, isInstallable: !!deferredPrompt || isIOS, install };
}
