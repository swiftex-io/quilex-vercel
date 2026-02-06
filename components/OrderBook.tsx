
import React from 'react';
import { MOCK_ASKS, MOCK_BIDS } from '../constants';

interface OrderBookProps {
  currentPrice?: number;
}

const OrderBook: React.FC<OrderBookProps> = ({ currentPrice = 65432.50 }) => {
  const spread = 2.5;
  const spreadPercent = ((spread / currentPrice) * 100).toFixed(4);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-b border-zinc-900 overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-zinc-900 h-10 shrink-0">
        <button className="px-4 text-[11px] font-bold text-white border-b-2 border-white">Order Book</button>
        <button className="px-4 text-[11px] font-bold text-zinc-500 hover:text-zinc-300">Market Trades</button>
      </div>
      
      {/* Column Titles */}
      <div className="grid grid-cols-3 px-4 py-2 text-zinc-500 font-medium text-[10px] uppercase tracking-tight">
        <span>Price(USDT)</span>
        <span className="text-right">Amount(BTC)</span>
        <span className="text-right">Total(BTC)</span>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Asks (Sell Orders) - Red */}
        <div className="flex flex-col-reverse justify-end overflow-hidden">
          {MOCK_ASKS.slice(0, 14).map((ask, i) => {
            const displayPrice = currentPrice + (i * 0.5) + spread/2;
            const depth = (ask.amount / 0.8) * 100;
            return (
              <div key={i} className="grid grid-cols-3 px-4 py-[3px] relative hover:bg-zinc-900/50 group cursor-pointer">
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-[#ff4d4f]/15 transition-all duration-300"
                  style={{ width: `${depth}%` }}
                ></div>
                <span className="text-[#ff4d4f] z-10 font-mono font-medium tabular-nums text-[12px]">{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                <span className="text-right z-10 font-mono text-zinc-300 tabular-nums text-[12px]">{ask.amount.toFixed(4)}</span>
                <span className="text-right z-10 font-mono text-zinc-500 tabular-nums text-[12px]">{(ask.amount * 1.5).toFixed(4)}</span>
              </div>
            );
          })}
        </div>

        {/* Mid Price & Spread Indicator */}
        <div className="py-3 px-4 bg-zinc-900/20 border-y border-zinc-900/50 my-1 flex flex-col shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#00d18e] tabular-nums tracking-tight">
              {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
               <span>≈ ${currentPrice.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-0.5">
             <span className="text-[10px] font-bold text-zinc-500 uppercase">Spread</span>
             <span className="text-[10px] font-mono font-medium text-zinc-500">{spread.toFixed(1)} ({spreadPercent}%)</span>
          </div>
        </div>

        {/* Bids (Buy Orders) - Green */}
        <div className="flex flex-col overflow-hidden">
          {MOCK_BIDS.slice(0, 14).map((bid, i) => {
            const displayPrice = currentPrice - (i * 0.5) - spread/2;
            const depth = (bid.amount / 0.8) * 100;
            return (
              <div key={i} className="grid grid-cols-3 px-4 py-[3px] relative hover:bg-zinc-900/50 group cursor-pointer">
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-[#00d18e]/15 transition-all duration-300"
                  style={{ width: `${depth}%` }}
                ></div>
                <span className="text-[#00d18e] z-10 font-mono font-medium tabular-nums text-[12px]">{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                <span className="text-right z-10 font-mono text-zinc-300 tabular-nums text-[12px]">{bid.amount.toFixed(4)}</span>
                <span className="text-right z-10 font-mono text-zinc-500 tabular-nums text-[12px]">{(bid.amount * 1.2).toFixed(4)}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Bottom Aggregation Selector */}
      <div className="h-9 px-4 flex items-center justify-between border-t border-zinc-900 text-zinc-500 shrink-0">
        <div className="flex items-center gap-1 text-[11px] font-bold cursor-pointer hover:text-white transition-colors">
          <span>Aggregation</span>
          <span className="text-zinc-400">0.1</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
