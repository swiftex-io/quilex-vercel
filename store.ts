
import { create } from 'zustand';
import { Asset, Trade } from './types';
import { MOCK_ASSETS, MOCK_TRADES } from './constants';
import { supabase } from './lib/supabase';

interface ExchangeState {
  balances: Asset[];
  tradeHistory: Trade[];
  referralCode: string;
  referralCount: number;
  earnings: number;
  isSyncing: boolean;
  user: any | null;
  profile: { nickname: string } | null;
  isGuest: boolean;
  isDepositModalOpen: boolean;
  
  initialize: () => Promise<void>;
  setUser: (user: any) => void;
  enterAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  deposit: (symbol: string, amount: number) => Promise<void>;
  withdraw: (symbol: string, amount: number) => Promise<void>;
  executeTrade: (pair: string, type: 'buy' | 'sell', price: number, amount: number) => Promise<boolean>;
  updatePrices: (priceData: Record<string, number>) => void;
  setDepositModalOpen: (open: boolean) => void;
  addMarketTrade: (trade: Trade) => void;
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  balances: [...MOCK_ASSETS],
  tradeHistory: [...MOCK_TRADES],
  referralCode: 'QUILEX_BEYOND_2024',
  referralCount: 128,
  earnings: 2450.00,
  isSyncing: false,
  user: null,
  profile: null,
  isGuest: false,
  isDepositModalOpen: false,

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
      balances: MOCK_ASSETS.map(b => {
        if (b.symbol === 'USDT') return { ...b, balance: 10000, available: 10000 };
        if (b.symbol === 'BTC') return { ...b, balance: 0.5, available: 0.5 };
        return { ...b, balance: 0, available: 0 };
      }),
      tradeHistory: [...MOCK_TRADES]
    });
    localStorage.setItem('quilex_guest_session', JSON.stringify(guestUser));
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem('quilex_guest_session');
    set({ user: null, profile: null, isGuest: false, tradeHistory: [...MOCK_TRADES], balances: [...MOCK_ASSETS] });
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
          isGuest: true
        });
      } else {
        const sessionResponse = await supabase.auth.getSession();
        const session = sessionResponse?.data?.session;
        if (session?.user) {
          set({ user: session.user, isGuest: false });
        }
      }
    } catch (err) {
      console.error("Initialization error, falling back to clean state:", err);
    } finally {
      set({ isSyncing: false });
    }
  },

  deposit: async (symbol, amount) => {
    set((state) => ({
      balances: state.balances.map(b => b.symbol === symbol ? { ...b, balance: b.balance + amount, available: b.available + amount } : b)
    }));
  },

  withdraw: async (symbol, amount) => {
    const asset = get().balances.find(b => b.symbol === symbol);
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

  addMarketTrade: (trade) => set((state) => ({
    tradeHistory: [trade, ...state.tradeHistory].slice(0, 50)
  })),

  executeTrade: async (pair, type, price, amount) => {
    const [base, quote] = pair.split('/');
    const totalQuote = price * amount;
    const { balances } = get();
    
    if (type === 'buy') {
      const q = balances.find(b => b.symbol === quote);
      if (!q || q.available < totalQuote) return false;
    } else {
      const b = balances.find(b => b.symbol === base);
      if (!b || b.available < amount) return false;
    }

    set((s) => ({
      balances: s.balances.map(b => {
        if (type === 'buy') {
          if (b.symbol === quote) return { ...b, balance: b.balance - totalQuote, available: b.available - totalQuote };
          if (b.symbol === base) return { ...b, balance: b.balance + amount, available: b.available + amount };
        } else {
          if (b.symbol === base) return { ...b, balance: b.balance - amount, available: b.available - amount };
          if (b.symbol === quote) return { ...b, balance: b.balance + totalQuote, available: b.available + totalQuote };
        }
        return b;
      }),
      tradeHistory: [{
        id: Math.random().toString(36).substr(2, 9),
        pair, type, price, amount,
        time: new Date().toLocaleTimeString([], { hour12: false })
      }, ...s.tradeHistory]
    }));
    return true;
  },
}));
