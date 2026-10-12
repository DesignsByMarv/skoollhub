import Link from 'next/link';
import { ArrowLeft, Clock3 } from 'lucide-react';

export default function FeatureUnavailable({ name }: { name: string }) {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
        <Clock3 size={28} />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">{name} is not available right now</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-zinc-400">
        We’re working on this feature. You can still use the campus feed to share updates and connect with students.
      </p>
      <Link href="/feed" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
        <ArrowLeft size={16} />Go to Home
      </Link>
    </section>
  );
}
