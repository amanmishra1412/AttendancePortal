'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSalaries,
  generateSalaryAction,
  clearSalaryStatus,
} from '../../store/slices/salarySlice';
import { api } from '../../shared/services/api';
import { Wallet, Play, FileText, CheckCircle, XCircle, Calculator, Download, Loader2 } from 'lucide-react';

export default function SalaryPage() {
  const dispatch = useDispatch();
  const { list: salaries, loading, generating, error, message } = useSelector((state) => state.salary);
  const { user } = useSelector((state) => state.auth);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [loadingPdfId, setLoadingPdfId] = useState(null);

  useEffect(() => {
    dispatch(fetchSalaries({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  const handleGenerateSalary = async () => {
    dispatch(clearSalaryStatus());
    const res = await dispatch(generateSalaryAction({ month: selectedMonth, year: selectedYear }));
    if (res.meta.requestStatus === 'fulfilled') {
      dispatch(fetchSalaries({ month: selectedMonth, year: selectedYear }));
    }
  };

  const handlePdfView = async (salaryId) => {
    setLoadingPdfId(salaryId);
    try {
      const res = await api.get(`/salary/${salaryId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPreviewPdfUrl(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate salary slip PDF. Please try again.');
    } finally {
      setLoadingPdfId(null);
    }
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-sans">Salary Tracker & Payroll Engine</h1>
          <p className="text-slate-500 text-xs mt-1">
            Exact minute-rate salary calculation (Base/30 & Base/270), overtime, shortfalls, & Sunday working pay
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleGenerateSalary}
            disabled={generating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition w-fit"
          >
            <Play className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Calculating Payroll...' : `Run Payroll (${selectedMonth}/${selectedYear})`}</span>
          </button>
        )}
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

      {/* Rate Breakdown Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-violet-50 border border-indigo-100 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Minute-Level Math Standard</h3>
            <p className="text-xs text-slate-600">
              Daily Rate = Base / 30 | Hourly Rate = Daily / 9 | Minute Rate = Hourly / 60
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">Period:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-white border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none shadow-xs"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('en', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none shadow-xs"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {/* Salaries Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                {isAdmin && <th className="p-3.5 rounded-l-xl">Employee</th>}
                <th className="p-3.5">Base Salary</th>
                <th className="p-3.5">Daily / Hourly Rate</th>
                <th className="p-3.5">Overtime Pay</th>
                <th className="p-3.5">Shortfall / Absence</th>
                <th className="p-3.5">Sunday Work</th>
                <th className="p-3.5">Advance Loan Recovery</th>
                <th className="p-3.5 font-bold">Net Salary</th>
                <th className="p-3.5 rounded-r-xl text-right">PDF Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salaries.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="text-center py-10 text-slate-400">
                    No salary calculation records found for this period. Click "Run Payroll" to generate.
                  </td>
                </tr>
              ) : (
                salaries.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition">
                    {isAdmin && (
                      <td className="p-3.5 font-semibold text-slate-900">
                        {s.employee?.name} <span className="text-slate-400 text-[10px]">({s.employee?.employeeId})</span>
                      </td>
                    )}
                    <td className="p-3.5 text-slate-900 font-bold">₹{s.baseSalary?.toLocaleString()}</td>
                    <td className="p-3.5 text-slate-600">
                      <div>₹{s.dailyRate || Math.round(s.baseSalary / 30)}/day</div>
                      <div className="text-[10px] text-slate-400">₹{s.hourlyRate || Math.round(s.baseSalary / 270)}/hr</div>
                    </td>
                    <td className="p-3.5 text-emerald-600 font-bold">+₹{s.overtimePay?.toLocaleString()}</td>
                    <td className="p-3.5 text-rose-600 font-bold">
                      -₹{((s.shortfallDeduction || 0) + (s.absenceDeduction || 0)).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-amber-700 font-bold">+₹{(s.sundayPay || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-slate-700 font-semibold">-₹{(s.advanceDeduction || 0).toLocaleString()}</td>
                    <td className="p-3.5 font-black text-indigo-700 text-sm">₹{s.netSalary?.toLocaleString()}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handlePdfView(s._id)}
                        disabled={loadingPdfId === s._id}
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200 transition inline-flex items-center gap-1.5"
                      >
                        {loadingPdfId === s._id ? (
                          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4 text-indigo-600" />
                        )}
                        <span>{loadingPdfId === s._id ? 'Loading...' : 'PDF Slip'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF View Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-4xl h-[85vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Official PDF Executive Pay Slip</span>
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewPdfUrl}
                  download={`Salary_Slip_${selectedMonth}_${selectedYear}.pdf`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
                <button
                  onClick={() => setPreviewPdfUrl(null)}
                  className="text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe src={previewPdfUrl} className="w-full flex-1 border-none" title="Salary PDF Slip" />
          </div>
        </div>
      )}
    </div>
  );
}
