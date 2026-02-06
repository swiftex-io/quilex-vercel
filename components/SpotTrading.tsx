
import React, { useState, useEffect } from 'react';
import OrderBook from './OrderBook';
import TradeChart from './TradeChart';
import { useExchangeStore } from '../store';

const SpotTrading: React.FC = () => {
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');

  const { balances, executeTrade, tradeHistory, addMarketTrade } = useExchangeStore();
  
  const btcAsset = balances.find(b => b.symbol === 'BTC');
  const livePrice = btcAsset?.price || 65000;
  
  const [priceInput, setPriceInput] = useState(livePrice.toFixed(2));

  // Sync price input with live price if market order
  useEffect(() => {
    if (orderType === 'market') {
      setPriceInput(livePrice.toFixed(2));
    }
  }, [livePrice, orderType]);

  // Simulate market activity
  useEffect(() => {
    const interval = setInterval(() => {
      const randomSide = Math.random() > 0.5 ? 'buy' : 'sell';
      const randomAmount = parseFloat((Math.random() * 0.1).toFixed(4));
      const randomPrice = livePrice + (Math.random() - 0.5) * 5;
      
      addMarketTrade({
        id: Math.random().toString(36).substr(2, 9),
        pair: 'BTC/USDT',
        type: randomSide as 'buy' | 'sell',
        price: randomPrice,
        amount: randomAmount,
        time: new Date().toLocaleTimeString([], { hour12: false })
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [livePrice, addMarketTrade]);

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

  return (
    <div className="flex flex-col lg:flex-row h-full bg-black overflow-hidden border-t border-zinc-900">
      {/* Left Column: Asset Selection & Chart & History */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-900 overflow-hidden">
        {/* Ticker Header */}
        <div className="h-14 border-b border-zinc-900 flex items-center px-4 gap-8 bg-zinc-950/20 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">BTC/USDT</span>
            <span className={`text-lg font-mono font-bold transition-all tabular-nums ${Math.random() > 0.5 ? 'text-green-500' : 'text-red-500'}`}>
              {livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="hidden xl:flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">24h Change</span>
              <span className="text-[11px] font-bold text-green-500">+2.45%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">24h High</span>
              <span className="text-[11px] font-bold text-zinc-200">67,120.50</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">24h Low</span>
              <span className="text-[11px] font-bold text-zinc-200">64,210.12</span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 bg-black overflow-hidden relative">
          <TradeChart />
        </div>
        
        {/* Bottom History Panel */}
        <div className="h-72 border-t border-zinc-900 bg-zinc-950/30 flex flex-col shrink-0">
          <div className="flex border-b border-zinc-900 bg-black/40">
            <button className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 border-white text-white">Live Trades</button>
            <button className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-400">Open Orders (0)</button>
            <button className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-400">Funds</button>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-[10px] text-left">
              <thead className="sticky top-0 bg-zinc-950 text-zinc-600 font-bold uppercase tracking-tighter">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Side</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {tradeHistory.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-2 text-zinc-500 font-mono">{t.time}</td>
                    <td className={`px-6 py-2 font-bold ${t.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>{t.type.toUpperCase()}</td>
                    <td className="px-6 py-2 font-mono text-zinc-300">{t.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-2 text-right font-mono text-white">{t.amount.toFixed(4)} BTC</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: OrderBook & Order Panel */}
      <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col bg-zinc-950 shrink-0 overflow-hidden">
        <div className="flex-1 min-h-0">
           <OrderBook currentPrice={livePrice} />
        </div>

        {/* Trade Form */}
        <div className="p-5 border-t border-zinc-900 bg-black shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl mb-4">
            <button 
              onClick={() => setSide('buy')}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${side === 'buy' ? 'bg-green-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              BUY
            </button>
            <button 
              onClick={() => setSide('sell')}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${side === 'sell' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              SELL
            </button>
          </div>

          <div className="flex gap-4 mb-4 border-b border-zinc-900 pb-1">
            <button onClick={() => setOrderType('limit')} className={`text-[10px] font-bold uppercase tracking-widest ${orderType === 'limit' ? 'text-white border-b border-white' : 'text-zinc-600'} pb-1`}>Limit</button>
            <button onClick={() => setOrderType('market')} className={`text-[10px] font-bold uppercase tracking-widest ${orderType === 'market' ? 'text-white border-b border-white' : 'text-zinc-600'} pb-1`}>Market</button>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-2 text-zinc-600 text-[8px] font-black uppercase tracking-widest">Price</span>
              <input 
                type="number" 
                value={orderType === 'market' ? '' : priceInput}
                placeholder={orderType === 'market' ? 'Market Price' : '0.00'}
                onChange={(e) => setPriceInput(e.target.value)}
                disabled={orderType === 'market'}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 pt-6 text-xs focus:outline-none focus:border-zinc-600 transition-all font-mono text-white disabled:opacity-30"
              />
              <span className="absolute right-3 bottom-2 text-zinc-500 text-[9px] font-bold uppercase">USDT</span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2 text-zinc-600 text-[8px] font-black uppercase tracking-widest">Amount</span>
              <input 
                type="number" 
                value={amount}
                placeholder="0.00"
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 pt-6 text-xs focus:outline-none focus:border-zinc-600 transition-all font-mono text-white"
              />
              <span className="absolute right-3 bottom-2 text-zinc-500 text-[9px] font-bold uppercase">BTC</span>
            </div>
            
            <div className="flex justify-between text-[9px] font-bold uppercase px-1 tracking-tight text-zinc-500">
              <span>Avail: <span className="text-zinc-300">{side === 'buy' ? `${usdtBalance.toLocaleString()} USDT` : `${btcBalance.toFixed(4)} BTC`}</span></span>
              <div className="flex gap-2">
                 {[25, 50, 75, 100].map(pct => (
                   <button key={pct} onClick={() => setAmount(side === 'buy' ? ((usdtBalance * (pct/100)) / livePrice).toFixed(4) : (btcBalance * (pct/100)).toFixed(4))} className="hover:text-white transition-colors">{pct}%</button>
                 ))}
              </div>
            </div>

            <button 
              onClick={handleTrade}
              className={`w-full py-3.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all transform active:scale-[0.98] shadow-xl mt-2 ${
                side === 'buy' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
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
