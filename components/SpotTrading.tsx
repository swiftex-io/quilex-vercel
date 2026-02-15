import React, { useState, useEffect, useRef, useMemo } from 'react';
import OrderBook from './OrderBook';
import TradeChart from './TradeChart';
import { useExchangeStore } from '../store';

const SpotTrading: React.FC = () => {
  const [orderType, setOrderType] = useState<'limit' | 'market' | 'tpsl'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [percent, setPercent] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [isPairSelectorOpen, setIsPairSelectorOpen] = useState(false);
  const [pairSearchQuery, setPairSearchQuery] = useState('');
  const [historyTab, setHistoryTab] = useState<'open' | 'history'>('open');
  const [openOrdersSubTab, setOpenOrdersSubTab] = useState<'limit_market' | 'tpsl'>('limit_market');
  
  // TP/SL States
  const [showTPSL, setShowTPSL] = useState(false);
  const [tpInput, setTpInput] = useState('');
  const [slInput, setSlInput] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [tpslExecutionType, setTpslExecutionType] = useState<'market' | 'limit'>('market');
  const [isTpslTypeDropdownOpen, setIsTpslTypeDropdownOpen] = useState(false);
  
  const pairSelectorRef = useRef<HTMLDivElement>(null);
  const tpslTypeRef = useRef<HTMLDivElement>(null);

  const { balances, placeOrder, tradeHistory, openOrders, cancelOrder, activePair, setActivePair } = useExchangeStore();
  
  const [activeBase, activeQuote] = activePair.split('/');
  
  const baseAsset = balances.find(b => b.symbol === activeBase);
  const quoteAsset = balances.find(b => b.symbol === activeQuote);
  
  const livePrice = baseAsset?.price || 0;
  const priceChange = baseAsset?.change24h || 0;
  const absChange = (livePrice * (priceChange / 100));

  const [priceInput, setPriceInput] = useState(livePrice.toFixed(2));

  const quoteBalance = quoteAsset?.available || 0;
  const baseBalance = baseAsset?.available || 0;

  useEffect(() => {
    if (orderType === 'limit' || (orderType === 'tpsl' && tpslExecutionType === 'limit')) {
      setPriceInput(livePrice.toFixed(2));
    }
  }, [activePair, orderType, tpslExecutionType]);

  useEffect(() => {
    setAmount('');
    setTotal('');
    setPercent(0);
    setTpInput('');
    setSlInput('');
    setTriggerPrice('');
    if (orderType === 'tpsl') {
      setShowTPSL(false);
    }
  }, [side, orderType, activePair]);

  const handlePriceChange = (val: string) => {
    setPriceInput(val);
    const p = parseFloat(val);
    const a = parseFloat(amount);
    if (!isNaN(p) && !isNaN(a)) {
      setTotal((p * a).toFixed(2));
    }
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const effectivePrice = (orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market')) ? livePrice : parseFloat(priceInput);
    const a = parseFloat(val);
    if (!isNaN(effectivePrice) && !isNaN(a)) {
      setTotal((effectivePrice * a).toFixed(2));
      const max = side === 'buy' ? (effectivePrice > 0 ? quoteBalance / effectivePrice : 0) : baseBalance;
      setPercent(max > 0 ? Math.min(100, Math.round((a / max) * 100)) : 0);
    } else if (val === '') {
      setTotal('');
      setPercent(0);
    }
  };

  const handleTotalChange = (val: string) => {
    setTotal(val);
    const effectivePrice = (orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market')) ? livePrice : parseFloat(priceInput);
    const t = parseFloat(val);
    if (!isNaN(effectivePrice) && !isNaN(t) && effectivePrice > 0) {
      const calculatedAmount = (t / effectivePrice).toFixed(6);
      setAmount(calculatedAmount);
      const maxTotal = side === 'buy' ? quoteBalance : (baseBalance * effectivePrice);
      setPercent(maxTotal > 0 ? Math.min(100, Math.round((t / maxTotal) * 100)) : 0);
    } else if (val === '') {
      setAmount('');
      setPercent(0);
    }
  };

  const handlePercentChange = (p: number) => {
    setPercent(p);
    const price = (orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market')) ? livePrice : parseFloat(priceInput);
    if (side === 'buy') {
      const buyableTotal = quoteBalance * (p / 100);
      setTotal(buyableTotal.toFixed(2));
      setAmount(price > 0 ? (buyableTotal / price).toFixed(6) : '0');
    } else {
      const sellableAmount = baseBalance * (p / 100);
      setAmount(sellableAmount.toFixed(6));
      setTotal((sellableAmount * price).toFixed(2));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pairSelectorRef.current && !pairSelectorRef.current.contains(event.target as Node)) {
        setIsPairSelectorOpen(false);
      }
      if (tpslTypeRef.current && !tpslTypeRef.current.contains(event.target as Node)) {
        setIsTpslTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTrade = async () => {
    const isMarketExecution = orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market');
    const numPrice = isMarketExecution ? livePrice : parseFloat(priceInput);
    const numAmount = parseFloat(amount);
    if (isNaN(numPrice) || numAmount <= 0) return;

    const tpValue = showTPSL && tpInput ? parseFloat(tpInput) : undefined;
    const slValue = (orderType === 'tpsl' && triggerPrice) ? parseFloat(triggerPrice) : (showTPSL && slInput ? parseFloat(slInput) : undefined);

    const success = await placeOrder({
      symbol: activePair,
      side,
      price: numPrice,
      amount: numAmount,
      type: orderType,
      tpPrice: tpValue,
      slPrice: slValue
    });

    if (success) {
      setAmount('');
      setTotal('');
      setPercent(0);
      setTpInput('');
      setSlInput('');
      setTriggerPrice('');
      setShowTPSL(false);
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

  const selectPair = (symbol: string) => {
    setActivePair(`${symbol}/USDT`);
    setIsPairSelectorOpen(false);
  };

  const filteredOpenOrders = useMemo(() => {
    if (openOrdersSubTab === 'limit_market') {
      return openOrders.filter(o => o.symbol === activePair && (o.type === 'limit' || o.type === 'market'));
    }
    return openOrders.filter(o => o.symbol === activePair && o.type === 'tpsl');
  }, [openOrders, openOrdersSubTab, activePair]);

  const subTabCounts = {
    limit_market: openOrders.filter(o => o.symbol === activePair && (o.type === 'limit' || o.type === 'market')).length,
    tpsl: openOrders.filter(o => o.symbol === activePair && o.type === 'tpsl').length
  };

  return (
    <div className="flex h-[calc(100vh-64px-32px)] bg-black overflow-hidden border-t border-zinc-900">
      
      {/* Left Sidebar - Trading Pairs */}
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

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
          <div className="grid grid-cols-12 px-3 py-2 text-[10px] text-zinc-500 font-normal border-b border-zinc-900/30 sticky top-0 bg-[#0a0a0a] z-10">
            <div className="col-span-7">Pair</div>
            <div className="col-span-5 text-right">Price</div>
          </div>
          {availablePairs.map((asset) => (
            <div 
              key={asset.symbol} 
              onClick={() => selectPair(asset.symbol)}
              className={`grid grid-cols-12 items-center px-3 py-2.5 hover:bg-zinc-900/50 transition-all cursor-pointer group ${asset.symbol === activeBase ? 'bg-zinc-900/60 border-l-2 border-white' : ''}`}
            >
              <div className="col-span-7 flex items-center gap-2">
                <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} alt={asset.symbol} className="w-4 h-4 rounded-full object-cover shrink-0" />
                <div className="flex flex-col min-0">
                  <span className="text-[12px] font-normal text-zinc-200 group-hover:text-white truncate">
                    {asset.symbol}<span className="text-zinc-500">/USDT</span>
                  </span>
                  <span className={`text-[10px] font-normal ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="col-span-5 text-right">
                <span className="text-[11px] font-medium text-zinc-300 block truncate">
                  {asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.price < 1 ? 4 : 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-0 h-full overflow-hidden border-r border-zinc-900">
        
        {/* Ticker Header */}
        <div className="h-[60px] border-b border-zinc-900 flex items-center px-4 gap-8 bg-black shrink-0 relative z-50">
          <div className="flex items-center gap-3 relative" ref={pairSelectorRef}>
            <div 
              className="flex items-center gap-2 cursor-pointer group select-none" 
              onClick={() => setIsPairSelectorOpen(!isPairSelectorOpen)}
            >
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                <img src={`https://assets.coincap.io/assets/icons/${activeBase.toLowerCase()}@2x.png`} alt={activeBase} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-normal tracking-tight">{activePair}</span>
                <svg 
                  className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 ${isPairSelectorOpen ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>

            <div className={`absolute top-full left-0 mt-2 w-80 bg-[#0d0d0d] border border-zinc-800 rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] z-[100] overflow-hidden dropdown-container ${isPairSelectorOpen ? 'is-visible' : ''}`}>
              <div className="p-3 border-b border-zinc-800 bg-black/40">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search pairs" 
                    value={pairSearchQuery}
                    autoFocus={isPairSelectorOpen}
                    onChange={(e) => setPairSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-[11px] font-normal focus:border-zinc-500 outline-none transition-all placeholder:text-zinc-600 text-white" 
                  />
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-12 px-4 py-2 text-[10px] text-zinc-500 font-normal border-b border-zinc-900/30 sticky top-0 bg-[#0d0d0d] z-10">
                  <div className="col-span-7">Pair</div>
                  <div className="col-span-5 text-right">Price</div>
                </div>
                {availablePairs.map((asset) => (
                  <div 
                    key={asset.symbol} 
                    onClick={() => selectPair(asset.symbol)}
                    className={`grid grid-cols-12 items-center px-4 py-3 hover:bg-zinc-800 transition-all cursor-pointer group ${asset.symbol === activeBase ? 'bg-zinc-900/30 border-l-2 border-white' : ''}`}
                  >
                    <div className="col-span-7 flex items-center gap-3">
                      <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} alt={asset.symbol} className="w-5 h-5 rounded-full object-cover shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-bold text-zinc-200 group-hover:text-white truncate">
                          {asset.symbol}<span className="text-zinc-500">/USDT</span>
                        </span>
                        <span className={`text-[10px] font-normal ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                          {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="col-span-5 text-right">
                      <span className="text-[12px] font-bold text-zinc-300 block truncate">
                        {asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.price < 1 ? 4 : 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className={`text-lg font-medium tabular-nums leading-none ${priceChange >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{livePrice.toLocaleString(undefined, { minimumFractionDigits: livePrice < 1 ? 4 : 1 })}</span>
            <span className={`text-[11px] font-normal tabular-nums leading-none mt-0.5 ${priceChange >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{priceChange >= 0 ? '+' : ''}{absChange.toLocaleString(undefined, { minimumFractionDigits: livePrice < 1 ? 4 : 1 })} ({priceChange.toFixed(2)}%)</span>
          </div>
          
          <div className="hidden xl:flex items-center gap-8">
            {[
              { label: '24h low', val: (livePrice * 0.95).toLocaleString(undefined, { maximumFractionDigits: 1 }) },
              { label: '24h high', val: (livePrice * 1.05).toLocaleString(undefined, { maximumFractionDigits: 1 }) },
              { label: '24h volume', val: '1.94K' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-normal">{item.label}</span>
                <span className="text-[12px] font-medium text-zinc-300 tracking-tight">{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[60%] bg-black overflow-hidden relative border-b border-zinc-900 shrink-0">
          <TradeChart />
        </div>
        
        {/* History Panel */}
        <div className="flex-1 bg-black flex flex-col min-h-0">
          <div className="flex border-b border-zinc-900 shrink-0">
            {[
              { id: 'open', label: `Open orders (${openOrders.filter(o => o.symbol === activePair).length})` },
              { id: 'history', label: 'Order history' }
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setHistoryTab(tab.id as any)}
                className={`px-4 py-2.5 text-[12px] font-normal transition-all ${historyTab === tab.id ? 'border-b-2 border-white text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {historyTab === 'open' ? (
              <div className="flex flex-col h-full">
                {/* Submenu for Open Orders */}
                <div className="flex gap-1 p-2 border-b border-zinc-900/50 bg-zinc-950/20 shrink-0">
                  <button 
                    onClick={() => setOpenOrdersSubTab('limit_market')}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-medium transition-all ${openOrdersSubTab === 'limit_market' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
                  >
                    <span>Limit | Market</span>
                    {subTabCounts.limit_market > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${openOrdersSubTab === 'limit_market' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-600'}`}>
                        {subTabCounts.limit_market}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => setOpenOrdersSubTab('tpsl')}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-medium transition-all ${openOrdersSubTab === 'tpsl' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
                  >
                    <span>TP/SL</span>
                    {subTabCounts.tpsl > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${openOrdersSubTab === 'tpsl' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-600'}`}>
                        {subTabCounts.tpsl}
                      </span>
                    )}
                  </button>
                </div>

                <table className="w-full text-[11px] text-left border-separate border-spacing-0">
                  <thead className="sticky top-0 bg-zinc-950 text-zinc-500 font-normal border-b border-zinc-900 z-10">
                    <tr>
                      <th className="px-4 py-2 font-normal">Pair / Type</th>
                      <th className="px-4 py-2 font-normal">Side</th>
                      <th className="px-4 py-2 font-normal">Price</th>
                      <th className="px-4 py-2 font-normal">Amount</th>
                      <th className="px-4 py-2 font-normal">Filled</th>
                      <th className="px-4 py-2 text-right font-normal">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOpenOrders.length > 0 ? filteredOpenOrders.map((o) => (
                      <tr key={o.id} className="border-b border-zinc-900/30 hover:bg-zinc-900/20 transition-all">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{o.symbol}</span>
                            <span className="text-zinc-600 text-[9px] uppercase">{o.type === 'tpsl' ? 'Trigger' : o.type}</span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 font-bold ${o.side === 'buy' ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{o.side === 'buy' ? 'Buy' : 'Sell'}</td>
                        <td className="px-4 py-3 text-zinc-300 font-medium">{o.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-zinc-300 font-medium">{o.amount}</td>
                        <td className="px-4 py-3">
                           <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                             <div className="h-full bg-[#00d18e]" style={{ width: `${(o.filled / o.amount) * 100}%` }}></div>
                           </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => cancelOrder(o.id)}
                            className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest">No active {openOrdersSubTab === 'limit_market' ? 'Limit | Market' : 'TP/SL'} orders for {activePair}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
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
                  {tradeHistory.filter(t => t.pair === activePair).map((t) => (
                    <tr key={t.id} className="border-b border-zinc-900/30">
                      <td className="px-4 py-1.5 text-zinc-500 font-medium">{t.time}</td>
                      <td className={`px-4 py-1.5 font-normal ${t.type === 'buy' ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{t.type === 'buy' ? 'Buy' : 'Sell'}</td>
                      <td className="px-4 py-1.5 text-zinc-300 font-medium">{t.price.toLocaleString()}</td>
                      <td className="px-4 py-1.5 text-right text-zinc-500 font-medium">{t.amount}</td>
                    </tr>
                  ))}
                  {tradeHistory.filter(t => t.pair === activePair).length === 0 && (
                     <tr>
                       <td colSpan={4} className="px-4 py-10 text-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest">No order history for {activePair}</td>
                     </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Right Column Group (Orderbook & Trade) - Responsive 2-column on 1440px+ */}
      <div className="flex shrink-0 h-full overflow-y-auto min-[1440px]:overflow-hidden bg-[#0a0a0a] border-l border-zinc-900 w-[300px] min-[1440px]:w-[640px] flex-col min-[1440px]:flex-row transition-all duration-300">
        
        {/* Sub-Column 1: Order Book */}
        <div className="w-full min-[1440px]:w-1/2 flex flex-col h-auto min-[1440px]:h-full border-r border-zinc-900/50 shrink-0">
          <div className="flex-1 min-[1440px]:h-full h-[480px] overflow-hidden">
             <OrderBook currentPrice={livePrice} />
          </div>
        </div>

        {/* Sub-Column 2: Order Entry Section */}
        <div className="w-full min-[1440px]:w-1/2 flex flex-col h-fit min-[1440px]:h-full bg-black min-h-0">
          {/* Static Header Part of Order Entry */}
          <div className="p-3 pb-0 shrink-0">
            <div className="flex gap-1 p-0.5 bg-zinc-900/50 rounded-lg mb-2">
              <button onClick={() => setSide('buy')} className={`flex-1 py-1 rounded-md text-[12px] font-bold transition-all ${side === 'buy' ? 'bg-[#00d18e] text-black shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}>Buy</button>
              <button onClick={() => setSide('sell')} className={`flex-1 py-1 rounded-md text-[12px] font-bold transition-all ${side === 'sell' ? 'bg-[#ff4d4f] text-white shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}>Sell</button>
            </div>

            <div className="flex gap-4 mb-2 border-b border-zinc-900">
              {['Limit', 'Market', 'TP/SL'].map(t => (
                <button key={t} onClick={() => setOrderType(t.toLowerCase() === 'tp/sl' ? 'tpsl' : t.toLowerCase() as any)} className={`text-[12px] font-normal pb-1 transition-all ${orderType === (t.toLowerCase() === 'tp/sl' ? 'tpsl' : t.toLowerCase()) ? 'text-white border-b-2 border-white' : 'text-zinc-500'}`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Middle Part: Fields and Slider - Scrollable on 1440px+ screens, auto height on smaller */}
          <div className="h-auto min-[1440px]:flex-1 min-[1440px]:overflow-y-auto custom-scrollbar px-3 space-y-1.5 pt-1.5 pb-12">
            {/* Conditional Trigger Price Field for TP/SL tab */}
            {orderType === 'tpsl' && (
              <div className="flex items-center border border-zinc-800 bg-[#111] rounded-lg px-3 h-10 focus-within:border-zinc-500 transition-all">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest min-w-[50px] shrink-0">Trigger</span>
                <input 
                  type="number" 
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
                  placeholder="Price"
                  className="flex-1 bg-transparent border-none outline-none text-right text-[12px] font-medium text-white pr-2 placeholder:text-zinc-700" 
                />
                <span className="text-[10px] font-bold text-zinc-600 shrink-0 uppercase">{activeQuote}</span>
              </div>
            )}

            {/* Price/Order Field */}
            <div className="flex items-center border rounded-lg px-3 h-10 group transition-all relative bg-[#111] border-zinc-800 focus-within:border-zinc-400">
              {orderType === 'tpsl' ? (
                <div className="relative shrink-0 flex items-center" ref={tpslTypeRef}>
                  <button 
                    onClick={() => setIsTpslTypeDropdownOpen(!isTpslTypeDropdownOpen)}
                    className="text-[9px] font-black text-zinc-500 uppercase tracking-widest min-w-[50px] flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
                  >
                    {tpslExecutionType} 
                    <svg className={`w-2.5 h-2.5 text-zinc-600 transition-transform ${isTpslTypeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {isTpslTypeDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-28 bg-[#1a1a1a] border border-zinc-800 rounded-lg shadow-2xl z-[110] py-1">
                      {(['market', 'limit'] as const).map(type => (
                        <button 
                          key={type}
                          onClick={() => { setTpslExecutionType(type); setIsTpslTypeDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors ${tpslExecutionType === type ? 'text-white bg-zinc-800' : 'text-zinc-500'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest min-w-[50px] shrink-0">Price</span>
              )}

              <input 
                type="text" 
                value={(orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market')) ? 'Market' : priceInput} 
                onChange={(e) => handlePriceChange(e.target.value)} 
                disabled={orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market')} 
                className="flex-1 bg-transparent border-none outline-none text-right text-[12px] font-medium text-white pr-2 placeholder:text-zinc-700 disabled:text-zinc-500" 
              />
              <span className="text-[10px] font-bold text-zinc-600 shrink-0 uppercase">{activeQuote}</span>
            </div>

            {/* Amount Field - Only visible for Limit and TP/SL execution */}
            {orderType !== 'market' && (
              <div className="flex items-center border rounded-lg px-3 h-10 group transition-all bg-[#111] border-zinc-800 focus-within:border-zinc-400">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest min-w-[50px] shrink-0">Amount</span>
                <input 
                  type="number" 
                  value={amount} 
                  placeholder="0.00"
                  onChange={(e) => handleAmountChange(e.target.value)} 
                  className="flex-1 bg-transparent border-none outline-none text-right text-[12px] font-medium text-white pr-2 placeholder:text-zinc-700" 
                />
                <span className="text-[10px] font-bold text-zinc-600 shrink-0 uppercase">{activeBase}</span>
              </div>
            )}

            {/* Investment Slider */}
            <div 
              className="px-1 py-1 relative group/slider"
              onMouseEnter={() => setIsSliderHovered(true)}
              onMouseLeave={() => setIsSliderHovered(false)}
            >
              <div className="relative h-6 flex items-center">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -translate-y-1/2 rounded-full overflow-hidden">
                   <div 
                    className={`h-full transition-all ${side === 'buy' ? 'bg-[#00d18e]' : 'bg-[#ff4d4f]'}`} 
                    style={{ width: `${percent}%` }}
                   />
                </div>
                <div className="absolute top-1/2 left-0 right-0 flex justify-between -translate-y-1/2 pointer-events-none px-[1px]">
                  {[0, 25, 50, 75, 100].map(p => (
                    <div key={p} className={`w-1.5 h-1.5 rounded-full border border-zinc-900 transition-colors ${percent >= p ? (side === 'buy' ? 'bg-[#00d18e]' : 'bg-[#ff4d4f]') : 'bg-zinc-700'}`} />
                  ))}
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1"
                  value={percent}
                  onChange={(e) => handlePercentChange(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer z-10 opacity-0"
                />
                <div 
                  className={`absolute -top-6 -translate-x-1/2 pointer-events-none transition-all duration-150 flex flex-col items-center ${isSliderHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  style={{ left: `${percent}%` }}
                >
                  <div className="bg-white text-black text-[10px] font-black px-1.5 py-0.5 rounded shadow-xl leading-none">
                    {percent}%
                  </div>
                  <div className="w-1.5 h-1.5 bg-white rotate-45 -mt-1 shadow-xl"></div>
                </div>
                <div 
                  className={`absolute top-1/2 w-3.5 h-3.5 rounded-full shadow-lg border-2 border-zinc-900 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all bg-white`}
                  style={{ left: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-bold text-zinc-600 px-0.5 uppercase tracking-tighter -mt-1 select-none">
                <span className="w-4 text-left">0%</span>
                <span className="w-6 text-center text-zinc-700">25%</span>
                <span className="w-6 text-center text-zinc-700">50%</span>
                <span className="w-6 text-center text-zinc-700">75%</span>
                <span className="w-6 text-right">100%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-1">
               {[25, 50, 75, 100].map(pct => (
                 <button 
                  key={pct} 
                  onClick={() => handlePercentChange(pct)} 
                  className={`py-0.5 bg-zinc-800/80 rounded text-[10px] font-bold transition-all ${percent === pct ? 'bg-zinc-600 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-700/50'}`}
                 >
                  {pct}%
                 </button>
               ))}
            </div>

            {/* Total Field */}
            <div className={`flex items-center border rounded-lg px-3 h-10 group transition-all bg-[#111] border-zinc-800 focus-within:border-zinc-400`}>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest min-w-[50px] shrink-0">Total</span>
              <input 
                type="number" 
                value={total} 
                placeholder="0.00"
                onChange={(e) => handleTotalChange(e.target.value)} 
                className="flex-1 bg-transparent border-none outline-none text-right text-[12px] font-medium text-white pr-2 placeholder:text-zinc-700" 
              />
              <span className="text-[10px] font-bold text-zinc-600 shrink-0 uppercase">{activeQuote}</span>
            </div>

            {/* TP/SL Inner Toggle Section (Only for Limit/Market) */}
            {orderType !== 'tpsl' && (
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer group w-fit select-none">
                  <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${showTPSL ? 'bg-white border-white' : 'border-zinc-700 group-hover:border-zinc-500'}`}>
                    {showTPSL && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m5 13 4 4L19 7"/></svg>}
                    <input type="checkbox" className="hidden" checked={showTPSL} onChange={() => setShowTPSL(!showTPSL)} />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors uppercase tracking-tight">TP/SL</span>
                </label>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showTPSL ? 'max-h-32 opacity-100 mt-2 space-y-1.5' : 'max-h-0 opacity-0'}`}>
                  {/* Take Profit Input */}
                  <div className="flex items-center border border-zinc-800 bg-[#111] rounded-lg px-3 h-9 focus-within:border-zinc-500 transition-all">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest min-w-[50px] shrink-0">TP Price</span>
                    <input 
                      type="number" 
                      value={tpInput}
                      onChange={(e) => setTpInput(e.target.value)}
                      placeholder="Take Profit"
                      className="flex-1 bg-transparent border-none outline-none text-right text-[11px] font-medium text-white pr-2 placeholder:text-zinc-700" 
                    />
                    <span className="text-[9px] font-bold text-zinc-600 shrink-0 uppercase">{activeQuote}</span>
                  </div>
                  {/* Stop Loss Input */}
                  <div className="flex items-center border border-zinc-800 bg-[#111] rounded-lg px-3 h-9 focus-within:border-zinc-500 transition-all">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest min-w-[50px] shrink-0">SL Price</span>
                    <input 
                      type="number" 
                      value={slInput}
                      onChange={(e) => setSlInput(e.target.value)}
                      placeholder="Stop Loss"
                      className="flex-1 bg-transparent border-none outline-none text-right text-[11px] font-medium text-white pr-2 placeholder:text-zinc-700" 
                    />
                    <span className="text-[9px] font-bold text-zinc-600 shrink-0 uppercase">{activeQuote}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer Actions Area: Locked at the bottom of the trade column */}
          <div className="mt-auto pt-4 p-3 border-t border-zinc-900/50 bg-black shrink-0">
            <div className="flex justify-between items-center text-[10px] font-normal text-zinc-500 px-0.5 mb-2">
              <span>Available</span>
              <span className="text-zinc-400 font-medium tabular-nums tracking-tighter">{side === 'buy' ? `${quoteBalance.toLocaleString()} ${activeQuote}` : `${baseBalance.toFixed(4)} ${activeBase}`}</span>
            </div>

            <button 
              onClick={handleTrade}
              className={`w-full py-2.5 rounded-xl font-bold text-[13px] transition-all active:scale-[0.98] shadow-2xl ${
                side === 'buy' ? 'bg-[#00d18e] hover:bg-[#00e099] text-black' : 'bg-[#ff4d4f] hover:bg-[#ff5c5e] text-white'
              }`}
            >
              {side === 'buy' ? 'Buy' : 'Sell'} {activeBase}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotTrading;