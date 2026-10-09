'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
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

const items = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Feed', href: '/feed', icon: MessageCircle },
  { label: 'Housing', href: '/houses', icon: House },
  { label: 'Roommates', href: '/roommates', icon: Users },
  { label: 'Classes', href: '/timetable', icon: BookOpen },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
  { label: 'AI Assistant', href: '/ai-assistant', icon: Sparkles },
];

const mobileItems = items.filter((item) =>
  ['/dashboard', '/feed', '/houses', '/messages', '/ai-assistant'].includes(item.href)
);

function isCurrent(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
}

export default function AppNavbar() {
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('skoollhub-theme');
    const theme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('skoollhub-theme', theme);
  }, []);

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
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition ${active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'}`}
                >
                  <Icon size={16} strokeWidth={active ? 2.4 : 1.9} />
                  {label}
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
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-900'}`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/95 md:hidden"
      >
        {mobileItems.map(({ label, href, icon: Icon }) => {
          const active = isCurrent(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition ${active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-500 dark:text-zinc-400'}`}
            >
              <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
              <span className="max-w-full truncate">{label === 'AI Assistant' ? 'AI' : label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
