'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Wallet,
  Building2,
  ChevronRight,
  Sparkles,
  HelpCircle,
  X,
} from 'lucide-react';
import HowItWorksModal from './HowItWorksModal';

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const navItems = [
    { label: 'Employee Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'GPS Attendance Clock', href: '/attendance', icon: Clock },
    { label: 'Apply Leave', href: '/leave', icon: CalendarDays },
    { label: 'My Salary Payslips', href: '/salary', icon: Wallet },
    { label: 'Advances & Finance', href: '/finance', icon: Building2 },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Logo & Mobile Close Button */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center font-black text-white text-xl justify-center shadow-md shadow-indigo-500/20 shrink-0">
              HR
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-wide text-base flex items-center gap-1.5">
                AttendancePro <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              </h1>
              <p className="text-xs text-slate-500">Employee Workspace</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        {/* How It Works Action Tile */}
        <div className="px-4 mb-2">
          <button
            onClick={() => {
              if (onClose) onClose();
              setHowItWorksOpen(true);
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-50/80 to-violet-50/80 hover:from-indigo-100 hover:to-violet-100 border border-indigo-200/60 text-indigo-900 text-xs font-bold transition group shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">How It Works?</p>
                <p className="text-[10px] text-indigo-600 font-medium">Full Software Tour</p>
              </div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition" />
          </button>
        </div>

        {/* User Badge */}
        <div className="p-4 m-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {user?.name?.charAt(0) || 'E'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Employee'}</p>
              <span className="inline-block text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase">
                {user?.designation || 'Staff'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col justify-between h-screen sticky top-0 text-slate-700 shadow-sm shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-Over) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col transition ease-in-out duration-300 animate-in slide-in-from-left">
            {sidebarContent}
          </div>
        </div>
      )}

      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </>
  );
}
