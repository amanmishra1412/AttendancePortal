'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingApprovals, approveUserAction, clearError } from '../../../store/slices/authSlice';
import { UserCheck, Check, X, CheckCircle, RefreshCw } from 'lucide-react';

export default function PendingApprovalsPage() {
  const dispatch = useDispatch();
  const { pendingApprovals, loading, message, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchPendingApprovals());
  }, [dispatch]);

  const handleApprove = (id) => {
    dispatch(clearError());
    dispatch(approveUserAction({ id, status: 'Active' }));
  };

  const handleReject = (id) => {
    dispatch(clearError());
    dispatch(approveUserAction({ id, status: 'Rejected' }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pending Registration Approvals</h1>
          <p className="text-slate-500 text-xs mt-1">Review OTP-verified employee registration requests before granting system dashboard access</p>
        </div>
        <button
          onClick={() => dispatch(fetchPendingApprovals())}
          className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 shadow-xs transition w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Alerts */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <X className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Approvals Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Employee ID</th>
                <th className="p-3.5">Name & Email</th>
                <th className="p-3.5">Proposed Base Salary</th>
                <th className="p-3.5">Email Verification</th>
                <th className="p-3.5 rounded-r-xl text-right">Approval Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!pendingApprovals || pendingApprovals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No pending employee registration approvals.</p>
                    <p className="text-[11px] text-slate-400 mt-1">New registrations verified via OTP will appear here for your review.</p>
                  </td>
                </tr>
              ) : (
                pendingApprovals.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-indigo-600">{emp.employeeId}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-slate-500 text-[11px]">{emp.email}</div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">₹{emp.baseSalary?.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> OTP Verified
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(emp._id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition inline-flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Account
                      </button>
                      <button
                        onClick={() => handleReject(emp._id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition inline-flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
