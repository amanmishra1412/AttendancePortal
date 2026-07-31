'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { verifyOTPAction, resendOTPAction, clearError } from '../../store/slices/authSlice';
import { Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function VerifyOTPPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get('email') || '';
  const { loading, error } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState('');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setInfoMsg(null);
    const res = await dispatch(verifyOTPAction({ email: emailParam, otp }));
    if (res.meta.requestStatus === 'fulfilled') {
      setVerifiedSuccess(true);
    }
  };

  const handleResend = async () => {
    dispatch(clearError());
    setInfoMsg(null);
    const res = await dispatch(resendOTPAction({ email: emailParam }));
    if (res.meta.requestStatus === 'fulfilled') {
      setInfoMsg('A new verification OTP code has been sent to your email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-white">Email OTP Verification</h1>
          <p className="text-slate-400 text-xs mt-1">
            We sent a 6-digit verification code to <span className="text-indigo-300 font-semibold">{emailParam || 'your email'}</span>
          </p>
        </div>

        {/* Info Notification */}
        {infoMsg && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs text-center font-medium">
            {infoMsg}
          </div>
        )}

        {/* Success State */}
        {verifiedSuccess ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Email Verified Successfully!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your registration request has been submitted to <span className="text-emerald-300 font-semibold">Admin for Approval</span>.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl text-[11px] text-amber-400 font-medium">
              Status: Pending Admin Approval
            </div>
            <Link
              href="/"
              className="inline-block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs transition mt-2"
            >
              Return to Login Screen
            </Link>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleVerify} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-950 border border-slate-800 text-center font-mono text-2xl tracking-widest font-black text-white rounded-2xl py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? <span>Verifying...</span> : <><span>Verify Email Address</span> <ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResend}
                className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" /> Resend OTP Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
