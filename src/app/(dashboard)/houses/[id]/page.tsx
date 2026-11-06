'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  Building2,
  CircleDollarSign,
  LoaderCircle,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { House, starterHouses } from '@/lib/starterHousing';

const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(
    Number(amount) || 0
  );

export default function HousingDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoaderCircle className="animate-spin text-indigo-600" />
        </div>
      }
    >
      <HousingDetailContent />
    </Suspense>
  );
}

function HousingDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadHouse = useCallback(async () => {
    try {
      const response = await fetch(`/api/houses/${encodeURIComponent(id)}`, { cache: 'no-store' });
      const data = (await response.json()) as { house?: House; error?: string };
      if (response.ok && data.house) {
        setHouse(data.house);
        return;
      }
      // Check starter houses
      const starter = starterHouses.find((h) => h.id === id);
      if (starter) {
        setHouse(starter);
        return;
      }
      throw new Error(data.error || 'Could not load this listing.');
    } catch {
      const starter = starterHouses.find((h) => h.id === id);
      if (starter) {
        setHouse(starter);
      } else {
        setError('Could not load this listing. It may have been taken or removed.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHouse();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadHouse]);

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
      const data = (await response.json()) as { authorization_url?: string; error?: string };
      if (response.ok && data.authorization_url) {
        window.location.assign(data.authorization_url);
      } else {
        // Fallback for demonstration / testing without Paystack keys configured
        setContactRevealed(true);
        setNotice('Demo unlock active: Landlord phone number and direct contact details revealed!');
      }
    } catch {
      setContactRevealed(true);
      setNotice('Demo unlock active: Landlord phone number and direct contact details revealed!');
    } finally {
      setPaying(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoaderCircle className="animate-spin text-indigo-600" />
      </div>
    );

  if (!house)
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-4">
        <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
          {error || 'This listing is not available.'}
        </p>
        <Link
          href="/houses"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          <ArrowLeft size={16} /> Back to all housing
        </Link>
      </main>
    );

  const isUnlocked = house.contact_unlocked || contactRevealed;

  return (
    <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 space-y-5">
      <Link
        href="/houses"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700 dark:text-zinc-400 dark:hover:text-indigo-300 transition-colors"
      >
        <ArrowLeft size={16} /> All Campus Housing
      </Link>

      {notice && (
        <p role="status" className="rounded-2xl bg-emerald-50 p-3.5 text-xs sm:text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] items-start">
        {/* Left Column: Photos & Property Info */}
        <section className="space-y-6">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-md">
            {house.images && house.images[0] ? (
              <div
                role="img"
                aria-label={house.title}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url("${house.images[0].replace(/["\\]/g, '')}")` }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-indigo-300">
                <Building2 size={64} />
              </div>
            )}
            {house.is_featured && (
              <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-black uppercase text-amber-950 shadow-md">
                Featured Lodge
              </span>
            )}
          </div>

          {house.images && house.images.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {house.images.slice(1, 5).map((image, idx) => (
                <div
                  key={idx}
                  role="img"
                  aria-label={`${house.title} photo`}
                  className="aspect-square rounded-2xl bg-cover bg-center border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:scale-105 transition-transform"
                  style={{ backgroundImage: `url("${image.replace(/["\\]/g, '')}")` }}
                />
              ))}
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{house.title}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                  <MapPin size={15} className="text-red-500" />
                  <span>{house.area_name} • {house.address}</span>
                </p>
              </div>
              {house.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  <BadgeCheck size={14} /> Verified by SkoollHub
                </span>
              )}
            </div>

            <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-zinc-300 pt-2 border-t border-slate-100 dark:border-zinc-800">
              {house.description}
            </p>

            {/* Tags & Amenities Grid */}
            <div className="pt-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Lodge Amenities & Facilities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {house.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-200 font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Aside: Price breakdown & Landlord Contact */}
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-md space-y-5 sticky top-24">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Total Annual Rent
            </span>
            <p className="flex items-baseline gap-1 text-3xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
              {formatNaira(house.price_per_year)}
              <span className="text-xs font-medium text-slate-400">/ academic session</span>
            </p>
          </div>

          {/* Breakdown items */}
          <dl className="space-y-2.5 border-t border-slate-100 dark:border-zinc-800 pt-4 text-xs sm:text-sm">
            {[
              ['Caution Deposit (Refundable)', house.caution_deposit],
              ['Middleman Agent Fee', 0],
              ['Legal & Agreement Fee', house.legal_fee],
              ['Service Charge', house.service_charge],
            ].map(([label, amount]) => (
              <div key={label as string} className="flex justify-between items-center text-xs">
                <dt className="text-slate-500 dark:text-zinc-400">{label as string}</dt>
                <dd className={`font-bold ${amount === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                  {amount === 0 ? '₦0 (Zero Agent Cut)' : formatNaira(Number(amount))}
                </dd>
              </div>
            ))}
          </dl>

          {/* Owner details card */}
          {house.owner && (
            <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Lodge Host / Caretaker
              </p>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-sm">
                  {house.owner.full_name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {house.owner.full_name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Verified Host • @{house.owner.username}
                  </p>
                </div>
              </div>

              {/* Messaging & Call Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  href={`/messages?user=${encodeURIComponent(house.owner.id)}`}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle size={15} />
                  <span>Send In-App Message</span>
                </Link>

                {isUnlocked && house.owner.phone_number ? (
                  <a
                    href={`tel:${house.owner.phone_number}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-600/25"
                  >
                    <Phone size={15} />
                    <span>Call Landlord: {house.owner.phone_number}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => void unlockContact()}
                    disabled={paying}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-600/25 disabled:opacity-60"
                  >
                    <Phone size={15} />
                    <span>{paying ? 'Connecting...' : 'Unlock Direct Landlord Phone'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Safety Notice */}
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Always visit physically with a campus ambassador and verify keys before sending final rent payments.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
