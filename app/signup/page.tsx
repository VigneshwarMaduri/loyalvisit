'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  Store,
  Phone,
  Gift,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useLoyaltyStore } from '@/lib/loyaltyStore';
import { supabase } from '@/lib/supabaseClient';

export default function SignUpPage() {
  const router = useRouter();
  const { updateBusiness } = useLoyaltyStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Store Identity
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Specialty Coffee & Bakery');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');

  // Step 3: Loyalty Rules
  const [rewardDesc, setRewardDesc] = useState('Free Signature Drink or Bakery Item');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = [
    'Specialty Coffee & Bakery',
    'Artisanal Bistro & Cafe',
    'Fine Dining & Bar',
    'Dessert & Gelato Lab',
    'Retail & Boutique',
    'Salon & Spa',
  ];

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid work email.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!businessName.trim()) {
      setErrorMessage('Please enter your business / store name.');
      return;
    }
    setStep(3);
  };

  const handleCompleteSignUp = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // 1. Real Supabase Auth Registration
      if (!supabase) {
        throw new Error('Supabase client is not connected.');
      }

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName,
            category,
            phone,
            instagram_handle: instagram,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 2. Insert into public.businesses table
      const formattedPhone = phone ? (phone.includes('+91') ? phone : `+91 ${phone.replace(/\D/g, '').slice(-10)}`) : null;
      const { data: bData, error: bError } = await supabase
        .from('businesses')
        .insert({
          name: businessName,
          category,
          phone: formattedPhone,
          instagram_handle: instagram.replace('@', ''),
        })
        .select()
        .single();

      if (bError) {
        console.warn('Business insert warning:', bError.message);
      }

      // 3. Insert reward rules
      if (bData) {
        await supabase.from('reward_rules').insert({
          business_id: bData.id,
          target_stamps: 5,
          reward_description: rewardDesc,
        });

        // Update active business in store
        await updateBusiness({
          id: bData.id,
          name: bData.name,
          category: bData.category,
          phone: bData.phone || '',
          instagram_handle: bData.instagram_handle || '',
          target_stamps: 5,
          reward_description: rewardDesc,
        });
      }

      // Route to dashboard
      router.push('/merchant/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your credentials.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
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

          <span className="text-xs font-bold text-gray-400 font-mono">Step {step}/3</span>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Account Credentials */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-gray-950 tracking-tight mb-1">
                Create Merchant Account
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Register with your business email to manage your digital loyalty cards and counter scanner.
              </p>
            </div>

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
                  className="w-full py-3.5 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-medium text-sm transition-all"
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full py-3.5 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-medium text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-black hover:bg-neutral-900 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-black/15 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>Continue to Store Profile</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 2: Store Identity */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-gray-950 tracking-tight mb-1">
                Store Identity
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Tell us about your brand so customers see your logo and store details on their pass.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Store / Brand Name
              </label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Blue Tokai Coffee"
                  className="w-full py-3.5 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-medium text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Industry Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-medium text-sm transition-all cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Counter Contact Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full py-3.5 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-medium text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Instagram Handle (Optional)
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="e.g. bluetokaicoffee"
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-medium text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-black hover:bg-neutral-900 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-black/15 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>Continue to Reward Rules</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 3: Reward Rules */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-gray-950 tracking-tight mb-1">
                Loyalty Reward Rules
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Configure your 5-Key Mystery Vault reward that customers unlock upon 5 visits.
              </p>
            </div>

            <div className="p-4 rounded-2xl border-2 border-black bg-purple-50/50">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="text-purple-600" size={18} />
                <span className="text-xs font-black uppercase text-purple-900">
                  Mystery Vault (5 Keys)
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Customers receive 1 key per counter scan. Unlocking 5 keys unlocks the Grand Mystery Gift!
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Reward Description
              </label>
              <input
                type="text"
                required
                value={rewardDesc}
                onChange={(e) => setRewardDesc(e.target.value)}
                placeholder="e.g. Free Artisanal Cold Brew & Pastry"
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none text-gray-900 font-medium text-sm transition-all"
              />
            </div>

            <button
              onClick={handleCompleteSignUp}
              disabled={isLoading}
              className="w-full mt-4 bg-black hover:bg-neutral-900 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-black/15 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Connecting Store to Supabase...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup & Open Dashboard</span>
                  <CheckCircle2 size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="pt-6 text-center">
        <button
          onClick={() => router.push('/login')}
          className="text-xs text-gray-500 hover:text-black transition-colors"
        >
          Already have an account? <span className="font-bold underline text-black">Log In</span>
        </button>
      </div>
    </div>
  );
}
