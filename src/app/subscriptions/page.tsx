'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BadgeCheck, LoaderCircle, Sparkles } from 'lucide-react';

type Plan = {
  id: string;
  code: string;
  name: string;
  description: string;
  amount_kobo: number;
  billing_interval: 'month' | 'year';
  features: string[];
};
type Subscription = { expires_at: string | null; subscription_plans: { name: string; code: string } | null } | null;

function formatNaira(kobo: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);
}

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const paidNotice = searchParams.get('paid') === '1';
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState('');
  const [error, setError] = useState('');
  const [notice] = useState(paidNotice ? 'Your payment was verified and your subscription is active.' : '');

  const loadPlans = useCallback(async () => {
    try {
      const response = await fetch('/api/subscriptions', { cache: 'no-store' });
      const data = await response.json() as { plans?: Plan[]; subscription?: Subscription; error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not load subscription plans.');
      setPlans(data.plans ?? []);
      setSubscription(data.subscription ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load subscription plans.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadPlans(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPlans]);

  const startPayment = async (planCode: string) => {
    setPaying(planCode);
    setError('');
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_code: planCode }),
      });
      const data = await response.json() as { authorization_url?: string; error?: string };
      if (!response.ok || !data.authorization_url) throw new Error(data.error || 'Could not start payment.');
      window.location.assign(data.authorization_url);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Could not start payment.');
      setPaying('');
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Student plans</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Choose your SkoollHub plan</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Secure payments are processed by Paystack. Subscription access is time-limited and renews only when you choose to pay again.</p>
      </div>

      {subscription && (
        <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          <BadgeCheck className="mr-2 inline" size={17} />Active plan: <strong>{subscription.subscription_plans?.name ?? 'Subscription'}</strong>
          {subscription.expires_at && ` · Expires ${new Date(subscription.expires_at).toLocaleDateString()}`}
        </p>
      )}
      {notice && <p role="status" className="mx-auto mt-4 max-w-2xl rounded-xl bg-emerald-50 p-3 text-center text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">{notice}</p>}
      {error && <p role="alert" className="mx-auto mt-4 max-w-2xl rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16"><LoaderCircle className="animate-spin text-indigo-600" /></div>
      ) : plans.length ? (
        <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <Sparkles className="text-indigo-600 dark:text-indigo-300" size={21} />
              <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">{plan.name}</h2>
              <p className="mt-2 min-h-10 text-sm text-slate-600 dark:text-zinc-400">{plan.description}</p>
              <p className="mt-5 text-2xl font-black text-indigo-700 dark:text-indigo-300">{formatNaira(plan.amount_kobo)}<span className="text-xs font-medium text-slate-500"> / {plan.billing_interval}</span></p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-700 dark:text-zinc-300">
                {(plan.features ?? []).map((feature) => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <button
                type="button"
                disabled={paying !== '' || plan.amount_kobo <= 0}
                onClick={() => void startPayment(plan.code)}
                className="mt-6 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paying === plan.code ? 'Connecting to Paystack…' : plan.amount_kobo > 0 ? 'Continue to secure payment' : 'Not available yet'}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-zinc-700">
          <p className="font-semibold text-slate-800 dark:text-white">No paid plans are available yet.</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">An administrator must configure pricing and payment credentials before checkout can be enabled.</p>
        </div>
      )}
      <p className="mt-8 text-center text-xs text-slate-500 dark:text-zinc-400"><Link href="/settings" className="underline">Manage account settings</Link></p>
    </main>
  );
}

export default function SubscriptionsPage() {
  return <Suspense fallback={<div className="py-16 text-center"><LoaderCircle className="mx-auto animate-spin text-indigo-600" /></div>}><SubscriptionContent /></Suspense>;
}
