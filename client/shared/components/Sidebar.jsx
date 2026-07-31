'use client';

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
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { label: 'Employee Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'GPS Attendance Clock', href: '/attendance', icon: Clock },
    { label: 'Apply Leave', href: '/leave', icon: CalendarDays },
    { label: 'My Salary Payslips', href: '/salary', icon: Wallet },
    { label: 'Advances & Finance', href: '/finance', icon: Building2 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 text-slate-700 shadow-sm">
      <div>
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center font-black text-white text-xl justify-center shadow-md shadow-indigo-500/20">
            HR
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-wide text-base flex items-center gap-1.5">
              AttendancePro <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-xs text-slate-500">Employee Workspace</p>
          </div>
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

      {/* User Badge */}
      <div className="p-4 m-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white text-sm">
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
    </aside>
  );
}
