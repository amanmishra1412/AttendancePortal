import './globals.css';
import StoreProvider from '../store/StoreProvider';
import MainLayout from '../shared/components/MainLayout';

export const metadata = {
  title: 'AttendancePro - HRMS & Payroll Management System',
  description: 'Production-ready location-based attendance & payroll system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        <StoreProvider>
          <MainLayout>{children}</MainLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
