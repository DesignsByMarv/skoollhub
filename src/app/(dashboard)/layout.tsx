import AppNavbar from '@/components/layout/AppNavbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell min-h-screen bg-amber-50/20 dark:bg-zinc-950">
      <AppNavbar />
      <main className="app-page min-h-[calc(100vh-4rem)] pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}