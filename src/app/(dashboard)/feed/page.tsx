'use client';

import CampusFeed from '@/components/feed/CampusFeed';

export default function FeedPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campus Feed</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Campus updates, academic news, housing, events, and student posts.
        </p>
      </header>
      <CampusFeed />
    </main>
  );
}
