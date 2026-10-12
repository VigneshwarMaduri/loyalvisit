'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ShieldCheck,
  Gift,
  CheckCircle2,
  Coffee,
  Store,
} from 'lucide-react';
import { useLoyaltyStore } from '@/lib/loyaltyStore';

export default function JoinBusinessPage() {
  const router = useRouter();

  const { business, customer, loginCustomer, awardStamps } = useLoyaltyStore();

  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // If already logged in, redirect directly to the pass
  useEffect(() => {
    if (customer && customer.isLoggedIn && customer.phone) {
      router.replace('/customer/pass');
    }
  }, [customer, router]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 200);
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    setErrorMessage('');

    try {
      const fullPhone = `+91 ${phone.replace(/\D/g, '').slice(-10)}`;
      loginCustomer(fullPhone);

      // Award 1 welcome stamp for joining
      await awardStamps(1, fullPhone);

      // Redirect directly to customer pass
      setTimeout(() => {
        router.push('/customer/pass');
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setErrorMessage(msg);
      setIsVerifying(false);
    }
  };

  const handleOtpInput = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-gradient-to-b from-white via-gray-50 to-gray-100 flex flex-col justify-between p-6">
      {/* Top Branding Section */}
      <div>
        {/* Counter Standee Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-[11px] font-bold">
            <Store size={13} />
            <span>Counter Standee Check-In</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Instant Web Pass</span>
          </div>
        </div>

        {/* Store Card Preview */}
        <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 rounded-3xl p-6 text-white shadow-xl shadow-purple-950/20 border border-purple-800/40 relative overflow-hidden mb-6">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-yellow-300 font-black text-lg shadow-inner">
              <Coffee size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">{business.name}</h2>
              <p className="text-xs text-purple-200 font-medium">{business.category}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 text-yellow-950 flex items-center justify-center font-bold shrink-0 shadow-md">
              <Gift size={18} />
            </div>
            <div>
              <p className="text-[11px] text-yellow-300 font-bold uppercase tracking-wide">
                Welcome Bonus
              </p>
              <p className="text-xs text-white font-medium leading-tight">
                Get +1 Instant Welcome Stamp & unlock the Mystery Vault today!
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        {step === 'phone' ? (
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm">
            <h3 className="text-xl font-black text-gray-950 mb-1 tracking-tight">
              Enter Your Phone Number
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              No app download required. We will save your digital stamp pass permanently in this browser.
            </p>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full bg-black hover:bg-neutral-900 disabled:opacity-50 text-white font-bold text-sm py-4 px-6 rounded-2xl shadow-lg shadow-black/15 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <span>{loading ? 'Sending OTP...' : 'Continue with OTP'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black text-gray-950 tracking-tight">Verify OTP</h3>
              <button
                onClick={() => setStep('phone')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Change Number
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              Enter 4-digit code sent to <span className="font-bold text-gray-800">+91 {phone}</span>
            </p>

            <div className="flex justify-between gap-2.5 mb-5">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={otp[idx]}
                  onChange={(e) => handleOtpInput(idx, e.target.value)}
                  className="w-14 h-14 text-center text-xl font-black bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all shadow-xs"
                />
              ))}
            </div>

            {errorMessage && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 mb-4">
                {errorMessage}
              </p>
            )}

            <button
              onClick={() => handleVerifyOtp()}
              disabled={isVerifying}
              className="w-full bg-black hover:bg-neutral-900 text-white font-bold text-sm py-4 px-6 rounded-2xl shadow-lg shadow-black/15 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer mb-3"
            >
              <span>{isVerifying ? 'Verifying...' : 'Verify & Unlock Pass'}</span>
              <CheckCircle2 size={16} />
            </button>

            {/* Instant Demo Fill Helper */}
            <button
              type="button"
              onClick={() => {
                setOtp(['1', '2', '3', '4']);
                setTimeout(() => handleVerifyOtp(), 150);
              }}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs py-2.5 rounded-xl border border-blue-200 transition-colors"
            >
              ⚡ 1-Tap Auto-Verify (Demo Code: 1234)
            </button>
          </div>
        )}
      </div>

      {/* Trust Footer */}
      <div className="pt-6 text-center">
        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Zero spam guarantee • 100% Private Web Pass</span>
        </div>
      </div>
    </div>
  );
}
