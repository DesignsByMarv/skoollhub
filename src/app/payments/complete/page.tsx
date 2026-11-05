'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

function PaymentResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!reference) return;
    let active = true;
    void fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json() as { purpose?: string; resource_id?: string; error?: string };
        if (!response.ok) throw new Error(data.error || 'Could not verify payment.');
        if (!active) return;
        if (data.purpose === 'housing_contact' && data.resource_id) {
          router.replace(`/houses/${data.resource_id}?contact=unlocked`);
        } else {
          router.replace('/subscriptions?paid=1');
        }
      })
      .catch((verifyError: unknown) => {
        if (active) setError(verifyError instanceof Error ? verifyError.message : 'Could not verify payment.');
      });
    return () => { active = false; };
  }, [reference, router]);

  if (!reference) return <main className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="text-xl font-bold text-slate-900 dark:text-white">Payment reference missing</h1><p role="alert" className="mt-3 text-sm text-rose-600">Return to the app and check your payment status before retrying.</p></main>;
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      {error ? (
        <>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Payment not confirmed</h1>
          <p role="alert" className="mt-3 text-sm text-rose-600 dark:text-rose-300">{error}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">Do not pay again until you have checked your payment history or contacted support.</p>
        </>
      ) : (
        <>
          <LoaderCircle className="animate-spin text-indigo-600" size={30} />
          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Verifying your payment</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Please wait while we confirm the transaction directly with Paystack.</p>
        </>
      )}
    </main>
  );
}

export default function PaymentCompletePage() {
  return <Suspense fallback={<div className="py-16 text-center"><LoaderCircle className="mx-auto animate-spin text-indigo-600" /></div>}><PaymentResult /></Suspense>;
}
