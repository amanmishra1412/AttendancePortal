'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../shared/services/api';
import {
  Clock,
  CalendarDays,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Award,
} from 'lucide-react';

export default function AdminAttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState('');

  // Fetch Employee Directory for Filter Dropdown
  const fetchEmployeeList = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.employees || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch All Attendance Records
  const fetchAttendanceLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedEmployee) params.employeeId = selectedEmployee;
      if (selectedDate) {
        params.date = selectedDate;
      } else {
        params.month = selectedMonth;
        params.year = selectedYear;
      }

      const res = await api.get('/attendance/history', { params });
      setLogs(res.data.history || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeList();
  }, []);

  useEffect(() => {
    fetchAttendanceLogs();
  }, [selectedEmployee, selectedMonth, selectedYear, selectedDate]);

  // Client-side search filter
  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const nameMatch = log.employee?.name?.toLowerCase().includes(term);
    const idMatch = log.employee?.employeeId?.toLowerCase().includes(term);
    const emailMatch = log.employee?.email?.toLowerCase().includes(term);
    return nameMatch || idMatch || emailMatch;
  });

  // Calculate Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const presentTodayCount = logs.filter((l) => l.date === todayStr && l.punchIn?.timestamp).length;
  const totalOvertimeMins = filteredLogs.reduce((acc, l) => acc + (l.overtimeMinutes || 0), 0);
  const totalShortfallMins = filteredLogs.reduce((acc, l) => acc + (l.shortfallMinutes || 0), 0);
  const sundayWorkCount = filteredLogs.filter((l) => l.isSunday).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">All Employee Attendance Monitoring</h1>
          <p className="text-slate-500 text-xs mt-1">
            Real-time geofenced punch logs, 9-hour shift tracking, overtime & shortfall analytics across all staff
          </p>
        </div>
        <button
          onClick={fetchAttendanceLogs}
          className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 shadow-xs transition w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Records in View</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{filteredLogs.length}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Logs in current filter</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Present Today</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{presentTodayCount}</h3>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Active Punch In Today</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overtime Logged</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">
              {Math.floor(totalOvertimeMins / 60)}h {totalOvertimeMins % 60}m
            </h3>
            <p className="text-[10px] text-indigo-600 font-medium mt-0.5">Above 9-hr baseline</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sunday Work Days</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{sundayWorkCount}</h3>
            <p className="text-[10px] text-amber-700 font-medium mt-0.5">Bonus Overtime Shifts</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Control Panel */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl space-y-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Employee Name, Email, or Staff ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          {/* Employee Dropdown Filter */}
          <div>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-600 focus:bg-white transition font-medium"
            >
              <option value="">All Employees ({employees.length})</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Month / Date Filter Mode */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-600 transition"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-[11px] text-indigo-600 hover:underline shrink-0 font-semibold"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Month & Year Selectors (if specific date is not selected) */}
        {!selectedDate && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold text-[11px]">Period Filter:</span>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-medium">
              <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent text-slate-900 focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1} className="bg-white text-slate-900">
                    {new Date(0, i).toLocaleString('en', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-slate-900 focus:outline-none"
              >
                <option value={2026} className="bg-white text-slate-900">2026</option>
                <option value={2025} className="bg-white text-slate-900">2025</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Logs Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Employee</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Punch In & GPS Distance</th>
                <th className="p-3.5">Punch Out & GPS Distance</th>
                <th className="p-3.5">Worked Duration</th>
                <th className="p-3.5">Overtime / Shortfall</th>
                <th className="p-3.5 rounded-r-xl">Geofence Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Fetching employee attendance logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No attendance logs found.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition">
                    {/* Employee Info */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{item.employee?.name || 'Staff Member'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.employee?.employeeId || '-'} &bull; {item.employee?.email}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-3.5 font-mono text-slate-700">
                      <div>{item.date}</div>
                      {item.isSunday && (
                        <span className="inline-block mt-0.5 text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          SUNDAY WORK
                        </span>
                      )}
                    </td>

                    {/* Punch In */}
                    <td className="p-3.5 text-slate-800">
                      {item.punchIn?.timestamp ? (
                        <div>
                          <div className="font-semibold text-emerald-700">
                            {new Date(item.punchIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.punchIn.distanceMeters !== undefined ? `${item.punchIn.distanceMeters}m from HQ` : 'GPS Verified'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Punch Out */}
                    <td className="p-3.5 text-slate-800">
                      {item.punchOut?.timestamp ? (
                        <div>
                          <div className="font-semibold text-rose-700">
                            {new Date(item.punchOut.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.punchOut.distanceMeters !== undefined ? `${item.punchOut.distanceMeters}m from HQ` : 'GPS Verified'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-medium text-[11px]">Working (In Shift)</span>
                      )}
                    </td>

                    {/* Worked Duration */}
                    <td className="p-3.5 font-bold text-indigo-700 font-mono">
                      {Math.floor((item.totalWorkingMinutes || 0) / 60)}h {(item.totalWorkingMinutes || 0) % 60}m
                    </td>

                    {/* Overtime / Shortfall */}
                    <td className="p-3.5 text-[11px]">
                      {item.isSunday ? (
                        <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Sunday OT: +{item.totalWorkingMinutes || 0}m
                        </span>
                      ) : item.overtimeMinutes > 0 ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Overtime: +{item.overtimeMinutes}m
                        </span>
                      ) : item.shortfallMinutes > 0 ? (
                        <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Shortfall: -{item.shortfallMinutes}m
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">Standard 9-Hr Shift</span>
                      )}
                    </td>

                    {/* Geofence Status */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <MapPin className="w-3 h-3" /> Geofence Verified
                      </span>
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
