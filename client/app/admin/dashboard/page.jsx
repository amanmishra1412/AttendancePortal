'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../shared/services/api';
import { Users, UserCheck, CalendarDays, Wallet, CheckCircle2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white p-6 rounded-3xl relative overflow-hidden shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Admin Control Center</span>
            </div>
            <h1 className="text-2xl font-black text-white">HRMS Operations & Executive Overview</h1>
            <p className="text-indigo-100 text-xs mt-1">Company-wide attendance status, pending registrations, and monthly payroll budget</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/approvals"
              className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Pending Registration Queue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Active Staff Accounts</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalEmployees || 0}</p>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active System Users
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Punched In Today</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">{stats?.presentToday || 0}</p>
          <p className="text-[11px] text-slate-500 mt-2">Verified Geofence Punches</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Pending Leave Requests</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">{stats?.pendingLeaves || 0}</p>
          <Link href="/admin/leave" className="text-[11px] text-indigo-600 font-semibold hover:underline mt-2 inline-block">
            Review Leave Queue &rarr;
          </Link>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Monthly Payroll Budget</span>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">₹{(stats?.totalSalaryExpense || 0).toLocaleString()}</p>
          <Link href="/admin/salary" className="text-[11px] text-violet-600 font-semibold hover:underline mt-2 inline-block">
            Run Payroll Engine &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
