'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { loginUser, clearError } from '../../../store/slices/authSlice';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('adminpassword123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const res = await dispatch(loginUser({ email, password }));
    if (res.meta.requestStatus === 'fulfilled') {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200 p-8 rounded-3xl shadow-xl relative z-10">
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-indigo-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            Admin Management Portal
          </h1>
          <p className="text-slate-500 text-xs mt-1">HR Operations, Approvals, & Payroll Control</p>
        </div>

        {/* Demo Admin Banner */}
        <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-center text-xs">
          <p className="font-semibold text-indigo-900">Default Admin Credentials</p>
          <p className="text-indigo-700 font-mono text-[11px] mt-1">admin@company.com / adminpassword123</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-sm transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <span>Authenticating Admin...</span> : <><span>Access Admin Portal</span> <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 transition">
            &larr; Switch to Employee Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
