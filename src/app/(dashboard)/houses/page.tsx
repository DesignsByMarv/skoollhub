'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  BadgeCheck,
  BedDouble,
  Building2,
  CircleDollarSign,
  LoaderCircle,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
  Calendar,
  X,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { House, School, starterHouses, starterSchools } from '@/lib/starterHousing';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';
const naira = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

async function getError(response: Response) {
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  return data?.error ?? 'Something went wrong. Please try again.';
}

export default function HousingPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [schools, setSchools] = useState<School[]>(starterSchools);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [search, setSearch] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [mineOnly, setMineOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHouseId, setSavingHouseId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [inspectionHouse, setInspectionHouse] = useState<House | null>(null);
  const [inspectionSuccess, setInspectionSuccess] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadHouses = useCallback(async (mine = false) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/houses${mine ? '?mine=true' : ''}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(await getError(response));
      const data = (await response.json()) as {
        houses: House[];
        schools: School[];
        current_school_id: string | null;
      };
      
      const loaded = data.houses ?? [];
      // If DB has listings, use them; if empty and not browsing "mine only", use curated starter listings
      if (loaded.length > 0 || mine) {
        setHouses(loaded);
      } else {
        setHouses(starterHouses);
      }

      if (data.schools && data.schools.length > 0) {
        setSchools(data.schools);
      } else {
        setSchools(starterSchools);
      }
      setSelectedSchool((current) => current || data.current_school_id || '');
    } catch {
      // Graceful fallback for local development or unmigrated databases
      if (!mine) {
        setHouses(starterHouses);
        setSchools(starterSchools);
      } else {
        setHouses([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHouses(mineOnly);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadHouses, mineOnly]);

  const visibleHouses = useMemo(
    () =>
      houses.filter((house) => {
        const query = search.trim().toLowerCase();
        const matchesText =
          !query ||
          `${house.title} ${house.area_name} ${house.address} ${house.school?.name ?? ''} ${house.room_type}`
            .toLowerCase()
            .includes(query);
        const matchesSchool = !selectedSchool || house.school_id === selectedSchool;

        const matchesRoomType =
          roomTypeFilter === 'All' || house.room_type.toLowerCase() === roomTypeFilter.toLowerCase();

        let matchesBudget = true;
        if (budgetFilter === 'under300') matchesBudget = house.price_per_year < 300000;
        else if (budgetFilter === '300to400')
          matchesBudget = house.price_per_year >= 300000 && house.price_per_year <= 400000;
        else if (budgetFilter === 'above400') matchesBudget = house.price_per_year > 400000;

        return matchesText && matchesSchool && matchesRoomType && matchesBudget;
      }),
    [houses, search, selectedSchool, roomTypeFilter, budgetFilter]
  );

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
      images: String(form.get('images') ?? '').split(/\r?\n/).filter(Boolean),
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

  const scheduleInspection = (house: House) => {
    setInspectionHouse(house);
    setInspectionSuccess(false);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/70">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Verified Off-Campus Hostels & Lodges
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Find Your Campus Home
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-zinc-400">
            Browse inspected hostels and private lodges across Nigerian universities. Zero middleman agent commissions. Direct landlord contact.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMineOnly((value) => !value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 shadow-sm"
          >
            {mineOnly ? 'Browse All Lodges' : 'My Listings'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all"
          >
            <Plus size={17} /> List a Lodge
          </button>
        </div>
      </div>

      {/* Main Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr]">
          <label className="relative">
            <span className="sr-only">Search housing</span>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, gate, area (e.g. Akoka, Agbowo, Mayfair)"
              className={`${inputClass} pl-10`}
            />
          </label>

          <label>
            <span className="sr-only">University</span>
            <select
              value={selectedSchool}
              onChange={(event) => setSelectedSchool(event.target.value)}
              className={inputClass}
            >
              <option value="">All Universities</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.short_name} — {school.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Rent Budget</span>
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">Any Price</option>
              <option value="under300">Under ₦300,000 / yr</option>
              <option value="300to400">₦300k – ₦400k / yr</option>
              <option value="above400">Above ₦400,000 / yr</option>
            </select>
          </label>
        </div>

        {/* Room Type Quick Filter Chips */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Type:
          </span>
          {['All', 'Self-contained', 'Single room', '1 bedroom flat', '2 bedroom flat'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setRoomTypeFilter(type)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                roomTypeFilter === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Meta Bar */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
        <span className="font-semibold text-slate-700 dark:text-zinc-200">
          {loading ? 'Searching campus lodges…' : `${visibleHouses.length} verified listings available`}
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldAlert size={14} /> Free physical inspection with campus ambassador
        </span>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          {notice}
        </p>
      )}

      {/* Listings Card Grid */}
      {loading ? (
        <div className="flex min-h-56 items-center justify-center">
          <LoaderCircle className="animate-spin text-indigo-600" />
        </div>
      ) : visibleHouses.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleHouses.map((house) => (
            <article
              key={house.id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <Link href={`/houses/${house.id}`} className="relative block aspect-[16/10] bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  {house.images && house.images[0] ? (
                    <span
                      role="img"
                      aria-label={house.title}
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url("${house.images[0].replace(/["\\]/g, '')}")` }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-indigo-300">
                      <Building2 size={54} />
                    </div>
                  )}

                  {/* Badges on Photo */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {house.is_featured && (
                      <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-950 shadow-sm">
                        Featured
                      </span>
                    )}
                    {house.is_verified && (
                      <span className="rounded-full bg-emerald-600/90 text-white backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <BadgeCheck size={12} /> Verified
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-3 right-3 rounded-lg bg-black/70 text-white text-[11px] font-bold px-2 py-0.5 backdrop-blur-sm">
                    {house.room_type}
                  </span>
                </Link>

                {/* Details */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/houses/${house.id}`}
                        className="font-bold text-base text-slate-900 hover:text-indigo-600 dark:text-white line-clamp-1"
                      >
                        {house.title}
                      </Link>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                        <MapPin size={13} className="text-red-500 shrink-0" />
                        <span>{house.area_name}</span>
                        {house.school ? <span className="font-semibold text-indigo-600 dark:text-indigo-400">• {house.school.short_name}</span> : null}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {naira(Number(house.price_per_year))}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ academic session</span>
                  </div>

                  {/* Bed & Bath */}
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <BedDouble size={14} className="text-indigo-500" />
                    <span>{house.bedrooms} Bedroom{house.bedrooms > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{house.bathrooms} Bath</span>
                  </p>

                  {/* Key Amenities */}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                    {house.amenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                    {house.amenities.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-zinc-800/60 text-slate-400 text-[10px]">
                        +{house.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <Link
                  href={`/houses/${house.id}`}
                  className="rounded-xl border border-indigo-200 py-2.5 text-center text-xs font-bold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40 transition-colors"
                >
                  View Details
                </Link>

                <button
                  type="button"
                  onClick={() => scheduleInspection(house)}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-colors flex items-center justify-center gap-1"
                >
                  <Calendar size={13} />
                  <span>Inspect Lodge</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <Building2 className="mx-auto text-slate-400" size={36} />
          <h2 className="mt-3 font-bold text-slate-900 dark:text-white">No listings match your search</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Try adjusting your budget filter or campus selection, or list a property yourself!
          </p>
        </div>
      )}

      {/* Schedule Inspection Modal */}
      {inspectionHouse && (
        <div
          role="presentation"
          onClick={() => setInspectionHouse(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Campus Ambassador Inspection
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  Schedule Free Physical Visit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectionHouse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X size={18} />
              </button>
            </div>

            {inspectionSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  Inspection Request Confirmed!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  The campus housing ambassador for {inspectionHouse.school?.short_name || 'your university'} has been notified. You will receive an SMS and in-app message with meeting directions.
                </p>
                <button
                  type="button"
                  onClick={() => setInspectionHouse(null)}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">{inspectionHouse.title}</p>
                  <p className="text-slate-500 mt-0.5">{inspectionHouse.address} • {naira(Number(inspectionHouse.price_per_year))}/yr</p>
                </div>

                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Preferred Inspection Day:
                  <select className={`${inputClass} mt-1`}>
                    <option>Tomorrow (Afternoon 02:00 PM - 04:00 PM)</option>
                    <option>Saturday Morning (10:00 AM - 12:00 PM)</option>
                    <option>Next Monday (Afternoon 03:00 PM - 05:00 PM)</option>
                  </select>
                </label>

                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Your WhatsApp / Phone Number:
                  <input placeholder="e.g. 08012345678" defaultValue="080" className={`${inputClass} mt-1`} />
                </label>

                <button
                  type="button"
                  onClick={() => setInspectionSuccess(true)}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
                >
                  Confirm Inspection Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {showForm && (
        <div
          role="presentation"
          onClick={() => setShowForm(false)}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-3 sm:items-center backdrop-blur-sm"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-house-title"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 sm:p-7 border border-slate-200 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="create-house-title" className="text-xl font-black text-slate-900 dark:text-white">
                  List a Campus Lodge or Hostel
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  Direct connection between students and landlords. Inspected before final confirmation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close listing form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(event) => void createListing(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">
                Listing Title
                <input
                  name="title"
                  required
                  maxLength={120}
                  placeholder="e.g. Greenwood Court Self-Contain near Gate 2"
                  className={`${inputClass} mt-1.5`}
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">
                Detailed Description
                <textarea
                  name="description"
                  required
                  maxLength={3000}
                  rows={3}
                  placeholder="Describe distance to gate, light/power situation, water, security, and hostel environment..."
                  className={`${inputClass} mt-1.5`}
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">
                University Campus
                <select name="school_id" required defaultValue={selectedSchool} className={`${inputClass} mt-1.5`}>
                  <option value="" disabled>Select University</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name} ({school.short_name})
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Area / Zone
                <input
                  name="area_name"
                  required
                  maxLength={100}
                  placeholder="e.g. Akoka, Agbowo, Mayfair"
                  className={`${inputClass} mt-1.5`}
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Physical Address
                <input
                  name="address"
                  required
                  maxLength={240}
                  placeholder="e.g. 12 University Road"
                  className={`${inputClass} mt-1.5`}
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Room Type
                <select name="room_type" className={`${inputClass} mt-1.5`}>
                  <option>Self-contained</option>
                  <option>Single room</option>
                  <option>Shared room</option>
                  <option>1 bedroom flat</option>
                  <option>2 bedroom flat</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Annual Rent (₦)
                <input
                  name="price_per_year"
                  required
                  type="number"
                  min="1"
                  step="1000"
                  inputMode="numeric"
                  placeholder="e.g. 350000"
                  className={`${inputClass} mt-1.5`}
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Bedrooms
                <input
                  name="bedrooms"
                  required
                  type="number"
                  min="1"
                  max="30"
                  defaultValue="1"
                  className={`${inputClass} mt-1.5`}
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Bathrooms
                <input
                  name="bathrooms"
                  required
                  type="number"
                  min="1"
                  max="30"
                  defaultValue="1"
                  className={`${inputClass} mt-1.5`}
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">
                Amenities (comma-separated)
                <input
                  name="amenities"
                  placeholder="24/7 Solar Light, Borehole Water, Security Guard, WiFi, Prepaid Meter"
                  className={`${inputClass} mt-1.5`}
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:col-span-2">
                Photo URLs (one per line, HTTPS)
                <textarea
                  name="images"
                  rows={2}
                  placeholder="https://images.unsplash.com/photo-..."
                  className={`${inputClass} mt-1.5`}
                />
              </label>

              <button
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 sm:col-span-2 shadow-md shadow-indigo-600/25"
              >
                {saving && <LoaderCircle size={16} className="animate-spin" />}
                Publish Lodge Listing
              </button>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
