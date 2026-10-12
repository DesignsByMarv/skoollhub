'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowUpRight, CircleUserRound, MessageCircle, Settings } from 'lucide-react';
import NearbyPlaces from '@/components/feed/NearbyPlaces';

type MiniProfile = {
  full_name: string;
  username: string;
  avatar_url: string | null;
  school?: { name: string; city: string; state: string } | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  location_sharing_enabled?: boolean;
};

export default function RightSidebar() {
  const [profile, setProfile] = useState<MiniProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/profile', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json() as { profile?: MiniProfile; error?: string };
        if (!response.ok) throw new Error(data.error || 'Could not load your profile.');
        if (active) setProfile(data.profile ?? null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load your profile.');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <aside className="w-full space-y-5 pt-2 lg:w-80">
      <section className="hidden rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:block">
        {profile ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" aria-label="View your profile" className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-bold text-white">
              {profile.avatar_url
                ? <Image src={profile.avatar_url} alt="" width={48} height={48} className="h-full w-full object-cover" />
                : profile.full_name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href="/profile" className="block truncate text-xs font-bold text-slate-900 hover:underline dark:text-white">{profile.username}</Link>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-zinc-400">{profile.full_name}</p>
              {profile.school?.name && <p className="mt-0.5 truncate text-[10px] text-slate-400">{profile.school.name}</p>}
            </div>
            <Link href="/profile" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-300">View</Link>
          </div>
        ) : error ? (
          <p role="alert" className="text-xs text-rose-600 dark:text-rose-300">{error}</p>
        ) : (
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
            <CircleUserRound size={34} className="text-slate-300" />Loading your profile…
          </div>
        )}
      </section>

      {profile && (
        <NearbyPlaces
          city={profile.school?.city}
          state={profile.school?.state}
          latitude={profile.location_latitude}
          longitude={profile.location_longitude}
          locationSharingEnabled={profile.location_sharing_enabled}
        />
      )}

      <section className="hidden rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:block">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 dark:text-zinc-400">Your account</h2>
          <Link href="/settings" className="text-[10px] font-semibold text-indigo-600 hover:underline dark:text-indigo-300">Manage</Link>
        </div>
        <div className="mt-3 space-y-1">
          <Link href="/profile" className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
            <CircleUserRound size={16} className="text-slate-400" />Profile
            <ArrowUpRight size={14} className="ml-auto text-slate-400" />
          </Link>
          <Link href="/messages" className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
            <MessageCircle size={16} className="text-slate-400" />Messages
            <ArrowUpRight size={14} className="ml-auto text-slate-400" />
          </Link>
          <Link href="/settings" className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
            <Settings size={16} className="text-slate-400" />Edit settings
            <ArrowUpRight size={14} className="ml-auto text-slate-400" />
          </Link>
        </div>
      </section>

      <p className="hidden px-1 text-[10px] leading-5 text-slate-400 lg:block">
        SkoollHub · A community built for campus life
      </p>
    </aside>
  );
}
