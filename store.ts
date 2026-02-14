import { create } from 'zustand';
import { Asset, Trade } from './types';
import { MOCK_ASSETS } from './constants';
import { supabase } from './lib/supabase';

export type ReferralTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

interface TierBenefits {
  commission: number;
  feeDiscount: number;
  aprBoost: number;
  perks: string[];
  color: string;
  requirement: number;
  volRequirement: number;
  avgEarn: string;
}

export const TIER_DATA: Record<ReferralTier, TierBenefits> = {
  Bronze: { 
    commission: 15, feeDiscount: 0, aprBoost: 0, 
    perks: ['Standard Support'], color: '#CD7F32', 
    requirement: 0, volRequirement: 0, avgEarn: '$50' 
  },
  Silver: { 
    commission: 25, feeDiscount: 10, aprBoost: 0.5, 
    perks: ['Priority Tickets', 'API Rate Boost'], color: '#C0C0C0', 
    requirement: 6, volRequirement: 50000, avgEarn: '$450' 
  },
  Gold: { 
    commission: 35, feeDiscount: 25, aprBoost: 1.5, 
    perks: ['Signals Access', 'Exclusive Events', 'Early Access'], color: '#FFD700', 
    requirement: 26, volRequirement: 250000, avgEarn: '$2,400' 
  },
  Platinum: { 
    commission: 45, feeDiscount: 50, aprBoost: 3.0, 
    perks: ['Dedicated Manager', '0.01% Flat Maker', 'VIP Merch'], color: '#E5E4E2', 
    requirement: 101, volRequirement: 1000000, avgEarn: '$12,000' 
  },
};

interface ExchangeState {
  balances: Asset[];
  tradeHistory: Trade[];
  referralCode: string;
  referralCount: number;
  referralVolume: number;
  earnings: number;
  referralXP: number;
  isSyncing: boolean;
  user: any | null;
  profile: { nickname: string } | null;
  isGuest: boolean;
  isDepositModalOpen: boolean;
  marketsActiveTab: 'Markets Overview' | 'Rankings';
  
  initialize: () => Promise<void>;
  setUser: (user: any) => void;
  enterAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  deposit: (symbol: string, amount: number) => Promise<void>;
  withdraw: (symbol: string, amount: number) => Promise<void>;
  executeTrade: (pair: string, type: 'buy' | 'sell', price: number, amount: number) => Promise<boolean>;
  updatePrices: (priceData: Record<string, number>) => void;
  setDepositModalOpen: (open: boolean) => void;
  setMarketsActiveTab: (tab: 'Markets Overview' | 'Rankings') => void;
  getTier: () => ReferralTier;
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  balances: [...MOCK_ASSETS],
  tradeHistory: [],
  referralCode: 'QUILEX_PRO_88',
  referralCount: 42,
  referralVolume: 125000, // New tracked metric
  earnings: 1245.50,
  referralXP: 4200,
  isSyncing: false,
  user: null,
  profile: null,
  isGuest: false,
  isDepositModalOpen: false,
  marketsActiveTab: 'Markets Overview',

  getTier: () => {
    const count = get().referralCount;
    const volume = get().referralVolume;
    // For the chase, we require both metrics to move up
    if (count >= 101 && volume >= 1000000) return 'Platinum';
    if (count >= 26 && volume >= 250000) return 'Gold';
    if (count >= 6 && volume >= 50000) return 'Silver';
    return 'Bronze';
  },

  setMarketsActiveTab: (tab) => set({ marketsActiveTab: tab }),
  setDepositModalOpen: (open: boolean) => set({ isDepositModalOpen: open }),
  setUser: (user) => set({ user, isGuest: false }),

  enterAsGuest: async () => {
    const guestUser = {
      id: 'guest-' + Math.random().toString(36).substr(2, 9),
      email: 'guest@quilex.io',
      user_metadata: { nickname: 'Guest_Trader' }
    };
    
    set({ 
      user: guestUser, 
      profile: { nickname: 'Guest_Trader' },
      isGuest: true, 
      balances: MOCK_ASSETS.map(b => b.symbol === 'USDT' ? { ...b, balance: 10000, available: 10000 } : { ...b, balance: 0, available: 0 }),
      tradeHistory: [] 
    });
    localStorage.setItem('quilex_guest_session', JSON.stringify(guestUser));
  },

  signOut: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('quilex_guest_session');
    set({ user: null, profile: null, isGuest: false, tradeHistory: [], balances: [...MOCK_ASSETS] });
  },

  initialize: async () => {
    set({ isSyncing: true });
    try {
      const savedGuest = localStorage.getItem('quilex_guest_session');
      if (savedGuest) {
        const guestUser = JSON.parse(savedGuest);
        set({ 
          user: guestUser, 
          profile: { nickname: guestUser.user_metadata?.nickname || 'Guest' },
          isGuest: true,
          balances: MOCK_ASSETS.map(b => {
             if (b.symbol === 'USDT') return { ...b, balance: 10000, available: 10000 };
             if (b.symbol === 'BTC') return { ...b, balance: 0.245, available: 0.245 };
             return { ...b, balance: 0, available: 0 };
          })
        });
        set({ isSyncing: false });
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        set({ user, isGuest: false });
        set({ profile: { nickname: user.email?.split('@')[0] || 'Trader' } });
      }
    } catch (err) {
      console.error("Initialization failed:", err);
    } finally {
      set({ isSyncing: false });
    }
  },

  deposit: async (symbol, amount) => {
    const { user, isGuest } = get();
    if (!user) return;
    set((state) => ({
      balances: state.balances.map(b => b.symbol === symbol ? { ...b, balance: b.balance + amount, available: b.available + amount } : b)
    }));
  },

  withdraw: async (symbol, amount) => {
    const { balances } = get();
    const asset = balances.find(b => b.symbol === symbol);
    if (!asset || asset.available < amount) return;
    set((state) => ({
      balances: state.balances.map(b => b.symbol === symbol ? { ...b, balance: b.balance - amount, available: b.available - amount } : b)
    }));
  },

  updatePrices: (priceData) => set((state) => ({
    balances: state.balances.map(asset => {
      const pair = `${asset.symbol}USDT`;
      const newPrice = priceData[pair];
      return newPrice ? { ...asset, price: newPrice } : asset;
    })
  })),

  executeTrade: async (pair, type, price, amount) => {
    set((s) => ({
      tradeHistory: [{
        id: Math.random().toString(36).substr(2, 9),
        pair, type, price, amount,
        time: new Date().toLocaleTimeString([], { hour12: false })
      }, ...s.tradeHistory]
    }));
    return true;
  },
}));