'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Maximize, Settings } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isDashboardActive = pathname === '/merchant/dashboard';
  const isScanActive = pathname === '/merchant/scanner';
  const isSettingsActive = pathname === '/merchant/settings';

  return (
    <div className="h-16 bg-white border-t border-gray-200 flex justify-around items-center shrink-0">
      <button
        onClick={() => router.push('/merchant/dashboard')}
        className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
          isDashboardActive ? 'text-black font-bold' : 'text-gray-400 font-normal'
        }`}
      >
        <Home className={isDashboardActive ? 'text-black' : 'text-gray-400'} size={22} />
        <span className="text-xs mt-1">Dashboard</span>
      </button>

      <button
        onClick={() => router.push('/merchant/scanner')}
        className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
          isScanActive ? 'text-black font-bold' : 'text-gray-400 font-normal'
        }`}
      >
        <Maximize className={isScanActive ? 'text-black' : 'text-gray-400'} size={22} />
        <span className="text-xs mt-1">Scan</span>
      </button>

      <button
        onClick={() => router.push('/merchant/settings')}
        className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
          isSettingsActive ? 'text-black font-bold' : 'text-gray-400 font-normal'
        }`}
      >
        <Settings className={isSettingsActive ? 'text-black' : 'text-gray-400'} size={22} />
        <span className="text-xs mt-1">Settings</span>
      </button>
    </div>
  );
}
