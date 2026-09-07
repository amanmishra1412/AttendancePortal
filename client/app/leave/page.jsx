'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLeaves,
  applyLeaveAction,
  updateLeaveStatusAction,
  clearLeaveStatus,
} from '../../store/slices/leaveSlice';
import { formatDateIST } from '../../shared/utils/dateTime';
import { api } from '../../shared/services/api';
import {
  PlusCircle,
  CheckCircle,
  XCircle,
  Check,
  X,
  CalendarDays,
  Award,
  Clock,
  PartyPopper,
  Sparkles,
  Gift,
  ShieldCheck,
} from 'lucide-react';

export default function LeavePage() {
  const dispatch = useDispatch();
  const { list: leaves, loading, error, successMessage } = useSelector((state) => state.leave);
  const { user } = useSelector((state) => state.auth);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [holidaysLoading, setHolidaysLoading] = useState(true);

  const [formData, setFormData] = useState({
    leaveType: 'Unpaid',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchHolidaysList = async () => {
    try {
      const res = await api.get('/holidays');
      setHolidays(res.data.holidays || []);
    } catch (e) {
      console.error(e);
    } finally {
      setHolidaysLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchLeaves({ status: filterStatus }));
    fetchHolidaysList();
  }, [dispatch, filterStatus]);

  const handleApply = async (e) => {
    e.preventDefault();
    const res = await dispatch(applyLeaveAction(formData));
    if (res.meta.requestStatus === 'fulfilled') {
      setShowApplyModal(false);
      setFormData({ leaveType: 'Unpaid', startDate: '', endDate: '', reason: '' });
    }
  };

  const handleStatusChange = (id, status) => {
    dispatch(updateLeaveStatusAction({ id, status }));
  };

  const isAdmin = user?.role === 'Admin';

  const upcomingHolidays = holidays.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-sans flex items-center gap-2">
            <span>Leave Management & Official Holidays</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Submit leave applications, track status, and view official paid festival holidays (Diwali, Raksha Bandhan, Eid, etc.)
          </p>
        </div>
        <button
          onClick={() => {
            dispatch(clearLeaveStatus());
            setShowApplyModal(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Official Holiday & Sunday Work Policy Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Official Company Holiday & 100% Paid Policy
              </span>
            </div>
            <h3 className="text-base font-bold text-white">Festivals & Sundays are 100% Paid (No Salary Deductions)</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Official company holidays (Diwali, Holi, Raksha Bandhan, Eid, Independence Day, etc.) and Sundays are fully authorized paid days off.
              Employees do not need to punch in on these days, and <span className="text-emerald-300 font-bold">zero payment is deducted</span> from your monthly salary.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs shrink-0 space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Base Pay Protected</span>
            </div>
            <p className="text-[11px] text-slate-300">Automatic payroll holiday credit</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Official Holidays Listed</span>
          <p className="text-xl font-black text-indigo-600 mt-1">{holidays.length} Declared Days</p>
          <p className="text-[11px] text-slate-400 mt-1">100% Paid (Festivals & National)</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Approved Leave Requests</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {leaves.filter((l) => l.status === 'Approved').length} Requests
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Current year total</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {leaves.filter((l) => l.status === 'Pending').length} Pending
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting manager review</p>
        </div>
      </div>

      {/* Official Holiday Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Official Company & Festival Holidays (100% Paid)</h2>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Zero Salary Deduction
          </span>
        </div>

        {holidaysLoading ? (
          <div className="py-8 text-center text-xs text-slate-400 font-semibold">Loading holidays...</div>
        ) : holidays.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No holidays found in calendar.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingHolidays.map((h) => {
              const dateObj = new Date(`${h.date}T00:00:00`);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const dateFormatted = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

              return (
                <div
                  key={h._id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-200 transition space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-lg">🎉</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {h.type}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{h.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{dateFormatted} ({dayName})</p>
                  </div>
                  <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Paid Off
                    </span>
                    <span className="text-slate-400">No punch needed</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leaves List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">Leave Applications History</h2>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                {isAdmin && <th className="p-3.5 rounded-l-xl">Employee</th>}
                <th className="p-3.5">Leave Type</th>
                <th className="p-3.5">Dates</th>
                <th className="p-3.5">Total Days</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Status</th>
                {isAdmin && <th className="p-3.5 rounded-r-xl text-right">Approval Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition">
                    {isAdmin && (
                      <td className="p-3.5 font-semibold text-slate-900">
                        {item.employee?.name} <span className="text-slate-400 text-[10px]">({item.employee?.employeeId})</span>
                      </td>
                    )}
                    <td className="p-3.5 font-bold text-indigo-700">{item.leaveType} Leave</td>
                    <td className="p-3.5 text-slate-700 font-mono">
                      {formatDateIST(item.startDate)} to {formatDateIST(item.endDate)}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">{item.totalDays} day(s)</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{item.reason}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-3.5 text-right space-x-2">
                        {item.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleStatusChange(item._id, 'Approved')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[11px] font-bold transition inline-flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(item._id, 'Rejected')}
                              className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 text-[11px] font-bold transition inline-flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Decided</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 w-full max-w-lg p-5 sm:p-6 rounded-3xl space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Submit Leave Application</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-900 text-sm p-1 rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600 font-medium"
                >
                  <option value="Unpaid">Unpaid Leave</option>
                  <option value="Casual">Casual / Medical Leave</option>
                  <option value="Other">Other Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason for Leave *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain brief reason for your leave request..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
