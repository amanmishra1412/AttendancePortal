'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../shared/services/api';
import {
  PartyPopper,
  CalendarDays,
  PlusCircle,
  Sparkles,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Gift,
  ShieldCheck,
  X,
} from 'lucide-react';
import { formatDateIST } from '../../../shared/utils/dateTime';

export default function AdminHolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState('All');
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'Festival',
    isPaid: true,
    description: '',
  });

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedYear) params.year = selectedYear;
      if (selectedType && selectedType !== 'All') params.type = selectedType;

      const res = await api.get('/holidays', { params });
      setHolidays(res.data.holidays || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load official holidays list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [selectedYear, selectedType]);

  const handleOpenAddModal = () => {
    setEditingHoliday(null);
    setFormData({
      name: '',
      date: `${selectedYear}-01-01`,
      type: 'Festival',
      isPaid: true,
      description: '',
    });
    setError('');
    setMessage('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (h) => {
    setEditingHoliday(h);
    setFormData({
      name: h.name,
      date: h.date,
      type: h.type || 'Festival',
      isPaid: h.isPaid !== undefined ? h.isPaid : true,
      description: h.description || '',
    });
    setError('');
    setMessage('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.date) {
      setError('Please provide holiday name and date');
      return;
    }

    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      if (editingHoliday) {
        await api.put(`/holidays/${editingHoliday._id}`, formData);
        setMessage(`Holiday "${formData.name}" updated successfully!`);
      } else {
        await api.post('/holidays', formData);
        setMessage(`Holiday "${formData.name}" added successfully!`);
      }
      setModalOpen(false);
      fetchHolidays();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving holiday');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete holiday "${name}"?`)) return;

    setActionLoading(true);
    try {
      await api.delete(`/holidays/${id}`);
      setMessage(`Holiday "${name}" deleted successfully`);
      fetchHolidays();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting holiday');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/holidays/seed');
      setMessage(res.data.message || 'Default official festivals & gazetted holidays loaded!');
      fetchHolidays();
    } catch (err) {
      setError(err.response?.data?.message || 'Error seeding default holidays');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredHolidays = holidays.filter((h) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      h.name?.toLowerCase().includes(term) ||
      h.date?.includes(term) ||
      h.type?.toLowerCase().includes(term) ||
      h.description?.toLowerCase().includes(term)
    );
  });

  const festivalCount = holidays.filter((h) => h.type === 'Festival').length;
  const nationalCount = holidays.filter((h) => h.type === 'National').length;
  const gazettedCount = holidays.filter((h) => h.type === 'Gazetted' || h.type === 'Company').length;

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Festival':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'National':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Gazetted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Company':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <PartyPopper className="w-7 h-7 text-indigo-600" />
            <span>Official Holidays & Festival Policies</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage company holidays, festive leaves (Diwali, Eid, Raksha Bandhan), and ensure zero salary deductions
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSeedDefaults}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-3 rounded-xl border border-slate-200 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Seed Standard Indian Holidays</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Holiday</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Highlights Banner: 100% Paid Policy */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              Zero Salary Penalty Policy
            </span>
          </div>
          <h3 className="text-base font-bold text-white">All Listed Official Holidays are 100% Paid</h3>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            The automated payroll engine counts these days as authorized paid company holidays. Employees are <span className="text-white font-semibold">NOT marked absent</span> and <span className="text-emerald-300 font-bold">zero amount is deducted</span> from their base monthly salary.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs shrink-0 flex items-center gap-3">
          <Gift className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <p className="font-bold text-white text-xs">Festivals & National Days</p>
            <p className="text-[11px] text-indigo-200">Full Daily Rate Credited</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Holidays in {selectedYear}</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{holidays.length} Days</p>
          <p className="text-[11px] text-slate-400 mt-1">Declared off days</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-purple-600">Festivals (Diwali, Eid, etc.)</span>
          <p className="text-2xl font-black text-purple-700 mt-1">{festivalCount} Days</p>
          <p className="text-[11px] text-purple-400 mt-1">Cultural & religious</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-amber-600">National Holidays</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{nationalCount} Days</p>
          <p className="text-[11px] text-amber-500 mt-1">26 Jan, 15 Aug, 2 Oct</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-emerald-600">Salary Status</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">100% Paid</p>
          <p className="text-[11px] text-emerald-500 mt-1">No deductions</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search holiday name or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 outline-none font-semibold"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 outline-none font-semibold"
            >
              <option value="All">All Types</option>
              <option value="Festival">Festival</option>
              <option value="National">National</option>
              <option value="Gazetted">Gazetted</option>
              <option value="Company">Company</option>
            </select>
          </div>

          <button
            onClick={fetchHolidays}
            className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Holidays List / Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-xs text-slate-400 mt-3 font-semibold">Loading official holidays...</p>
          </div>
        ) : filteredHolidays.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No holidays found for this filter</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click &quot;Seed Standard Indian Holidays&quot; or &quot;Add New Holiday&quot; above to declare holiday dates.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Holiday Name</th>
                  <th className="p-3.5">Date & Day</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Payroll Status</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHolidays.map((h) => {
                  const dateObj = new Date(`${h.date}T00:00:00`);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                  const formattedDate = dateObj.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={h._id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-base">🎉</span>
                        <div>
                          <p>{h.name}</p>
                          <span className="text-[10px] text-slate-400 sm:hidden">{h.date}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">
                        <p>{formattedDate}</p>
                        <span className="text-[10px] text-indigo-600 font-bold">{dayName}</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getTypeBadge(h.type)}`}>
                          {h.type}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {h.isPaid !== false ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            100% Paid (No Deduction)
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px] max-w-xs truncate">
                        {h.description || '-'}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(h)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Holiday"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(h._id, h.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Holiday"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-indigo-600" />
                <span>{editingHoliday ? 'Edit Holiday' : 'Add New Official Holiday'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Holiday / Festival Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali, Raksha Bandhan, Eid-ul-Fitr"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="Festival">Festival</option>
                    <option value="National">National</option>
                    <option value="Gazetted">Gazetted</option>
                    <option value="Company">Company</option>
                    <option value="Restricted">Restricted</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.isPaid}
                    onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>100% Paid Holiday (Zero Salary Deduction)</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5 ml-6">
                  Recommended checked. Unattended employees will NOT have pay deducted for this day.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional details or greeting..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium outline-none focus:border-indigo-500 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-600/20"
                >
                  {actionLoading ? 'Saving...' : editingHoliday ? 'Update Holiday' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
