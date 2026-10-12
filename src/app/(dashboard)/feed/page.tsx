'use client';

import CampusFeed from '@/components/feed/CampusFeed';
import RightSidebar from '@/components/feed/RightSidebar';
import SuggestedPeople from '@/components/social/SuggestedPeople';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function FeedPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-6 sm:px-6 lg:flex-row lg:py-8">
      <div className="mx-auto min-w-0 w-full max-w-[640px] flex-1 space-y-5">
        <header className="flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Campus community</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Home</h1>
          </div>
          <Link href="/feed#share-post" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
            <Plus size={15} />Create post
          </Link>
        </header>
        <SuggestedPeople />
        <CampusFeed />
      </div>
      <div className="w-full shrink-0 lg:w-[300px]">
        <RightSidebar />
      </div>
    </main>
  );
}
