'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';

type Suggestion = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  department: string | null;
};

export default function SuggestedPeople() {
  const [people, setPeople] = useState<Suggestion[]>([]);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/social', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json() as { suggestions?: Suggestion[]; error?: string };
        if (!response.ok) throw new Error(data.error || 'Could not load suggestions.');
        if (active) setPeople(data.suggestions ?? []);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load suggestions.');
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleFollow = async (userId: string) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json() as { isFollowing?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not update follow.');
      setPeople((current) => current.filter((person) => person.id !== userId));
      setFollowing((current) => data.isFollowing ? [...current, userId] : current.filter((id) => id !== userId));
    } catch (followError) {
      setError(followError instanceof Error ? followError.message : 'Could not update follow.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white">People to follow</h2>
      {error && <p role="alert" className="mt-2 text-xs text-rose-600 dark:text-rose-300">{error}</p>}
      {people.length ? (
        <ul className="mt-3 space-y-3">
          {people.map((person) => (
            <li key={person.id} className="flex items-center gap-2">
              <Link href={`/profile/${encodeURIComponent(person.username)}`} className="flex min-w-0 flex-1 items-center gap-2">
                {person.avatar_url
                  ? <img src={person.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                  : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{person.full_name.slice(0, 1).toUpperCase()}</span>}
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-slate-800 dark:text-zinc-100">{person.full_name}</span>
                  <span className="block truncate text-[10px] text-slate-500 dark:text-zinc-400">@{person.username}</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => void toggleFollow(person.id)}
                disabled={loading}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1.5 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 dark:bg-indigo-950 dark:text-indigo-200"
              >
                <UserPlus size={12} />{following.includes(person.id) ? 'Following' : 'Follow'}
              </button>
            </li>
          ))}
        </ul>
      ) : !error ? <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">No suggestions yet. Check back soon.</p> : null}
    </section>
  );
}
