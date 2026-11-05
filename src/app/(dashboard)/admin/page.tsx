'use client';

import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, LoaderCircle, ShieldCheck } from 'lucide-react';

type Listing = { id: string; title: string; owner_id: string; area_name: string; price_per_year: number; is_verified: boolean; is_featured: boolean };
type Plan = { id: string; code: string; name: string; amount_kobo: number; billing_interval: string; is_active: boolean };
type DashboardData = { listings: Listing[]; plans: Plan[]; metrics: { students: number; listings: number; materials: number; pendingPayments: number } };

function formatNaira(kobo: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);
}

export default function AdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      const response = await fetch('/api/admin', { cache: 'no-store' });
      const result = await response.json() as DashboardData & { error?: string };
      if (!response.ok) throw new Error(result.error || 'Could not load the admin dashboard.');
      setData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadDashboard(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const update = async (payload: Record<string, string | number | boolean>, key: string) => {
    setSaving(key);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Could not save this update.');
      setNotice('Admin changes saved.');
      await loadDashboard();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this update.');
    } finally {
      setSaving('');
    }
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><LoaderCircle className="animate-spin text-indigo-600" /></div>;
  if (error && !data) return <main className="mx-auto max-w-3xl px-4 py-10"><p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p></main>;
  if (!data) return null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3"><ShieldCheck className="text-indigo-600 dark:text-indigo-300" size={26} /><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Administrator</p><h1 className="text-2xl font-black text-slate-900 dark:text-white">SkoollHub control centre</h1></div></div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">{notice}</p>}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
        ['Students', data.metrics.students],
        ['Housing listings', data.metrics.listings],
        ['Course materials', data.metrics.materials],
        ['Pending payments', data.metrics.pendingPayments],
      ].map(([label, count]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-slate-500 dark:text-zinc-400">{label}</p><p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{count}</p></article>)}</section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Housing review queue</h2>
        <div className="mt-3 space-y-3">{data.listings.length ? data.listings.map((listing) => <article key={listing.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><div><h3 className="font-bold text-slate-900 dark:text-white">{listing.title}</h3><p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{listing.area_name} · {formatNaira(Number(listing.price_per_year) * 100)}/year</p></div><div className="flex items-center gap-2"><label className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300"><input type="checkbox" checked={listing.is_featured} onChange={(event) => void update({ type: 'listing', id: listing.id, is_verified: true, is_featured: event.target.checked }, listing.id)} />Featured</label><button disabled={saving === listing.id} onClick={() => void update({ type: 'listing', id: listing.id, is_verified: true, is_featured: listing.is_featured }, listing.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><BadgeCheck size={14} />Verify</button></div></article>) : <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-zinc-700 dark:text-zinc-400">No listings need verification.</p>}</div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subscription pricing</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Prices are set in kobo. Keep plans disabled until Paystack is configured.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">{data.plans.map((plan) => <PlanEditor key={plan.id} plan={plan} saving={saving === plan.id} onSave={(amountKobo, isActive) => void update({ type: 'plan', id: plan.id, amount_kobo: amountKobo, is_active: isActive }, plan.id)} />)}</div>
      </section>
    </main>
  );
}

function PlanEditor({ plan, saving, onSave }: { plan: Plan; saving: boolean; onSave: (amountKobo: number, isActive: boolean) => void }) {
  const [amount, setAmount] = useState(String(plan.amount_kobo));
  const [active, setActive] = useState(plan.is_active);
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><h3 className="font-bold text-slate-900 dark:text-white">{plan.name}</h3><p className="text-xs text-slate-500">{plan.code} · {plan.billing_interval}</p><label className="mt-3 block text-xs font-semibold text-slate-600 dark:text-zinc-300">Amount (kobo)<input type="number" min="0" step="100" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" /></label><label className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />Available for purchase</label><p className="mt-2 text-xs text-slate-500">Current: {formatNaira(plan.amount_kobo)}</p><button disabled={saving} onClick={() => onSave(Number(amount), active)} className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save plan'}</button></article>;
}
