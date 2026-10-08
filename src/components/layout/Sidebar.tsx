'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: '🏠' },
  { label: 'Hostels & Housing', href: '/houses', icon: '🏢' },
  { label: 'Roommate Finder', href: '/roommates', icon: '👥' },
  { label: 'Timetable & Classes', href: '/timetable', icon: '📅' },
  { label: 'Campus Feed', href: '/feed', icon: '📱' },
  { label: 'Messages', href: '/messages', icon: '💬' },
  { label: 'SkoollHub AI', href: '/ai-assistant', icon: '🤖' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 hidden md:flex flex-col justify-between dark:bg-gray-800 dark:border-gray-700">
      <div>
        <div className="px-3 py-4">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            SkoollHub
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Campus Companion</p>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm dark:bg-blue-900/50 dark:text-blue-300">
            SH
          </div>
          <div className="text-xs overflow-hidden">
            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">Student Account</p>
            <p className="text-gray-500 dark:text-gray-400 truncate">Active Session</p>
          </div>
        </div>
      </div>
    </aside>
  );
}