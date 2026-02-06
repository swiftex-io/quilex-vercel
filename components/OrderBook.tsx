
import React from 'react';
import { MOCK_ASKS, MOCK_BIDS } from '../constants';

interface OrderBookProps {
  currentPrice?: number;
}

const OrderBook: React.FC<OrderBookProps> = ({ currentPrice = 65432.50 }) => {
  return (
    <div className="flex flex-col h-full bg-black text-[11px]">
      <div className="h-8 border-b border-gray-800 flex items-center px-4 text-gray-500 font-medium uppercase tracking-widest text-[10px]">
        Order Book
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-3 px-4 py-2 text-gray-600 font-medium text-[9px] uppercase tracking-tighter">
          <span>Price(USDT)</span>
          <span className="text-right">Amount(BTC)</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="flex flex-col-reverse">
          {MOCK_ASKS.slice(0, 10).map((ask, i) => {
            const displayPrice = currentPrice + (i * 2.5);
            return (
              <div key={i} className="grid grid-cols-3 px-4 py-1 relative hover:bg-zinc-900 group transition-colors cursor-pointer">
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-red-900/10 transition-all pointer-events-none"
                  style={{ width: `${(ask.amount / 0.8) * 100}%` }}
                ></div>
                <span className="text-red-500 z-10 font-mono font-bold">{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                <span className="text-right z-10 font-mono text-gray-400">{ask.amount.toFixed(4)}</span>
                <span className="text-right text-gray-600 z-10 font-mono">{(displayPrice * ask.amount).toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        {/* Current Price (REAL TIME) */}
        <div className="py-3 px-4 bg-zinc-900/40 flex items-center justify-between border-y border-gray-900/50">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-500 tabular-nums">
              {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">≈ ${currentPrice.toLocaleString()}</span>
          </div>
          <div className="text-[9px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">↑</div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex flex-col">
          {MOCK_BIDS.slice(0, 10).map((bid, i) => {
            const displayPrice = currentPrice - (i * 2.5) - 0.5;
            return (
              <div key={i} className="grid grid-cols-3 px-4 py-1 relative hover:bg-zinc-900 group transition-colors cursor-pointer">
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-green-900/10 transition-all pointer-events-none"
                  style={{ width: `${(bid.amount / 0.8) * 100}%` }}
                ></div>
                <span className="text-green-500 z-10 font-mono font-bold">{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                <span className="text-right z-10 font-mono text-gray-400">{bid.amount.toFixed(4)}</span>
                <span className="text-right text-gray-600 z-10 font-mono">{(displayPrice * bid.amount).toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
