import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-4 shadow-xl max-w-sm w-[calc(100%-2rem)] flex items-center gap-3" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Install DevConnect</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Access the app from your home screen</p>
      </div>
      <button onClick={handleInstall} className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-4 py-2 rounded-[12px] text-sm font-semibold cursor-pointer whitespace-nowrap">Install</button>
      <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer" aria-label="Dismiss install prompt">&times;</button>
    </div>
  );
}
