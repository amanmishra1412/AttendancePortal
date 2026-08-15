'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingApprovals, approveUserAction, clearError } from '../../../store/slices/authSlice';
import {
  fetchRegularizationRequests,
  reviewRegularization,
  clearAttendanceMessage,
} from '../../../store/slices/attendanceSlice';
import { UserCheck, Check, X, CheckCircle, RefreshCw, Clock, FileText } from 'lucide-react';

export default function PendingApprovalsPage() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('regularization'); // default tab

  const { pendingApprovals, loading: authLoading, message: authMsg, error: authErr } = useSelector((state) => state.auth);
  const {
    regularizationRequests,
    loading: attLoading,
    message: attMsg,
    error: attErr,
  } = useSelector((state) => state.attendance);

  const loadData = () => {
    dispatch(fetchPendingApprovals());
    dispatch(fetchRegularizationRequests({ status: 'Pending' }));
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleApproveRegistration = (id) => {
    dispatch(clearError());
    dispatch(approveUserAction({ id, status: 'Active' }));
  };

  const handleRejectRegistration = (id) => {
    dispatch(clearError());
    dispatch(approveUserAction({ id, status: 'Rejected' }));
  };

  const handleApproveRegularization = async (id) => {
    dispatch(clearAttendanceMessage());
    const res = await dispatch(reviewRegularization({ id, status: 'Approved' }));
    if (reviewRegularization.fulfilled.match(res)) {
      dispatch(fetchRegularizationRequests({ status: 'Pending' }));
    }
  };

  const handleRejectRegularization = async (id) => {
    dispatch(clearAttendanceMessage());
    const res = await dispatch(reviewRegularization({ id, status: 'Rejected' }));
    if (reviewRegularization.fulfilled.match(res)) {
      dispatch(fetchRegularizationRequests({ status: 'Pending' }));
    }
  };

  const activeMessage = authMsg || attMsg;
  const activeError = authErr || attErr;
  const loading = authLoading || attLoading;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Approvals & Regularization Hub</h1>
          <p className="text-slate-500 text-xs mt-1">
            Review registration requests & employee attendance regularization corrections
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 shadow-xs transition w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('regularization')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition border ${
            activeTab === 'regularization'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Attendance Regularizations</span>
          {regularizationRequests?.length > 0 && (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
              {regularizationRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('registration')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition border ${
            activeTab === 'registration'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Staff Registrations</span>
          {pendingApprovals?.length > 0 && (
            <span className="bg-emerald-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
              {pendingApprovals.length}
            </span>
          )}
        </button>
      </div>

      {/* Alerts */}
      {activeMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{activeMessage}</span>
        </div>
      )}
      {activeError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <X className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}

      {/* Tab 1: Attendance Regularizations */}
      {activeTab === 'regularization' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pending Attendance Punch Corrections</h2>
              <p className="text-xs text-slate-500">Employee punch in/out requests with missing log reasons</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Employee</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Requested Times</th>
                  <th className="p-3.5">Reason Submitted</th>
                  <th className="p-3.5">Submitted On</th>
                  <th className="p-3.5 rounded-r-xl text-right">Admin Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!regularizationRequests || regularizationRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">No pending attendance regularization requests.</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Correction requests submitted by employees will appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  regularizationRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{req.employee?.name || 'Staff Member'}</div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          {req.employee?.employeeId} &bull; {req.employee?.email}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-indigo-600">{req.date}</td>
                      <td className="p-3.5">
                        <div className="font-mono text-slate-800">
                          <span className="text-emerald-700 font-semibold">In:</span>{' '}
                          {new Date(req.requestedPunchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="font-mono text-slate-800">
                          <span className="text-rose-700 font-semibold">Out:</span>{' '}
                          {new Date(req.requestedPunchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs italic">
                          "{req.reason}"
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleApproveRegularization(req._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept & Update
                        </button>
                        <button
                          onClick={() => handleRejectRegularization(req._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition inline-flex items-center gap-1"
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
      )}

      {/* Tab 2: Staff Registrations */}
      {activeTab === 'registration' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pending Employee Account Registration Approvals</h2>
              <p className="text-xs text-slate-500">Review OTP-verified employee signup requests</p>
            </div>
          </div>

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
                          onClick={() => handleApproveRegistration(emp._id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve Account
                        </button>
                        <button
                          onClick={() => handleRejectRegistration(emp._id)}
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
      )}
    </div>
  );
}
