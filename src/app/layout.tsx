import type { Viewport, Metadata } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#7E22CE',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'SkoollHub',
  description: 'Mobile campus platform for Nigerian students',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SkoollHub',
  },
};

// Make sure 'export default' is present right here!
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}