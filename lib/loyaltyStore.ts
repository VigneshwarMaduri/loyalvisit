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

export interface MerchantMetrics {
  todayScans: number;
  activeLoyalists: number;
  rewardsGiven: number;
}

const STORAGE_KEYS = {
  BUSINESS: 'loyalvisit_business_profile',
  CUSTOMER_SESSION: 'loyalvisit_customer_session',
  LOYALTY: 'loyalvisit_customer_loyalty',
  METRICS: 'loyalvisit_merchant_metrics',
  HISTORY: 'loyalvisit_scan_history',
};

const isValidUuid = (val: string) =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

export const DEFAULT_BUSINESS: BusinessProfile = {
  id: '',
  name: '',
  category: '',
  phone: '',
  instagram_handle: '',
  google_review_link: '',
  active_game_type: 'mystery_vault',
  target_stamps: 5,
  reward_description: 'Store Reward',
};

export const DEFAULT_CUSTOMER: CustomerSession = {
  id: '',
  phone: '',
  isLoggedIn: false,
  registeredAt: '',
};

export const DEFAULT_LOYALTY: LoyaltyRecord = {
  id: '',
  businessId: '',
  customerId: '',
  currentStamps: 0,
  totalRewards: 0,
  isFollowed: false,
  isReviewed: false,
  lastUpdated: '',
};

export const DEFAULT_METRICS: MerchantMetrics = {
  todayScans: 0,
  activeLoyalists: 0,
  rewardsGiven: 0,
};

export const DEFAULT_HISTORY: ScanActivity[] = [];

// Cookie storage helpers for persistent sessions
function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

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
    window.dispatchEvent(new Event('loyalvisit_state_sync'));
  } catch (err) {
    console.error('Failed to write to localStorage', err);
  }
}

export function useLoyaltyStore() {
  const [business, setBusinessState] = useState<BusinessProfile>(DEFAULT_BUSINESS);
  const [customer, setCustomerState] = useState<CustomerSession>(DEFAULT_CUSTOMER);
  const [loyalty, setLoyaltyState] = useState<LoyaltyRecord>(DEFAULT_LOYALTY);
  const [metrics, setMetricsState] = useState<MerchantMetrics>(DEFAULT_METRICS);
  const [history, setHistoryState] = useState<ScanActivity[]>(DEFAULT_HISTORY);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const loadLocalState = useCallback(() => {
    // Check cookie first for persistent customer session
    const cookieSessionRaw = getCookie('loyalvisit_customer_session');
    let session = readStorage(STORAGE_KEYS.CUSTOMER_SESSION, DEFAULT_CUSTOMER);
    if (cookieSessionRaw) {
      try {
        const parsed = JSON.parse(cookieSessionRaw);
        if (parsed && parsed.phone) {
          session = parsed;
        }
      } catch {}
    }

    setBusinessState(readStorage(STORAGE_KEYS.BUSINESS, DEFAULT_BUSINESS));
    setCustomerState(session);
    setLoyaltyState(readStorage(STORAGE_KEYS.LOYALTY, DEFAULT_LOYALTY));
    setMetricsState(readStorage(STORAGE_KEYS.METRICS, DEFAULT_METRICS));
    setHistoryState(readStorage(STORAGE_KEYS.HISTORY, DEFAULT_HISTORY));
  }, []);

  // Fetch live state from Supabase
  const syncWithSupabase = useCallback(async () => {
    if (!supabase) return;
    try {
      setIsSyncing(true);

      // 1. Fetch active business
      const { data: bData } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let activeBizId = '';
      if (bData) {
        activeBizId = bData.id;
        const updatedBiz: BusinessProfile = {
          id: bData.id,
          name: bData.name || 'Store',
          category: bData.category || 'Retail & Cafe',
          phone: bData.phone || '',
          instagram_handle: bData.instagram_handle || '',
          google_review_link: bData.google_review_link || '',
          active_game_type: 'mystery_vault',
          target_stamps: 5,
          reward_description: 'Store Reward',
        };

        // Fetch reward rule for this business
        const { data: rData } = await supabase
          .from('reward_rules')
          .select('*')
          .eq('business_id', bData.id)
          .maybeSingle();

        if (rData) {
          updatedBiz.target_stamps = rData.target_stamps || 5;
          updatedBiz.reward_description = rData.reward_description || 'Store Reward';
        }

        setBusinessState(updatedBiz);
        writeStorage(STORAGE_KEYS.BUSINESS, updatedBiz);
      }

      // 2. Fetch or sync active customer session
      let currentCust = readStorage(STORAGE_KEYS.CUSTOMER_SESSION, DEFAULT_CUSTOMER);
      const cookieSession = getCookie('loyalvisit_customer_session');
      if (cookieSession) {
        try {
          const parsed = JSON.parse(cookieSession);
          if (parsed && parsed.phone) currentCust = parsed;
        } catch {}
      }

      if (currentCust && currentCust.phone) {
        // Look up customer in Supabase customers table
        const { data: cData } = await supabase
          .from('customers')
          .select('*')
          .eq('phone_number', currentCust.phone)
          .maybeSingle();

        let realCustId = currentCust.id;
        if (cData) {
          realCustId = cData.id;
          const verifiedCust: CustomerSession = {
            id: cData.id,
            phone: cData.phone_number,
            isLoggedIn: true,
            registeredAt: cData.created_at || new Date().toISOString(),
          };
          setCustomerState(verifiedCust);
          writeStorage(STORAGE_KEYS.CUSTOMER_SESSION, verifiedCust);
          setCookie('loyalvisit_customer_session', JSON.stringify(verifiedCust), 365);
        }

        // 3. Fetch loyalty card for customer & business
        if (realCustId && activeBizId) {
          const { data: cardData } = await supabase
            .from('loyalty_cards')
            .select('*')
            .eq('business_id', activeBizId)
            .eq('customer_id', realCustId)
            .maybeSingle();

          if (cardData) {
            const updatedCard: LoyaltyRecord = {
              id: cardData.id,
              businessId: cardData.business_id,
              customerId: cardData.customer_id,
              currentStamps: cardData.current_stamps || 0,
              totalRewards: cardData.total_rewards || 0,
              isFollowed: false,
              isReviewed: false,
              lastUpdated: cardData.updated_at || new Date().toISOString(),
            };
            setLoyaltyState(updatedCard);
            writeStorage(STORAGE_KEYS.LOYALTY, updatedCard);
          }
        }
      }

      // 4. Fetch real merchant metrics & live activity
      if (activeBizId) {
        const { data: cards, count } = await supabase
          .from('loyalty_cards')
          .select('id, current_stamps, total_rewards, updated_at, customers(phone_number)', { count: 'exact' })
          .eq('business_id', activeBizId)
          .order('updated_at', { ascending: false });

        if (cards) {
          const totalScans = cards.reduce((acc, c) => acc + (c.current_stamps || 0) + ((c.total_rewards || 0) * 5), 0);
          const totalRewards = cards.reduce((acc, c) => acc + (c.total_rewards || 0), 0);

          const liveMetrics: MerchantMetrics = {
            todayScans: totalScans,
            activeLoyalists: count || cards.length,
            rewardsGiven: totalRewards,
          };
          setMetricsState(liveMetrics);
          writeStorage(STORAGE_KEYS.METRICS, liveMetrics);

          // Build live history from actual database transactions
          const realHistory: ScanActivity[] = cards.map((c, i) => {
            const custObj = c.customers as unknown as { phone_number?: string } | null;
            const phoneStr = custObj?.phone_number || `Customer #${i + 1}`;
            return {
              id: c.id,
              customerPhone: phoneStr,
              action: `${c.current_stamps} Keys Unlocked`,
              time: c.updated_at ? new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
              badge: (c.current_stamps >= 5) ? 'Vault Unlocked' : 'Active',
            };
          });

          setHistoryState(realHistory);
          writeStorage(STORAGE_KEYS.HISTORY, realHistory);
        }
      }
    } catch (err) {
      console.error('Supabase sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadLocalState();

    const handleSync = () => loadLocalState();
    window.addEventListener('loyalvisit_state_sync', handleSync);
    window.addEventListener('storage', handleSync);

    syncWithSupabase();

    // Supabase Realtime subscription
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
              syncWithSupabase();
            }
          })
          .subscribe();
      }
    } catch {}

    return () => {
      window.removeEventListener('loyalvisit_state_sync', handleSync);
      window.removeEventListener('storage', handleSync);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadLocalState, syncWithSupabase]);

  // Real Customer Login with persistent session
  const loginCustomer = useCallback(async (phone: string, businessId?: string, initialStamps = 0) => {
    const formattedPhone = phone.includes('+91')
      ? phone
      : `+91 ${phone.replace(/\D/g, '').slice(-10)}`;

    let customerId = `cust_${phone.replace(/\D/g, '').slice(-10)}`;
    let registeredAt = new Date().toISOString();

    // 1. Upsert customer in Supabase
    try {
      if (supabase) {
        const { data: cData } = await supabase
          .from('customers')
          .upsert({ phone_number: formattedPhone }, { onConflict: 'phone_number' })
          .select()
          .single();

        if (cData) {
          customerId = cData.id;
          registeredAt = cData.created_at || registeredAt;
        }
      }
    } catch (err) {
      console.error('Failed to upsert customer in Supabase:', err);
    }

    const session: CustomerSession = {
      id: customerId,
      phone: formattedPhone,
      isLoggedIn: true,
      registeredAt,
    };

    setCustomerState(session);
    writeStorage(STORAGE_KEYS.CUSTOMER_SESSION, session);
    setCookie('loyalvisit_customer_session', JSON.stringify(session), 365);

    // 2. Fetch or create loyalty card in Supabase
    const targetBizId = businessId || business.id;
    let stamps = initialStamps;
    let loyaltyCardId = '';

    try {
      if (supabase && isValidUuid(customerId) && isValidUuid(targetBizId)) {
        const { data: existingCard } = await supabase
          .from('loyalty_cards')
          .select('*')
          .eq('business_id', targetBizId)
          .eq('customer_id', customerId)
          .maybeSingle();

        if (existingCard) {
          stamps = existingCard.current_stamps;
          loyaltyCardId = existingCard.id;
        } else {
          const { data: newCard } = await supabase
            .from('loyalty_cards')
            .insert({
              business_id: targetBizId,
              customer_id: customerId,
              current_stamps: initialStamps,
              total_rewards: 0,
            })
            .select()
            .single();

          if (newCard) {
            loyaltyCardId = newCard.id;
            stamps = newCard.current_stamps;
          }
        }
      }
    } catch (err) {
      console.error('Failed to get/create loyalty card in Supabase:', err);
    }

    const updatedLoyalty: LoyaltyRecord = {
      id: loyaltyCardId,
      businessId: targetBizId,
      customerId,
      currentStamps: stamps,
      totalRewards: 0,
      isFollowed: false,
      isReviewed: false,
      lastUpdated: new Date().toISOString(),
    };

    setLoyaltyState(updatedLoyalty);
    writeStorage(STORAGE_KEYS.LOYALTY, updatedLoyalty);

    return session;
  }, [business.id]);

  // Award stamps to customer in Supabase
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

      // Async write to Supabase
      try {
        if (supabase) {
          // If we have an existing loyalty card id
          if (isValidUuid(nextLoyalty.id)) {
            await supabase
              .from('loyalty_cards')
              .update({
                current_stamps: newStamps,
                updated_at: new Date().toISOString(),
              })
              .eq('id', nextLoyalty.id);
          } else if (customerPhone && isValidUuid(business.id)) {
            // Find customer by phone
            const { data: cData } = await supabase
              .from('customers')
              .select('id')
              .eq('phone_number', customerPhone)
              .maybeSingle();

            if (cData) {
              await supabase
                .from('loyalty_cards')
                .upsert({
                  business_id: business.id,
                  customer_id: cData.id,
                  current_stamps: newStamps,
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'business_id,customer_id' });
            }
          }
        }
      } catch (err) {
        console.error('Error awarding stamps in Supabase:', err);
      }

      // Re-sync metrics
      setTimeout(() => syncWithSupabase(), 300);

      return nextLoyalty;
    },
    [business.id, business.target_stamps, syncWithSupabase]
  );

  // Redeem reward
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

    try {
      if (supabase && isValidUuid(nextLoyalty.id)) {
        await supabase
          .from('loyalty_cards')
          .update({
            current_stamps: 0,
            total_rewards: nextLoyalty.totalRewards,
            updated_at: new Date().toISOString(),
          })
          .eq('id', nextLoyalty.id);
      }
    } catch (err) {
      console.error('Error redeeming in Supabase:', err);
    }

    setTimeout(() => syncWithSupabase(), 300);
    return nextLoyalty;
  }, [syncWithSupabase]);

  // Social bonuses
  const claimInstagramBonus = useCallback(async () => {
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

    try {
      if (supabase && isValidUuid(nextLoyalty.id)) {
        await supabase
          .from('loyalty_cards')
          .update({ current_stamps: newStamps })
          .eq('id', nextLoyalty.id);
      }
    } catch {}

    return true;
  }, [business.target_stamps]);

  const claimReviewBonus = useCallback(async () => {
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

    try {
      if (supabase && isValidUuid(nextLoyalty.id)) {
        await supabase
          .from('loyalty_cards')
          .update({ current_stamps: newStamps })
          .eq('id', nextLoyalty.id);
      }
    } catch {}

    return true;
  }, [business.target_stamps]);

  // Update business profile in Supabase
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
              phone: next.phone,
              instagram_handle: next.instagram_handle,
              google_review_link: next.google_review_link,
            })
            .eq('id', next.id);

          if (next.reward_description) {
            await supabase
              .from('reward_rules')
              .upsert({
                business_id: next.id,
                target_stamps: next.target_stamps || 5,
                reward_description: next.reward_description,
              }, { onConflict: 'business_id' });
          }
        }
      } catch (err) {
        console.error('Error updating business in Supabase:', err);
      }
    },
    []
  );

  // Logout customer
  const logoutCustomer = useCallback(() => {
    deleteCookie('loyalvisit_customer_session');
    setCustomerState(DEFAULT_CUSTOMER);
    writeStorage(STORAGE_KEYS.CUSTOMER_SESSION, DEFAULT_CUSTOMER);
    setLoyaltyState(DEFAULT_LOYALTY);
    writeStorage(STORAGE_KEYS.LOYALTY, DEFAULT_LOYALTY);
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
    logoutCustomer,
    syncWithSupabase,
  };
}
