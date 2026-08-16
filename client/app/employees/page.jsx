'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmployees,
  createEmployeeAction,
  updateEmployeeAction,
  deleteEmployeeAction,
  clearEmployeeStatus,
} from '../../store/slices/employeeSlice';
import { approveUserAction } from '../../store/slices/authSlice';
import { Users, UserPlus, Search, Trash2, Pencil, CheckCircle, XCircle, Check, X, Clock } from 'lucide-react';

export default function EmployeesPage() {
  const dispatch = useDispatch();
  const { list: employees, loading, error, successMessage } = useSelector((state) => state.employee);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add Employee Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: 'General',
    designation: 'Staff',
    baseSalary: 50000,
    hourlyRate: 300,
    phone: '',
    status: 'Active',
  });

  // Edit Employee Form State
  const [editFormData, setEditFormData] = useState({
    _id: '',
    employeeId: '',
    name: '',
    email: '',
    role: 'Employee',
    department: 'General',
    designation: 'Staff',
    baseSalary: 50000,
    phone: '',
    status: 'Active',
  });

  useEffect(() => {
    dispatch(fetchEmployees({ search }));
  }, [dispatch, search]);

  const handleApprove = async (id) => {
    await dispatch(approveUserAction({ id, status: 'Active' }));
    dispatch(fetchEmployees({ search }));
  };

  const handleReject = async (id) => {
    await dispatch(approveUserAction({ id, status: 'Rejected' }));
    dispatch(fetchEmployees({ search }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createEmployeeAction(formData));
    if (res.meta.requestStatus === 'fulfilled') {
      setShowModal(false);
      setFormData({
        employeeId: '',
        name: '',
        email: '',
        password: '',
        role: 'Employee',
        department: 'General',
        designation: 'Staff',
        baseSalary: 50000,
        hourlyRate: 300,
        phone: '',
      });
      dispatch(fetchEmployees({ search }));
    }
  };

  const handleOpenEdit = (emp) => {
    dispatch(clearEmployeeStatus());
    setEditFormData({
      _id: emp._id,
      employeeId: emp.employeeId || '',
      name: emp.name || '',
      email: emp.email || '',
      role: emp.role || 'Employee',
      department: emp.department || 'General',
      designation: emp.designation || 'Staff',
      baseSalary: emp.baseSalary || 50000,
      phone: emp.phone || '',
      status: emp.status || 'Active',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const { _id, ...data } = editFormData;
    const res = await dispatch(updateEmployeeAction({ id: _id, data }));
    if (res.meta.requestStatus === 'fulfilled') {
      setShowEditModal(false);
      dispatch(fetchEmployees({ search }));
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this employee account?')) {
      dispatch(deleteEmployeeAction(id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-sans">Staff & Employee Directory</h1>
          <p className="text-slate-500 text-xs mt-1">Manage staff accounts, assign salary structures, and approve user registrations</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <button
            onClick={() => {
              dispatch(clearEmployeeStatus());
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition w-fit"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        )}
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

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Employee ID, Name, or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Employee ID</th>
                <th className="p-3.5">Name & Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Base Monthly Salary</th>
                <th className="p-3.5">Daily / Hourly Rate</th>
                {currentUser?.role === 'Admin' && <th className="p-3.5 rounded-r-xl text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No employees found matching criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const isPending = emp.status === 'Pending_Approval' || emp.status === 'Pending_OTP';
                  return (
                    <tr key={emp._id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-indigo-600">{emp.employeeId}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{emp.name}</div>
                        <div className="text-slate-500 text-[11px]">{emp.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            emp.role === 'Admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {isPending ? (
                          <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" /> Pending Approval
                          </span>
                        ) : emp.status === 'Rejected' ? (
                          <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <X className="w-3 h-3 text-rose-600" /> Rejected
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">₹{emp.baseSalary?.toLocaleString()}</td>
                      <td className="p-3.5 text-slate-600 text-[11px]">
                        <div>₹{Math.round((emp.baseSalary || 50000) / 30)}/day</div>
                        <div className="text-slate-400">₹{Math.round((emp.baseSalary || 50000) / 270)}/hr</div>
                      </td>
                      {currentUser?.role === 'Admin' && (
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(emp._id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition inline-flex items-center gap-1"
                                title="Approve Account"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleReject(emp._id)}
                                className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition inline-flex items-center gap-1"
                                title="Reject Account"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition border border-indigo-200 inline-flex items-center"
                            title="Edit Employee"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp._id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-200 inline-flex items-center"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 w-full max-w-xl p-5 sm:p-6 rounded-3xl space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Add New Employee Account</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 text-sm p-1 rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-103"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Base Monthly Salary (₹)</label>
                <input
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md"
                >
                  Save Employee Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 w-full max-w-xl p-5 sm:p-6 rounded-3xl space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Edit Employee Details</h3>
                <p className="text-xs text-slate-500">Update staff role, contact & salary details</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-900 text-sm p-1 rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.employeeId}
                    onChange={(e) => setEditFormData({ ...editFormData, employeeId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">System Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Base Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={editFormData.baseSalary}
                    onChange={(e) => setEditFormData({ ...editFormData, baseSalary: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 sm:p-3 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md"
                >
                  Update Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
