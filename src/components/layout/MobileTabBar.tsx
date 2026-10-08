'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'Home', href: '/dashboard', icon: '🏠' },
  { label: 'Hostels', href: '/houses', icon: '🏢' },
  { label: 'Roommates', href: '/roommates', icon: '👥' },
  { label: 'Classes', href: '/timetable', icon: '📅' },
  { label: 'AI Helper', href: '/ai-assistant', icon: '🤖' },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <nav className="ios-glass border border-black/5 dark:border-white/10 rounded-full px-3 py-2 flex items-center justify-around shadow-2xl">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}