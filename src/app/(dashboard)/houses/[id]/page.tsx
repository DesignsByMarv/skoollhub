'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, BedDouble, Building2, CircleDollarSign, LoaderCircle, MapPin, ShieldAlert } from 'lucide-react';

type House = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price_per_year: number;
  address: string;
  area_name: string;
  bedrooms: number;
  bathrooms: number;
  room_type: string;
  amenities: string[];
  images: string[];
  is_verified: boolean;
  is_featured: boolean;
  caution_deposit: number;
  agency_fee: number;
  legal_fee: number;
  service_charge: number;
  school: { name: string; short_name: string; city: string; state: string } | null;
  owner: { id: string; full_name: string; username: string; avatar_url: string | null; phone_number: string | null } | null;
  contact_unlocked: boolean;
  is_owner: boolean;
};

const formatNaira = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(amount) || 0);

export default function HousingDetailPage() {
  return <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><LoaderCircle className="animate-spin text-indigo-600" /></div>}><HousingDetailContent /></Suspense>;
}

function HousingDetailContent() {
  const { id } = useParams<{ id: string }>();
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadHouse = useCallback(async () => {
    try {
      const response = await fetch(`/api/houses/${encodeURIComponent(id)}`, { cache: 'no-store' });
      const data = await response.json() as { house?: House; error?: string };
      if (!response.ok || !data.house) throw new Error(data.error || 'Could not load this listing.');
      setHouse(data.house);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load this listing.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadHouse(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadHouse]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (new URLSearchParams(window.location.search).get('contact') === 'unlocked') {
        setNotice('Payment verified. The housing owner’s contact details are now unlocked.');
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const unlockContact = async () => {
    if (!house) return;
    setPaying(true);
    setError('');
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'housing_contact', house_id: house.id }),
      });
      const data = await response.json() as { authorization_url?: string; error?: string };
      if (!response.ok || !data.authorization_url) throw new Error(data.error || 'Could not start contact payment.');
      window.location.assign(data.authorization_url);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Could not start contact payment.');
      setPaying(false);
    }
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><LoaderCircle className="animate-spin text-indigo-600" /></div>;
  if (!house) return <main className="mx-auto max-w-3xl px-4 py-10"><p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error || 'This listing is not available.'}</p><Link href="/houses" className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300"><ArrowLeft size={16} />Back to housing</Link></main>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6">
      <Link href="/houses" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700 dark:text-zinc-400 dark:hover:text-indigo-300"><ArrowLeft size={16} />All housing</Link>
      {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100 dark:bg-zinc-900">
            {house.images[0]
              ? <div role="img" aria-label={house.title} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${house.images[0].replace(/["\\]/g, '')}")` }} />
              : <div className="flex h-full items-center justify-center text-indigo-300"><Building2 size={64} /></div>}
            {house.is_featured && <span className="absolute left-4 top-4 rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-amber-950">Featured</span>}
          </div>
          {house.images.length > 1 && <div className="mt-3 grid grid-cols-4 gap-3">{house.images.slice(1, 5).map((image) => <div key={image} role="img" aria-label={`${house.title} photo`} className="aspect-square rounded-xl bg-cover bg-center" style={{ backgroundImage: `url("${image.replace(/["\\]/g, '')}")` }} />)}</div>}
          <div className="mt-6">
            <div className="flex items-start justify-between gap-3">
              <div><h1 className="text-2xl font-black text-slate-900 dark:text-white">{house.title}</h1><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400"><MapPin size={15} />{house.area_name} · {house.address}</p></div>
              {house.is_verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><BadgeCheck size={14} />Verified</span>}
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-zinc-300">{house.description}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">{house.room_type}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200"><BedDouble size={13} />{house.bedrooms} bed · {house.bathrooms} bath</span>
              {house.school && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">{house.school.short_name} · {house.school.city}, {house.school.state}</span>}
              {house.amenities.map((amenity) => <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">{amenity}</span>)}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="flex items-center gap-2 text-2xl font-black text-indigo-700 dark:text-indigo-300"><CircleDollarSign size={22} />{formatNaira(house.price_per_year)}<span className="text-sm font-medium text-slate-500">/ year</span></p>
          <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm dark:border-zinc-800">
            {[
              ['Caution deposit', house.caution_deposit],
              ['Agency fee', house.agency_fee],
              ['Legal fee', house.legal_fee],
              ['Service charge', house.service_charge],
            ].map(([label, amount]) => <div key={label} className="flex justify-between gap-3"><dt className="text-slate-500 dark:text-zinc-400">{label}</dt><dd className="font-semibold text-slate-900 dark:text-white">{formatNaira(Number(amount))}</dd></div>)}
          </dl>
          {house.owner && <div className="mt-5 border-t border-slate-100 pt-4 dark:border-zinc-800"><p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Listed by</p><Link href={`/profile/${encodeURIComponent(house.owner.username)}`} className="mt-3 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{house.owner.full_name.slice(0, 1).toUpperCase()}</span><span className="font-semibold text-slate-900 dark:text-white">{house.owner.full_name}<span className="block text-xs font-normal text-slate-500">@{house.owner.username}</span></span></Link>
            {!house.is_owner && <Link href={`/messages?user=${encodeURIComponent(house.owner.id)}`} className="mt-4 block rounded-xl border border-indigo-200 px-4 py-3 text-center text-sm font-bold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40">Chat with owner</Link>}
            {house.contact_unlocked && house.owner.phone_number && <a href={`tel:${house.owner.phone_number}`} className="mt-3 block rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-indigo-700">Call {house.owner.phone_number}</a>}
            {!house.is_owner && !house.contact_unlocked && <button type="button" onClick={() => void unlockContact()} disabled={paying} className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{paying ? 'Connecting to Paystack…' : 'Unlock owner contact'}</button>}
          </div>}
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><ShieldAlert className="mt-0.5 shrink-0" size={15} />Inspect the property and independently verify ownership before sending rent or fees.</p>
        </aside>
      </div>
    </main>
  );
}
