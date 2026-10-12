'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { useLoyaltyStore } from '@/lib/loyaltyStore';
import {
  Sparkles,
  Check,
  Zap,
  Search,
  Camera,
  Trophy,
  UserCheck,
} from 'lucide-react';

export default function MerchantScanner() {
  const router = useRouter();
  const { business, loyalty, awardStamps, redeemReward } = useLoyaltyStore();

  const [toast, setToast] = useState<string | null>(null);
  const [identifiedCustomer, setIdentifiedCustomer] = useState({
    id: loyalty.customerId || '22222222-2222-4222-a222-222222222222',
    phone: '+91 98765 43210',
    currentStamps: loyalty.currentStamps,
    isLocked: true,
  });
  const [manualPhone, setManualPhone] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'initializing' | 'active' | 'simulated' | 'error'>('initializing');

  // QR decoding handler
  const handleQrCodeScanned = (decodedText: string) => {
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.customerId || parsed.phone) {
        setIdentifiedCustomer({
          id: parsed.customerId || `cust_${Date.now()}`,
          phone: parsed.phone || '+91 98765 43210',
          currentStamps: parsed.stamps !== undefined ? parsed.stamps : loyalty.currentStamps,
          isLocked: true,
        });
        setToast(`🎯 QR Locked: ${parsed.phone || parsed.customerId}`);
        setTimeout(() => setToast(null), 1500);
        return;
      }
    } catch {
      // Raw string fallback
    }
    setIdentifiedCustomer({
      id: `cust_${decodedText.replace(/\D/g, '').slice(-10) || '9876543210'}`,
      phone: decodedText.includes('+91') ? decodedText : `+91 ${decodedText.replace(/\D/g, '').slice(-10) || '98765 43210'}`,
      currentStamps: loyalty.currentStamps,
      isLocked: true,
    });
    setToast('🎯 QR Code Locked!');
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
          // Fallback if browser/environment doesn't have camera or permission
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

  // Sync identified customer with live loyalty store
  useEffect(() => {
    setIdentifiedCustomer((prev) => ({
      ...prev,
      currentStamps: loyalty.currentStamps,
    }));
  }, [loyalty.currentStamps]);

  const handleAddStamps = async (count: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setToast(`+${count} Stamp${count > 1 ? 's' : ''} Awarded!`);

    await awardStamps(count, identifiedCustomer.phone);

    setTimeout(() => {
      setToast(null);
      setIsProcessing(false);
    }, 1200);
  };

  const handleRedeemReward = async () => {
    setIsProcessing(true);
    await redeemReward();
    setToast('🎉 Reward Claimed & Progress Reset!');
    setTimeout(() => {
      setToast(null);
      setIsProcessing(false);
    }, 1500);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualPhone.length >= 4) {
      setIdentifiedCustomer({
        id: `cust_${manualPhone.replace(/\D/g, '')}`,
        phone: `+91 ${manualPhone.replace(/\D/g, '').slice(-10)}`,
        currentStamps: loyalty.currentStamps,
        isLocked: true,
      });
      setShowManualInput(false);
      setToast('Customer Found!');
      setTimeout(() => setToast(null), 1000);
    }
  };

  const isRewardReady = identifiedCustomer.currentStamps >= 5;

  return (
    <div className="h-full flex flex-col bg-[#09090B] text-white select-none relative overflow-hidden">
      {/* Top Banner connecting to Customer Pass */}
      <div className="h-12 px-5 bg-black/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-gray-300 font-mono font-bold">
            Counter Scanner 01
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Search size={12} />
            <span>Search Phone</span>
          </button>
          <button
            onClick={() => router.push('/customer/pass')}
            className="text-xs text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-lg active:scale-95 transition-transform cursor-pointer"
          >
            <Sparkles size={12} />
            <span>Pass ({identifiedCustomer.currentStamps}/5)</span>
          </button>
        </div>
      </div>

      {/* Manual Phone Fallback Search Bar */}
      {showManualInput && (
        <form
          onSubmit={handleManualSearch}
          className="bg-neutral-900 border-b border-white/10 p-3 flex gap-2 z-20 animate-in slide-in-from-top duration-200 shrink-0"
        >
          <input
            type="tel"
            placeholder="Enter customer 10-digit phone"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
            className="flex-1 bg-black border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            autoFocus
          />
          <button
            type="submit"
            className="bg-[#2563EB] text-white text-xs font-bold px-3 py-2 rounded-xl"
          >
            Lock
          </button>
        </form>
      )}

      {/* 60 / 40 Split Wrapper */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Camera Viewfinder (Strict Top 60%) */}
        <div className="h-[60%] shrink-0 relative flex items-center justify-center flex-col p-4 bg-[#09090B]">
          {/* Ambient Camera Scan Effect */}
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
            <div className="absolute bottom-2 inset-x-2 z-10 bg-black/90 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-2xl flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2">
                <UserCheck size={14} className="text-emerald-400 shrink-0" />
                <div className="text-left">
                  <span className="text-[9px] text-gray-400 font-mono block leading-none truncate max-w-[120px]">
                    QR Locked: {identifiedCustomer.id.slice(0, 8)}...
                  </span>
                  <span className="text-xs font-bold text-white tracking-wide">
                    {identifiedCustomer.phone}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black bg-blue-500/20 text-[#2563EB] border border-blue-500/30 px-2 py-0.5 rounded-full shrink-0">
                {identifiedCustomer.currentStamps}/5 Keys
              </span>
            </div>
          </div>

          {/* Test Scanner Quick Scan Action Pill */}
          <div className="mt-4 flex items-center gap-2 z-10">
            <button
              onClick={() => handleQrCodeScanned(JSON.stringify({ customerId: '22222222-2222-4222-a222-222222222222', phone: '+91 98765 43210', stamps: 3 }))}
              className="text-[10px] font-bold text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Camera size={11} className="text-[#2563EB]" />
              <span>Simulate QR Scan</span>
            </button>
          </div>
        </div>

        {/* Action Panel (Strict Bottom 40%) */}
        <div className="h-[40%] shrink-0 bg-white text-gray-900 rounded-t-[2.5rem] p-5 flex flex-col justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-10 relative">
          {/* Floating Toast Notification (< 0.5s response) */}
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
                One-Tap Stamp Award
              </span>
            </div>
            <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {business.name}
            </span>
          </div>

          {/* Reward Burn / Claim Action if ready */}
          {isRewardReady ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-amber-950">Reward Available!</p>
                  <p className="text-[10px] text-amber-700 truncate max-w-[180px]">{business.reward_description}</p>
                </div>
              </div>
              <button
                onClick={handleRedeemReward}
                className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
              >
                Burn & Redeem
              </button>
            </div>
          ) : null}

          {/* Massive Stamp Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleAddStamps(1)}
              disabled={isProcessing}
              className="bg-[#09090B] hover:bg-neutral-800 text-white text-3xl font-black h-20 rounded-2xl active:scale-90 transition-all shadow-lg shadow-black/15 flex flex-col items-center justify-center cursor-pointer border border-neutral-800 disabled:opacity-50"
            >
              <span>+1</span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                Stamp
              </span>
            </button>

            <button
              onClick={() => handleAddStamps(2)}
              disabled={isProcessing}
              className="bg-[#2563EB] hover:bg-blue-700 text-white text-3xl font-black h-20 rounded-2xl active:scale-90 transition-all shadow-lg shadow-blue-600/25 flex flex-col items-center justify-center cursor-pointer border border-blue-500 disabled:opacity-50"
            >
              <span>+2</span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-200">
                Stamps
              </span>
            </button>

            <button
              onClick={() => handleAddStamps(3)}
              disabled={isProcessing}
              className="bg-purple-600 hover:bg-purple-700 text-white text-3xl font-black h-20 rounded-2xl active:scale-90 transition-all shadow-lg shadow-purple-600/25 flex flex-col items-center justify-center cursor-pointer border border-purple-500 disabled:opacity-50"
            >
              <span>+3</span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-purple-200">
                Stamps
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
