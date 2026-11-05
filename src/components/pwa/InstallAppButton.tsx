'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { Download, Share, X } from 'lucide-react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches
    || navigatorWithStandalone.standalone === true;
}

export default function InstallAppButton({ className = '' }: { className?: string }) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const standaloneCheck = window.requestAnimationFrame(() => setInstalled(isStandalone()));

    const handleInstallAvailable = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.cancelAnimationFrame(standaloneCheck);
      window.removeEventListener('beforeinstallprompt', handleInstallAvailable);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === 'accepted') setInstalled(true);
    } catch (error) {
      console.error('Could not open the SkoollHub install prompt:', error);
      setShowInstructions(true);
    }
  };

  const stopPropagation = (event: MouseEvent<HTMLElement>) => event.stopPropagation();

  if (installed) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        aria-label="Install SkoollHub app"
        title="Install SkoollHub"
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/50 ${className}`}
      >
        <Download size={18} />
      </button>
      {showInstructions && (
        <div
          role="presentation"
          onClick={() => setShowInstructions(false)}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-4 sm:items-center"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-app-title"
            onClick={stopPropagation}
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="install-app-title" className="text-lg font-bold text-slate-900 dark:text-white">
                  Add SkoollHub to your home screen
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-300">
                  Open this site in your browser&apos;s menu and choose <strong>Add to Home Screen</strong> or <strong>Install app</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                aria-label="Close install instructions"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-50 p-3 text-xs text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200">
              <Share size={16} className="shrink-0" />
              <span>On iPhone or iPad, use Safari&apos;s Share button, then tap Add to Home Screen.</span>
            </div>
            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </>
  );
}
