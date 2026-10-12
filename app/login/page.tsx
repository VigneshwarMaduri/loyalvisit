'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Mail, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('manager@greenleaf.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setStatusMsg(null);

    // If custom non-demo email, attempt Supabase Auth
    if (email && email !== 'manager@greenleaf.com') {
      try {
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } catch {
        // graceful handle
      }
    }

    // 2. Complete 1-second simulated network transition
    setTimeout(() => {
      setIsLoading(false);
      router.push('/merchant/dashboard');
    }, 1000);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-white p-6 flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/70 flex items-center justify-center text-gray-600 hover:text-black transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-200/60 px-3 py-1 rounded-full">
            <Sparkles size={12} className="text-black" />
            <span>Merchant Console</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-950 tracking-tight mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Sign in to access your live scanner portal, loyalty vault metrics, and branch settings.
          </p>
        </div>

        {/* Status Pill */}
        {statusMsg && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full py-4 pl-12 pr-4 bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none text-gray-900 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setEmail('manager@greenleaf.com');
                  setPassword('password123');
                }}
                className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Use Demo PIN
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-4 pl-12 pr-4 bg-gray-50/80 border border-gray-200 rounded-xl mb-4 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none text-gray-900 transition-all font-medium text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 space-y-4">
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-[#09090B] hover:bg-neutral-900 text-white font-bold text-base py-4 px-6 rounded-xl shadow-xl shadow-black/10 flex items-center justify-center gap-2 active:scale-95 transition-all transform disabled:opacity-75 cursor-pointer border border-neutral-800"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Connecting to Store...</span>
            </>
          ) : (
            'Login to Dashboard'
          )}
        </button>

        <div className="text-center">
          <button
            onClick={() => router.push('/signup')}
            className="text-xs text-gray-500 hover:text-black transition-colors"
          >
            Don&apos;t have an account? <span className="font-bold underline text-black">Sign Up</span>
          </button>
        </div>
      </div>
    </div>
  );
}
