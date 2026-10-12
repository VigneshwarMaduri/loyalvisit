'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Key,
  QrCode,
  Sparkles,
  CheckCircle2,
  Bell,
  X,
  Coffee,
  Trophy,
  Star,
  Check,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLoyaltyStore } from '@/lib/loyaltyStore';
import ScratchCard from '@/components/ScratchCard';
import { QRCodeSVG } from 'qrcode.react';

// Custom Instagram SVG icon to replace missing Lucide icon
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

// Telugu suspense copy helper
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
  const {
    business,
    customer,
    loyalty,
    claimInstagramBonus,
    claimReviewBonus,
    redeemReward,
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
      } catch {
        // Fallback if canvas-confetti unavailable
      }
    }
  }, [isGoalReached, redeemed]);

  const copy = useMemo(() => getMysteryVaultCopy(stamps), [stamps]);

  const handleInstagramFollow = () => {
    if (loyalty.isFollowed) return;
    window.open(`https://instagram.com/${business.instagram_handle}`, '_blank');
    const granted = claimInstagramBonus();
    if (granted) {
      showToast('🎉 +1 Bonus Stamp added for following!');
    }
  };

  const handleGoogleReview = () => {
    if (loyalty.isReviewed) return;
    window.open(business.google_review_link, '_blank');
    const granted = claimReviewBonus();
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
        {/* Instagram Profile Header */}
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
                  <h1 className="text-base font-black tracking-tight">{business.name}</h1>
                  <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-[9px]">
                    ✓
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{business.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                    <Star size={11} fill="currentColor" /> 4.9
                  </span>
                </div>
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

          {/* Customer Membership Pill */}
          <div className="mt-3.5 flex items-center justify-between bg-slate-800/50 rounded-xl px-3 py-2 border border-slate-700/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Member:</span>
              <span className="font-bold text-slate-200">{customer.phone || '+91 98765 43210'}</span>
            </div>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800/50">
              VIP Tier
            </span>
          </div>
        </header>

        {/* Gamification Engine Card */}
        <main className="px-5 py-5 space-y-5">
          {/* Engine: Mystery Vault */}
          {business.active_game_type === 'mystery_vault' && (
            <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 p-6 shadow-2xl border border-purple-700/50 overflow-hidden">
              {/* Ambient Vault Lighting */}
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

                <div className="px-2.5 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-black text-xs">
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
                            : isVaultGoal
                            ? 'bg-white/10 border-2 border-dashed border-yellow-400/80 text-yellow-300 animate-pulse'
                            : 'bg-purple-950/60 border border-purple-700/40 text-purple-400/30'
                        }`}
                      >
                        {isUnlocked ? (
                          <Key size={18} className="animate-pulse" />
                        ) : isVaultGoal ? (
                          <Gift size={18} className="text-yellow-400" />
                        ) : (
                          <Key size={18} className="stroke-[1.5]" />
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-bold ${
                          isUnlocked ? 'text-yellow-400 font-black' : isVaultGoal ? 'text-yellow-300' : 'text-purple-400/40'
                        }`}
                      >
                        {isVaultGoal ? 'REWARD' : `Key ${keyNum}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Suspense Copy Box (Telugu + English) */}
              <div className="mt-2 pt-3 border-t border-purple-800/60 text-center">
                <p className="text-xs sm:text-sm font-bold text-yellow-300 tracking-tight leading-snug">
                  {copy.te}
                </p>
                <p className="text-[10px] text-purple-200/80 font-medium mt-1">
                  {copy.en}
                </p>
              </div>

              {/* Reward Target Teaser Banner */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-purple-200">
                <div className="flex items-center gap-1.5 truncate">
                  <Sparkles size={13} className="text-yellow-400 shrink-0" />
                  <span className="text-[11px] font-semibold truncate text-purple-100">
                    Grand Prize: {business.reward_description}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-yellow-300 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20 shrink-0">
                  {Math.max(0, 5 - stamps)} Left
                </span>
              </div>

              {/* Reward Reveal Trigger Button when goal reached */}
              {isGoalReached && (
                <div className="mt-4 pt-3 border-t border-yellow-400/30 text-center">
                  <button
                    onClick={() => setShowRedeemModal(true)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-950 font-black text-xs py-3 px-4 rounded-xl shadow-lg shadow-yellow-400/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trophy size={16} />
                    <span>Redeem Unlocked Reward!</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Engine: Classic 10-Stamp Grid */}
          {business.active_game_type === 'ten_stamps' && (
            <div className="rounded-3xl bg-slate-800/90 p-5 shadow-2xl border border-slate-700/80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black tracking-tight text-white">
                  Loyalty Stamp Card
                </h3>
                <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800/60">
                  {stamps * 2} / 10 Stamps
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2.5 py-3">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const isMarked = idx < stamps * 2;
                  return (
                    <div
                      key={idx}
                      className={`h-12 rounded-xl flex items-center justify-center transition-all ${
                        isMarked
                          ? 'bg-amber-400 border border-amber-300 text-slate-950 font-black shadow-md shadow-amber-500/20'
                          : idx === 9
                          ? 'bg-white/10 border-2 border-dashed border-amber-400/80 text-amber-300 animate-pulse'
                          : 'bg-slate-900 border border-slate-700/60 text-slate-600'
                      }`}
                    >
                      {isMarked ? (
                        <CheckCircle2 size={20} />
                      ) : idx === 9 ? (
                        <Gift size={18} />
                      ) : (
                        <Coffee size={16} />
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-center text-slate-300 mt-2 font-medium">
                Collect 10 stamps to earn {business.reward_description}
              </p>
            </div>
          )}

          {/* Engine: Scratch Card / Lucky Draw */}
          {business.active_game_type === 'scratch_card' && (
            <div className="rounded-3xl bg-slate-800/90 p-5 shadow-2xl border border-slate-700/80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span>Lucky Scratch Card</span>
                </h3>
                <span className="text-xs font-bold text-emerald-400">
                  Active Draw
                </span>
              </div>

              <ScratchCard
                rewardText={business.reward_description}
                isUnlocked={isGoalReached}
                onReveal={() => showToast('🎉 Lucky card revealed! Show cashier to claim.')}
              />
            </div>
          )}

          {/* Social Growth UI */}
          <div className="bg-slate-800/50 rounded-3xl p-5 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Social Growth & Bonus Perks
            </h4>

            {/* Follow Instagram Button */}
            <button
              onClick={handleInstagramFollow}
              disabled={loyalty.isFollowed}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                loyalty.isFollowed
                  ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 cursor-default'
                  : 'bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-pink-700/40 text-pink-200 hover:text-white active:scale-95'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <InstagramIcon size={18} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">
                    Follow @{business.instagram_handle}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {loyalty.isFollowed ? 'Bonus Credited (+1 Key)' : 'Earn +1 Instant Stamp'}
                  </p>
                </div>
              </div>

              {loyalty.isFollowed ? (
                <span className="text-xs font-bold flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={16} /> Claimed
                </span>
              ) : (
                <span className="text-xs font-bold bg-pink-500 text-white px-2.5 py-1 rounded-xl">
                  +1 Stamp
                </span>
              )}
            </button>

            {/* Google Review Button */}
            <button
              onClick={handleGoogleReview}
              disabled={loyalty.isReviewed}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                loyalty.isReviewed
                  ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 cursor-default'
                  : 'bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white active:scale-95'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Star size={18} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">Review on Google</p>
                  <p className="text-[10px] text-slate-400">
                    {loyalty.isReviewed ? 'Bonus Credited (+1 Key)' : 'Earn +1 Instant Stamp'}
                  </p>
                </div>
              </div>

              {loyalty.isReviewed ? (
                <span className="text-xs font-bold flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={16} /> Claimed
                </span>
              ) : (
                <span className="text-xs font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded-xl">
                  +1 Stamp
                </span>
              )}
            </button>
          </div>
        </main>
      </div>

      {/* Floating Bottom Action Bar: Show My QR */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent z-30">
        <button
          onClick={() => setShowQrModal(true)}
          className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black text-sm py-4 px-6 rounded-2xl shadow-2xl shadow-white/10 flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <QrCode size={19} className="text-slate-950 stroke-[2.5]" />
          <span>Show My QR to Cashier</span>
        </button>
      </div>

      {/* Customer QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center relative border border-slate-200 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold mb-3">
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
                  phone: customer.phone || '+91 98765 43210',
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
                  {customer.phone || '+91 98765 43210'}
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
              Close Pass
            </button>
          </div>
        </div>
      )}

      {/* Reward Burn / Redemption Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center relative border border-purple-500/50 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowRedeemModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-yellow-950 mx-auto flex items-center justify-center shadow-lg shadow-yellow-400/20 mb-3 animate-bounce">
              <Trophy size={28} />
            </div>

            <h3 className="text-xl font-black tracking-tight text-white mb-1">
              Claim Your Reward!
            </h3>
            <p className="text-xs text-yellow-300 font-semibold mb-4">
              {business.reward_description}
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">
                Cashier One-Time Burn Code
              </span>
              <span className="text-3xl font-black font-mono tracking-widest text-white">
                #RW-7749
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-5">
              Cashier will verify this code or scan your screen to hand over your reward.
            </p>

            <button
              onClick={handleRedeemBurn}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>Cashier Verified • Complete Redemption</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
