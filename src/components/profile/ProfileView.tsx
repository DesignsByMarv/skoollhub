'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, BadgeCheck, CalendarDays, GraduationCap, LoaderCircle, MapPin, MessageCircle, Settings, UserPlus, Users, X } from 'lucide-react';

type Profile = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  department: string | null;
  level: number | null;
  is_verified?: boolean;
  created_at: string;
  school?: { name: string; city: string; state: string } | null;
  posts_count: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  is_own_profile: boolean;
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

export default function ProfileView({ username }: { username?: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingFollow, setSavingFollow] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (username) {
          const response = await fetch(`/api/social?username=${encodeURIComponent(username)}`, { cache: 'no-store' });
          if (!response.ok) throw new Error(await readError(response));
          const data = await response.json() as { profile: Profile; posts: Post[] };
          if (active) {
            setProfile(data.profile);
            setPosts(data.posts);
          }
        } else {
          const response = await fetch('/api/profile', { cache: 'no-store' });
          if (!response.ok) throw new Error(await readError(response));
          const data = await response.json() as { profile: Profile; posts: Post[] };
          const socialResponse = await fetch(`/api/social?username=${encodeURIComponent(data.profile.username)}`, { cache: 'no-store' });
          if (!socialResponse.ok) throw new Error(await readError(socialResponse));
          const social = await socialResponse.json() as { profile: Profile };
          if (active) {
            setProfile({ ...data.profile, ...social.profile, is_own_profile: true });
            setPosts(data.posts);
          }
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load this profile.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [username]);

  const toggleFollow = async () => {
    if (!profile || savingFollow) return;
    setSavingFollow(true);
    setError('');
    try {
      const response = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json() as { isFollowing: boolean };
      setProfile((current) => current ? {
        ...current,
        is_following: data.isFollowing,
        followers_count: current.followers_count + (data.isFollowing ? 1 : -1),
      } : current);
    } catch (followError) {
      setError(followError instanceof Error ? followError.message : 'Could not update follow.');
    } finally {
      setSavingFollow(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500"><LoaderCircle size={18} className="mr-2 animate-spin" />Loading profile…</div>;
  }
  if (error && !profile) {
    return <div className="mx-auto max-w-3xl px-4 py-10"><p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p></div>;
  }
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6">
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
      <section className="flex flex-col gap-6 border-b border-slate-200 pb-7 dark:border-zinc-800 sm:flex-row sm:items-center sm:gap-12 sm:px-6">
        <div className="flex shrink-0 justify-center sm:w-48">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={`${profile.full_name}'s profile`} className="h-28 w-28 rounded-full border border-slate-200 object-cover sm:h-36 sm:w-36" />
            : <span className="flex h-28 w-28 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200 sm:h-36 sm:w-36">{initials(profile.full_name)}</span>}
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <h1 className="text-xl font-normal text-slate-900 dark:text-white">@{profile.username}</h1>
            {profile.is_verified && <BadgeCheck size={18} className="text-indigo-600 dark:text-indigo-300" aria-label="Verified student" />}
            {profile.is_own_profile ? (
              <Link href="/settings" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"><Settings size={14} className="mr-1 inline" />Edit profile</Link>
            ) : (
              <>
                <button type="button" onClick={() => void toggleFollow()} disabled={savingFollow} className={`rounded-lg px-4 py-1.5 text-xs font-bold disabled:opacity-50 ${profile.is_following ? 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {savingFollow ? 'Saving…' : profile.is_following ? 'Following' : <><UserPlus size={14} className="mr-1 inline" />Follow</>}
                </button>
                <Link href={`/messages?user=${encodeURIComponent(profile.id)}`} className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"><MessageCircle size={14} className="mr-1 inline" />Message</Link>
              </>
            )}
          </div>

          <div className="mt-5 flex justify-center gap-6 text-sm text-slate-800 dark:text-zinc-100 sm:justify-start sm:gap-8">
            <span><strong>{profile.posts_count ?? posts.length}</strong> posts</span>
            <span><strong>{profile.followers_count}</strong> followers</span>
            <span><strong>{profile.following_count}</strong> following</span>
          </div>

          <div className="mt-5">
            <h2 className="font-semibold text-slate-900 dark:text-white">{profile.full_name}</h2>
            {profile.bio && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-zinc-300">{profile.bio}</p>}
            <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-zinc-400 sm:justify-start">
              {profile.school?.name && <span className="inline-flex items-center gap-1"><GraduationCap size={14} />{profile.school.name}</span>}
              {profile.school?.city && <span className="inline-flex items-center gap-1"><MapPin size={13} />{profile.school.city}{profile.school.state ? `, ${profile.school.state}` : ''}</span>}
              {profile.department && <span>{profile.department}{profile.level ? ` · ${profile.level} Level` : ''}</span>}
              <span className="inline-flex items-center gap-1"><CalendarDays size={13} />Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-zinc-800">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-700 dark:text-zinc-300">Posts</h2>
          <span className="text-xs text-slate-500"><Users size={14} className="mr-1 inline" />{profile.followers_count} followers</span>
        </div>
        {posts.length ? (
          <div className="grid grid-cols-3 gap-1 sm:gap-4">
            {posts.map((post) => (
              <button key={post.id} type="button" onClick={() => setSelectedPost(post)} aria-label={`Open post: ${post.content.slice(0, 70)}`} className="group relative aspect-square overflow-hidden bg-slate-100 text-left dark:bg-zinc-900">
                {post.media_urls?.[0] && post.media_type === 'video'
                  ? <video src={post.media_urls[0]} className="h-full w-full object-cover" muted />
                  : post.media_urls?.[0]
                    ? <img src={post.media_urls[0]} alt="" className="h-full w-full object-cover" />
                    : <span className="flex h-full w-full items-center justify-center overflow-hidden p-2 text-center text-xs text-slate-700 dark:text-zinc-200 sm:p-5 sm:text-sm">{post.content}</span>}
                <span className="absolute inset-0 flex items-center justify-center gap-4 bg-black/0 text-sm font-bold text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
                  <span>♥ {post.likes_count}</span><span>◯ {post.comments_count}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-5 py-14 text-center dark:border-zinc-700">
            <MessageCircle size={26} className="mx-auto text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-zinc-100">No posts yet</p>
            {profile.is_own_profile && <Link href="/feed" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300">Share your first post<ArrowUpRight size={13} /></Link>}
          </div>
        )}
      </section>

      {selectedPost && (
        <div role="presentation" onClick={() => setSelectedPost(null)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <article role="dialog" aria-modal="true" aria-label="Profile post" onClick={(event) => event.stopPropagation()} className="relative grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 sm:grid-cols-2">
            <button type="button" onClick={() => setSelectedPost(null)} aria-label="Close post" className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white"><X size={18} /></button>
            <div className="flex max-h-[65vh] items-center justify-center bg-black sm:max-h-[80vh]">
              {selectedPost.media_urls?.[0] && selectedPost.media_type === 'video'
                ? <video src={selectedPost.media_urls[0]} controls className="max-h-full max-w-full" />
                : selectedPost.media_urls?.[0]
                  ? <img src={selectedPost.media_urls[0]} alt="Post" className="max-h-full max-w-full object-contain" />
                  : <p className="whitespace-pre-wrap p-8 text-center text-white">{selectedPost.content}</p>}
            </div>
            <div className="flex flex-col p-5">
              <p className="font-semibold text-slate-900 dark:text-white">{profile.full_name} <span className="font-normal text-slate-500">@{profile.username}</span></p>
              <p className="mt-4 flex-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-zinc-200">{selectedPost.content}</p>
              <p className="border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">♥ {selectedPost.likes_count} likes · {selectedPost.comments_count} comments</p>
            </div>
          </article>
        </div>
      )}

    </div>
  );
}
