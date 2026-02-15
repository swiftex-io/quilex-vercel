import { create } from 'zustand';
import { Asset, Trade, Order, Notification } from './types';
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

// Audio Utilities
const SOUNDS = {
  PLACED: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  FILLED: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' // Updated to a satisfying coins dropping sound
};

const playAudio = (url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.4;
  audio.play().catch(e => console.debug('Audio play blocked by browser policy until interaction.'));
};

interface ExchangeState {
  balances: Asset[];
  tradeHistory: Trade[];
  openOrders: Order[];
  filledOrders: Order[]; // Track filled orders to monitor TP/SL
  notifications: Notification[];
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
  activePair: string;
  
  initialize: () => Promise<void>;
  setUser: (user: any) => void;
  enterAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  deposit: (symbol: string, amount: number) => Promise<void>;
  withdraw: (symbol: string, amount: number) => Promise<void>;
  executeTrade: (pair: string, type: 'buy' | 'sell', price: number, amount: number) => Promise<boolean>;
  placeOrder: (order: Omit<Order, 'id' | 'filled' | 'status' | 'time'>) => Promise<boolean>;
  cancelOrder: (id: string) => void;
  updatePrices: (priceData: Record<string, number>) => void;
  setDepositModalOpen: (open: boolean) => void;
  setMarketsActiveTab: (tab: 'Markets Overview' | 'Rankings') => void;
  getTier: () => ReferralTier;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  setActivePair: (pair: string) => void;
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  balances: [...MOCK_ASSETS],
  tradeHistory: [],
  openOrders: [],
  filledOrders: [],
  notifications: [],
  referralCode: 'LINTEX_PRO_88',
  referralCount: 42,
  referralVolume: 125000,
  earnings: 1245.50,
  referralXP: 4200,
  isSyncing: false,
  user: null,
  profile: null,
  isGuest: false,
  isDepositModalOpen: false,
  marketsActiveTab: 'Markets Overview',
  activePair: 'BTC/USDT',

  getTier: () => {
    const count = get().referralCount;
    const volume = get().referralVolume;
    if (count >= 101 && volume >= 1000000) return 'Platinum';
    if (count >= 26 && volume >= 250000) return 'Gold';
    if (count >= 6 && volume >= 50000) return 'Silver';
    return 'Bronze';
  },

  setActivePair: (pair) => set({ activePair: pair }),

  addNotification: (n) => {
    const id = Math.random().toString(36).substring(2, 9);
    set(s => ({ 
      notifications: [{ ...n, id, timestamp: Date.now() }, ...s.notifications].slice(0, 5) 
    }));
    // Auto remove after 5s
    setTimeout(() => get().removeNotification(id), 5000);
  },

  removeNotification: (id) => set(s => ({ 
    notifications: s.notifications.filter(n => n.id !== id) 
  })),

  setMarketsActiveTab: (tab) => set({ marketsActiveTab: tab }),
  setDepositModalOpen: (open: boolean) => set({ isDepositModalOpen: open }),
  setUser: (user) => set({ user, isGuest: false }),

  enterAsGuest: async () => {
    const guestUser = {
      id: 'guest-' + Math.random().toString(36).substr(2, 9),
      email: 'guest@lintex.exchange',
      user_metadata: { nickname: 'Guest_Trader' }
    };
    
    set({ 
      user: guestUser, 
      profile: { nickname: 'Guest_Trader' },
      isGuest: true, 
      balances: MOCK_ASSETS.map(b => b.symbol === 'USDT' ? { ...b, balance: 10000, available: 10000 } : { ...b, balance: 0.1, available: 0.1 }),
      tradeHistory: [],
      openOrders: [],
      filledOrders: []
    });
    localStorage.setItem('lintex_guest_session', JSON.stringify(guestUser));
  },

  signOut: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('lintex_guest_session');
    set({ user: null, profile: null, isGuest: false, tradeHistory: [], openOrders: [], filledOrders: [], balances: [...MOCK_ASSETS] });
  },

  initialize: async () => {
    set({ isSyncing: true });
    try {
      const savedGuest = localStorage.getItem('lintex_guest_session');
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
    const { user } = get();
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

  updatePrices: (priceData) => {
    const currentPrices = priceData;
    const { openOrders, filledOrders, balances, tradeHistory, addNotification } = get();
    const updatedHistory: Trade[] = [...tradeHistory];
    const nextOpenOrders: Order[] = [];
    const nextFilledOrders: Order[] = [];
    let balancesChanged = false;
    let updatedBalances = [...balances];
    let playSuccess = false;

    // 1. Process Open Orders
    openOrders.forEach(order => {
      const baseSymbol = order.symbol.split('/')[0];
      const pairKey = `${baseSymbol}USDT`;
      const currentPrice = currentPrices[pairKey];
      
      if (!currentPrice) {
        nextOpenOrders.push(order);
        return;
      }

      let isFilled = false;
      if (order.side === 'buy') {
        if (currentPrice <= order.price) isFilled = true;
      } else {
        if (currentPrice >= order.price) isFilled = true;
      }

      if (isFilled) {
        balancesChanged = true;
        playSuccess = true;
        const filledOrder: Order = { ...order, status: 'filled', filled: order.amount };
        nextFilledOrders.push(filledOrder);

        updatedHistory.unshift({
          id: order.id,
          pair: order.symbol,
          type: order.side,
          price: order.price, 
          amount: order.amount,
          time: new Date().toLocaleTimeString([], { hour12: false })
        });
        
        addNotification({
          title: 'Limit Order Filled',
          message: `${order.side.toUpperCase()} ${order.amount} ${baseSymbol} @ ${order.price.toLocaleString()}`,
          type: 'success'
        });

        const quoteSymbol = order.symbol.split('/')[1];
        updatedBalances = updatedBalances.map(b => {
          if (order.side === 'buy') {
             if (b.symbol === quoteSymbol) return { ...b, balance: b.balance - (order.price * order.amount) };
             if (b.symbol === baseSymbol) return { ...b, balance: b.balance + order.amount, available: b.available + order.amount };
          } else {
             if (b.symbol === baseSymbol) return { ...b, balance: b.balance - order.amount };
             if (b.symbol === quoteSymbol) return { ...b, balance: b.balance + (order.price * order.amount), available: b.available + (order.price * order.amount) };
          }
          return b;
        });
      } else {
        nextOpenOrders.push(order);
      }
    });

    // 2. Process Filled Orders for TP/SL Triggers
    filledOrders.forEach(order => {
      const baseSymbol = order.symbol.split('/')[0];
      const pairKey = `${baseSymbol}USDT`;
      const currentPrice = currentPrices[pairKey];
      
      if (!currentPrice || (!order.tpPrice && !order.slPrice)) {
        nextFilledOrders.push(order);
        return;
      }

      let triggered = false;
      let triggerType: 'tp' | 'sl' | null = null;

      // Logic for closing a position based on TP/SL
      if (order.side === 'buy') {
        if (order.tpPrice && currentPrice >= order.tpPrice) { triggered = true; triggerType = 'tp'; }
        else if (order.slPrice && currentPrice <= order.slPrice) { triggered = true; triggerType = 'sl'; }
      } else {
        if (order.tpPrice && currentPrice <= order.tpPrice) { triggered = true; triggerType = 'tp'; }
        else if (order.slPrice && currentPrice >= order.slPrice) { triggered = true; triggerType = 'sl'; }
      }

      if (triggered) {
        balancesChanged = true;
        playSuccess = true;
        
        const sideLabel = triggerType === 'tp' ? 'Take Profit' : 'Stop Loss';
        addNotification({
          title: `${sideLabel} Triggered`,
          message: `Closed ${order.amount} ${baseSymbol} @ ${currentPrice.toLocaleString()}`,
          type: triggerType === 'tp' ? 'success' : 'warning'
        });

        // Execute closing trade (reverse of original)
        const quoteSymbol = order.symbol.split('/')[1];
        updatedBalances = updatedBalances.map(b => {
          if (order.side === 'buy') { // Close buy position = Sell
            if (b.symbol === baseSymbol) return { ...b, balance: b.balance - order.amount, available: b.available - order.amount };
            if (b.symbol === quoteSymbol) return { ...b, balance: b.balance + (currentPrice * order.amount), available: b.available + (currentPrice * order.amount) };
          } else { // Close sell position = Buy
            if (b.symbol === quoteSymbol) return { ...b, balance: b.balance - (currentPrice * order.amount), available: b.available - (currentPrice * order.amount) };
            if (b.symbol === baseSymbol) return { ...b, balance: b.balance + order.amount, available: b.available + order.amount };
          }
          return b;
        });

        updatedHistory.unshift({
          id: `exit-${order.id}`,
          pair: order.symbol,
          type: order.side === 'buy' ? 'sell' : 'buy',
          price: currentPrice,
          amount: order.amount,
          time: new Date().toLocaleTimeString([], { hour12: false })
        });
      } else {
        nextFilledOrders.push(order);
      }
    });

    if (playSuccess) playAudio(SOUNDS.FILLED);

    set((state) => ({
      openOrders: nextOpenOrders,
      filledOrders: nextFilledOrders,
      tradeHistory: updatedHistory,
      balances: (balancesChanged ? updatedBalances : state.balances).map(asset => {
        const pair = `${asset.symbol}USDT`;
        const newPrice = priceData[pair];
        return {
          ...asset,
          price: newPrice || asset.price
        };
      })
    }));
  },

  placeOrder: async (orderData) => {
    const { balances, addNotification } = get();
    const base = orderData.symbol.split('/')[0];
    const quote = orderData.symbol.split('/')[1];

    if (orderData.type === 'market') {
      const bAsset = balances.find(b => b.symbol === base);
      const qAsset = balances.find(b => b.symbol === quote);
      
      if (orderData.side === 'buy') {
        const cost = orderData.price * orderData.amount;
        if (!qAsset || qAsset.available < cost) return false;
        
        set(s => ({
          balances: s.balances.map(b => {
            if (b.symbol === quote) return { ...b, balance: b.balance - cost, available: b.available - cost };
            if (b.symbol === base) return { ...b, balance: b.balance + orderData.amount, available: b.available + orderData.amount };
            return b;
          }),
          tradeHistory: [{
            id: Math.random().toString(36).substr(2, 9),
            pair: orderData.symbol,
            type: 'buy',
            price: orderData.price,
            amount: orderData.amount,
            time: new Date().toLocaleTimeString([], { hour12: false })
          }, ...s.tradeHistory],
          filledOrders: [{
            ...orderData,
            id: Math.random().toString(36).substr(2, 9),
            filled: orderData.amount,
            status: 'filled',
            time: new Date().toLocaleTimeString([], { hour12: false })
          }, ...s.filledOrders]
        }));
      } else {
        if (!bAsset || bAsset.available < orderData.amount) return false;
        const gain = orderData.price * orderData.amount;
        
        set(s => ({
          balances: s.balances.map(b => {
            if (b.symbol === base) return { ...b, balance: b.balance - orderData.amount, available: b.available - orderData.amount };
            if (b.symbol === quote) return { ...b, balance: b.balance + gain, available: b.available + gain };
            return b;
          }),
          tradeHistory: [{
            id: Math.random().toString(36).substr(2, 9),
            pair: orderData.symbol,
            type: 'sell',
            price: orderData.price,
            amount: orderData.amount,
            time: new Date().toLocaleTimeString([], { hour12: false })
          }, ...s.tradeHistory],
          filledOrders: [{
            ...orderData,
            id: Math.random().toString(36).substr(2, 9),
            filled: orderData.amount,
            status: 'filled',
            time: new Date().toLocaleTimeString([], { hour12: false })
          }, ...s.filledOrders]
        }));
      }

      playAudio(SOUNDS.FILLED);
      addNotification({
        title: 'Order Filled',
        message: `${orderData.side.toUpperCase()} ${orderData.amount} ${base} @ ${orderData.price.toLocaleString()}`,
        type: 'success'
      });

      return true;
    } else {
      if (orderData.side === 'buy') {
        const quoteAsset = balances.find(b => b.symbol === quote);
        const cost = orderData.price * orderData.amount;
        if (!quoteAsset || quoteAsset.available < cost) return false;
        
        set(s => ({
          balances: s.balances.map(b => b.symbol === quote ? { ...b, available: b.available - cost } : b)
        }));
      } else {
        const baseAsset = balances.find(b => b.symbol === base);
        if (!baseAsset || baseAsset.available < orderData.amount) return false;
        
        set(s => ({
          balances: s.balances.map(b => b.symbol === base ? { ...b, available: b.available - orderData.amount } : b)
        }));
      }

      const newOrder: Order = {
        ...orderData,
        id: Math.random().toString(36).substr(2, 9),
        filled: 0,
        status: 'open',
        time: new Date().toLocaleTimeString([], { hour12: false })
      };

      set(s => ({ openOrders: [...s.openOrders, newOrder] }));
      playAudio(SOUNDS.PLACED);
      addNotification({
        title: 'Order Placed',
        message: `Limit ${orderData.side.toUpperCase()} ${orderData.amount} ${base} @ ${orderData.price.toLocaleString()}`,
        type: 'info'
      });

      return true;
    }
  },

  cancelOrder: (id) => {
    const { openOrders, balances, addNotification } = get();
    const order = openOrders.find(o => o.id === id);
    if (!order) return;

    const quote = order.symbol.split('/')[1];
    const base = order.symbol.split('/')[0];

    if (order.side === 'buy') {
      const cost = order.price * order.amount;
      set(s => ({
        balances: s.balances.map(b => b.symbol === quote ? { ...b, available: b.available + cost } : b)
      }));
    } else {
      set(s => ({
        balances: s.balances.map(b => b.symbol === base ? { ...b, available: b.available + order.amount } : b)
      }));
    }

    set(s => ({ openOrders: s.openOrders.filter(o => o.id !== id) }));
    addNotification({
      title: 'Order Canceled',
      message: `${order.side.toUpperCase()} ${order.amount} ${base} canceled.`,
      type: 'warning'
    });
  },

  executeTrade: async (pair, type, price, amount) => {
    return get().placeOrder({ symbol: pair, side: type, price, amount, type: 'market' });
  },
}));