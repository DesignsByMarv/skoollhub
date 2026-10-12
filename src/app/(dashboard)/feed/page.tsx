'use client';

import CampusFeed from '@/components/feed/CampusFeed';
import RightSidebar from '@/components/feed/RightSidebar';

export default function FeedPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6">
      <div className="min-w-0 flex-1 space-y-5">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Home</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Campus updates, student posts, and people to connect with.
          </p>
        </header>
        <CampusFeed />
      </div>
      <RightSidebar />
    </main>
  );
}
