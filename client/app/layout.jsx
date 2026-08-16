import './globals.css';
import StoreProvider from '../store/StoreProvider';
import MainLayout from '../shared/components/MainLayout';
import PwaManager from '../shared/components/PwaManager';

export const metadata = {
  title: 'AttendancePro - HRMS & Payroll Management System',
  description: 'Production-ready location-based attendance & payroll system',
  applicationName: 'AttendancePro',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AttendancePro',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AttendancePro" />
      </head>
      <body className="antialiased bg-slate-950 text-slate-100">
        <StoreProvider>
          <PwaManager />
          <MainLayout>{children}</MainLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
