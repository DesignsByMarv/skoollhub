'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState, useMemo, type FormEvent } from 'react';
import {
  BookOpen,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Plus,
  SlidersHorizontal,
  Users,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Search,
} from 'lucide-react';
import { Roommate, School, starterRoommates } from '@/lib/starterRoommates';

type Current = {
  id?: string;
  school_id?: string;
  budget_share?: number;
  budget_max?: number;
  preferred_location?: string;
  bio?: string;
  gender?: string;
  gender_preference?: string;
  study_habit?: string;
  cleanliness?: string;
  social_style?: string;
  smokes?: boolean;
  cooks?: boolean;
  is_active?: boolean;
} | null;

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';
const naira = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

async function responseError(response: Response) {
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  return data?.error ?? 'Something went wrong. Please try again.';
}

export default function RoommatesPage() {
  const [matches, setMatches] = useState<Roommate[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [current, setCurrent] = useState<Current>(null);
  const [profileSchoolId, setProfileSchoolId] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/roommates', { cache: 'no-store' });
      if (!response.ok) throw new Error(await responseError(response));
      const data = (await response.json()) as {
        matches: Roommate[];
        current: Current;
        profile: { school_id: string | null } | null;
        schools: School[];
      };

      const loaded = data.matches ?? [];
      if (loaded.length > 0) {
        setMatches(loaded);
      } else {
        setMatches(starterRoommates);
      }
      setCurrent(data.current);
      setProfileSchoolId(data.profile?.school_id ?? '');
      setSchools(data.schools ?? []);
    } catch {
      // Graceful starter fallback
      setMatches(starterRoommates);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMatches();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadMatches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const query = search.trim().toLowerCase();
      const matchesText =
        !query ||
        `${match.full_name} ${match.department ?? ''} ${match.preferred_location ?? ''} ${match.school?.name ?? ''}`
          .toLowerCase()
          .includes(query);

      const matchesGender =
        genderFilter === 'all' || match.gender.toLowerCase() === genderFilter.toLowerCase();

      return matchesText && matchesGender;
    });
  }, [matches, search, genderFilter]);

  const savePreferences = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const formData = new FormData(event.currentTarget);
    const payload = {
      school_id: formData.get('school_id'),
      gender: formData.get('gender'),
      gender_preference: formData.get('gender_preference'),
      budget_share: formData.get('budget_share'),
      preferred_location: formData.get('preferred_location'),
      study_habit: formData.get('study_habit'),
      cleanliness: formData.get('cleanliness'),
      social_style: formData.get('social_style'),
      smokes: formData.get('smokes') === 'on',
      cooks: formData.get('cooks') === 'on',
      bio: formData.get('bio'),
    };
    try {
      const response = await fetch('/api/roommates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setShowForm(false);
      setNotice('Your roommate preferences are saved and your profile is visible to other students.');
      await loadMatches();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your roommate preferences.');
    } finally {
      setSaving(false);
    }
  };

  const defaultSchool = current?.school_id ?? profileSchoolId;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 border border-purple-200/70 dark:border-purple-800/70">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Compatibility-Powered Matching
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Find Your Ideal Roommate
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-zinc-400">
            Match with verified campus peers based on study rhythm, sleep habits, cleanliness, and budget share.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-purple-600/25 transition-all hover:-translate-y-0.5"
        >
          <SlidersHorizontal size={16} />
          <span>{current ? 'Edit My Preferences' : 'Set My Preferences'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, faculty, or area..."
            className={`${fieldClass} pl-10`}
          />
        </div>

        {/* Gender Filter Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 mr-1">Gender:</span>
          {(['all', 'female', 'male'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenderFilter(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                genderFilter === g
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs sm:text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          {notice}
        </p>
      )}

      {/* Roommates Grid */}
      {loading ? (
        <div className="flex min-h-56 items-center justify-center">
          <LoaderCircle className="animate-spin text-purple-600" />
        </div>
      ) : filteredMatches.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {filteredMatches.map((match) => (
            <article
              key={match.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Header with Avatar & Compatibility Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                      {match.full_name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <Link
                        href={`/profile/${match.username}`}
                        className="font-bold text-base text-slate-900 hover:text-purple-600 dark:text-white"
                      >
                        {match.full_name}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        @{match.username} {match.level ? `• ${match.level}L` : ''} {match.department ? `• ${match.department}` : ''}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
                        <MapPin size={12} className="text-red-500" />
                        <span>{match.school?.short_name || 'University'}</span>
                        {match.preferred_location ? <span>• Prefers {match.preferred_location}</span> : null}
                      </p>
                    </div>
                  </div>

                  {/* Compatibility Circle Badge */}
                  <span className="shrink-0 px-3 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-sm">
                    {match.match_score}% Match
                  </span>
                </div>

                {/* Bio */}
                {match.bio && (
                  <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-zinc-300 bg-slate-50/70 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    &ldquo;{match.bio}&rdquo;
                  </p>
                )}

                {/* Habit Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Budget Share</span>
                    <strong className="text-slate-900 dark:text-white font-extrabold">{naira(match.budget_share)}/yr</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Study Habit</span>
                    <span className="text-slate-800 dark:text-zinc-200 font-semibold">{match.study_habit ?? 'Flexible'}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Cleanliness</span>
                    <span className="text-slate-800 dark:text-zinc-200 font-semibold">{match.cleanliness ?? 'Tidy'}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Cooking</span>
                    <span className="text-slate-800 dark:text-zinc-200 font-semibold">{match.cooks ? '🍳 Cooks often' : '🥡 Orders food'}</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={14} /> Verified Student ID
                </span>

                <Link
                  href={`/messages?user=${match.student_id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-colors"
                >
                  <MessageCircle size={14} />
                  <span>Connect & Chat</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <Users className="mx-auto text-slate-400" size={36} />
          <h2 className="mt-3 font-bold text-slate-900 dark:text-white">No roommate profiles match this filter</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Try broadening your search or resetting the gender filter.</p>
        </div>
      )}

      {/* Set Preferences Modal */}
      {showForm && (
        <div
          role="presentation"
          onClick={() => setShowForm(false)}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-3 sm:items-center backdrop-blur-sm"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="roommate-title"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 sm:p-7 border border-slate-200 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 id="roommate-title" className="text-xl font-black text-slate-900 dark:text-white">
                  Your Roommate Lifestyle Preferences
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  We use these factors to calculate your mutual compatibility score.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close preferences"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(event) => void savePreferences(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">
                University Campus
                <select name="school_id" required defaultValue={defaultSchool} className={`${fieldClass} mt-1.5`}>
                  <option value="" disabled>Select University</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Your Gender
                <select name="gender" defaultValue={current?.gender ?? 'male'} className={`${fieldClass} mt-1.5`}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Preferred Roommate Gender
                <select name="gender_preference" defaultValue={current?.gender_preference ?? 'any'} className={`${fieldClass} mt-1.5`}>
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Annual Rent Budget (₦)
                <input
                  name="budget_share"
                  type="number"
                  min="0"
                  step="5000"
                  required
                  defaultValue={current?.budget_share ?? 200000}
                  className={`${fieldClass} mt-1.5`}
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Preferred Area / Location
                <input
                  name="preferred_location"
                  maxLength={100}
                  defaultValue={current?.preferred_location ?? ''}
                  placeholder="e.g. Akoka, Agbowo, Mayfair"
                  className={`${fieldClass} mt-1.5`}
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Study Rhythm
                <select name="study_habit" defaultValue={current?.study_habit ?? 'Focused & quiet study late night'} className={`${fieldClass} mt-1.5`}>
                  <option>Focused &amp; quiet study late night</option>
                  <option>Early bird morning reviser</option>
                  <option>Library person</option>
                  <option>Group study discussion</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Tidiness Standard
                <select name="cleanliness" defaultValue={current?.cleanliness ?? 'Very tidy & orderly'} className={`${fieldClass} mt-1.5`}>
                  <option>Very tidy &amp; orderly</option>
                  <option>Tidy</option>
                  <option>Relaxed</option>
                </select>
              </label>

              <div className="flex items-center gap-5 pt-2 text-xs text-slate-700 dark:text-zinc-300 sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input name="cooks" type="checkbox" defaultChecked={current?.cooks ?? true} className="rounded" />
                  <span>I cook meals</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input name="smokes" type="checkbox" defaultChecked={current?.smokes ?? false} className="rounded" />
                  <span>I smoke</span>
                </label>
              </div>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">
                Short Introduction / Bio
                <textarea
                  name="bio"
                  rows={3}
                  maxLength={500}
                  defaultValue={current?.bio ?? ''}
                  placeholder="Describe your degree, what you value in a flatmate, and your usual daily schedule..."
                  className={`${fieldClass} mt-1.5`}
                />
              </label>

              <button
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60 sm:col-span-2 shadow-md shadow-purple-600/25"
              >
                {saving && <LoaderCircle size={16} className="animate-spin" />}
                Save Roommate Profile
              </button>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
