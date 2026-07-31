'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { Lock, Mail, ShieldCheck, UserCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const res = await dispatch(loginUser({ email, password }));
    if (res.meta.requestStatus === 'fulfilled') {
      router.push('/dashboard');
    }
  };

  const setDemoCredentials = (role) => {
    dispatch(clearError());
    if (role === 'admin') {
      setEmail('admin@company.com');
      setPassword('adminpassword123');
    } else {
      setEmail('rahul@company.com');
      setPassword('employeepassword123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-extrabold text-white text-2xl mx-auto mb-4 shadow-xl shadow-indigo-500/30">
            HR
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            AttendancePro <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">Sign in to manage attendance & payroll</p>
        </div>

        {/* Demo Account Quick Fill Toolbar */}
        <div className="mb-6 bg-slate-850 p-3 rounded-2xl border border-slate-800/80 text-center">
          <p className="text-[11px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Quick Fill Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin')}
              className="flex items-center justify-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 py-2 rounded-xl text-xs font-semibold transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('employee')}
              className="flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 py-2 rounded-xl text-xs font-semibold transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Employee Demo</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Work Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl py-3 pl-11 pr-4 text-sm transition outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl py-3 pl-11 pr-4 text-sm transition outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 text-sm transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center mt-6">
          Secured with JWT authentication & role-based access controls.
        </p>
      </div>
    </div>
  );
}
