'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../../../shared/services/api';
import { fetchPendingApprovals, approveUserAction } from '../../../store/slices/authSlice';
import { Users, UserCheck, CalendarDays, Wallet, CheckCircle2, Check, X, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { pendingApprovals } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

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

  useEffect(() => {
    fetchStats();
    dispatch(fetchPendingApprovals());
  }, [dispatch]);

  const handleApprove = async (id, name) => {
    await dispatch(approveUserAction({ id, status: 'Active' }));
    dispatch(fetchPendingApprovals());
    fetchStats();
    setActionMsg(`Approved employee ${name}! Account is now Active.`);
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleReject = async (id, name) => {
    await dispatch(approveUserAction({ id, status: 'Rejected' }));
    dispatch(fetchPendingApprovals());
    fetchStats();
    setActionMsg(`Rejected registration for ${name}.`);
    setTimeout(() => setActionMsg(null), 4000);
  };

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
              <span>Pending Approvals ({pendingApprovals?.length || 0})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

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

      {/* Pending User Registrations Quick-Approve Box */}
      {pendingApprovals && pendingApprovals.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 className="text-base font-bold text-slate-900">
                Staff Registrations Awaiting Approval ({pendingApprovals.length})
              </h2>
            </div>
            <Link
              href="/admin/approvals"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Open Approvals Hub &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">ID</th>
                  <th className="p-3">Staff Name & Email</th>
                  <th className="p-3">Role / Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl text-right">Instant Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApprovals.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-indigo-600">{u.employeeId}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-slate-500 text-[11px]">{u.email}</div>
                    </td>
                    <td className="p-3 text-slate-700">
                      {u.department || 'Engineering'} &bull; {u.designation || 'Staff'}
                    </td>
                    <td className="p-3">
                      <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> Pending Approval
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(u._id, u.name)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition inline-flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Account
                      </button>
                      <button
                        onClick={() => handleReject(u._id, u.name)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition inline-flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
