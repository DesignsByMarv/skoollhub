'use client';

import Link from 'next/link';

export default function Navbar({ onOpenCreatePost }: { onOpenCreatePost?: () => void }) {
  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="font-bold text-lg text-gray-900 dark:text-white">
        SkoollHub
      </div>

      <div className="flex items-center gap-3 text-xs font-medium text-gray-700 dark:text-gray-300">
        <Link href="/dashboard" className="hover:text-blue-500 flex items-center gap-1">
          🏠 Home
        </Link>
        <Link href="/hostels" className="hover:text-blue-500 flex items-center gap-1">
          🏢 Hostels
        </Link>
        <Link href="/roommates" className="hover:text-blue-500 flex items-center gap-1">
          👥 Roommates
        </Link>

        {/* ➕ CREATE POST BUTTON (MIDDLE BETWEEN ROOMMATES & CLASSES) */}
        <button
          type="button"
          onClick={onOpenCreatePost}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-lg hover:scale-105 active:scale-95 shadow-md transition-all"
          title="Create Post"
        >
          +
        </button>

        <Link href="/timetable" className="hover:text-blue-500 flex items-center gap-1">
          📅 Classes
        </Link>
        <Link href="/ai-assistant" className="hover:text-blue-500 flex items-center gap-1">
          🤖 AI Helper
        </Link>
      </div>
    </nav>
  );
}