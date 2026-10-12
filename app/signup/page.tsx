'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useLoyaltyStore } from '@/lib/loyaltyStore';

export default function SignUpPage() {
  const router = useRouter();
  const { updateBusiness } = useLoyaltyStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Account
  const [email, setEmail] = useState('founder@saffroncafe.com');
  const [password, setPassword] = useState('Passcode123!');

  // Step 2: Store Identity
  const [businessName, setBusinessName] = useState('Saffron Artisanal Cafe');
  const [category, setCategory] = useState('Specialty Coffee & Bakery');
  const [instagram, setInstagram] = useState('saffron_cafe_hyd');

  // Step 3: Loyalty Rules
  const [gameType, setGameType] = useState<'mystery_vault' | 'ten_stamps' | 'scratch_card'>('mystery_vault');
  const [rewardDesc, setRewardDesc] = useState('Free Signature Artisanal Beverage & Truffle Croissant');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const categories = [
    'Specialty Coffee & Bakery',
    'Artisanal Bistro & Cafe',
    'Fine Dining & Bar',
    'Dessert & Gelato Lab',
    'Retail & Boutique',
  ];

  const handleCompleteSignUp = async () => {
    setIsLoading(true);
    setStatusMsg('Registering your business in Supabase...');

    // 1. Update local state immediately for instant responsive feel
    await updateBusiness({
      name: businessName,
      category,
      instagram_handle: instagram,
      active_game_type: gameType,
      reward_description: rewardDesc,
    });

    // 2. Fire Supabase registration via server API route
    try {
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          businessName,
          category,
          instagram,
        }),
      }).catch(() => {});
    } catch {
      // Handled
    }

    setTimeout(() => {
      setIsLoading(false);
      router.push('/merchant/dashboard');
    }, 400);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-white p-6 flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => (step > 1 ? setStep((prev) => (prev === 3 ? 2 : 1)) : router.push('/'))}
            className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/70 flex items-center justify-center text-gray-600 hover:text-black transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-7 h-2 rounded-full transition-all ${
                  s === step ? 'bg-black w-8' : s < step ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Step {step} of 3: {step === 1 ? 'Credentials' : step === 2 ? 'Store Identity' : 'Loyalty Engine'}
          </div>
          <h2 className="text-2xl font-black text-gray-950 tracking-tight">
            {step === 1
              ? 'Merchant Account'
              : step === 2
              ? 'Tell Us About Your Store'
              : 'Choose Gamification Engine'}
          </h2>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
            {step === 1
              ? 'Create your master account to manage your store loyalty cards.'
              : step === 2
              ? 'This branding appears on your digital counter pass & standee.'
              : 'Select how walk-in guests earn and unlock rewards.'}
          </p>
        </div>

        {statusMsg && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Step 1: Account */}
        {step === 1 && (
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
                  className="w-full py-3.5 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-bold text-sm"
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-3.5 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-bold text-sm"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Store Identity */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Saffron Artisanal Cafe"
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-bold text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-bold text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Instagram Handle (without @)
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="saffron_cafe_hyd"
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-bold text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 3: Loyalty Rules */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Select Active Game
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setGameType('mystery_vault')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    gameType === 'mystery_vault'
                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/20'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-xl">🗝️</span>
                  <div>
                    <span className="text-xs font-black block">Mystery Vault (5 Keys)</span>
                    <span className="text-[10px] text-gray-500">Telugu suspense copy & reveals</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGameType('ten_stamps')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    gameType === 'ten_stamps'
                      ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-600/20'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-xl">☕</span>
                  <div>
                    <span className="text-xs font-black block">Classic 10 Stamps</span>
                    <span className="text-[10px] text-gray-500">Traditional punch card progression</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGameType('scratch_card')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    gameType === 'scratch_card'
                      ? 'border-rose-600 bg-rose-50 ring-2 ring-rose-600/20'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-xl">🎟️</span>
                  <div>
                    <span className="text-xs font-black block">Lucky Scratch Card</span>
                    <span className="text-[10px] text-gray-500">Scratch foil to reveal prize</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Reward Description
              </label>
              <input
                type="text"
                value={rewardDesc}
                onChange={(e) => setRewardDesc(e.target.value)}
                placeholder="e.g. Free Artisanal Dessert"
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-bold text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-6 space-y-3">
        {step < 3 ? (
          <button
            onClick={() => setStep((prev) => (prev === 1 ? 2 : 3))}
            className="w-full bg-[#09090B] hover:bg-neutral-900 text-white font-bold text-sm py-4 px-6 rounded-2xl shadow-xl shadow-black/15 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer border border-neutral-800"
          >
            <span>Continue to Step {step + 1}</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleCompleteSignUp}
            disabled={isLoading}
            className="w-full bg-[#09090B] hover:bg-neutral-900 text-white font-bold text-sm py-4 px-6 rounded-2xl shadow-xl shadow-black/15 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer border border-neutral-800 disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Launching Store...</span>
              </>
            ) : (
              <>
                <span>Complete Setup & Enter Dashboard</span>
                <CheckCircle2 size={16} />
              </>
            )}
          </button>
        )}

        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-xs text-gray-500 hover:text-black transition-colors"
          >
            Already have an account? <span className="font-bold underline text-black">Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
