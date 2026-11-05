'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function AppLaunchSplash() {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const hideTimer = window.setTimeout(() => setVisible(false), 850);
    const removeTimer = window.setTimeout(() => setMounted(false), 1_200);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-300 dark:bg-zinc-950 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/icons/skoollhub-512.png"
          alt=""
          width={88}
          height={88}
          priority
          className="rounded-[22px] shadow-lg"
        />
        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          SkoollHub
        </span>
      </div>
    </div>
  );
}
