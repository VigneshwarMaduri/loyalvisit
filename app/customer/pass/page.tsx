'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Key,
  QrCode,
  Sparkles,
  CheckCircle2,
  Bell,
  X,
  Coffee,
  Check,
  Gift,
  LogOut,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLoyaltyStore } from '@/lib/loyaltyStore';
import { QRCodeSVG } from 'qrcode.react';

// Custom Instagram SVG icon
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// Telugu suspense copy helper strictly aligned with 0 to 5 keys
function getMysteryVaultCopy(stamps: number) {
  switch (stamps) {
    case 0:
      return {
        te: 'Vault Lock ayi undi! First purchase chesi first key geluchukondi! 🗝️',
        en: 'Vault is locked. Make your first purchase to win key #1!',
      };
    case 1:
      return {
        te: 'First key vachesindi! Inka 4 keys unnay... keep going! ✨',
        en: '1 key unlocked! 4 more keys remaining.',
      };
    case 2:
      return {
        te: '2 keys unnay! Inka 3 keys eh balance... suspense perugutundi! 🔥',
        en: '2 keys unlocked! Only 3 keys to go.',
      };
    case 3:
      return {
        te: 'Inka 2 keys eh balance... em vastundo chuddam! 🎁',
        en: 'Only 2 keys left! The grand mystery reward awaits.',
      };
    case 4:
      return {
        te: 'Just 1 key migilindi! Next visit lo Grand Mystery Gift unlock avtundi! 🚀',
        en: 'Just 1 key left! Next visit unlocks the vault.',
      };
    case 5:
    default:
      return {
        te: 'HURRAY! Vault Unlock Aipoindi! Counter daggara reward claim cheskondi! 🎉',
        en: 'Vault unlocked! Claim your reward at the counter.',
      };
  }
}

export default function CustomerPassPage() {
  const router = useRouter();
  const {
    business,
    customer,
    loyalty,
    claimInstagramBonus,
    claimReviewBonus,
    redeemReward,
    logoutCustomer,
  } = useLoyaltyStore();

  const [showQrModal, setShowQrModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState(false);

  const stamps = loyalty.currentStamps;
  const isGoalReached = stamps >= 5;

  // Trigger confetti when goal reached
  useEffect(() => {
    if (isGoalReached && !redeemed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#facc15', '#a855f7', '#3b82f6', '#ec4899'],
        });
      } catch {}
    }
  }, [isGoalReached, redeemed]);

  const copy = useMemo(() => getMysteryVaultCopy(stamps), [stamps]);

  const handleInstagramFollow = async () => {
    if (loyalty.isFollowed) return;
    if (business.instagram_handle) {
      window.open(`https://instagram.com/${business.instagram_handle}`, '_blank');
    }
    const granted = await claimInstagramBonus();
    if (granted) {
      showToast('🎉 +1 Bonus Stamp added for following!');
    }
  };

  const handleGoogleReview = async () => {
    if (loyalty.isReviewed) return;
    if (business.google_review_link) {
      window.open(business.google_review_link, '_blank');
    }
    const granted = await claimReviewBonus();
    if (granted) {
      showToast('⭐ +1 Bonus Stamp added for reviewing!');
    }
  };

  const handleRedeemBurn = async () => {
    await redeemReward();
    setRedeemed(true);
    setShowRedeemModal(false);
    showToast('✅ Reward redeemed! Stamps reset for your next rewards.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSwitchAccount = () => {
    logoutCustomer();
    router.push('/join/default');
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-900 text-white flex flex-col justify-between pb-24 relative select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400/30 animate-in fade-in slide-in-from-top duration-200">
          <Sparkles size={14} className="text-yellow-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div>
        {/* Dynamic Store Header */}
        <header className="px-5 pt-6 pb-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-lg">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-yellow-400 font-black">
                    <Coffee size={22} />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <Check size={9} className="text-white stroke-[3]" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black tracking-tight">{business.name || 'Store'}</h1>
                  <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-[9px]">
                    ✓
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{business.category || 'Loyalty Pass'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('🔔 Notifications active for store rewards')}
                className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
              >
                <Bell size={16} />
              </button>
            </div>
          </div>

          {/* Customer Identification Banner */}
          <div className="mt-3.5 flex items-center justify-between bg-slate-800/50 rounded-xl px-3.5 py-2.5 border border-slate-700/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Pass Holder:</span>
              <span className="font-bold text-slate-200 font-mono">
                {customer.phone || 'Connecting pass...'}
              </span>
            </div>
            <button
              onClick={handleSwitchAccount}
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-semibold hover:underline"
            >
              <LogOut size={11} />
              <span>Switch</span>
            </button>
          </div>
        </header>

        {/* 5-Key Mystery Vault Main Card */}
        <main className="px-5 py-5 space-y-5">
          <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 p-6 shadow-2xl border border-purple-700/50 overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-300">
                  <Key size={14} />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-white">
                    The Mystery Vault
                  </h3>
                  <p className="text-[10px] text-purple-200 font-medium">
                    5-Key Lock Box
                  </p>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-black text-xs font-mono">
                {stamps} / 5 Keys
              </div>
            </div>

            {/* 5 Key Slots */}
            <div className="flex justify-between items-center py-4 my-2">
              {[1, 2, 3, 4, 5].map((keyNum) => {
                const isUnlocked = keyNum <= stamps;
                const isVaultGoal = keyNum === 5;
                return (
                  <div key={keyNum} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 transform ${
                        isUnlocked
                          ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-yellow-950 shadow-[0_0_16px_rgba(250,204,21,0.6)] scale-105'
                          : 'bg-slate-900/80 border-2 border-dashed border-slate-700 text-slate-500'
                      }`}
                    >
                      <Key
                        size={isUnlocked ? 20 : 16}
                        className={isUnlocked ? 'animate-bounce drop-shadow' : 'opacity-40'}
                      />
                    </div>
                    <span className="text-[10px] font-bold font-mono text-purple-200/80">
                      {isVaultGoal ? 'VAULT' : `#${keyNum}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Suspense Storyline Banner */}
            <div className="mt-3 bg-purple-950/60 backdrop-blur-md rounded-2xl p-4 border border-purple-500/30">
              <div className="flex items-start gap-2.5">
                <span className="text-xl shrink-0">🔮</span>
                <div>
                  <p className="text-xs font-bold text-yellow-300 leading-snug">
                    {copy.te}
                  </p>
                  <p className="text-[10px] text-purple-200/80 mt-1 italic font-medium">
                    {copy.en}
                  </p>
                </div>
              </div>
            </div>

            {/* Goal Reward Action Button */}
            {isGoalReached && (
              <button
                onClick={() => setShowRedeemModal(true)}
                className="w-full mt-4 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-950 font-black text-xs py-3.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all animate-pulse cursor-pointer"
              >
                <Gift size={16} />
                <span>OPEN MYSTERY VAULT REWARD NOW</span>
              </button>
            )}
          </div>

          {/* Social Bonus Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
              Bonus Key Quests
            </h4>

            {/* Instagram Follow */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                  <InstagramIcon size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Follow on Instagram</h5>
                  <p className="text-[11px] text-slate-400">
                    +{business.instagram_handle ? `@${business.instagram_handle}` : 'Follow store'} • Win +1 Bonus Key
                  </p>
                </div>
              </div>

              <button
                onClick={handleInstagramFollow}
                disabled={loyalty.isFollowed}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                  loyalty.isFollowed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white text-slate-950 hover:bg-slate-100 active:scale-95'
                }`}
              >
                {loyalty.isFollowed ? 'Claimed ✓' : 'Follow +1'}
              </button>
            </div>

            {/* Google Review */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Google Review</h5>
                  <p className="text-[11px] text-slate-400">
                    Rate & Review • Win +1 Bonus Key
                  </p>
                </div>
              </div>

              <button
                onClick={handleGoogleReview}
                disabled={loyalty.isReviewed}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                  loyalty.isReviewed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white text-slate-950 hover:bg-slate-100 active:scale-95'
                }`}
              >
                {loyalty.isReviewed ? 'Claimed ✓' : 'Review +1'}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Sticky Cashier QR Trigger */}
      <div className="fixed bottom-4 inset-x-4 max-w-sm mx-auto z-30">
        <button
          onClick={() => setShowQrModal(true)}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-sm py-4 px-6 rounded-2xl shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <QrCode size={20} />
          <span>Show My QR to Cashier</span>
        </button>
      </div>

      {/* Centered QR Pass Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-950 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center relative border border-slate-200">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold mb-3 border border-blue-200">
              <QrCode size={13} />
              <span>Customer Identification Pass</span>
            </div>

            <h3 className="text-lg font-black tracking-tight mb-1">
              Scan to Award Stamps
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Hold this QR code up to the cashier’s Fast-Scanner camera
            </p>

            {/* Real Scannable QR Code */}
            <div className="bg-white p-4 rounded-3xl border-2 border-slate-900 inline-block mb-4 shadow-xl">
              <QRCodeSVG
                value={JSON.stringify({
                  type: 'LOYALVISIT_PASS',
                  customerId: customer.id,
                  phone: customer.phone,
                  stamps: loyalty.currentStamps,
                  businessId: business.id,
                })}
                size={180}
                level="H"
                includeMargin={true}
              />
              <div className="mt-2 text-center">
                <span className="text-[10px] font-mono font-bold text-slate-500 block">
                  ID: {customer.id}
                </span>
                <span className="text-xs font-black text-slate-950 font-mono">
                  {customer.phone}
                </span>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-100 py-2 px-3 rounded-xl mb-4">
              Current Balance: <span className="font-black text-slate-900">{stamps}/5 Keys</span>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full bg-slate-950 text-white font-bold text-xs py-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

      {/* Goal Unlock Mystery Vault Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-b from-indigo-950 to-slate-950 text-white border border-purple-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center relative">
            <button
              onClick={() => setShowRedeemModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-yellow-400 text-yellow-950 mx-auto flex items-center justify-center shadow-lg shadow-yellow-400/20 mb-4 animate-bounce">
              <Gift size={32} />
            </div>

            <h3 className="text-xl font-black tracking-tight text-yellow-300 mb-1">
              Vault Unlocked!
            </h3>
            <p className="text-xs text-purple-200 mb-5">
              Congratulations! Show this screen to the counter staff to claim:
            </p>

            <div className="bg-purple-900/50 border border-purple-400/30 rounded-2xl p-4 mb-5">
              <p className="text-sm font-extrabold text-white">
                {business.reward_description || 'Free Store Reward'}
              </p>
              <span className="text-[10px] text-yellow-300 font-bold block mt-1">
                Verified Store Benefit
              </span>
            </div>

            <button
              onClick={handleRedeemBurn}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Mark Claimed by Cashier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
