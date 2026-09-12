'use client';

import { useState, useEffect } from 'react';
import { api } from '../../shared/services/api';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { formatDateTimeIST } from '../../shared/utils/dateTime';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit');
      setLogs(res.data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900">System Security & Audit Logs</h1>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Last 10 Days Retention
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Immutable security trail for logins, punch-ins, salary generations & admin actions (automatically retains last 10 days)
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 shadow-xs transition w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Timestamp</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Module</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5 rounded-r-xl">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-sans">
                    No system audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">{formatDateTimeIST(item.createdAt)}</td>
                    <td className="p-3.5 text-slate-900 font-sans font-semibold">
                      {item.user?.name || 'System'}{' '}
                      {item.user?.email && <span className="text-slate-400 font-mono text-[10px]">({item.user.email})</span>}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {item.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-sans">{item.module}</td>
                    <td className="p-3.5 text-slate-500">{item.ipAddress}</td>
                    <td className="p-3.5 text-slate-600 font-sans max-w-sm truncate">{item.details}</td>
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
