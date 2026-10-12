'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { useLoyaltyStore } from '@/lib/loyaltyStore';
import {
  ArrowUpRight,
  Maximize2,
  Users,
  ExternalLink,
  Gift,
  Clock,
  Sparkles,
  QrCode,
  Coffee,
} from 'lucide-react';

export default function MerchantDashboard() {
  const router = useRouter();
  const { business, metrics, history, loyalty } = useLoyaltyStore();

  return (
    <div className="h-full flex flex-col bg-gray-50 text-gray-900 select-none">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white p-6 border-b border-gray-200 sticky top-0 z-20 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live PostgREST Sync
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              {business.name}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{business.category}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-black text-white shadow-md flex items-center justify-center font-black text-sm">
            <Coffee size={20} />
          </div>
        </div>

        {/* Stats Grid: Today's Scans & Active Loyalists */}
        <div className="grid grid-cols-2 gap-3.5 p-6 pb-4">
          {/* Card 1: Today's Scans */}
          <div className="bg-white p-4 rounded-3xl shadow-xs border border-gray-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                Today&apos;s Scans
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-200">
                +18% <ArrowUpRight size={10} />
              </span>
            </div>
            <div className="text-gray-950 text-4xl font-black tracking-tight">
              {metrics.todayScans}
            </div>
            <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1 font-medium">
              <Clock size={11} /> Real-time counter
            </p>
          </div>

          {/* Card 2: Active Loyalists */}
          <div className="bg-white p-4 rounded-3xl shadow-xs border border-gray-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                Active VIPs
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-blue-200">
                +12 new
              </span>
            </div>
            <div className="text-gray-950 text-4xl font-black tracking-tight">
              {metrics.activeLoyalists}
            </div>
            <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1 font-medium">
              <Users size={11} /> 86% return rate
            </p>
          </div>
        </div>

        {/* Quick Fast-Scanner Action Banner */}
        <div className="px-6 mb-4">
          <button
            onClick={() => router.push('/merchant/scanner')}
            className="w-full bg-black hover:bg-neutral-900 active:scale-95 transition-all text-white p-4 rounded-3xl font-bold flex items-center justify-between shadow-xl shadow-black/15 cursor-pointer border border-neutral-800"
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-inner">
                <Maximize2 size={22} />
              </div>
              <div>
                <div className="text-base font-black leading-tight tracking-tight">
                  Open Fast-Scanner
                </div>
                <div className="text-xs text-gray-300 font-normal">
                  Award +1, +2, +3 stamps in &lt; 0.5s
                </div>
              </div>
            </div>
            <ArrowUpRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Active Gamification Engine Status */}
        <div className="px-6 mb-4">
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-violet-950 text-white p-4 rounded-3xl shadow-sm border border-purple-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center font-bold">
                <Gift size={20} />
              </div>
              <div>
                <div className="text-xs font-black flex items-center gap-1.5">
                  <span className="capitalize">
                    {business.active_game_type.replace('_', ' ')}
                  </span>
                  <span className="text-[9px] bg-yellow-400/20 text-yellow-300 px-1.5 py-0.2 rounded font-mono font-bold">
                    {loyalty.currentStamps}/5 Keys
                  </span>
                </div>
                <div className="text-[11px] text-purple-200/90 font-medium line-clamp-1">
                  {business.reward_description}
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/customer/pass')}
              className="bg-white text-purple-950 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 active:scale-95 transition-transform cursor-pointer shadow-xs"
            >
              <span>Pass</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* Standee Tent Card Quick Action */}
        <div className="px-6 mb-5">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <QrCode size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block">
                  Counter Table Standee
                </span>
                <span className="text-[11px] text-gray-500">
                  Ready to print A5 tent card
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/merchant/settings')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Open Print Preview
            </button>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="px-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-500">
              Live Counter Activity
            </h2>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
              <Sparkles size={12} /> Auto-Sync
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200/80 divide-y divide-gray-100 shadow-xs overflow-hidden">
            {history.map((tx) => (
              <div key={tx.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-800 font-mono">
                    {tx.customerPhone.slice(-2)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">
                      {tx.customerPhone}
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium">
                      {tx.action}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tx.badge === 'Unlocked' || tx.badge === 'Reward'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {tx.badge}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-0.5">{tx.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
