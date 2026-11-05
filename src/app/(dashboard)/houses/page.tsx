'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { BadgeCheck, BedDouble, Building2, CircleDollarSign, LoaderCircle, MapPin, Plus, Search, ShieldAlert, X } from 'lucide-react';

type School = { id: string; name: string; short_name: string; city: string; state: string };
type House = {
  id: string;
  owner_id: string;
  school_id: string;
  title: string;
  description: string;
  price_per_year: number;
  address: string;
  area_name: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  is_available: boolean;
  is_featured: boolean;
  is_verified: boolean;
  room_type: string;
  school: School | null;
  owner: { id: string; full_name: string; username: string; avatar_url: string | null } | null;
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';
const naira = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

async function getError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null;
  return data?.error ?? 'Something went wrong. Please try again.';
}

export default function HousingPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [search, setSearch] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [mineOnly, setMineOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHouseId, setSavingHouseId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadHouses = useCallback(async (mine = false) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/houses${mine ? '?mine=true' : ''}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(await getError(response));
      const data = await response.json() as { houses: House[]; schools: School[]; current_school_id: string | null };
      setHouses(data.houses ?? []);
      setSchools(data.schools ?? []);
      setSelectedSchool((current) => current || data.current_school_id || '');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load campus housing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadHouses(mineOnly); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadHouses, mineOnly]);

  const visibleHouses = useMemo(() => houses.filter((house) => {
    const query = search.trim().toLowerCase();
    const matchesText = !query || `${house.title} ${house.area_name} ${house.address} ${house.school?.name ?? ''} ${house.room_type}`.toLowerCase().includes(query);
    const matchesSchool = !selectedSchool || house.school_id === selectedSchool;
    const matchesBudget = !maxRent || house.price_per_year <= Number(maxRent);
    return matchesText && matchesSchool && matchesBudget;
  }), [houses, maxRent, search, selectedSchool]);

  const createListing = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get('title'),
      description: form.get('description'),
      school_id: form.get('school_id'),
      address: form.get('address'),
      area_name: form.get('area_name'),
      room_type: form.get('room_type'),
      price_per_year: form.get('price_per_year'),
      bedrooms: form.get('bedrooms'),
      bathrooms: form.get('bathrooms'),
      amenities: String(form.get('amenities') ?? '').split(','),
      images: String(form.get('images') ?? '').split(/\r?\n/),
    };
    try {
      const response = await fetch('/api/houses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await getError(response));
      setShowForm(false);
      setNotice('Your housing listing is live.');
      await loadHouses(mineOnly);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not publish the listing.');
    } finally {
      setSaving(false);
    }
  };

  const updateAvailability = async (house: House) => {
    setSavingHouseId(house.id);
    setError('');
    try {
      const response = await fetch(`/api/houses/${encodeURIComponent(house.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !house.is_available }),
      });
      if (!response.ok) throw new Error(await getError(response));
      await loadHouses(mineOnly);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update this listing.');
    } finally {
      setSavingHouseId('');
    }
  };

  const deleteListing = async (house: House) => {
    if (!window.confirm(`Delete "${house.title}"? This cannot be undone.`)) return;
    setSavingHouseId(house.id);
    setError('');
    try {
      const response = await fetch(`/api/houses/${encodeURIComponent(house.id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(await getError(response));
      await loadHouses(mineOnly);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete this listing.');
    } finally {
      setSavingHouseId('');
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Student housing</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Find a place near campus</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-zinc-400">Compare annual rent, location and amenities. Message a student owner to ask questions or arrange an inspection.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setMineOnly((value) => !value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">{mineOnly ? 'Browse all places' : 'My listings'}</button>
          <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700">
            <Plus size={17} /> List a place
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_220px_180px] dark:border-zinc-800 dark:bg-zinc-900">
        <label className="relative">
          <span className="sr-only">Search housing</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, area or room type" className={`${inputClass} pl-9`} />
        </label>
        <label>
          <span className="sr-only">University</span>
          <select value={selectedSchool} onChange={(event) => setSelectedSchool(event.target.value)} className={inputClass}>
            <option value="">All universities</option>
            {schools.map((school) => <option key={school.id} value={school.id}>{school.short_name} — {school.name}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Maximum annual rent</span>
          <input type="number" min="0" inputMode="numeric" value={maxRent} onChange={(event) => setMaxRent(event.target.value)} placeholder="Max annual rent (₦)" className={inputClass} />
        </label>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-500 dark:text-zinc-400">
        <span>{loading ? 'Loading listings…' : `${mineOnly ? 'Your ' : ''}${visibleHouses.length} ${visibleHouses.length === 1 ? 'listing' : 'listings'}`}</span>
        <span className="inline-flex items-center gap-1"><ShieldAlert size={14} /> Visit and verify before paying.</span>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{notice}</p>}

      {loading ? (
        <div className="flex min-h-56 items-center justify-center"><LoaderCircle className="animate-spin text-indigo-600" /></div>
      ) : visibleHouses.length ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleHouses.map((house) => (
            <article key={house.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <Link href={`/houses/${house.id}`} className="relative block aspect-[16/10] bg-slate-100 dark:bg-zinc-800">
                {house.images[0] ? (
                  <span role="img" aria-label={house.title} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${house.images[0].replace(/["\\]/g, '')}")` }} />
                ) : <div className="flex h-full items-center justify-center text-indigo-300"><Building2 size={54} /></div>}
                {house.is_featured && <span className="absolute left-3 top-3 rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-950">Featured</span>}
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/houses/${house.id}`} className="font-bold text-slate-900 hover:text-indigo-700 dark:text-white">{house.title}</Link>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400"><MapPin size={13} />{house.area_name}{house.school ? ` · ${house.school.short_name}` : ''}</p>
                  </div>
                  {house.is_verified && <BadgeCheck aria-label="Verified listing" size={18} className="shrink-0 text-emerald-600" />}
                </div>
                <p className="mt-4 flex items-center gap-2 text-lg font-black text-indigo-700 dark:text-indigo-300"><CircleDollarSign size={17} />{naira(Number(house.price_per_year))}<span className="text-xs font-medium text-slate-500">/ year</span></p>
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400"><BedDouble size={14} />{house.room_type} · {house.bedrooms} bed{house.bedrooms === 1 ? '' : 's'} · {house.bathrooms} bath</p>
                <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600 dark:text-zinc-400">{house.description}</p>
                <Link href={`/houses/${house.id}`} className="mt-4 block rounded-xl border border-indigo-200 py-2.5 text-center text-sm font-bold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40">View details</Link>
                {mineOnly && <div className="mt-2 grid grid-cols-2 gap-2"><button type="button" disabled={savingHouseId === house.id} onClick={() => void updateAvailability(house)} className="rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200">{house.is_available ? 'Mark rented' : 'Relist'}</button><button type="button" disabled={savingHouseId === house.id} onClick={() => void deleteListing(house)} className="rounded-xl border border-rose-200 py-2 text-xs font-bold text-rose-700 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300">Delete</button></div>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-zinc-700">
          <Building2 className="mx-auto text-slate-400" size={32} />
          <h2 className="mt-3 font-bold text-slate-900 dark:text-white">No listings match yet</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Try a different campus or rent limit, or be the first to list a place.</p>
        </div>
      )}

      {showForm && (
        <div role="presentation" onClick={() => setShowForm(false)} className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-3 sm:items-center">
          <section role="dialog" aria-modal="true" aria-labelledby="create-house-title" onClick={(event) => event.stopPropagation()} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-zinc-900 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="create-house-title" className="text-xl font-black text-slate-900 dark:text-white">Create a housing listing</h2><p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Use accurate details. Students should inspect before sending payment.</p></div>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Close listing form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"><X size={18} /></button>
            </div>
            <form onSubmit={(event) => void createListing(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">Listing title<input name="title" required maxLength={120} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">Description<textarea name="description" required maxLength={3000} rows={3} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">University<select name="school_id" required defaultValue={selectedSchool} className={`${inputClass} mt-1.5`}><option value="" disabled>Select university</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Area<input name="area_name" required maxLength={100} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Address<input name="address" required maxLength={240} className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Room type<select name="room_type" className={`${inputClass} mt-1.5`}><option>Single room</option><option>Self-contained</option><option>Shared room</option><option>1 bedroom flat</option><option>2 bedroom flat</option><option>Other</option></select></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Annual rent (₦)<input name="price_per_year" required type="number" min="1" step="1000" inputMode="numeric" className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Bedrooms<input name="bedrooms" required type="number" min="1" max="30" defaultValue="1" className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Bathrooms<input name="bathrooms" required type="number" min="1" max="30" defaultValue="1" className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">Amenities (comma separated)<input name="amenities" placeholder="Water, security, prepaid meter" className={`${inputClass} mt-1.5`} /></label>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">Photo URLs (secure HTTPS, one per line)<textarea name="images" rows={2} placeholder="https://…" className={`${inputClass} mt-1.5`} /></label>
              <button disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 sm:col-span-2">{saving && <LoaderCircle size={16} className="animate-spin" />}Publish listing</button>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
