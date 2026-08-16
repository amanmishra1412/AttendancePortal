'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { fetchMe } from '../../store/slices/authSlice';

export default function MainLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  const isPublicOrAdmin = pathname.startsWith('/admin') || pathname === '/' || pathname === '/verify-otp';

  useEffect(() => {
    setMounted(true);
    if (isPublicOrAdmin) {
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.replace('/');
    } else {
      dispatch(fetchMe());
    }
  }, [pathname, dispatch, router, isPublicOrAdmin]);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!mounted) return null;

  if (isPublicOrAdmin) {
    return <main className="min-h-screen bg-slate-50 text-slate-900">{children}</main>;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto w-full max-w-full">{children}</main>
      </div>
    </div>
  );
}
