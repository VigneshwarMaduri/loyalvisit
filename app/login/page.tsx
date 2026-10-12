'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useLoyaltyStore } from '@/lib/loyaltyStore';

export default function LoginPage() {
  const router = useRouter();
  const { syncWithSupabase } = useLoyaltyStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setIsLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase backend is not initialized.');
      }

      // Real Supabase Auth login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || 'Invalid email or password.');
      }

      // Sync fresh merchant data
      await syncWithSupabase();

      // Successful redirect to store dashboard
      router.push('/merchant/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
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
            Sign in to access your live store scanner, customer metrics, and loyalty rules.
          </p>
        </div>

        {/* Error Pill */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@yourstore.com"
                className="w-full py-4 pl-12 pr-4 bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none text-gray-900 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-4 pl-12 pr-4 bg-gray-50/80 border border-gray-200 rounded-xl mb-4 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none text-gray-900 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#09090B] hover:bg-neutral-900 text-white font-bold text-base py-4 px-6 rounded-xl shadow-xl shadow-black/10 flex items-center justify-center gap-2 active:scale-95 transition-all transform disabled:opacity-75 cursor-pointer border border-neutral-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Authenticating with Supabase...</span>
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>
      </div>

      {/* Action Footer */}
      <div className="pt-6 text-center">
        <button
          onClick={() => router.push('/signup')}
          className="text-xs text-gray-500 hover:text-black transition-colors"
        >
          Don&apos;t have an account? <span className="font-bold underline text-black">Sign Up</span>
        </button>
      </div>
    </div>
  );
}
