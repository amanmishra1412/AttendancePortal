'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { loginUser, clearError } from '../../../store/slices/authSlice';
import { Lock, Mail, ShieldCheck, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import HowItWorksModal from '../../../shared/components/HowItWorksModal';

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  // Auto-redirect if already logged in as Admin
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (token) {
      let role = user?.role;
      if (!role && storedUserStr) {
        try {
          const parsed = JSON.parse(storedUserStr);
          role = parsed?.role;
        } catch (e) {}
      }

      if (role === 'Admin') {
        router.replace('/admin/dashboard');
        return;
      }
    }
    setCheckingAuth(false);
  }, [user, router]);

  const setDemoCredentials = () => {
    dispatch(clearError());
    setEmail('admin@company.com');
    setPassword('adminpassword123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const res = await dispatch(loginUser({ email, password }));
    if (res.meta.requestStatus === 'fulfilled') {
      if (res.payload.user?.role === 'Admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-400 font-semibold text-sm">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Checking Admin session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            Admin Management Portal <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">HR Operations, Approvals, & Payroll Control</p>
        </div>

        {/* Quick Fill Toolbar */}
        <div className="mb-6 bg-slate-800/60 p-3 rounded-2xl border border-slate-750 text-center">
          <p className="text-[11px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Quick Fill Demo Account</p>
          <button
            type="button"
            onClick={setDemoCredentials}
            className="w-full flex items-center justify-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 py-2 rounded-xl text-xs font-bold transition"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Fill System Admin Demo Credentials</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Admin Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl py-3 pl-10 pr-4 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl py-3 pl-10 pr-4 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 text-sm transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <span>Authenticating Admin...</span> : <><span>Sign In to Admin Portal</span> <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-800 pt-4 flex items-center justify-between">
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1 font-medium">
            &larr; Switch to Employee Portal
          </Link>
          <button
            type="button"
            onClick={() => setHowItWorksOpen(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1.5 transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How It Works?</span>
          </button>
        </div>
      </div>

      {/* Guide Modal */}
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </div>
  );
}
