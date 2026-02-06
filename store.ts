
import { create } from 'zustand';
import { Asset, Trade } from './types';
import { MOCK_ASSETS } from './constants';
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
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  balances: [...MOCK_ASSETS],
  tradeHistory: [],
  referralCode: 'QUILEX_BEYOND_2024',
  referralCount: 128,
  earnings: 2450.00,
  isSyncing: false,
  user: null,
  profile: null,
  isGuest: false,
  isDepositModalOpen: false,
  marketsActiveTab: 'Markets Overview',

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
             // If it's a guest, give some USDT and BTC for trading
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
        
        let profileData = null;
        let balancesData: any[] | null = null;
        let tradesData: any[] | null = null;

        try {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (!error) profileData = data;
        } catch (e) { console.warn("Profiles access limited"); }

        try {
          const { data } = await supabase.from('balances').select('*').eq('user_id', user.id);
          balancesData = data;
        } catch (e) { console.warn("Balances table not ready"); }

        try {
          const { data } = await supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          tradesData = data;
        } catch (e) { console.warn("Trades table not ready"); }

        set({ 
          profile: { nickname: profileData?.nickname || user.user_metadata?.nickname || user.email?.split('@')[0] || 'Trader' },
          balances: MOCK_ASSETS.map(b => {
                const db = balancesData?.find((d: any) => d.symbol === b.symbol);
                if (db) return { ...b, balance: Number(db.amount), available: Number(db.available) };
                // Default starter balance for new registered users
                if (b.symbol === 'USDT') return { ...b, balance: 10000, available: 10000 };
                return { ...b, balance: 0, available: 0 };
              }),
          tradeHistory: tradesData ? tradesData.map((t: any) => ({
            id: t.id, pair: t.pair, type: t.type, price: Number(t.price), amount: Number(t.amount),
            time: new Date(t.created_at).toLocaleTimeString([], { hour12: false })
          })) : []
        });
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
    
    set({ isSyncing: true });
    try {
      const currentAsset = get().balances.find(b => b.symbol === symbol);
      const newAmount = (currentAsset?.balance || 0) + amount;
      
      if (!isGuest) {
        await supabase.from('balances').upsert({ user_id: user.id, symbol, amount: newAmount, available: newAmount }, { onConflict: 'user_id,symbol' });
      }

      set((state) => ({
        balances: state.balances.map(b => b.symbol === symbol ? { ...b, balance: b.balance + amount, available: b.available + amount } : b)
      }));
    } catch (e) {
      console.error("Deposit error:", e);
    } finally {
      set({ isSyncing: false });
    }
  },

  withdraw: async (symbol, amount) => {
    const { user, isGuest, balances } = get();
    const asset = balances.find(b => b.symbol === symbol);
    if (!asset || asset.available < amount || !user) return;

    set({ isSyncing: true });
    try {
      const newAmount = asset.balance - amount;
      if (!isGuest) {
        await supabase.from('balances').update({ amount: newAmount, available: newAmount }).eq('user_id', user.id).eq('symbol', symbol);
      }
      set((state) => ({
        balances: state.balances.map(b => b.symbol === symbol ? { ...b, balance: b.balance - amount, available: b.available - amount } : b)
      }));
    } catch (e) {
      console.error("Withdraw error:", e);
    } finally {
      set({ isSyncing: false });
    }
  },

  updatePrices: (priceData) => set((state) => ({
    balances: state.balances.map(asset => {
      const pair = `${asset.symbol}USDT`;
      const newPrice = priceData[pair];
      return newPrice ? { ...asset, price: newPrice } : asset;
    })
  })),

  executeTrade: async (pair, type, price, amount) => {
    const [base, quote] = pair.split('/');
    const totalQuote = price * amount;
    const { balances, user, isGuest } = get();
    
    if (type === 'buy') {
      const q = balances.find(b => b.symbol === quote);
      if (!q || q.available < totalQuote) return false;
    } else {
      const b = balances.find(b => b.symbol === base);
      if (!b || b.available < amount) return false;
    }

    set({ isSyncing: true });
    try {
      if (user && !isGuest) {
        const bAsset = balances.find(b => b.symbol === base);
        const qAsset = balances.find(b => b.symbol === quote);
        const nB = type === 'buy' ? (bAsset?.balance || 0) + amount : (bAsset?.balance || 0) - amount;
        const nQ = type === 'buy' ? (qAsset?.balance || 0) - totalQuote : (qAsset?.balance || 0) + totalQuote;

        await supabase.from('trades').insert({ user_id: user.id, pair, type, price, amount });
        await Promise.all([
          supabase.from('balances').upsert({ user_id: user.id, symbol: base, amount: nB, available: nB }, { onConflict: 'user_id,symbol' }),
          supabase.from('balances').upsert({ user_id: user.id, symbol: quote, amount: nQ, available: nQ }, { onConflict: 'user_id,symbol' })
        ]);
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
    } catch (e) {
      console.error("Trade error:", e);
      return true;
    } finally {
      set({ isSyncing: false });
    }
  },
}));
