'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser, clearError } from '../store/slices/authSlice';
import { Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck, AlertCircle, UserCheck, HelpCircle } from 'lucide-react';
import HowItWorksModal from '../shared/components/HowItWorksModal';

import Link from 'next/link';

export default function HomePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    baseSalary: 50000,
  });

  const [infoMessage, setInfoMessage] = useState(null);

  // Auto-redirect if already logged in
  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (storedToken) {
      let role = user?.role;
      if (!role && storedUserStr) {
        try {
          const parsed = JSON.parse(storedUserStr);
          role = parsed?.role;
        } catch (e) {}
      }

      if (role === 'Admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    } else {
      setCheckingAuth(false);
    }
  }, [user, token, router]);

  const setDemoCredentials = () => {
    dispatch(clearError());
    setLoginEmail('rahul@company.com');
    setLoginPassword('employeepassword123');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setInfoMessage(null);
    const res = await dispatch(loginUser({ email: loginEmail, password: loginPassword }));

    if (res.meta.requestStatus === 'fulfilled') {
      if (res.payload.user?.role === 'Admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } else if (res.payload) {
      if (res.payload.pendingApproval) {
        setInfoMessage('Your registration request is pending Admin approval. You will be able to log in once an Admin approves your account.');
      }
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setInfoMessage(null);
    const res = await dispatch(registerUser(signupData));

    if (res.meta.requestStatus === 'fulfilled') {
      setLoginEmail(signupData.email);
      setSignupData({
        name: '',
        email: '',
        password: '',
        phone: '',
        department: 'Engineering',
        designation: 'Software Engineer',
        baseSalary: 50000,
      });
      setActiveTab('login');
      setInfoMessage('Account registered successfully! Your account is pending Admin approval. You can sign in once approved.');
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-600 font-semibold text-sm">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Redirecting to your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-indigo-500/20">
            HR
          </div>
          <span className="font-bold text-slate-900 tracking-wide text-lg flex items-center gap-1.5">
            AttendancePro <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* How It Works Button */}
          <button
            onClick={() => setHowItWorksOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 text-indigo-700 px-3.5 py-2 rounded-xl text-xs font-bold border border-indigo-200/80 shadow-xs transition"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span>How It Works?</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto my-8 bg-white/90 backdrop-blur-xl border border-slate-200 p-8 rounded-3xl shadow-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Portal</h1>
          <p className="text-slate-500 text-xs mt-1">Attendance, Leaves, & Salary Payslips</p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-6 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('login');
              dispatch(clearError());
              setInfoMessage(null);
            }}
            className={`py-2.5 rounded-xl transition ${
              activeTab === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Employee Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('signup');
              dispatch(clearError());
              setInfoMessage(null);
            }}
            className={`py-2.5 rounded-xl transition ${
              activeTab === 'signup' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Info or Error Alerts */}
        {infoMessage && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{infoMessage}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form: LOGIN */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {/* Quick Fill Demo Toolbar */}
            {/* <div className="mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">Quick Fill Demo Credentials</p>
              <button
                type="button"
                onClick={setDemoCredentials}
                className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 py-2 rounded-xl text-xs font-semibold transition"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Fill Employee Demo Account</span>
              </button>
            </div> */}

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="rahul@company.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
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
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-sm transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <span>Signing In...</span> : <><span>Sign In</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          /* Form: SIGNUP */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Aman Verma"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">Work Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="aman@company.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>



            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 text-xs transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <span>Submitting Registration...</span> : <><span>Submit Registration for Approval</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}
      </div>

      {/* Guide Banner */}
      <div className="max-w-md w-full mx-auto text-center mb-6 relative z-10">
        <button
          onClick={() => setHowItWorksOpen(true)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/60 px-4 py-2 rounded-full transition shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>New to AttendancePro? Explore how it works &rarr;</span>
        </button>
      </div>

      <footer className="text-center text-slate-500 text-[11px] relative z-10 pb-4">
        Attendance & Payroll Management System &copy; 2026 Enterprise Edition
      </footer>

      {/* Guide Modal */}
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </div>
  );
}
