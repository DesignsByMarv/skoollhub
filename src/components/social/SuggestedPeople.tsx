'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { LoaderCircle, MapPin, UserPlus } from 'lucide-react';

type Suggestion = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  department: string | null;
  same_school?: boolean;
};

export default function SuggestedPeople() {
  const [people, setPeople] = useState<Suggestion[]>([]);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  const loadSuggestions = useCallback(async () => {
    const response = await fetch('/api/social', { cache: 'no-store' });
    const data = await response.json() as { suggestions?: Suggestion[]; nearby_enabled?: boolean; error?: string };
    if (!response.ok) throw new Error(data.error || 'Could not load suggestions.');
    return data;
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/social', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json() as { suggestions?: Suggestion[]; nearby_enabled?: boolean; error?: string };
        if (!response.ok) throw new Error(data.error || 'Could not load suggestions.');
        if (active) {
          setPeople(data.suggestions ?? []);
          setLocationEnabled(Boolean(data.nearby_enabled));
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load suggestions.');
      });
    return () => {
      active = false;
    };
  }, [loadSuggestions]);

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

  const toggleNearby = async () => {
    if (updatingLocation) return;
    setUpdatingLocation(true);
    setError('');
    try {
      if (locationEnabled) {
        const response = await fetch('/api/profile/location', { method: 'DELETE' });
        if (!response.ok) {
          const data = await response.json() as { error?: string };
          throw new Error(data.error || 'Could not turn off nearby discovery.');
        }
        setLocationEnabled(false);
        const data = await loadSuggestions();
        setPeople(data.suggestions ?? []);
        setLocationEnabled(Boolean(data.nearby_enabled));
        return;
      }
      if (!navigator.geolocation) throw new Error('Location sharing is not supported by this browser.');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 12_000,
          maximumAge: 60_000,
        });
      });
      const response = await fetch('/api/profile/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });
      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Could not enable nearby discovery.');
      }
      const data = await loadSuggestions();
      setPeople(data.suggestions ?? []);
      setLocationEnabled(Boolean(data.nearby_enabled));
    } catch (locationError) {
      if (locationError instanceof GeolocationPositionError) {
        setError(locationError.code === locationError.PERMISSION_DENIED
          ? 'Allow location access in your browser to enable nearby suggestions.'
          : 'Could not get your location. Try again or choose your campus in your profile.');
      } else {
        setError(locationError instanceof Error ? locationError.message : 'Could not update location sharing.');
      }
    } finally {
      setUpdatingLocation(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Discover students</h2>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">Find people from your campus community.</p>
        </div>
        <button
          type="button"
          onClick={() => void toggleNearby()}
          disabled={updatingLocation}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-pressed={locationEnabled}
        >
          {updatingLocation ? <LoaderCircle size={13} className="animate-spin" /> : <MapPin size={13} />}
          {locationEnabled ? 'Nearby on' : 'Use nearby'}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-rose-600 dark:text-rose-300">{error}</p>}
      {people.length ? (
        <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {people.map((person) => (
            <li key={person.id} className="flex w-28 shrink-0 flex-col items-center rounded-xl border border-slate-100 px-2.5 py-3 text-center dark:border-zinc-800">
              <Link href={`/profile/${encodeURIComponent(person.username)}`} className="flex w-full flex-col items-center">
                {person.avatar_url
                  ? <img src={person.avatar_url} alt="" className="h-14 w-14 rounded-full border-2 border-white object-cover ring-2 ring-fuchsia-300 dark:border-zinc-900" />
                  : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-bold text-white ring-2 ring-fuchsia-300 dark:border-zinc-900">{person.full_name.slice(0, 1).toUpperCase()}</span>}
                <span className="mt-2 w-full min-w-0">
                  <span className="block truncate text-[11px] font-semibold text-slate-800 dark:text-zinc-100">{person.full_name}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-slate-500 dark:text-zinc-400">@{person.username}</span>
                  {person.same_school && <span className="mt-1 block truncate text-[9px] font-medium text-indigo-600 dark:text-indigo-300">Your campus</span>}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => void toggleFollow(person.id)}
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-indigo-50 px-2 py-1.5 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 dark:bg-indigo-950 dark:text-indigo-200"
              >
                <UserPlus size={12} />{following.includes(person.id) ? 'Following' : 'Follow'}
              </button>
            </li>
          ))}
        </ul>
      ) : !error ? <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">No new student suggestions right now.</p> : null}
    </section>
  );
}
