export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-amber-50/20 dark:bg-zinc-950">
      {children}
    </div>
  );
}