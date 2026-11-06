import { Suspense } from 'react';
import AppNavbar from '@/components/layout/AppNavbar';
import DashboardAssistant from '@/components/layout/DashboardAssistant';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell min-h-screen bg-amber-50/20 dark:bg-zinc-950">
      <Suspense fallback={<div className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:block" />}>
        <AppNavbar />
      </Suspense>
      <main className="app-page min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))] md:ml-64 md:pb-8">
        {children}
      </main>
      <DashboardAssistant />
    </div>
  );
}