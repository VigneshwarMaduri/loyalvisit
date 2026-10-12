'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { useLoyaltyStore } from '@/lib/loyaltyStore';
import { supabase } from '@/lib/supabaseClient';
import {
  Check,
  Zap,
  Search,
  Trophy,
  UserCheck,
  X,
} from 'lucide-react';

interface IdentifiedCustomer {
  id: string;
  phone: string;
  currentStamps: number;
}

export default function MerchantScanner() {
  const router = useRouter();
  const { business, awardStamps, redeemReward } = useLoyaltyStore();

  const [toast, setToast] = useState<string | null>(null);
  const [identifiedCustomer, setIdentifiedCustomer] = useState<IdentifiedCustomer | null>(null);
  const [manualPhone, setManualPhone] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'initializing' | 'active' | 'simulated' | 'error'>('initializing');

  // QR decoding handler
  const handleQrCodeScanned = async (decodedText: string) => {
    let customerPhone = '';
    let customerId = '';
    let currentStamps = 0;

    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.customerId || parsed.phone) {
        customerId = parsed.customerId || '';
        customerPhone = parsed.phone || '';
        if (parsed.stamps !== undefined) currentStamps = parsed.stamps;
      }
    } catch {
      // Raw text phone fallback
      const cleaned = decodedText.replace(/\D/g, '');
      if (cleaned.length >= 10) {
        customerPhone = `+91 ${cleaned.slice(-10)}`;
      }
    }

    if (!customerPhone && !customerId) {
      setToast('⚠️ Invalid QR code');
      setTimeout(() => setToast(null), 1500);
      return;
    }

    // Look up customer in Supabase
    try {
      if (supabase && customerPhone) {
        const { data: cData } = await supabase
          .from('customers')
          .select('id, phone_number')
          .eq('phone_number', customerPhone)
          .maybeSingle();

        if (cData) {
          customerId = cData.id;
          // Look up current stamps
          const { data: cardData } = await supabase
            .from('loyalty_cards')
            .select('current_stamps')
            .eq('business_id', business.id)
            .eq('customer_id', cData.id)
            .maybeSingle();

          if (cardData) {
            currentStamps = cardData.current_stamps;
          }
        }
      }
    } catch (err) {
      console.error('Error fetching customer from Supabase:', err);
    }

    setIdentifiedCustomer({
      id: customerId || `cust_${customerPhone.replace(/\D/g, '').slice(-10)}`,
      phone: customerPhone || 'Customer Pass',
      currentStamps,
    });
    setToast('🎯 Customer Pass Locked!');
    setTimeout(() => setToast(null), 1500);
  };

  // Real Html5Qrcode Camera Scanner initialization
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let html5QrCode: any = null;
    let isMounted = true;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;

        const readerElem = document.getElementById('qr-camera-element');
        if (!readerElem) return;

        html5QrCode = new Html5Qrcode('qr-camera-element');

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 200, height: 200 },
          },
          (decodedText: string) => {
            handleQrCodeScanned(decodedText);
          },
          () => {
            // Frame scanned without QR
          }
        );

        if (isMounted) {
          setCameraStatus('active');
        }
      } catch {
        if (isMounted) {
          setCameraStatus('simulated');
        }
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCode) {
        try {
          if (html5QrCode.isScanning) {
            html5QrCode.stop().then(() => html5QrCode?.clear()).catch(() => {});
          } else {
            html5QrCode.clear();
          }
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualLock = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = manualPhone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setToast('⚠️ Enter valid 10-digit number');
      setTimeout(() => setToast(null), 1500);
      return;
    }
    const fullPhone = `+91 ${cleaned.slice(-10)}`;
    await handleQrCodeScanned(JSON.stringify({ phone: fullPhone }));
    setShowManualInput(false);
    setManualPhone('');
  };

  const handleAddStamps = async (count: number) => {
    if (!identifiedCustomer) {
      setShowManualInput(true);
      setToast('⚠️ Scan QR or enter phone first');
      setTimeout(() => setToast(null), 1800);
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);
    setToast(`+${count} Stamp${count > 1 ? 's' : ''} Awarded!`);

    const newTotal = Math.min(identifiedCustomer.currentStamps + count, 5);
    setIdentifiedCustomer((prev) => prev ? { ...prev, currentStamps: newTotal } : null);

    await awardStamps(count, identifiedCustomer.phone);

    setTimeout(() => {
      setToast(null);
      setIsProcessing(false);
    }, 1200);
  };

  const handleRedeemReward = async () => {
    if (!identifiedCustomer) return;
    setIsProcessing(true);
    await redeemReward();
    setToast('🎉 Reward Claimed & Progress Reset!');
    setIdentifiedCustomer((prev) => prev ? { ...prev, currentStamps: 0 } : null);
    setTimeout(() => {
      setToast(null);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col bg-black text-white relative select-none">
      {/* Scanner Header Bar */}
      <div className="bg-[#09090B] px-5 py-3.5 border-b border-white/10 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-black text-xs tracking-wider uppercase text-gray-200">
            Fast-Scanner
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-[11px] font-bold text-gray-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Search size={12} />
            <span>{showManualInput ? 'Close' : 'Phone Input'}</span>
          </button>

          <button
            onClick={() => router.push('/merchant/dashboard')}
            className="text-xs font-bold text-gray-400 hover:text-white px-2 py-1"
          >
            Done
          </button>
        </div>
      </div>

      {/* Manual Phone Input Drawer */}
      {showManualInput && (
        <form
          onSubmit={handleManualLock}
          className="bg-neutral-900 border-b border-white/10 p-3 flex gap-2 z-20 animate-in slide-in-from-top duration-200 shrink-0"
        >
          <input
            type="tel"
            placeholder="Enter customer 10-digit mobile"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
            className="flex-1 bg-black border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            autoFocus
          />
          <button
            type="submit"
            className="bg-[#2563EB] text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            Lock Pass
          </button>
        </form>
      )}

      {/* 60 / 40 Split Wrapper */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Camera Viewfinder (Strict Top 60%) */}
        <div className="h-[60%] shrink-0 relative flex items-center justify-center flex-col p-4 bg-[#09090B]">
          {/* Ambient Lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

          {/* Viewfinder Frame */}
          <div className="w-56 h-56 border-2 border-white/20 rounded-3xl relative flex items-center justify-center shadow-2xl backdrop-blur-xs overflow-hidden bg-black/40">
            {/* Real Camera Stream Target */}
            <div id="qr-camera-element" className="w-full h-full absolute inset-0 object-cover" />

            {/* Viewfinder Corners */}
            <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-[#2563EB] rounded-tl-2xl z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-[#2563EB] rounded-tr-2xl z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-[#2563EB] rounded-bl-2xl z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-[#2563EB] rounded-br-2xl z-10 pointer-events-none" />

            {/* Scanning Laser Beam */}
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,1)] animate-pulse z-10 pointer-events-none" />

            {/* Camera Status Badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${
                cameraStatus === 'active'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-black/80 text-blue-300 border-blue-500/30'
              }`}>
                {cameraStatus === 'active' ? '● Camera Live' : '● Sensor Ready'}
              </span>
            </div>

            {/* Locked Customer Chip */}
            {identifiedCustomer ? (
              <div className="absolute bottom-2 inset-x-2 z-10 bg-black/90 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-2xl flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-2">
                  <UserCheck size={14} className="text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <span className="text-[9px] text-gray-400 font-mono block leading-none truncate max-w-[120px]">
                      Pass Locked
                    </span>
                    <span className="text-xs font-bold text-white tracking-wide">
                      {identifiedCustomer.phone}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black bg-blue-500/20 text-[#2563EB] border border-blue-500/30 px-2 py-0.5 rounded-full shrink-0">
                    {identifiedCustomer.currentStamps}/5 Keys
                  </span>
                  <button
                    onClick={() => setIdentifiedCustomer(null)}
                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-2 inset-x-2 z-10 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-1.5 rounded-xl text-center">
                <span className="text-[10px] text-gray-300 font-medium">
                  Align QR pass or tap Phone Input
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel (Strict Bottom 40%) */}
        <div className="h-[40%] shrink-0 bg-white text-gray-900 rounded-t-[2.5rem] p-5 flex flex-col justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-10 relative">
          {/* Floating Toast Notification */}
          {toast && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400/40 animate-in zoom-in-90 duration-150">
              <Check size={16} className="stroke-[3]" />
              <span>{toast}</span>
            </div>
          )}

          {/* Panel Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Zap size={16} className="text-[#2563EB]" />
              <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                Single-Tap Stamp Award
              </span>
            </div>
            <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Mystery Vault
            </span>
          </div>

          {/* Goal Reached Redeem Panel or Fast Stamp Buttons */}
          {identifiedCustomer && identifiedCustomer.currentStamps >= 5 ? (
            <div className="my-auto py-2">
              <button
                onClick={handleRedeemReward}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all animate-bounce cursor-pointer"
              >
                <Trophy size={18} />
                <span>REDEEM VAULT REWARD & RESET</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 my-auto">
              {/* +1 Stamp */}
              <button
                onClick={() => handleAddStamps(1)}
                disabled={isProcessing}
                className="h-24 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200/80 hover:border-[#2563EB] rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all group cursor-pointer shadow-xs"
              >
                <span className="text-3xl font-black text-gray-900 group-hover:text-[#2563EB]">
                  +1
                </span>
                <span className="text-[11px] font-bold text-gray-500 group-hover:text-[#2563EB]">
                  Stamp
                </span>
              </button>

              {/* +2 Stamps */}
              <button
                onClick={() => handleAddStamps(2)}
                disabled={isProcessing}
                className="h-24 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200/80 hover:border-[#2563EB] rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all group cursor-pointer shadow-xs"
              >
                <span className="text-3xl font-black text-gray-900 group-hover:text-[#2563EB]">
                  +2
                </span>
                <span className="text-[11px] font-bold text-gray-500 group-hover:text-[#2563EB]">
                  Stamps
                </span>
              </button>

              {/* +3 Stamps */}
              <button
                onClick={() => handleAddStamps(3)}
                disabled={isProcessing}
                className="h-24 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <span className="text-3xl font-black text-white">+3</span>
                <span className="text-[11px] font-bold text-blue-100">
                  Combo
                </span>
              </button>
            </div>
          )}

          {/* Bottom Security Assurance */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
            <span>Customer: {identifiedCustomer ? identifiedCustomer.phone : 'Not locked'}</span>
            <span className="text-emerald-600 font-bold">Supabase Realtime Sync</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
