
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
    <div className="flex flex-col lg:flex-row h-full bg-black overflow-hidden border-t border-zinc-900">
      {/* Left/Middle Column */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-900 overflow-hidden">
        
        {/* Ticker Header */}
        <div className="h-[72px] border-b border-zinc-900 flex items-center px-4 gap-10 bg-black shrink-0 relative z-50">
          <div className="flex items-center gap-4" ref={pairSelectorRef}>
            <div 
              className="flex items-center gap-2 group cursor-pointer" 
              onClick={() => setIsPairSelectorOpen(!isPairSelectorOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-[#f7931a] flex items-center justify-center overflow-hidden">
                <img src="https://assets.coincap.io/assets/icons/btc@2x.png" alt="BTC" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight">BTC/USDT</span>
                <svg className={`w-4 h-4 text-zinc-500 group-hover:text-white transition-transform duration-200 ${isPairSelectorOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-800 hover:border-zinc-600 transition-all bg-zinc-950/50">
              <svg className="w-4 h-4 text-[#f5a623]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            </button>

            {isPairSelectorOpen && (
              <div className="absolute top-[64px] left-4 w-[420px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-zinc-900">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <input type="text" placeholder="Search coins" autoFocus value={pairSearchQuery} onChange={(e) => setPairSearchQuery(e.target.value)} className="w-full bg-zinc-900 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:border-white/10 outline-none transition-all placeholder:text-zinc-700 text-white" />
                  </div>
                </div>
                <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-12 px-6 py-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-900/50">
                    <div className="col-span-6">Pair</div>
                    <div className="col-span-3 text-right">Price</div>
                    <div className="col-span-3 text-right">Change</div>
                  </div>
                  <div className="py-1">
                    {availablePairs.map((asset) => (
                      <div key={asset.symbol} onClick={() => { setIsPairSelectorOpen(false); setPairSearchQuery(''); }} className="grid grid-cols-12 items-center px-6 py-3 hover:bg-zinc-900/50 transition-all cursor-pointer group">
                        <div className="col-span-6 flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden"><img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} alt={asset.symbol} className="w-full h-full object-cover" /></div>
                          <span className="text-sm font-bold text-zinc-200 group-hover:text-white">{asset.symbol}<span className="text-zinc-600 font-medium">/USDT</span></span>
                        </div>
                        <div className="col-span-3 text-right"><span className="text-xs font-mono font-bold text-zinc-200">{asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                        <div className={`col-span-3 text-right text-xs font-bold font-mono ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <span className={`text-xl font-mono font-bold tabular-nums leading-none mb-1 ${priceChange >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{livePrice.toLocaleString(undefined, { minimumFractionDigits: 1 })}</span>
            <span className={`text-[12px] font-bold tabular-nums leading-none ${priceChange >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{priceChange >= 0 ? '+' : ''}{absChange.toLocaleString(undefined, { minimumFractionDigits: 1 })} ({priceChange.toFixed(2)}%)</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            {['24h low', '24h high', '24h volume (BTC)'].map((label, i) => (
              <div key={label} className="flex flex-col">
                <span className="text-[11px] text-zinc-500 font-medium mb-1">{label}</span>
                <span className="text-[13px] font-bold text-white font-mono tracking-tight">{[59872.0, 71621.7, '1.94K'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 bg-black overflow-hidden relative"><TradeChart /></div>
        
        {/* History Panel */}
        <div className="h-72 border-t border-zinc-900 bg-black flex flex-col shrink-0">
          <div className="flex border-b border-zinc-900">
            {['Market Trades', 'Open Orders (0)', 'Order History'].map((tab, i) => (
              <button key={tab} className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest ${i === 0 ? 'border-b-2 border-white text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>{tab}</button>
            ))}
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-[11px] text-left">
              <thead className="sticky top-0 bg-zinc-950 text-zinc-600 font-bold uppercase tracking-tighter border-b border-zinc-900">
                <tr>
                  <th className="px-6 py-2.5">Time</th>
                  <th className="px-6 py-2.5">Side</th>
                  <th className="px-6 py-2.5">Price(USDT)</th>
                  <th className="px-6 py-2.5 text-right">Amount(BTC)</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-900/30 transition-colors border-b border-zinc-900/30">
                    <td className="px-6 py-2 text-zinc-500 font-mono">{t.time}</td>
                    <td className={`px-6 py-2 font-bold ${t.type === 'buy' ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{t.type.toUpperCase()}</td>
                    <td className="px-6 py-2 font-mono text-zinc-200">{t.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-2 text-right font-mono text-zinc-400">{t.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column (Orderbook & Trade) */}
      <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col bg-[#0a0a0a] shrink-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
           <OrderBook currentPrice={livePrice} />
        </div>

        {/* Trade Form - OKX Precise Look */}
        <div className="p-4 bg-black border-t border-zinc-900 shrink-0">
          <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-lg mb-4">
            <button onClick={() => setSide('buy')} className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${side === 'buy' ? 'bg-[#00d18e] text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>BUY</button>
            <button onClick={() => setSide('sell')} className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${side === 'sell' ? 'bg-[#ff4d4f] text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>SELL</button>
          </div>

          <div className="flex gap-4 mb-4 border-b border-zinc-900">
            {['Limit', 'Market'].map(t => (
              <button key={t} onClick={() => setOrderType(t.toLowerCase() as any)} className={`text-[11px] font-bold pb-2 transition-all ${orderType === t.toLowerCase() ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{t}</button>
            ))}
          </div>

          <div className="space-y-3.5">
            <div className="relative group">
              <input type="number" value={orderType === 'market' ? '' : priceInput} placeholder={orderType === 'market' ? 'Market Price' : 'Price'} onChange={(e) => setPriceInput(e.target.value)} disabled={orderType === 'market'} className="w-full bg-[#111] border border-zinc-800 rounded-lg p-3 text-sm focus:border-zinc-400 outline-none transition-all font-mono text-white disabled:opacity-50" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 uppercase">USDT</span>
            </div>

            <div className="relative group">
              <input type="number" value={amount} placeholder="Amount" onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#111] border border-zinc-800 rounded-lg p-3 text-sm focus:border-zinc-400 outline-none transition-all font-mono text-white" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 uppercase">BTC</span>
            </div>
            
            <div className="grid grid-cols-4 gap-1.5">
               {[25, 50, 75, 100].map(pct => (
                 <button key={pct} onClick={() => setAmount(side === 'buy' ? ((usdtBalance * (pct/100)) / livePrice).toFixed(4) : (btcBalance * (pct/100)).toFixed(4))} className="py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-bold text-zinc-500 hover:text-white hover:border-zinc-600 transition-all">{pct}%</button>
               ))}
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 px-0.5 mt-2">
              <span>Available</span>
              <span className="text-zinc-200 font-mono tracking-tight">{side === 'buy' ? `${usdtBalance.toLocaleString()} USDT` : `${btcBalance.toFixed(4)} BTC`}</span>
            </div>

            <button 
              onClick={handleTrade}
              className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-tight transition-all active:scale-[0.98] shadow-2xl mt-2 ${
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
