'use client';

import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  QrCode,
  Gift,
  Key,
  ChevronRight,
  CheckCircle2,
  Database
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-gradient-to-b from-white via-gray-50/50 to-gray-100 flex flex-col">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#09090B] flex items-center justify-center text-[#2563EB] shadow-md shadow-black/10">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-gray-950 block leading-tight">
              LoyalVisit
            </span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wide">
              DIGITAL LOYALTY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Supabase Live
          </div>
          <button
            onClick={() => router.push('/login')}
            className="text-xs font-bold text-gray-700 hover:text-black px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors active:scale-95 cursor-pointer"
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-7 pb-6 text-center flex flex-col items-center">
        {/* Subtle Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100/90 border border-gray-200/70 text-gray-700 text-[11px] font-semibold mb-5 shadow-xs">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
          </span>
          Next-Gen Customer Retention Engine
        </div>

        {/* Massive Bold Headline */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-950 leading-[1.08] mb-4">
          Turn Walk-ins into{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Regulars.
          </span>
        </h1>

        {/* Value Proposition Subtitle */}
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-7 max-w-sm font-normal">
          Gamified digital stamp cards that boost repeat visits by 43%. Zero apps for customers to download. Lightning-fast counter scanner for staff.
        </p>

        {/* Solid Heavy Action Buttons */}
        <div className="w-full space-y-2.5 max-w-xs">
          <button
            onClick={() => router.push('/signup')}
            className="w-full bg-[#09090B] hover:bg-neutral-900 text-white font-bold text-base py-4 px-6 rounded-2xl shadow-xl shadow-black/15 flex items-center justify-center gap-2 active:scale-95 transition-all transform cursor-pointer border border-neutral-800"
          >
            <span>Get Started Free</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => router.push('/login')}
            className="w-full bg-white hover:bg-gray-50 text-[#09090B] font-bold text-sm py-3.5 px-6 rounded-2xl border border-gray-200/90 shadow-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <span>Merchant Store Login</span>
          </button>
        </div>
      </section>

      {/* Floating Interactive Mockup Card */}
      <section className="px-6 py-4">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2.5 flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="text-purple-600" /> Live Customer Web Pass Preview
        </div>

        <div
          onClick={() => router.push('/customer/pass')}
          className="cursor-pointer group relative bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 rounded-[2rem] p-6 text-white shadow-xl shadow-purple-950/20 border border-purple-800/40 transform hover:-translate-y-1 transition-all duration-300"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-yellow-300 font-bold text-xs">
                GL
              </div>
              <div>
                <h4 className="text-sm font-extrabold leading-tight">Green Leaf Cafe</h4>
                <p className="text-[10px] text-purple-200">Mystery Vault Level 1</p>
              </div>
            </div>
            <span className="text-[10px] bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-2 py-0.5 rounded-full font-bold">
              3/5 Keys
            </span>
          </div>

          {/* 5-Key Slots Representation */}
          <div className="flex justify-between items-center py-2 mb-3">
            {[1, 2, 3, 4, 5].map((slot) => (
              <div
                key={slot}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  slot <= 3
                    ? 'bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] text-yellow-950'
                    : 'border border-purple-500/40 bg-purple-950/40 text-purple-300/30'
                }`}
              >
                <Key size={16} />
              </div>
            ))}
          </div>

          <p className="text-center text-yellow-300 font-medium text-xs mb-3">
            Inka 2 keys eh balance... <span className="text-white/80 font-normal">em vastundo chuddam!</span>
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-purple-200 font-medium">
            <span>Tap to open live customer pass</span>
            <span className="flex items-center gap-0.5 text-white font-bold group-hover:translate-x-1 transition-transform">
              Explore Pass <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </section>

      {/* Metrics & Social Proof Strip */}
      <section className="px-6 py-4">
        <div className="grid grid-cols-3 gap-2.5 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="text-center">
            <span className="block text-xl font-black text-gray-950">43%</span>
            <span className="text-[10px] text-gray-500 font-medium">Repeat Rate</span>
          </div>
          <div className="text-center border-x border-gray-100">
            <span className="block text-xl font-black text-gray-950">&lt; 3s</span>
            <span className="text-[10px] text-gray-500 font-medium">Scan Time</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-black text-gray-950">Zero</span>
            <span className="text-[10px] text-gray-500 font-medium">App Installs</span>
          </div>
        </div>
      </section>

      {/* How it Works: 3-Step Grid */}
      <section className="px-6 py-6">
        <div className="text-center mb-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Simple 3-Step Process
          </h3>
          <h2 className="text-2xl font-black text-gray-950">How LoyalVisit Works</h2>
        </div>

        <div className="space-y-3.5">
          {/* Step 1 */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0">
              <QrCode size={20} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-gray-900 mb-0.5">
                1. Customer Scans at Counter
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Guests tap your table standee or scan the QR. Their digital pass opens instantly in mobile browser without installing anything.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-gray-900 mb-0.5">
                2. Cashier Awards Stamps (+1, +2, +3)
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Staff tap +1 on the merchant scanner in under 2 seconds. The pass vibrates and keys unlock in real time.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-600 flex items-center justify-center shrink-0">
              <Gift size={20} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-gray-900 mb-0.5">
                3. Mystery Vault Unlocks Reward
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Reaching 5 keys triggers your store reward reveals, bringing guests back every week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Reliability Strip */}
      <section className="px-6 py-2 pb-6">
        <div className="bg-neutral-900 text-white p-5 rounded-2xl shadow-lg border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
              <Database size={15} className="text-emerald-400" />
              <span>Real-Time Supabase Sync</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              POSTGRES READY
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Encrypted transactions, instant webhook relays, and multi-branch staff portals powered by Supabase.
          </p>
          <div className="flex items-center gap-4 pt-1 text-[11px] text-gray-300">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-400" /> RLS Protected
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-400" /> Fraud Guard
            </span>
          </div>
        </div>
      </section>

      {/* Bottom Launch Banner */}
      <footer className="px-6 pb-10 pt-2 text-center">
        <button
          onClick={() => router.push('/merchant/dashboard')}
          className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer mb-3"
        >
          <span>Enter Merchant Dashboard</span>
          <ArrowRight size={16} />
        </button>

        <p className="text-[11px] text-gray-400">
          LoyalVisit Loyalty © 2026 • Built for modern cafes & retail
        </p>
      </footer>
    </div>
  );
}
