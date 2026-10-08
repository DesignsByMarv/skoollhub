import Link from 'next/link';
import MotivationalQuote from '@/components/MotivationalQuote';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          SkoollHub
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center space-y-8">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Your All-In-One <br />
          <span className="text-blue-600 dark:text-blue-400">
            Campus Companion
          </span>
        </h2>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Find off-campus hostels, match with compatibility-tested roommates, manage your timetable, and connect with students across your university.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 transition-colors shadow-sm"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200 font-semibold text-base hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </main>

      {/* Floating Motivational Quote */}
      <MotivationalQuote />

      {/* Footer */}
    <footer className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
  © 2026 SkoollHub. All rights reserved.
</footer>
    </div>
  );
}