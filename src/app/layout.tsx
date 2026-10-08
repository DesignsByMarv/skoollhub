import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkoollHub — All-in-One Nigerian Student Platform',
  description: 'Housing, Roommates, Timetables, Social Feed & AI Assistant for Nigerian Campus Students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}