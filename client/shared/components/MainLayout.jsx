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

  useEffect(() => {
    setMounted(true);
    if (pathname.startsWith('/admin') || pathname === '/' || pathname === '/login' || pathname === '/verify-otp') {
      return;
    }

    if (!localStorage.getItem('token')) {
      router.push('/');
    } else {
      dispatch(fetchMe());
    }
  }, [pathname, dispatch, router]);

  if (!mounted) return null;

  if (pathname.startsWith('/admin') || pathname === '/' || pathname === '/login' || pathname === '/verify-otp') {
    return <main className="min-h-screen bg-slate-50 text-slate-900">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
