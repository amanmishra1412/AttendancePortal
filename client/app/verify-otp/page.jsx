'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6 text-center">
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <h1 className="text-xl font-black text-white">Email Verification Not Required</h1>
        <p className="text-slate-400 text-xs leading-relaxed">
          Email OTP verification is no longer needed. New accounts are submitted directly to the Admin for approval.
        </p>

        <Link
          href="/"
          className="inline-block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition mt-4"
        >
          Return to Sign In Portal
        </Link>
      </div>
    </div>
  );
}
