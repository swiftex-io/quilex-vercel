
import React, { useMemo } from 'react';
import { MOCK_ASKS, MOCK_BIDS } from '../constants';

interface OrderBookProps {
  currentPrice?: number;
}

const OrderBook: React.FC<OrderBookProps> = ({ currentPrice = 65432.50 }) => {
  // Enhanced mock data to ensure nice visual fills
  const asks = useMemo(() => MOCK_ASKS.slice(0, 15).map((ask, i) => ({
    ...ask,
    price: currentPrice + (14 - i) * 2.5 + Math.random() * 0.5,
    amount: 0.1 + Math.random() * 1.5
  })), [currentPrice]);

  const bids = useMemo(() => MOCK_BIDS.slice(0, 15).map((bid, i) => ({
    ...bid,
    price: currentPrice - (i + 1) * 2.5 - Math.random() * 0.5,
    amount: 0.1 + Math.random() * 1.5
  })), [currentPrice]);

  const maxAmount = Math.max(...asks.map(a => a.amount), ...bids.map(b => b.amount));

  return (
    <div className="flex flex-col h-full bg-black text-[11px] select-none">
      <div className="h-10 border-b border-zinc-900 flex items-center px-4 justify-between">
        <div className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Order Book</div>
        <div className="flex gap-2">
           <div className="w-3 h-3 bg-green-500/20 rounded-sm border border-green-500/40"></div>
           <div className="w-3 h-3 bg-red-500/20 rounded-sm border border-red-500/40"></div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-3 px-4 py-2 text-gray-600 font-bold text-[9px] uppercase tracking-tighter border-b border-zinc-900/50 bg-zinc-950">
          <span>Price(USDT)</span>
          <span className="text-right">Amount(BTC)</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="flex-1 overflow-hidden flex flex-col justify-end">
          {asks.map((ask, i) => (
            <div key={`ask-${i}`} className="grid grid-cols-3 px-4 py-[3px] relative hover:bg-zinc-800/50 group transition-colors cursor-pointer overflow-hidden">
              <div 
                className="absolute right-0 top-0 bottom-0 bg-red-500/10 transition-all duration-500 pointer-events-none"
                style={{ width: `${(ask.amount / maxAmount) * 100}%` }}
              ></div>
              <span className="text-red-500 z-10 font-mono font-bold tabular-nums">
                {ask.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-right z-10 font-mono text-zinc-400 tabular-nums">{ask.amount.toFixed(4)}</span>
              <span className="text-right text-zinc-600 z-10 font-mono tabular-nums">{(ask.price * ask.amount).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Current Price (REAL TIME) */}
        <div className="py-3 px-4 bg-zinc-900/40 flex items-center justify-between border-y border-zinc-800 shadow-inner z-20">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-green-500 tabular-nums tracking-tighter">
              {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-zinc-500 font-bold">≈ ${currentPrice.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-green-500">+2.41%</span>
             <span className="text-[8px] text-zinc-600 font-bold uppercase">More</span>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex-1 overflow-hidden">
          {bids.map((bid, i) => (
            <div key={`bid-${i}`} className="grid grid-cols-3 px-4 py-[3px] relative hover:bg-zinc-800/50 group transition-colors cursor-pointer overflow-hidden">
              <div 
                className="absolute right-0 top-0 bottom-0 bg-green-500/10 transition-all duration-500 pointer-events-none"
                style={{ width: `${(bid.amount / maxAmount) * 100}%` }}
              ></div>
              <span className="text-green-500 z-10 font-mono font-bold tabular-nums">
                {bid.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-right z-10 font-mono text-zinc-400 tabular-nums">{bid.amount.toFixed(4)}</span>
              <span className="text-right text-zinc-600 z-10 font-mono tabular-nums">{(bid.price * bid.amount).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
