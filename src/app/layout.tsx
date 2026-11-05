import type { Viewport, Metadata } from 'next';
import AppLaunchSplash from '@/components/pwa/AppLaunchSplash';
import PwaServiceWorker from '@/components/pwa/PwaServiceWorker';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
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
  icons: {
    icon: '/icons/skoollhub-192.png',
    apple: '/icons/skoollhub-180.png',
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
        <AppLaunchSplash />
        <PwaServiceWorker />
        {children}
      </body>
    </html>
  );
}