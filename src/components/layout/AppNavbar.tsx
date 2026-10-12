'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Check,
  CircleUserRound,
  House,
  LayoutDashboard,
  MessageCircle,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const items = [
  { label: 'Home', href: '/feed', icon: LayoutDashboard },
  { label: 'Housing', href: '/houses', icon: House },
  { label: 'Roommates', href: '/roommates', icon: Users },
  { label: 'Classes', href: '/timetable', icon: BookOpen },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
  { label: 'AI Assistant', href: '/ai-assistant', icon: Sparkles },
  { label: 'Profile', href: '/profile', icon: CircleUserRound },
];

const mobileItems = items.filter((item) =>
  ['/feed', '/houses', '/timetable', '/messages', '/profile', '/ai-assistant'].includes(item.href)
);

function isCurrent(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
}

export default function AppNavbar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageNotice, setMessageNotice] = useState(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/unread', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json() as { unreadCount: number };
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Could not refresh unread message badge:', error);
    }
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('skoollhub-theme');
    const theme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('skoollhub-theme', theme);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active || !user) return;
      channel = supabase
        .channel(`inbox-notifications:${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        }, (payload) => {
          const message = payload.new as { sender_id?: string };
          if (message.sender_id === user.id) return;
          let shouldNotify = true;
          const savedPreferences = window.localStorage.getItem('skoollhub-notifications');
          if (savedPreferences) {
            try {
              const preferences = JSON.parse(savedPreferences) as { newMessages?: boolean };
              shouldNotify = preferences.newMessages !== false;
            } catch {
              window.localStorage.removeItem('skoollhub-notifications');
            }
          }
          if (shouldNotify) {
            setMessageNotice(true);
            window.setTimeout(() => setMessageNotice(false), 5000);
          }
          void refreshUnreadCount();
        })
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Live inbox notifications are unavailable.');
          }
        });
      void refreshUnreadCount();
    });
    const poll = window.setInterval(() => void refreshUnreadCount(), 30_000);
    return () => {
      active = false;
      window.clearInterval(poll);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [refreshUnreadCount]);

  const messageBadge = unreadCount > 0 ? (
    <span aria-hidden="true" className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  ) : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Sparkles size={18} />
            </span>
            <span className="hidden text-base font-extrabold tracking-tight text-slate-900 dark:text-white sm:inline">
              SkoollHub
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
            {items.map(({ label, href, icon: Icon }) => {
              const active = isCurrent(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  onClick={(event) => {
                    if (href === '/feed' && pathname === '/feed') {
                      event.preventDefault();
                      window.location.reload();
                    }
                  }}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition ${active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'}`}
                >
                  <Icon size={16} strokeWidth={active ? 2.4 : 1.9} />
                  {label}
                  {href === '/messages' && messageBadge}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href="/feed"
              className="hidden items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 sm:inline-flex"
            >
              <span className="text-sm leading-none">+</span>
              Create post
            </Link>
            <Link
              href="/profile"
              aria-label="My profile"
              aria-current={isCurrent(pathname, '/profile') ? 'page' : undefined}
              className={`hidden h-10 w-10 items-center justify-center rounded-xl transition sm:flex ${isCurrent(pathname, '/profile') ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'}`}
            >
              <CircleUserRound size={18} />
            </Link>
            <Link
              href="/settings"
              aria-label="Settings"
              aria-current={isCurrent(pathname, '/settings') ? 'page' : undefined}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${isCurrent(pathname, '/settings') ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'}`}
            >
              <Settings size={18} />
            </Link>
            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={() => {
                const isDark = document.documentElement.classList.toggle('dark');
                window.localStorage.setItem('skoollhub-theme', isDark ? 'dark' : 'light');
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              <Sun size={18} className="hidden dark:block" />
              <Moon size={18} className="dark:hidden" />
            </button>
          </div>
        </div>

        <nav aria-label="Main navigation" className="hidden overflow-x-auto border-t border-slate-100 px-3 py-2 dark:border-zinc-800 md:flex xl:hidden">
          <div className="mx-auto flex min-w-max items-center gap-1">
            {items.map(({ label, href, icon: Icon }) => {
              const active = isCurrent(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  onClick={(event) => {
                    if (href === '/feed' && pathname === '/feed') {
                      event.preventDefault();
                      window.location.reload();
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-900'}`}
                >
                  <Icon size={15} />
                  {label}
                  {href === '/messages' && messageBadge}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-6 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/95 md:hidden"
      >
        {mobileItems.map(({ label, href, icon: Icon }) => {
          const active = isCurrent(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              onClick={(event) => {
                if (href === '/feed' && pathname === '/feed') {
                  event.preventDefault();
                  window.location.reload();
                }
              }}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition ${active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-500 dark:text-zinc-400'}`}
            >
              <span className="relative">
                <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
                {href === '/messages' && unreadCount > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </span>
              <span className="max-w-full truncate">{label === 'AI Assistant' ? 'AI' : label}</span>
            </Link>
          );
        })}
      </nav>
      {messageNotice && pathname !== '/messages' && (
        <Link
          href="/messages"
          role="status"
          onClick={() => setMessageNotice(false)}
          className="fixed right-4 top-20 z-[60] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-xl dark:border-indigo-900 dark:bg-zinc-900 dark:text-white"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"><MessageCircle size={17} /></span>
          <span>New message received <span className="block text-xs font-normal text-slate-500 dark:text-zinc-400">Tap to open your inbox</span></span>
          <Check size={16} className="ml-2 text-emerald-600" />
        </Link>
      )}
    </>
  );
}
