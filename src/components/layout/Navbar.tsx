'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, Users, GraduationCap, MessageSquare, Bot, User } from 'lucide-react';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/housing', label: 'Housing', icon: Building2 },
  { href: '/roommates', label: 'Roommates', icon: Users },
  { href: '/classes', label: 'Classes', icon: GraduationCap },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Brand Logo */}
      <Link href="/home" className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
        <span className="text-xl">SkoollHub</span>
      </Link>

      {/* Navigation Links - Icon Only */}
      <div className="flex items-center gap-1 sm:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <Icon size={20} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}