'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import {
  LogOut,
  Download,
  Sparkles,
  Check,
  Printer,
  Coffee,
  X,
} from 'lucide-react';
import { useLoyaltyStore } from '@/lib/loyaltyStore';
import { QRCodeSVG } from 'qrcode.react';

export default function MerchantSettings() {
  const router = useRouter();
  const { business, updateBusiness } = useLoyaltyStore();

  const [name, setName] = useState(business.name);
  const [category, setCategory] = useState(business.category);
  const [phone, setPhone] = useState(business.phone);
  const [instagram, setInstagram] = useState(business.instagram_handle);
  const [googleReview, setGoogleReview] = useState(business.google_review_link);
  const [rewardDesc, setRewardDesc] = useState(business.reward_description);

  const [savedToast, setSavedToast] = useState(false);
  const [showStandeeModal, setShowStandeeModal] = useState(false);

  // Keep state synced with business when loaded from Supabase
  useEffect(() => {
    if (business.name) setName(business.name);
    if (business.category) setCategory(business.category);
    if (business.phone) setPhone(business.phone);
    if (business.instagram_handle) setInstagram(business.instagram_handle);
    if (business.google_review_link) setGoogleReview(business.google_review_link);
    if (business.reward_description) setRewardDesc(business.reward_description);
  }, [business]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updateBusiness({
      name,
      category,
      phone,
      instagram_handle: instagram,
      google_review_link: googleReview,
      reward_description: rewardDesc,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${business.id || 'default'}`
    : `https://loyalvisit.app/join/${business.id || 'default'}`;

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
              ID: {business.id ? `${business.id.slice(0, 8)}...` : 'Connected'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            Store & Loyalty Configuration
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure {name || 'your store'} counter experience & reward mechanics
          </p>
        </div>

        {savedToast && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-600 text-white rounded-2xl text-center text-xs font-bold shadow-lg animate-in fade-in flex items-center justify-center gap-2">
            <Check size={16} />
            <span>Settings saved and synced to Supabase database!</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Active Loyalty Mechanism */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-600" />
                <span>Active Loyalty Mechanism</span>
              </h3>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Live on Customer Pass
              </span>
            </div>

            <div className="p-4 rounded-2xl border-2 border-black bg-purple-50/40">
              <div className="font-extrabold text-sm text-gray-900 mb-0.5">
                5-Key Mystery Vault
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Customers collect 5 unlock keys to reveal the grand mystery surprise. Drives consistent return visits through anticipation.
              </p>
            </div>
          </div>

          {/* Store Profile Form */}
          <form onSubmit={handleSave} className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
              Store Information
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Industry Category
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
                Counter Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="store_handle"
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
                placeholder="https://g.page/r/your-business/review"
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
                placeholder="Free Artisanal Drink or Pastry"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-xs py-3.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Save Configuration to Database
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
                {name || 'Store'}
              </h2>
              <p className="text-xs text-gray-500 font-medium mb-4">
                {category || 'Specialty Coffee & Bakery'}
              </p>

              {/* Scannable Tabletop Standee QR Code */}
              <div className="bg-white p-3.5 rounded-2xl border-2 border-black inline-block shadow-lg mb-3">
                <QRCodeSVG
                  value={joinUrl}
                  size={150}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="bg-purple-950 text-white rounded-xl p-3 mb-2">
                <span className="text-[10px] font-black uppercase text-yellow-300 block mb-0.5 tracking-wider">
                  Scan for Instant Web Pass
                </span>
                <span className="text-xs font-bold">
                  {rewardDesc || 'Unlock Mystery Vault Keys'}
                </span>
              </div>

              <span className="text-[10px] text-gray-400 font-mono block">
                No App Download Required
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 bg-black text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <Printer size={14} />
                <span>Print Standee</span>
              </button>

              <button
                onClick={() => setShowStandeeModal(false)}
                className="bg-gray-100 text-gray-700 font-bold text-xs py-3 px-4 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
