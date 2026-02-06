
export enum Page {
  TRADE = 'trade',
  ASSETS = 'assets',
  REFERRAL = 'referral',
  AFFILIATE = 'affiliate',
  SETTINGS = 'settings',
  HOME = 'home'
}

export type LayoutType = 'default' | 'trading' | 'none';

export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  available: number;
  price: number;
  change24h: number;
}

export interface Trade {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  time: string;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}
