'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { api } from '../../shared/services/api';
import {
  Users,
  UserCheck,
  CalendarDays,
  Wallet,
  Clock,
  ArrowUpRight,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);
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

  const isAdmin = user?.role === 'Admin';

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white p-6 rounded-3xl relative overflow-hidden shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Live HR Dashboard</span>
            </div>
            <h1 className="text-2xl font-black text-white">Welcome back, {user?.name}! 👋</h1>
            <p className="text-indigo-100 text-xs mt-1">
              {isAdmin
                ? 'Overview of company attendance, payroll expense, and leave requests.'
                : `Employee Portal - ${user?.designation} (${user?.department})`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/attendance"
              className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Go to Attendance Clock</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      {isAdmin ? (
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
              <span className="text-xs font-semibold text-slate-500">Pending Leave Approvals</span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-amber-600">{stats?.pendingLeaves || 0}</p>
            <Link href="/leave" className="text-[11px] text-indigo-600 font-semibold hover:underline mt-2 inline-block">
              Review Leave Applications &rarr;
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
            <p className="text-[11px] text-slate-500 mt-2">Current Month Net Payout</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">Today's Attendance</span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p
              className={`text-2xl font-black ${
                stats?.todayStatus === 'Present' ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {stats?.todayStatus || 'Not Punched'}
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              {stats?.punchInTime ? `Punched at ${new Date(stats.punchInTime).toLocaleTimeString()}` : 'Awaiting Punch In'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">Remaining Paid Leaves</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-emerald-600">{stats?.paidLeaveQuota || 0} Days</p>
            <p className="text-[11px] text-slate-500 mt-2">Annual Leave Balance</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">Pending Requests</span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-amber-600">{stats?.pendingLeaves || 0}</p>
            <p className="text-[11px] text-slate-500 mt-2">Awaiting Manager Approval</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">Last Take-Home Pay</span>
              <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">₹{(stats?.lastNetSalary || 0).toLocaleString()}</p>
            <Link href="/salary" className="text-[11px] text-indigo-600 font-semibold hover:underline mt-2 inline-block">
              View Pay Slips &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="p-3 w-fit rounded-xl bg-indigo-50 text-indigo-600">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">GPS Location Attendance</h3>
            <p className="text-xs text-slate-500 mt-1">
              Verify office coordinates, check allowed distance radius, punch in and out seamlessly.
            </p>
          </div>
          <Link
            href="/attendance"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>Open Punch Screen</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="p-3 w-fit rounded-xl bg-emerald-50 text-emerald-600">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Leave Management</h3>
            <p className="text-xs text-slate-500 mt-1">
              Submit leave requests, check status, or approve employee applications as an admin.
            </p>
          </div>
          <Link
            href="/leave"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            <span>Manage Leave</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="p-3 w-fit rounded-xl bg-violet-50 text-violet-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Salary & PDF Payslips</h3>
            <p className="text-xs text-slate-500 mt-1">
              Automated minute-rate payroll engine calculating overtime, shortfalls & instant PDF pay slip downloads.
            </p>
          </div>
          <Link
            href="/salary"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700"
          >
            <span>View Salary Engine</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
