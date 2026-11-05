'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { BookOpen, LoaderCircle, MapPin, MessageCircle, Plus, SlidersHorizontal, Users } from 'lucide-react';

type School = { id: string; name: string; short_name: string };
type Roommate = {
  id: string;
  student_id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  department: string | null;
  level: number | null;
  school: School | null;
  budget_share: number;
  preferred_location: string | null;
  study_habit: string | null;
  cleanliness: string | null;
  social_style: string | null;
  bio: string | null;
  gender: string;
  cooks: boolean;
  smokes: boolean;
  contact_enabled: boolean;
  match_score: number;
  same_school: boolean;
};
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

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';
const naira = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

async function responseError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null;
  return data?.error ?? 'Something went wrong. Please try again.';
}

export default function RoommatesPage() {
  const [matches, setMatches] = useState<Roommate[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [current, setCurrent] = useState<Current>(null);
  const [profileSchoolId, setProfileSchoolId] = useState('');
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
      const data = await response.json() as { matches: Roommate[]; current: Current; profile: { school_id: string | null } | null; schools: School[] };
      setMatches(data.matches ?? []);
      setCurrent(data.current);
      setProfileSchoolId(data.profile?.school_id ?? '');
      setSchools(data.schools ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load roommate matches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadMatches(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadMatches]);

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

  const hideProfile = async () => {
    setError('');
    try {
      const response = await fetch('/api/roommates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setCurrent((value) => value ? { ...value, is_active: false } : value);
      setNotice('Your roommate profile is hidden from matching.');
    } catch (hideError) {
      setError(hideError instanceof Error ? hideError.message : 'Could not hide your roommate profile.');
    }
  };

  const defaultSchool = current?.school_id ?? profileSchoolId;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Campus Haven</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Find a roommate who fits</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-zinc-400">Compare campus, budget and day-to-day habits. Matching uses the preferences students choose to share.</p>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700">
          <SlidersHorizontal size={16} /> {current ? 'Edit my preferences' : 'Set my preferences'}
        </button>
      </div>

      {current?.is_active && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Your roommate profile is visible in matching.</p>
          <button type="button" onClick={() => void hideProfile()} className="rounded-lg px-3 py-2 text-xs font-bold text-indigo-800 hover:bg-indigo-100 dark:text-indigo-200 dark:hover:bg-indigo-950">Hide my profile</button>
        </div>
      )}
      {!current?.is_active && current && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-slate-600 dark:text-zinc-300">Your profile is hidden. Edit preferences to appear in matching again.</p>
          <button type="button" onClick={() => setShowForm(true)} className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Show profile</button>
        </div>
      )}

      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{notice}</p>}

      {loading ? (
        <div className="flex min-h-56 items-center justify-center"><LoaderCircle className="animate-spin text-indigo-600" /></div>
      ) : matches.length ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {matches.map((match) => (
            <article key={match.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start gap-3">
                {match.avatar_url ? <Image src={match.avatar_url} alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover" /> : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{match.full_name.slice(0, 1).toUpperCase()}</span>}
                <div className="min-w-0 flex-1">
                  <Link href={`/profile/${match.username}`} className="font-bold text-slate-900 hover:text-indigo-700 dark:text-white">{match.full_name}</Link>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">@{match.username}{match.level ? ` · ${match.level} level` : ''}{match.department ? ` · ${match.department}` : ''}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400"><MapPin size={12} />{match.school?.short_name ?? match.school?.name ?? 'University not listed'}{match.preferred_location ? ` · ${match.preferred_location}` : ''}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{match.match_score}% fit</span>
              </div>
              {match.bio && <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-zinc-300">{match.bio}</p>}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-400 sm:grid-cols-4">
                <span className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800"><strong className="block text-slate-900 dark:text-white">{naira(match.budget_share)}</strong>budget share</span>
                <span className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800"><strong className="block text-slate-900 dark:text-white">{match.study_habit ?? 'Flexible'}</strong>study</span>
                <span className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800"><strong className="block text-slate-900 dark:text-white">{match.cleanliness ?? 'Not specified'}</strong>tidiness</span>
                <span className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800"><strong className="block text-slate-900 dark:text-white">{match.social_style ?? 'Not specified'}</strong>social style</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400"><BookOpen size={13} />{match.same_school ? 'Same university' : 'Lifestyle and budget match'}</span>
                {match.contact_enabled && <Link href={`/messages?user=${match.student_id}`} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"><MessageCircle size={14} />Message</Link>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-zinc-700">
          <Users className="mx-auto text-slate-400" size={34} />
          <h2 className="mt-3 font-bold text-slate-900 dark:text-white">{current ? 'No matching profiles yet' : 'No roommate matches yet'}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-zinc-400">Set up your preferences to help other students find you. Matches appear as students create their roommate profiles.</p>
          <button type="button" onClick={() => setShowForm(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} />Set preferences</button>
        </div>
      )}

      {showForm && (
        <div role="presentation" onClick={() => setShowForm(false)} className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-3 sm:items-center">
          <section role="dialog" aria-modal="true" aria-labelledby="roommate-title" onClick={(event) => event.stopPropagation()} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-zinc-900 sm:p-7">
            <div className="flex items-start justify-between"><div><h2 id="roommate-title" className="text-xl font-black text-slate-900 dark:text-white">Your roommate preferences</h2><p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Only share the lifestyle details you’re comfortable showing.</p></div><button type="button" onClick={() => setShowForm(false)} aria-label="Close preferences" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800">×</button></div>
            <form onSubmit={(event) => void savePreferences(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">University<select name="school_id" required defaultValue={defaultSchool} className={`${fieldClass} mt-1.5`}><option value="" disabled>Select university</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Your gender<select name="gender" defaultValue={current?.gender ?? 'prefer_not_to_say'} className={`${fieldClass} mt-1.5`}><option value="prefer_not_to_say">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option></select></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Roommate preference<select name="gender_preference" defaultValue={current?.gender_preference ?? 'any'} className={`${fieldClass} mt-1.5`}><option value="any">Any</option><option value="female">Female</option><option value="male">Male</option></select></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Annual budget share (₦)<input name="budget_share" type="number" min="0" max="100000000" required defaultValue={current?.budget_share ?? current?.budget_max ?? 250000} className={`${fieldClass} mt-1.5`} /></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Preferred area<input name="preferred_location" maxLength={100} defaultValue={current?.preferred_location ?? ''} placeholder="e.g. Tanke" className={`${fieldClass} mt-1.5`} /></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Study habits<select name="study_habit" defaultValue={current?.study_habit ?? ''} className={`${fieldClass} mt-1.5`}><option value="">Flexible / no preference</option><option>Night reader</option><option>Early riser</option><option>Library person</option><option>Flexible</option></select></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Tidiness<select name="cleanliness" defaultValue={current?.cleanliness ?? ''} className={`${fieldClass} mt-1.5`}><option value="">No preference</option><option>Very tidy</option><option>Tidy</option><option>Relaxed</option></select></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Social style<select name="social_style" defaultValue={current?.social_style ?? ''} className={`${fieldClass} mt-1.5`}><option value="">No preference</option><option>Quiet &amp; private</option><option>Balanced</option><option>Very social</option></select></label>
              <div className="flex items-center gap-5 pt-4 text-xs text-slate-700 dark:text-zinc-300"><label className="flex items-center gap-2"><input name="cooks" type="checkbox" defaultChecked={current?.cooks} />I cook</label><label className="flex items-center gap-2"><input name="smokes" type="checkbox" defaultChecked={current?.smokes} />I smoke</label></div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">Short introduction<textarea name="bio" rows={3} maxLength={500} defaultValue={current?.bio ?? ''} placeholder="Describe the kind of living arrangement you're looking for." className={`${fieldClass} mt-1.5`} /></label>
              <button disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 sm:col-span-2">{saving && <LoaderCircle size={16} className="animate-spin" />}Save preferences</button>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
