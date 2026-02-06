
import React from 'react';
import { MOCK_ASKS, MOCK_BIDS } from '../constants';

interface OrderBookProps {
  currentPrice?: number;
}

const OrderBook: React.FC<OrderBookProps> = ({ currentPrice = 65432.50 }) => {
  const spread = 2.5;
  const spreadPercent = ((spread / currentPrice) * 100).toFixed(4);

  // Povećan broj redova za bolji uvid u tržište (ukupno 11 na obe strane)
  const visibleRows = 11;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-zinc-900 h-9 shrink-0">
        <button className="px-4 text-[12px] font-normal text-white border-b-2 border-white">Order book</button>
        <button className="px-4 text-[12px] font-normal text-zinc-500 hover:text-zinc-300">Market</button>
      </div>
      
      {/* Column Titles */}
      <div className="grid grid-cols-3 px-3 py-1.5 text-zinc-500 font-normal text-[11px] shrink-0 border-b border-zinc-900/30">
        <span>Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden py-1 custom-scrollbar overflow-y-auto">
        {/* Asks (Sell Orders) - Red */}
        <div className="flex flex-col-reverse justify-end overflow-hidden">
          {MOCK_ASKS.slice(0, visibleRows).map((ask, i) => {
            const displayPrice = currentPrice + (i * 0.5) + spread/2;
            const depth = (ask.amount / 0.8) * 100;
            return (
              <div key={i} className="grid grid-cols-3 px-3 py-[2.5px] relative group cursor-pointer hover:bg-zinc-900/30 transition-colors">
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-[#ff4d4f]/10 transition-all duration-300"
                  style={{ width: `${depth}%` }}
                ></div>
                <span className="text-[#ff4d4f] z-10 font-mono font-normal tabular-nums text-[11px]">{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                <span className="text-right z-10 font-mono text-zinc-400 tabular-nums text-[11px]">{ask.amount.toFixed(4)}</span>
                <span className="text-right z-10 font-mono text-zinc-600 tabular-nums text-[11px]">{(ask.amount * 1.5).toFixed(3)}</span>
              </div>
            );
          })}
        </div>

        {/* Mid Price & Spread Indicator */}
        <div className="py-2 px-3 bg-zinc-900/20 border-y border-zinc-900/30 my-1 flex flex-col shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-normal text-[#00d18e] tabular-nums tracking-tighter">
              {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] font-normal text-zinc-500">
              Spread {spread.toFixed(1)} ({spreadPercent}%)
            </span>
          </div>
        </div>

        {/* Bids (Buy Orders) - Green */}
        <div className="flex flex-col overflow-hidden">
          {MOCK_BIDS.slice(0, visibleRows).map((bid, i) => {
            const displayPrice = currentPrice - (i * 0.5) - spread/2;
            const depth = (bid.amount / 0.8) * 100;
            return (
              <div key={i} className="grid grid-cols-3 px-3 py-[2.5px] relative group cursor-pointer hover:bg-zinc-900/30 transition-colors">
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-[#00d18e]/10 transition-all duration-300"
                  style={{ width: `${depth}%` }}
                ></div>
                <span className="text-[#00d18e] z-10 font-mono font-normal tabular-nums text-[11px]">{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                <span className="text-right z-10 font-mono text-zinc-400 tabular-nums text-[11px]">{bid.amount.toFixed(4)}</span>
                <span className="text-right z-10 font-mono text-zinc-600 tabular-nums text-[11px]">{(bid.amount * 1.2).toFixed(3)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
