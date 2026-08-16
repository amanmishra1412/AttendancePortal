'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Clock,
  CalendarDays,
  Wallet,
  Building2,
  Settings,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { fetchMe, logout, fetchPendingApprovals } from '../../store/slices/authSlice';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, pendingApprovals } = useSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (pathname === '/admin/login') {
      setAuthorized(true);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    let currentUser = user;
    if (!currentUser && storedUserStr) {
      try {
        currentUser = JSON.parse(storedUserStr);
      } catch (e) {}
    }

    if (!token) {
      router.replace('/admin/login');
    } else if (currentUser && currentUser.role !== 'Admin') {
      router.replace('/dashboard');
    } else {
      setAuthorized(true);
      dispatch(fetchMe());
      dispatch(fetchPendingApprovals());
    }
  }, [pathname, dispatch, router, user]);

  if (!mounted || !authorized) return null;

  if (pathname === '/admin/login') {
    return <main className="min-h-screen bg-slate-50 text-slate-900">{children}</main>;
  }

  const navItems = [
    { label: 'Admin Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    {
      label: 'Pending Approvals',
      href: '/admin/approvals',
      icon: UserCheck,
      badge: pendingApprovals?.length || 0,
    },
    { label: 'Employee Directory', href: '/admin/employees', icon: Users },
    { label: 'Attendance Logs', href: '/admin/attendance', icon: Clock },
    { label: 'Leave Approvals', href: '/admin/leave', icon: CalendarDays },
    { label: 'Salary & Payroll', href: '/admin/salary', icon: Wallet },
    { label: 'Finance & Advances', href: '/admin/finance', icon: Building2 },
    { label: 'Office GPS Settings', href: '/admin/settings', icon: Settings },
    { label: 'System Audit Logs', href: '/admin/audit', icon: ShieldAlert },
  ];

  const adminSidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Logo Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center font-black text-white text-lg justify-center shadow-md shadow-indigo-500/20 shrink-0">
            AD
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-wide text-base flex items-center gap-1.5">
              AdminPortal <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Enterprise HRMS</p>
          </div>
        </div>

        {/* Close Button on Mobile */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          aria-label="Close admin menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto min-h-0 text-xs font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 ? (
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-white/80" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User Info Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 shrink-0">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
              AD
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'System Admin'}</p>
              <span className="inline-block text-[9px] text-indigo-700 font-extrabold uppercase tracking-wide">
                SYSTEM ADMIN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 text-slate-700 shadow-sm z-40 shrink-0">
        {adminSidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col transition ease-in-out duration-300 animate-in slide-in-from-left">
            {adminSidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sm:h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              aria-label="Open admin menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight line-clamp-1">Admin Center</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">Approval Queue, Payroll & Policies</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => {
                dispatch(logout());
                router.push('/admin/login');
              }}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold border border-rose-200 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto w-full max-w-full">{children}</main>
      </div>
    </div>
  );
}
