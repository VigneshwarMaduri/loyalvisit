'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

export interface BusinessProfile {
  id: string;
  name: string;
  category: string;
  phone: string;
  instagram_handle: string;
  google_review_link: string;
  active_game_type: 'mystery_vault' | 'ten_stamps' | 'scratch_card';
  target_stamps: number;
  reward_description: string;
}

export interface CustomerSession {
  id: string;
  phone: string;
  isLoggedIn: boolean;
  registeredAt: string;
}

export interface LoyaltyRecord {
  id: string;
  businessId: string;
  customerId: string;
  currentStamps: number;
  totalRewards: number;
  isFollowed: boolean;
  isReviewed: boolean;
  lastUpdated: string;
}

export interface ScanActivity {
  id: string;
  customerPhone: string;
  action: string;
  time: string;
  badge: string;
}

const STORAGE_KEYS = {
  BUSINESS: 'returnwin_business_profile',
  CUSTOMER_SESSION: 'returnwin_customer_session',
  LOYALTY: 'returnwin_customer_loyalty',
  METRICS: 'returnwin_merchant_metrics',
  HISTORY: 'returnwin_scan_history',
};

const isValidUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export const DEFAULT_BUSINESS: BusinessProfile = {
  id: '11111111-1111-4111-a111-111111111111',
  name: 'Saffron Artisanal Cafe',
  category: 'Specialty Coffee & Bakery',
  phone: '+91 98765 43210',
  instagram_handle: 'saffron_cafe_hyd',
  google_review_link: 'https://g.page/r/saffron-cafe-hyd/review',
  active_game_type: 'mystery_vault',
  target_stamps: 5,
  reward_description: 'Free Signature Artisanal Beverage & Truffle Croissant',
};

export const DEFAULT_CUSTOMER: CustomerSession = {
  id: '22222222-2222-4222-a222-222222222222',
  phone: '',
  isLoggedIn: false,
  registeredAt: new Date().toISOString(),
};

export const DEFAULT_LOYALTY: LoyaltyRecord = {
  id: '33333333-3333-4333-a333-333333333333',
  businessId: '11111111-1111-4111-a111-111111111111',
  customerId: '22222222-2222-4222-a222-222222222222',
  currentStamps: 3,
  totalRewards: 1,
  isFollowed: false,
  isReviewed: false,
  lastUpdated: new Date().toISOString(),
};

export const DEFAULT_METRICS = {
  todayScans: 48,
  activeLoyalists: 142,
  rewardsGiven: 18,
};

export const DEFAULT_HISTORY: ScanActivity[] = [
  { id: '1', customerPhone: '+91 98765 43210', action: '+2 Stamps (Mystery Vault)', time: '2m ago', badge: 'Active' },
  { id: '2', customerPhone: '+91 91234 56789', action: 'Claimed: Truffle Croissant', time: '14m ago', badge: 'Reward' },
  { id: '3', customerPhone: '+91 99887 76655', action: '+1 Stamp (Follow Bonus)', time: '29m ago', badge: 'Bonus' },
  { id: '4', customerPhone: '+91 94400 11223', action: '+1 Stamp (Counter Visit)', time: '41m ago', badge: 'Visit' },
];

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('returnwin_state_sync'));
  } catch (err) {
    console.error('Failed to write to localStorage', err);
  }
}

export function useLoyaltyStore() {
  const [business, setBusinessState] = useState<BusinessProfile>(DEFAULT_BUSINESS);
  const [customer, setCustomerState] = useState<CustomerSession>(DEFAULT_CUSTOMER);
  const [loyalty, setLoyaltyState] = useState<LoyaltyRecord>(DEFAULT_LOYALTY);
  const [metrics, setMetricsState] = useState(DEFAULT_METRICS);
  const [history, setHistoryState] = useState<ScanActivity[]>(DEFAULT_HISTORY);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const loadLocalState = useCallback(() => {
    setBusinessState(readStorage(STORAGE_KEYS.BUSINESS, DEFAULT_BUSINESS));
    setCustomerState(readStorage(STORAGE_KEYS.CUSTOMER_SESSION, DEFAULT_CUSTOMER));
    setLoyaltyState(readStorage(STORAGE_KEYS.LOYALTY, DEFAULT_LOYALTY));
    setMetricsState(readStorage(STORAGE_KEYS.METRICS, DEFAULT_METRICS));
    setHistoryState(readStorage(STORAGE_KEYS.HISTORY, DEFAULT_HISTORY));
  }, []);

  // Fetch or sync from Supabase
  const syncWithSupabase = useCallback(async () => {
    if (!supabase) return;
    try {
      setIsSyncing(true);
      // Attempt to load business
      const { data: bData } = await supabase
        .from('businesses')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (bData) {
        setBusinessState((prev) => {
          const updated: BusinessProfile = {
            ...prev,
            id: bData.id || prev.id,
            name: bData.name || prev.name,
            category: bData.category || prev.category,
            phone: bData.phone || prev.phone,
            instagram_handle: bData.instagram_handle || prev.instagram_handle,
            google_review_link: bData.google_review_link || prev.google_review_link,
            active_game_type: (bData.active_game_type as BusinessProfile['active_game_type']) || prev.active_game_type,
          };
          writeStorage(STORAGE_KEYS.BUSINESS, updated);
          return updated;
        });
      }

      // Attempt to load reward rule
      const { data: rData } = await supabase
        .from('reward_rules')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (rData) {
        setBusinessState((prev) => {
          const updated = {
            ...prev,
            target_stamps: rData.target_stamps || prev.target_stamps,
            reward_description: rData.reward_description || prev.reward_description,
          };
          writeStorage(STORAGE_KEYS.BUSINESS, updated);
          return updated;
        });
      }
    } catch {
      // Graceful local mode fallback
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadLocalState();

    const handleSync = () => loadLocalState();
    window.addEventListener('returnwin_state_sync', handleSync);
    window.addEventListener('storage', handleSync);

    // Initial Supabase fetch
    syncWithSupabase();

    // Supabase Realtime channel subscription for multi-device sync
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      if (typeof window !== 'undefined' && supabase) {
        channel = supabase
          .channel('loyalty_live_updates')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'loyalty_cards' }, (payload) => {
            if (payload.new && 'current_stamps' in payload.new) {
              const updatedStamps = Number((payload.new as { current_stamps: number }).current_stamps);
              setLoyaltyState((prev) => {
                const next = { ...prev, currentStamps: updatedStamps };
                writeStorage(STORAGE_KEYS.LOYALTY, next);
                return next;
              });
            }
          })
          .subscribe();
      }
    } catch {
      // Ignore websocket errors in unsupported environments
    }

    return () => {
      window.removeEventListener('returnwin_state_sync', handleSync);
      window.removeEventListener('storage', handleSync);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadLocalState, syncWithSupabase]);

  // Award stamps to customer
  const awardStamps = useCallback(
    async (count: number, customerPhone?: string) => {
      const currentLoyalty = readStorage(STORAGE_KEYS.LOYALTY, DEFAULT_LOYALTY);
      const targetMax = business.target_stamps || 5;
      const newStamps = Math.min(currentLoyalty.currentStamps + count, targetMax);

      const nextLoyalty: LoyaltyRecord = {
        ...currentLoyalty,
        currentStamps: newStamps,
        lastUpdated: new Date().toISOString(),
      };
      setLoyaltyState(nextLoyalty);
      writeStorage(STORAGE_KEYS.LOYALTY, nextLoyalty);

      // Update merchant metrics
      const currentMetrics = readStorage(STORAGE_KEYS.METRICS, DEFAULT_METRICS);
      const nextMetrics = {
        ...currentMetrics,
        todayScans: currentMetrics.todayScans + 1,
      };
      setMetricsState(nextMetrics);
      writeStorage(STORAGE_KEYS.METRICS, nextMetrics);

      // Append to scan history
      const currentHistory = readStorage(STORAGE_KEYS.HISTORY, DEFAULT_HISTORY);
      const newLog: ScanActivity = {
        id: Date.now().toString(),
        customerPhone: customerPhone || currentLoyalty.customerId || '+91 98765 43210',
        action: `+${count} Stamp${count > 1 ? 's' : ''} Awarded`,
        time: 'Just now',
        badge: newStamps >= targetMax ? 'Unlocked' : 'Stamp',
      };
      const nextHistory = [newLog, ...currentHistory.slice(0, 9)];
      setHistoryState(nextHistory);
      writeStorage(STORAGE_KEYS.HISTORY, nextHistory);

      // Async write to Supabase loyalty_cards if possible
      try {
        if (supabase && isValidUuid(currentLoyalty.id)) {
          await supabase
            .from('loyalty_cards')
            .update({ current_stamps: newStamps })
            .eq('id', currentLoyalty.id);
        }
      } catch {
        // Fallback persisted in localStorage
      }

      return nextLoyalty;
    },
    [business.target_stamps]
  );

  // Redeem unlocked reward
  const redeemReward = useCallback(async () => {
    const currentLoyalty = readStorage(STORAGE_KEYS.LOYALTY, DEFAULT_LOYALTY);
    const nextLoyalty: LoyaltyRecord = {
      ...currentLoyalty,
      currentStamps: 0,
      totalRewards: currentLoyalty.totalRewards + 1,
      lastUpdated: new Date().toISOString(),
    };
    setLoyaltyState(nextLoyalty);
    writeStorage(STORAGE_KEYS.LOYALTY, nextLoyalty);

    // Update merchant metrics
    const currentMetrics = readStorage(STORAGE_KEYS.METRICS, DEFAULT_METRICS);
    const nextMetrics = {
      ...currentMetrics,
      rewardsGiven: currentMetrics.rewardsGiven + 1,
    };
    setMetricsState(nextMetrics);
    writeStorage(STORAGE_KEYS.METRICS, nextMetrics);

    // Append to scan history
    const currentHistory = readStorage(STORAGE_KEYS.HISTORY, DEFAULT_HISTORY);
    const newLog: ScanActivity = {
      id: Date.now().toString(),
      customerPhone: currentLoyalty.customerId || '+91 98765 43210',
      action: `Claimed: ${business.reward_description}`,
      time: 'Just now',
      badge: 'Reward',
    };
    setHistoryState([newLog, ...currentHistory.slice(0, 9)]);
    writeStorage(STORAGE_KEYS.HISTORY, [newLog, ...currentHistory.slice(0, 9)]);

    return nextLoyalty;
  }, [business.reward_description]);

  // Social bonus (Instagram follow)
  const claimInstagramBonus = useCallback(() => {
    const currentLoyalty = readStorage(STORAGE_KEYS.LOYALTY, DEFAULT_LOYALTY);
    if (currentLoyalty.isFollowed) return false;

    const targetMax = business.target_stamps || 5;
    const newStamps = Math.min(currentLoyalty.currentStamps + 1, targetMax);
    const nextLoyalty: LoyaltyRecord = {
      ...currentLoyalty,
      isFollowed: true,
      currentStamps: newStamps,
    };
    setLoyaltyState(nextLoyalty);
    writeStorage(STORAGE_KEYS.LOYALTY, nextLoyalty);

    // Add to history
    const currentHistory = readStorage(STORAGE_KEYS.HISTORY, DEFAULT_HISTORY);
    const newLog: ScanActivity = {
      id: Date.now().toString(),
      customerPhone: '+91 98765 43210',
      action: '+1 Stamp (Instagram Follow)',
      time: 'Just now',
      badge: 'Bonus',
    };
    setHistoryState([newLog, ...currentHistory.slice(0, 9)]);
    writeStorage(STORAGE_KEYS.HISTORY, [newLog, ...currentHistory.slice(0, 9)]);

    return true;
  }, [business.target_stamps]);

  // Social bonus (Google Review)
  const claimReviewBonus = useCallback(() => {
    const currentLoyalty = readStorage(STORAGE_KEYS.LOYALTY, DEFAULT_LOYALTY);
    if (currentLoyalty.isReviewed) return false;

    const targetMax = business.target_stamps || 5;
    const newStamps = Math.min(currentLoyalty.currentStamps + 1, targetMax);
    const nextLoyalty: LoyaltyRecord = {
      ...currentLoyalty,
      isReviewed: true,
      currentStamps: newStamps,
    };
    setLoyaltyState(nextLoyalty);
    writeStorage(STORAGE_KEYS.LOYALTY, nextLoyalty);

    return true;
  }, [business.target_stamps]);

  // Update business settings
  const updateBusiness = useCallback(
    async (updated: Partial<BusinessProfile>) => {
      const current = readStorage(STORAGE_KEYS.BUSINESS, DEFAULT_BUSINESS);
      const next = { ...current, ...updated };
      setBusinessState(next);
      writeStorage(STORAGE_KEYS.BUSINESS, next);

      try {
        if (supabase && isValidUuid(next.id)) {
          await supabase
            .from('businesses')
            .update({
              name: next.name,
              category: next.category,
              instagram_handle: next.instagram_handle,
              google_review_link: next.google_review_link,
            })
            .eq('id', next.id);
        }
      } catch {
        // Fallback persisted locally
      }
    },
    []
  );

  // Customer phone login / session set
  const loginCustomer = useCallback((phone: string) => {
    const session: CustomerSession = {
      id: `cust_${phone.replace(/\D/g, '')}`,
      phone,
      isLoggedIn: true,
      registeredAt: new Date().toISOString(),
    };
    setCustomerState(session);
    writeStorage(STORAGE_KEYS.CUSTOMER_SESSION, session);

    // Initialize or load loyalty record
    const existingLoyalty = readStorage(STORAGE_KEYS.LOYALTY, DEFAULT_LOYALTY);
    const updatedLoyalty = {
      ...existingLoyalty,
      customerId: session.id,
    };
    setLoyaltyState(updatedLoyalty);
    writeStorage(STORAGE_KEYS.LOYALTY, updatedLoyalty);

    return session;
  }, []);

  // Reset demo state
  const resetAllDemoData = useCallback(() => {
    setBusinessState(DEFAULT_BUSINESS);
    writeStorage(STORAGE_KEYS.BUSINESS, DEFAULT_BUSINESS);

    setCustomerState(DEFAULT_CUSTOMER);
    writeStorage(STORAGE_KEYS.CUSTOMER_SESSION, DEFAULT_CUSTOMER);

    setLoyaltyState(DEFAULT_LOYALTY);
    writeStorage(STORAGE_KEYS.LOYALTY, DEFAULT_LOYALTY);

    setMetricsState(DEFAULT_METRICS);
    writeStorage(STORAGE_KEYS.METRICS, DEFAULT_METRICS);

    setHistoryState(DEFAULT_HISTORY);
    writeStorage(STORAGE_KEYS.HISTORY, DEFAULT_HISTORY);
  }, []);

  return {
    business,
    customer,
    loyalty,
    metrics,
    history,
    isSyncing,
    awardStamps,
    redeemReward,
    claimInstagramBonus,
    claimReviewBonus,
    updateBusiness,
    loginCustomer,
    resetAllDemoData,
  };
}
