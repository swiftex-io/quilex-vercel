
import React, { useState, useEffect, useRef, useMemo } from 'react';
import OrderBook from './OrderBook';
import TradeChart from './TradeChart';
import { useExchangeStore } from '../store';

const SpotTrading: React.FC = () => {
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [isPairSelectorOpen, setIsPairSelectorOpen] = useState(false);
  const [pairSearchQuery, setPairSearchQuery] = useState('');
  
  const pairSelectorRef = useRef<HTMLDivElement>(null);

  const { balances, executeTrade, tradeHistory } = useExchangeStore();
  
  const btcAsset = balances.find(b => b.symbol === 'BTC');
  const livePrice = btcAsset?.price || 65961.70;
  const priceChange = btcAsset?.change24h || 5.04;
  const absChange = (livePrice * (priceChange / 100));

  const [priceInput, setPriceInput] = useState(livePrice.toFixed(2));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pairSelectorRef.current && !pairSelectorRef.current.contains(event.target as Node)) {
        setIsPairSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (orderType === 'market') {
      setPriceInput(livePrice.toFixed(2));
    }
  }, [livePrice, orderType]);

  const usdtBalance = balances.find(b => b.symbol === 'USDT')?.available || 0;
  const btcBalance = btcAsset?.available || 0;

  const handleTrade = async () => {
    const numPrice = orderType === 'market' ? livePrice : parseFloat(priceInput);
    const numAmount = parseFloat(amount);
    if (isNaN(numPrice) || isNaN(numAmount) || numAmount <= 0) return;

    const success = await executeTrade('BTC/USDT', side, numPrice, numAmount);
    if (success) {
      setAmount('');
    } else {
      alert('Insufficient funds!');
    }
  };

  const availablePairs = useMemo(() => {
    return balances
      .filter(b => b.symbol !== 'USDT')
      .filter(b => 
        b.symbol.toLowerCase().includes(pairSearchQuery.toLowerCase()) || 
        b.name.toLowerCase().includes(pairSearchQuery.toLowerCase())
      );
  }, [balances, pairSearchQuery]);

  return (
    // Fixed height for the main container to ensure internal scrolling works correctly
    <div className="flex h-[calc(100vh-64px-32px)] bg-black overflow-hidden border-t border-zinc-900">
      
      {/* Left Sidebar - Trading Pairs (Fixed width, internal scrolling) */}
      <div className="hidden lg:flex w-[260px] flex-col border-r border-zinc-900 bg-[#0a0a0a] shrink-0 h-full overflow-hidden">
        <div className="p-3 border-b border-zinc-900 bg-black/40">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search pairs" 
              value={pairSearchQuery}
              onChange={(e) => setPairSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-[11px] font-normal focus:border-zinc-500 outline-none transition-all placeholder:text-zinc-600 text-white" 
            />
          </div>
        </div>
        
        <div className="flex px-2 pt-1 gap-1 border-b border-zinc-900 bg-black/20">
          {['All', 'Meme', 'L1', 'AI'].map((cat, i) => (
            <button key={cat} className={`px-3 py-1.5 text-[11px] font-normal rounded-t-lg transition-all ${i === 0 ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Scrollable Coin List - Explicitly scrollable with auto-fit height */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
          <div className="grid grid-cols-12 px-3 py-2 text-[10px] text-zinc-500 font-normal border-b border-zinc-900/30 sticky top-0 bg-[#0a0a0a] z-10">
            <div className="col-span-7">Pair</div>
            <div className="col-span-5 text-right">Price</div>
          </div>
          {availablePairs.map((asset) => (
            <div 
              key={asset.symbol} 
              className={`grid grid-cols-12 items-center px-3 py-2.5 hover:bg-zinc-900/50 transition-all cursor-pointer group ${asset.symbol === 'BTC' ? 'bg-zinc-900/30 border-l-2 border-white' : ''}`}
            >
              <div className="col-span-7 flex items-center gap-2">
                <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} alt={asset.symbol} className="w-4 h-4 rounded-full object-cover shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-normal text-zinc-200 group-hover:text-white truncate">
                    {asset.symbol}<span className="text-zinc-500">/USDT</span>
                  </span>
                  <span className={`text-[10px] font-normal ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="col-span-5 text-right">
                <span className="text-[11px] font-mono font-normal text-zinc-300 block truncate">
                  {asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.price < 1 ? 4 : 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden border-r border-zinc-900">
        
        {/* Ticker Header */}
        <div className="h-[60px] border-b border-zinc-900 flex items-center px-4 gap-8 bg-black shrink-0 relative z-50">
          <div className="flex items-center gap-3" ref={pairSelectorRef}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsPairSelectorOpen(!isPairSelectorOpen)}>
              <div className="w-7 h-7 rounded-full bg-[#f7931a] flex items-center justify-center overflow-hidden">
                <img src="https://assets.coincap.io/assets/icons/btc@2x.png" alt="BTC" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-normal tracking-tight">BTC/USDT</span>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className={`text-lg font-mono font-normal tabular-nums leading-none ${priceChange >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{livePrice.toLocaleString(undefined, { minimumFractionDigits: 1 })}</span>
            <span className={`text-[11px] font-normal tabular-nums leading-none mt-0.5 ${priceChange >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{priceChange >= 0 ? '+' : ''}{absChange.toLocaleString(undefined, { minimumFractionDigits: 1 })} ({priceChange.toFixed(2)}%)</span>
          </div>
          
          <div className="hidden xl:flex items-center gap-8">
            {[
              { label: '24h low', val: '59,872.0' },
              { label: '24h high', val: '71,621.7' },
              { label: '24h volume', val: '1.94K' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-normal">{item.label}</span>
                <span className="text-[12px] font-normal text-zinc-300 font-mono tracking-tight">{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Area - 65% of viewport height relative to main area */}
        <div className="h-[65%] bg-black overflow-hidden relative border-b border-zinc-900 shrink-0">
          <TradeChart />
        </div>
        
        {/* History Panel - Flexible remaining space */}
        <div className="flex-1 bg-black flex flex-col min-h-0">
          <div className="flex border-b border-zinc-900 shrink-0">
            {['Market trades', 'Open orders', 'History'].map((tab, i) => (
              <button key={tab} className={`px-4 py-2.5 text-[12px] font-normal ${i === 0 ? 'border-b-2 border-white text-white' : 'text-zinc-500'}`}>{tab}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-[11px] text-left border-separate border-spacing-0">
              <thead className="sticky top-0 bg-zinc-950 text-zinc-500 font-normal border-b border-zinc-900 z-10">
                <tr>
                  <th className="px-4 py-2 font-normal">Time</th>
                  <th className="px-4 py-2 font-normal">Side</th>
                  <th className="px-4 py-2 font-normal">Price</th>
                  <th className="px-4 py-2 text-right font-normal">Amount</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory.map((t) => (
                  <tr key={t.id} className="border-b border-zinc-900/30">
                    <td className="px-4 py-1.5 text-zinc-500 font-mono">{t.time}</td>
                    <td className={`px-4 py-1.5 font-normal ${t.type === 'buy' ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{t.type === 'buy' ? 'Buy' : 'Sell'}</td>
                    <td className="px-4 py-1.5 font-mono text-zinc-300">{t.price.toLocaleString()}</td>
                    <td className="px-4 py-1.5 text-right font-mono text-zinc-500">{t.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column (Orderbook & Trade) */}
      <div className="w-[300px] xl:w-[320px] flex flex-col bg-[#0a0a0a] shrink-0 h-full overflow-hidden">
        {/* OrderBook - Occupies available space above trade form */}
        <div className="flex-1 min-h-0 overflow-hidden border-b border-zinc-900">
           <OrderBook currentPrice={livePrice} />
        </div>

        {/* Trade Form - Compact layout pushed to the bottom */}
        <div className="p-3 bg-black shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          <div className="flex gap-1 p-0.5 bg-zinc-900/50 rounded-lg mb-3">
            <button onClick={() => setSide('buy')} className={`flex-1 py-1.5 rounded-md text-[12px] font-normal transition-all ${side === 'buy' ? 'bg-[#00d18e] text-black shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}>Buy</button>
            <button onClick={() => setSide('sell')} className={`flex-1 py-1.5 rounded-md text-[12px] font-normal transition-all ${side === 'sell' ? 'bg-[#ff4d4f] text-white shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}>Sell</button>
          </div>

          <div className="flex gap-4 mb-2 border-b border-zinc-900">
            {['Limit', 'Market'].map(t => (
              <button key={t} onClick={() => setOrderType(t.toLowerCase() as any)} className={`text-[12px] font-normal pb-1 transition-all ${orderType === t.toLowerCase() ? 'text-white border-b-2 border-white' : 'text-zinc-500'}`}>{t}</button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <input type="number" value={orderType === 'market' ? '' : priceInput} placeholder={orderType === 'market' ? 'Market price' : 'Price'} onChange={(e) => setPriceInput(e.target.value)} disabled={orderType === 'market'} className="w-full bg-[#111] border border-zinc-800 rounded-lg p-2.5 text-[12px] font-normal focus:border-zinc-400 outline-none transition-all font-mono text-white disabled:opacity-50" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-normal text-zinc-600">USDT</span>
            </div>

            <div className="relative">
              <input type="number" value={amount} placeholder="Amount" onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#111] border border-zinc-800 rounded-lg p-2.5 text-[12px] font-normal focus:border-zinc-400 outline-none transition-all font-mono text-white" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-normal text-zinc-600">BTC</span>
            </div>
            
            <div className="grid grid-cols-4 gap-1.5">
               {[25, 50, 75, 100].map(pct => (
                 <button key={pct} onClick={() => setAmount(side === 'buy' ? ((usdtBalance * (pct/100)) / livePrice).toFixed(4) : (btcBalance * (pct/100)).toFixed(4))} className="py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-normal text-zinc-500 hover:text-white transition-all">{pct}%</button>
               ))}
            </div>

            <div className="flex justify-between items-center text-[10px] font-normal text-zinc-500 px-0.5 pt-1">
              <span>Available</span>
              <span className="text-zinc-400 font-mono tracking-tighter">{side === 'buy' ? `${usdtBalance.toLocaleString()} USDT` : `${btcBalance.toFixed(4)} BTC`}</span>
            </div>

            <button 
              onClick={handleTrade}
              className={`w-full py-3 rounded-xl font-normal text-[13px] transition-all active:scale-[0.98] shadow-2xl mt-1 ${
                side === 'buy' ? 'bg-[#00d18e] hover:bg-[#00e099] text-black' : 'bg-[#ff4d4f] hover:bg-[#ff5c5e] text-white'
              }`}
            >
              {side === 'buy' ? `Buy BTC` : `Sell BTC`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotTrading;
