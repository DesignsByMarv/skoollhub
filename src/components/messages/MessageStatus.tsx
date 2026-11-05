'use client';

import { Check, CheckCheck } from 'lucide-react';

interface MessageStatusProps {
  isSent?: boolean;
  isRead?: boolean;
}

export function MessageStatus({ isSent = true, isRead = false }: MessageStatusProps) {
  if (isRead) {
    return <CheckCheck size={14} className="text-sky-400 dark:text-sky-400 shrink-0" />;
  }

  if (isSent) {
    return <CheckCheck size={14} className="text-slate-400 dark:text-zinc-400 shrink-0" />;
  }

  return <Check size={14} className="text-slate-400 dark:text-zinc-400 shrink-0" />;
}

export function UserAvatar({ src, name, isOnline }: { src?: string; name: string; isOnline?: boolean }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'S';

  return (
    <div className="relative inline-block shrink-0">
      {src ? (
        <img src={src} alt={name} className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
          {initials}
        </span>
      )}
      {isOnline && (
        <span
          className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950"
          title="Online"
        />
      )}
    </div>
  );
}