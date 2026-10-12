'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import {
  Store,
  LogOut,
  Download,
  Sparkles,
  Check,
  Database,
  RefreshCw,
  Printer,
  Coffee,
  X,
} from 'lucide-react';
import { useLoyaltyStore } from '@/lib/loyaltyStore';
import { QRCodeSVG } from 'qrcode.react';

export default function MerchantSettings() {
  const router = useRouter();
  const { business, updateBusiness, resetAllDemoData } = useLoyaltyStore();

  const [name, setName] = useState(business.name);
  const [category, setCategory] = useState(business.category);
  const [phone, setPhone] = useState(business.phone);
  const [instagram, setInstagram] = useState(business.instagram_handle);
  const [googleReview, setGoogleReview] = useState(business.google_review_link);
  const [gameType, setGameType] = useState(business.active_game_type);
  const [rewardDesc, setRewardDesc] = useState(business.reward_description);

  const [savedToast, setSavedToast] = useState(false);
  const [showStandeeModal, setShowStandeeModal] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updateBusiness({
      name,
      category,
      phone,
      instagram_handle: instagram,
      google_review_link: googleReview,
      active_game_type: gameType,
      reward_description: rewardDesc,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleResetDemo = () => {
    resetAllDemoData();
    setName(business.name);
    setCategory(business.category);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 text-gray-900 select-none">
      <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white p-6 border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Store Settings
            </span>
            <span className="text-[10px] font-mono font-bold text-gray-400">
              ID: {business.id}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            Store & Gamification Settings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure {name} counter experience & loyalty mechanics
          </p>
        </div>

        {savedToast && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-600 text-white rounded-2xl text-center text-xs font-bold shadow-lg animate-in fade-in flex items-center justify-center gap-2">
            <Check size={16} />
            <span>Settings saved and synced to database!</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Active Gamification Engine Selector */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-600" />
                <span>Active Gamification Engine</span>
              </h3>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Live on Customer Pass
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {/* Mystery Vault */}
              <button
                type="button"
                onClick={() => setGameType('mystery_vault')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  gameType === 'mystery_vault'
                    ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    gameType === 'mystery_vault'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🗝️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-900">
                      The Mystery Vault (5 Keys)
                    </span>
                    <span className="text-[9px] bg-yellow-100 text-yellow-800 font-bold px-1.5 py-0.2 rounded">
                      Featured
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                    Progressive Telugu suspense copy + Gold keys unlock.
                  </p>
                </div>
              </button>

              {/* Classic 10 Stamps */}
              <button
                type="button"
                onClick={() => setGameType('ten_stamps')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  gameType === 'ten_stamps'
                    ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    gameType === 'ten_stamps'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  ☕
                </div>
                <div>
                  <span className="text-xs font-black text-gray-900">
                    Classic 10-Stamp Grid
                  </span>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                    Traditional coffee card layout with progress checkpoints.
                  </p>
                </div>
              </button>

              {/* Scratch Card */}
              <button
                type="button"
                onClick={() => setGameType('scratch_card')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  gameType === 'scratch_card'
                    ? 'border-rose-600 bg-rose-50/70 ring-2 ring-rose-600/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    gameType === 'scratch_card'
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🎟️
                </div>
                <div>
                  <span className="text-xs font-black text-gray-900">
                    Lucky Draw Scratch Card
                  </span>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                    Interactive canvas foil that guests scratch to reveal prizes.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Business & Social Profile Form */}
          <form onSubmit={handleSave} className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Store size={14} className="text-blue-600" />
              <span>Store Profile & Social Links</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Store Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Instagram Handle (without @)
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Google Review URL
              </label>
              <input
                type="url"
                value={googleReview}
                onChange={(e) => setGoogleReview(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Reward Description
              </label>
              <input
                type="text"
                value={rewardDesc}
                onChange={(e) => setRewardDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-xs py-3.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Save Configuration
            </button>
          </form>

          {/* Printable Standee Generator Banner */}
          <div className="bg-gradient-to-br from-indigo-950 to-purple-950 text-white p-5 rounded-3xl border border-purple-800/40 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <Download size={16} className="text-yellow-400" />
              <h3 className="text-sm font-black tracking-tight">
                Printable Counter Standee
              </h3>
            </div>
            <p className="text-xs text-purple-200 leading-relaxed">
              Generate an A5 tabletop tent card featuring your store branding and counter QR code so guests scan to join.
            </p>
            <button
              onClick={() => setShowStandeeModal(true)}
              className="w-full bg-white text-gray-950 hover:bg-gray-100 font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
            >
              <Printer size={15} />
              <span>Preview & Print Standee Tent Card</span>
            </button>
          </div>

          {/* Demo Controls */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Database size={14} className="text-emerald-600" />
              <span>Data Diagnostics</span>
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Reset stamps, history, and test records to initial showroom defaults.
            </p>
            <button
              onClick={handleResetDemo}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Reset All Demo State to Defaults</span>
            </button>
          </div>

          {/* Sign Out */}
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out of Store</span>
          </button>
        </div>
      </div>

      {/* Standee Tent Card Modal */}
      {showStandeeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white text-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center relative border border-gray-200 max-h-[92vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => setShowStandeeModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Tent Card Paper Mockup */}
            <div className="border-4 border-dashed border-gray-300 p-5 rounded-2xl bg-gradient-to-b from-gray-50 to-white shadow-inner mb-5">
              <div className="w-12 h-12 bg-black text-white rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-md">
                <Coffee size={22} />
              </div>
              <h2 className="text-xl font-black tracking-tight text-gray-950 mb-0.5">
                {name}
              </h2>
              <p className="text-xs text-gray-500 font-medium mb-4">{category}</p>

              {/* Real Scannable Standee QR Code */}
              <div className="bg-white p-3 rounded-2xl border-2 border-gray-900 inline-block shadow-md mb-4">
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3005'}/join/${business.id}`}
                  size={150}
                  level="H"
                  includeMargin={true}
                />
                <div className="mt-1 text-center">
                  <span className="text-[9px] font-mono font-bold text-gray-500 block">
                    SCAN WITH CAMERA
                  </span>
                  <span className="text-[9px] font-mono text-blue-600 block truncate max-w-[150px]">
                    /join/{business.id.slice(0, 8)}...
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-2.5 text-center">
                <p className="text-xs font-black text-purple-950">
                  🎁 Scan with Phone Camera
                </p>
                <p className="text-[10px] text-purple-700 font-medium mt-0.5">
                  Unlock mystery perks & instant welcome stamp!
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handlePrint}
                className="w-full bg-black hover:bg-neutral-800 text-white font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Printer size={15} />
                <span>Print Standee Tent Card</span>
              </button>
              <button
                onClick={() => router.push(`/join/${business.id}`)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                Test Guest Scan Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
