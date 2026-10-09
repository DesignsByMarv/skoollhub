'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Settings,
  UserRound,
} from 'lucide-react';

type Profile = {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  school_id: string | null;
  department: string | null;
  level: number | null;
  bio: string | null;
  phone_number: string | null;
  is_verified: boolean;
  created_at: string;
  school: { name: string; short_name: string; city: string; state: string } | null;
};
type Post = {
  id: string;
  content: string;
  category: string | null;
  media_urls: string[] | null;
  media_type: 'image' | 'video' | 'none' | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

async function readError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null;
  return data?.error || 'Something went wrong. Please try again.';
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'S';
}

function relativeDate(value: string) {
  const date = new Date(value);
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error(await readError(response));
        const data = await response.json() as { profile: Profile; posts: Post[] };
        if (active) {
          setProfile(data.profile);
          setPosts(data.posts);
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load your profile.');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        <LoaderCircle size={18} className="mr-2 animate-spin" />Loading your profile…
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />{error || 'Your profile could not be found.'}
        </div>
        <Link href="/settings" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
          <Settings size={16} />Open settings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 sm:h-44" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={`${profile.full_name}'s profile`} className="h-24 w-24 rounded-3xl border-4 border-white bg-white object-cover shadow-md dark:border-zinc-900 dark:bg-zinc-900 sm:h-28 sm:w-28" />
              ) : (
                <span className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-indigo-100 text-2xl font-extrabold text-indigo-700 shadow-md dark:border-zinc-900 dark:bg-indigo-950 dark:text-indigo-300 sm:h-28 sm:w-28">
                  {initials(profile.full_name)}
                </span>
              )}
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{profile.full_name}</h1>
                  {profile.is_verified && <BadgeCheck size={19} className="text-indigo-600 dark:text-indigo-300" aria-label="Verified student" />}
                </div>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">@{profile.username}</p>
              </div>
            </div>
            <Link href="/settings" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
              <Settings size={15} />Edit profile
            </Link>
          </div>

          <p className="mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-zinc-300">
            {profile.bio || 'Add a short intro so people on your campus can get to know you.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-500 dark:text-zinc-400">
            {profile.school && (
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap size={15} />
                {profile.school.name}
              </span>
            )}
            {profile.department && (
              <span className="inline-flex items-center gap-1.5">
                <UserRound size={14} />{profile.department}
              </span>
            )}
            {profile.level && (
              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={14} />{profile.level} Level
              </span>
            )}
            {profile.school?.city && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} />{profile.school.city}{profile.school.state ? `, ${profile.school.state}` : ''}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} />Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="mt-6 flex gap-6 border-t border-slate-100 pt-4 dark:border-zinc-800">
            <div><span className="font-bold text-slate-900 dark:text-white">{posts.length}</span><span className="ml-1.5 text-xs text-slate-500 dark:text-zinc-400">recent posts</span></div>
            <div><span className="font-bold text-slate-900 dark:text-white">{posts.reduce((total, post) => total + post.likes_count, 0)}</span><span className="ml-1.5 text-xs text-slate-500 dark:text-zinc-400">likes received</span></div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent posts</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Your latest updates to the campus community.</p>
        </div>
        {posts.length ? (
          <div className="space-y-3">
            {posts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                    <CalendarDays size={14} />{relativeDate(post.created_at)}
                  </div>
                  {post.category && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{post.category}</span>}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-zinc-200">{post.content}</p>
                {post.media_urls?.[0] && (
                  post.media_type === 'video' ? (
                    <video src={post.media_urls[0]} controls className="mt-4 max-h-96 w-full rounded-xl bg-black object-contain" />
                  ) : (
                    <img src={post.media_urls[0]} alt="Post attachment" className="mt-4 max-h-96 w-full rounded-xl object-contain" />
                  )
                )}
                <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1.5"><MessageCircle size={15} />{post.comments_count} comments</span>
                  <span>{post.likes_count} likes</span>
                  <Link href="/feed" className="ml-auto inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-300">Open feed<ArrowUpRight size={14} /></Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <MessageCircle size={22} className="mx-auto text-slate-400" />
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No posts yet</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Your posts will appear here when you share with campus.</p>
            <Link href="/feed" className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Create your first post</Link>
          </div>
        )}
      </section>
    </div>
  );
}
