'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchFinanceHistory,
  requestFinanceAction,
  updateFinanceStatusAction,
  clearFinanceStatus,
} from '../../store/slices/financeSlice';
import { fetchEmployees } from '../../store/slices/employeeSlice';
import { Building2, PlusCircle, CheckCircle, XCircle, Check, X, CreditCard, DollarSign, UserCheck } from 'lucide-react';

export default function FinancePage() {
  const dispatch = useDispatch();
  const { list: records, loading, error, message } = useSelector((state) => state.finance);
  const { list: employees } = useSelector((state) => state.employee);
  const { user } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'Advance',
    amount: 10000,
    reason: '',
    repaymentMonths: 3,
  });

  useEffect(() => {
    dispatch(fetchFinanceHistory());
    if (user?.role === 'Admin') {
      dispatch(fetchEmployees());
    }
  }, [dispatch, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(requestFinanceAction(formData));
    if (res.meta.requestStatus === 'fulfilled') {
      setShowModal(false);
      setFormData({ employeeId: '', type: 'Advance', amount: 10000, reason: '', repaymentMonths: 3 });
      dispatch(fetchFinanceHistory());
    }
  };

  const handleStatusChange = (id, status) => {
    dispatch(updateFinanceStatusAction({ id, status }));
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Salary Advances & Financial Disbursals</h1>
          <p className="text-slate-500 text-xs mt-1">Issue advance salary loans, bonuses, & track monthly recovery schedules</p>
        </div>
        <button
          onClick={() => {
            dispatch(clearFinanceStatus());
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAdmin ? 'Issue Advance / Bonus' : 'New Advance Request'}</span>
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
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                {isAdmin && <th className="p-3.5 rounded-l-xl">Employee</th>}
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Disbursed Amount</th>
                <th className="p-3.5">Reason / Purpose</th>
                <th className="p-3.5">Recovery Tenure</th>
                <th className="p-3.5">Monthly Deduction</th>
                <th className="p-3.5">Status</th>
                {isAdmin && <th className="p-3.5 rounded-r-xl text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-10 text-slate-400">
                    No financial advance or bonus records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition">
                    {isAdmin && (
                      <td className="p-3.5 font-semibold text-slate-900">
                        {r.employee?.name} <span className="text-slate-400 text-[10px]">({r.employee?.employeeId})</span>
                      </td>
                    )}
                    <td className="p-3.5 font-bold text-indigo-700">{r.type}</td>
                    <td className="p-3.5 font-black text-slate-900 text-sm">₹{r.amount?.toLocaleString()}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{r.reason}</td>
                    <td className="p-3.5 text-slate-700 font-medium">
                      {r.type === 'Advance' ? `${r.repaymentMonths} Month(s)` : 'N/A'}
                    </td>
                    <td className="p-3.5 text-rose-600 font-bold">
                      {r.type === 'Advance' ? `₹${r.monthlyDeduction?.toLocaleString()}/mo` : '₹0'}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-3.5 text-right space-x-2">
                        {r.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleStatusChange(r._id, 'Approved')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[11px] font-bold transition inline-flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(r._id, 'Rejected')}
                              className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 text-[11px] font-bold transition inline-flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Approved</span>
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
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 w-full max-w-lg p-5 sm:p-6 rounded-3xl space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {isAdmin ? 'Disburse Advance / Bonus' : 'Request Salary Advance'}
                </h3>
                <p className="text-xs text-slate-500">Auto-calculated monthly payroll deductions</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 text-sm p-1 rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {isAdmin && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Employee *</label>
                  <select
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600"
                  >
                    <option value="">Choose Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.employeeId}) - Base: ₹{emp.baseSalary?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Request / Disbursal Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600"
                >
                  <option value="Advance">Salary Advance Loan</option>
                  <option value="Bonus">Performance Bonus</option>
                  <option value="Reimbursement">Expense Reimbursement</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl p-3 outline-none focus:border-indigo-600"
                />
              </div>

              {formData.type === 'Advance' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Repayment Recovery Tenure</label>
                  <select
                    value={formData.repaymentMonths}
                    onChange={(e) => setFormData({ ...formData, repaymentMonths: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600"
                  >
                    <option value={1}>1 Month (Full Recovery)</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={4}>4 Months</option>
                    <option value={6}>6 Months</option>
                  </select>
                  <p className="text-[11px] text-indigo-700 font-semibold mt-1">
                    Monthly Auto-Deduction: ₹{Math.round(formData.amount / formData.repaymentMonths).toLocaleString()}/month
                  </p>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason / Notes *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {isAdmin ? 'Confirm & Disburse' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
