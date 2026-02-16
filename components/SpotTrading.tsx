
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
  const [historyTab, setHistoryTab] = useState<'open' | 'history' | 'assets' | 'bots'>('open');
  const [openOrdersSubTab, setOpenOrdersSubTab] = useState<'limit_market' | 'tpsl'>('limit_market');
  const [sidebarTab, setSidebarTab] = useState<'All' | 'Favorites' | 'Meme' | 'L1' | 'AI'>('All');
  
  // Assets Tab States
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  
  // TP/SL States
  const [showTPSL, setShowTPSL] = useState(false);
  const [tpInput, setTpInput] = useState('');
  const [slInput, setSlInput] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [tpslExecutionType, setTpslExecutionType] = useState<'market' | 'limit'>('market');
  const [isTpslTypeDropdownOpen, setIsTpslTypeDropdownOpen] = useState(false);
  
  const pairSelectorRef = useRef<HTMLDivElement>(null);
  const tpslTypeRef = useRef<HTMLDivElement>(null);

  const { balances, placeOrder, tradeHistory, openOrders, cancelOrder, activePair, setActivePair, favorites, toggleFavorite, user, setDepositModalOpen } = useExchangeStore();
  
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
    if (orderType !== 'limit') {
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

    const tpValue = (orderType === 'limit' && showTPSL && tpInput) ? parseFloat(tpInput) : undefined;
    const slValue = (orderType === 'tpsl' && triggerPrice) ? parseFloat(triggerPrice) : (orderType === 'limit' && showTPSL && slInput ? parseFloat(slInput) : undefined);

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
    let list = balances
      .filter(b => b.symbol !== 'USDT')
      .filter(b => 
        b.symbol.toLowerCase().includes(pairSearchQuery.toLowerCase()) || 
        b.name.toLowerCase().includes(pairSearchQuery.toLowerCase())
      );
    
    if (sidebarTab === 'Favorites') {
      list = list.filter(b => favorites.includes(b.symbol));
    } else if (sidebarTab === 'Meme') {
      list = list.filter(b => ['DOGE', 'SHIB', 'PEPE'].includes(b.symbol));
    } else if (sidebarTab === 'L1') {
      list = list.filter(b => ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'AVAX', 'DOT'].includes(b.symbol));
    } else if (sidebarTab === 'AI') {
      list = list.filter(b => ['NEAR', 'ICP', 'RNDR'].includes(b.symbol));
    }

    return list;
  }, [balances, pairSearchQuery, sidebarTab, favorites]);

  const filteredTerminalAssets = useMemo(() => {
    let list = balances.filter(b => b.balance > 0 && 
      (b.symbol.toLowerCase().includes(assetSearchQuery.toLowerCase()) || 
       b.name.toLowerCase().includes(assetSearchQuery.toLowerCase()))
    );
    return list.sort((a, b) => (b.balance * b.price) - (a.balance * a.price));
  }, [balances, assetSearchQuery]);

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

  const StarIcon = ({ filled, className }: { filled: boolean, className?: string }) => (
    <svg 
      width="15" 
      height="15" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={`transition-all duration-300 ${className || ''} ${filled ? 'text-[#F1F22D]' : 'text-zinc-600 group-hover:text-zinc-400'}`}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );

  const AuthCTA = ({ feature }: { feature: string }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <h4 className="text-sm font-bold text-white mb-2 tracking-tight">Log in or sign up to view your {feature}</h4>
      <div className="flex gap-3 mt-4">
        <button className="px-6 py-2 bg-white text-black font-black rounded-full text-[11px] transition-all hover:bg-zinc-200">Log In</button>
        <button className="px-6 py-2 bg-zinc-800 text-white font-black rounded-full text-[11px] transition-all hover:bg-zinc-700">Sign Up</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px-32px)] bg-black overflow-hidden border-t border-zinc-900">
      
      {/* Left Sidebar */}
      <div className="hidden xl:flex w-[260px] flex-col border-r border-zinc-900 bg-[#0a0a0a] shrink-0 h-full overflow-hidden">
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
        
        <div className="flex px-2 pt-1 gap-0.5 border-b border-zinc-900 bg-black/20 overflow-x-auto no-scrollbar">
          {['All', 'Favorites', 'Meme', 'L1', 'AI'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSidebarTab(cat as any)}
              className={`px-3 py-1.5 text-[11px] font-normal rounded-t-lg transition-all whitespace-nowrap ${sidebarTab === cat ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {cat === 'Favorites' ? (
                <div className="flex items-center gap-1">
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-[#F1F22D]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                   Favorites
                </div>
              ) : cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
          <div className="grid grid-cols-12 px-3 py-2 text-[10px] text-zinc-500 font-bold uppercase tracking-tight border-b border-zinc-900/30 sticky top-0 bg-[#0a0a0a] z-10">
            <div className="col-span-6">Pair / Name</div>
            <div className="col-span-4 text-right">Price / 24h</div>
            <div className="col-span-2 text-right"></div>
          </div>
          {availablePairs.map((asset) => (
            <div 
              key={asset.symbol} 
              onClick={() => selectPair(asset.symbol)}
              className={`grid grid-cols-12 items-center px-3 py-2.5 hover:bg-zinc-900/50 transition-all cursor-pointer group ${asset.symbol === activeBase ? 'bg-zinc-900/60 border-l-2 border-white' : ''}`}
            >
              <div className="col-span-6 flex items-center gap-2 overflow-hidden">
                <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} alt={asset.symbol} className="w-4 h-4 rounded-full object-cover shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-bold text-zinc-200 group-hover:text-white truncate">
                    {asset.symbol}<span className="text-zinc-500 font-medium">/USDT</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate font-medium">
                    {asset.name}
                  </span>
                </div>
              </div>
              <div className="col-span-4 text-right overflow-hidden flex flex-col">
                <span className="text-[12px] font-bold text-zinc-200 tabular-nums truncate">
                  {asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.price < 1 ? 4 : 2 })}
                </span>
                <span className={`text-[10px] font-bold tabular-nums ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </span>
              </div>
              <div className="col-span-2 text-right">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(asset.symbol); }}
                  className="group/fav p-1 rounded-md hover:bg-zinc-800 transition-all active:scale-125"
                >
                  <StarIcon filled={favorites.includes(asset.symbol)} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-0 h-full overflow-hidden border-r border-zinc-900">
        
        {/* Detailed Ticker Header */}
        <div className="h-[60px] border-b border-zinc-900 flex items-center px-4 gap-7 bg-black shrink-0 relative z-50">
          <div className="flex items-center gap-3 shrink-0 relative" ref={pairSelectorRef}>
            <div 
              className="flex items-center gap-2 cursor-pointer group select-none" 
              onClick={() => setIsPairSelectorOpen(!isPairSelectorOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                <img src={`https://assets.coincap.io/assets/icons/${activeBase.toLowerCase()}@2x.png`} alt={activeBase} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-black tracking-tight uppercase">{activePair}</span>
                <svg 
                  className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 ${isPairSelectorOpen ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
            {/* Star Icon in Circular Container */}
            <button 
              onClick={() => toggleFavorite(activeBase)}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-all active:scale-95 group/fav"
            >
              <StarIcon filled={favorites.includes(activeBase)} className="transform active:scale-125" />
            </button>

            {/* Pair Selector Dropdown */}
            <div className={`absolute top-full left-0 mt-2 dropdown-container ${isPairSelectorOpen ? 'is-visible' : ''}`}>
              <div className="bg-[#111] border border-zinc-800 rounded-2xl w-[340px] shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[500px]">
                <div className="p-4">
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search pairs" 
                      value={pairSearchQuery}
                      onChange={(e) => setPairSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-[13px] font-medium focus:border-zinc-500 outline-none transition-all placeholder:text-zinc-600 text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 px-5 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/30">
                  <div className="col-span-8">Pair</div>
                  <div className="col-span-4 text-right">Price</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
                  {availablePairs.map((asset) => {
                    const isSelected = asset.symbol === activeBase;
                    return (
                      <div 
                        key={asset.symbol} 
                        onClick={() => selectPair(asset.symbol)}
                        className={`grid grid-cols-12 items-center px-5 py-3.5 hover:bg-zinc-800/50 transition-all cursor-pointer group relative ${isSelected ? 'bg-zinc-800/80' : ''}`}
                      >
                        {/* Active Indicator Bar */}
                        {isSelected && <div className="absolute left-0 top-1 bottom-1 w-1 bg-white rounded-r"></div>}
                        
                        <div className="col-span-8 flex items-center gap-3 overflow-hidden">
                          <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} alt={asset.symbol} className="w-6 h-6 rounded-full object-cover shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-white group-hover:text-blue-400 transition-colors">
                              {asset.symbol}<span className="text-zinc-500 font-medium">/USDT</span>
                            </span>
                            <span className={`text-[11px] font-bold ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                              {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="col-span-4 text-right flex flex-col items-end">
                          <span className="text-[13px] font-bold text-zinc-200 tabular-nums">
                            {asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.price < 1 ? 4 : 2 })}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(asset.symbol); }}
                            className="mt-1 p-1 rounded-md hover:bg-zinc-700 transition-all group/fav"
                          >
                            <StarIcon filled={favorites.includes(asset.symbol)} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center shrink-0">
            <span className={`text-[16px] font-black tabular-nums leading-none ${priceChange >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
              {livePrice.toLocaleString(undefined, { minimumFractionDigits: livePrice < 1 ? 4 : 2 })}
            </span>
            <span className={`text-[10px] font-bold tabular-nums leading-none mt-1 ${priceChange >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
              {priceChange >= 0 ? '+' : ''}{absChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })} ({priceChange.toFixed(2)}%)
            </span>
          </div>

          <div className="hidden min-[960px]:flex items-center gap-7 shrink-0">
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-600 font-bold uppercase tracking-tight mb-0.5">24h low</span>
              <span className="text-[12px] text-zinc-200 font-bold tabular-nums">{(livePrice * 0.95).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-600 font-bold uppercase tracking-tight mb-0.5">24h high</span>
              <span className="text-[12px] text-zinc-200 font-bold tabular-nums">{(livePrice * 1.05).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-600 font-bold uppercase tracking-tight mb-0.5">24h volume</span>
              <span className="text-[12px] text-zinc-200 font-bold tabular-nums">1.94K</span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[52%] bg-black overflow-hidden relative border-b border-zinc-900 shrink-0">
          <TradeChart />
        </div>
        
        {/* History Panel */}
        <div className="flex-1 bg-black flex flex-col min-h-0">
          <div className="flex border-b border-zinc-900 shrink-0 items-center justify-between pr-4">
            <div className="flex h-full">
              {[
                { id: 'open', label: `Open orders (${openOrders.filter(o => o.symbol === activePair).length})` },
                { id: 'history', label: 'Order history' },
                { id: 'assets', label: 'Assets' },
                { id: 'bots', label: 'Bots' }
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setHistoryTab(tab.id as any)}
                  className={`px-4 py-2.5 text-[12px] font-normal transition-all relative h-full flex items-center gap-1 ${historyTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {tab.label}
                  {tab.id === 'assets' && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-40"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                  )}
                  {historyTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
                </button>
              ))}
            </div>
            
            {historyTab === 'assets' && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
                <button className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-tight">Easy convert</button>
                <button onClick={() => setDepositModalOpen(true)} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] font-bold text-white hover:bg-zinc-800 transition-all uppercase tracking-tight">Deposit</button>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search" 
                    value={assetSearchQuery}
                    onChange={(e) => setAssetSearchQuery(e.target.value)}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-md py-1 pl-7 pr-3 text-[10px] font-normal focus:border-zinc-500 outline-none transition-all placeholder:text-zinc-600 text-white w-32" 
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {historyTab === 'open' ? (
              <div className="flex flex-col h-full">
                {!user ? (
                  <AuthCTA feature="orders" />
                ) : (
                  <>
                    <div className="flex gap-1 p-2 border-b border-zinc-900/50 bg-zinc-950/20 shrink-0">
                      <button onClick={() => setOpenOrdersSubTab('limit_market')} className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${openOrdersSubTab === 'limit_market' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-custom-400'}`}>Limit | Market</button>
                      <button onClick={() => setOpenOrdersSubTab('tpsl')} className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${openOrdersSubTab === 'tpsl' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-400'}`}>TP/SL</button>
                    </div>
                    <table className="w-full text-[11px] text-left border-separate border-spacing-0">
                      <thead className="sticky top-0 bg-zinc-950 text-zinc-500 font-normal border-b border-zinc-900 z-10">
                        <tr>
                          <th className="px-4 py-2">Pair / Type</th>
                          <th className="px-4 py-2">Side</th>
                          {openOrdersSubTab === 'tpsl' && <th className="px-4 py-2">Trigger condition</th>}
                          <th className="px-4 py-2">Price</th>
                          <th className="px-4 py-2">Amount</th>
                          <th className="px-4 py-2">Filled</th>
                          <th className="px-4 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOpenOrders.map((o) => (
                          <tr key={o.id} className="border-b border-zinc-900/30 hover:bg-zinc-900/20 transition-all">
                            <td className="px-4 py-3"><span className="font-bold text-white">{o.symbol}</span> <span className="text-zinc-600 text-[9px] uppercase">{o.type}</span></td>
                            <td className={`px-4 py-3 font-bold ${o.side === 'buy' ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{o.side.toUpperCase()}</td>
                            {openOrdersSubTab === 'tpsl' && (
                              <td className="px-4 py-3 text-zinc-400 font-medium whitespace-nowrap">
                                Last price {o.side === 'buy' ? '>=' : '<='} {o.slPrice?.toLocaleString()}
                              </td>
                            )}
                            <td className="px-4 py-3 text-zinc-300 font-medium">{o.price.toLocaleString()}</td>
                            <td className="px-4 py-3 text-zinc-300 font-medium">{o.amount}</td>
                            <td className="px-4 py-3">
                               <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-[#00d18e]" style={{ width: `${(o.filled / o.amount) * 100}%` }}></div>
                               </div>
                            </td>
                            <td className="px-4 py-3 text-right"><button onClick={() => cancelOrder(o.id)} className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase">Cancel</button></td>
                          </tr>
                        ))}
                        {filteredOpenOrders.length === 0 && (
                          <tr>
                            <td colSpan={openOrdersSubTab === 'tpsl' ? 7 : 6} className="py-20 text-center text-zinc-600 uppercase font-black text-[10px] tracking-widest opacity-20">No active orders</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            ) : historyTab === 'assets' ? (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                {!user ? (
                   <AuthCTA feature="assets" />
                ) : filteredTerminalAssets.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 text-zinc-600 text-center">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="mb-4 opacity-10">
                        <path d="M20 12V8H4V12M20 12V16H4V12M20 12H4M4 8C4 5.79086 5.79086 4 8 4H16C18.2091 4 20 5.79086 20 8M4 16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16" />
                      </svg>
                      <span className="text-[11px] font-black tracking-widest uppercase mb-6 opacity-30">No records found</span>
                      <button onClick={() => setDepositModalOpen(true)} className="px-8 py-2.5 bg-white text-black font-black rounded-full text-[12px] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all">Deposit Crypto</button>
                   </div>
                ) : (
                  <table className="w-full text-[11px] text-left border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-zinc-950 text-zinc-500 font-normal border-b border-zinc-900 z-10">
                      <tr>
                        <th className="px-4 py-3 font-normal">Assets</th>
                        <th className="px-4 py-3 font-normal">
                          <span className="border-b border-dotted border-zinc-800 inline-flex items-center gap-1 cursor-help">Equity <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 11l5 5 5-5M7 13l5 5 5-5"/></svg></span>
                        </th>
                        <th className="px-4 py-3 font-normal">
                          <span className="border-b border-dotted border-zinc-800 inline-flex items-center gap-1 cursor-help">Balance <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 11l5 5 5-5M7 13l5 5 5-5"/></svg></span>
                        </th>
                        <th className="px-4 py-3 font-normal">Frozen</th>
                        <th className="px-4 py-3 font-normal">
                          <span className="border-b border-dotted border-zinc-800 inline-flex items-center gap-1 cursor-help">Cost price</span>
                        </th>
                        <th className="px-4 py-3 font-normal">
                          <span className="border-b border-dotted border-zinc-800 inline-flex items-center gap-1 cursor-help">PnL <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 11l5 5 5-5M7 13l5 5 5-5"/></svg></span>
                        </th>
                        <th className="px-4 py-3 text-right font-normal pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTerminalAssets.map((asset) => {
                        const equity = asset.balance * asset.price;
                        const mockCostPrice = asset.price * (1 - (0.05 * (asset.symbol.charCodeAt(0) % 5) / 5)); 
                        const mockPnl = equity - (asset.balance * mockCostPrice);
                        const mockPnlPercent = ((asset.price - mockCostPrice) / mockCostPrice) * 100;
                        
                        return (
                          <tr key={asset.symbol} className="border-b border-zinc-900/30 hover:bg-zinc-900/20 transition-all group">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                                   <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} className="w-full h-full object-cover" alt="" />
                                </div>
                                <span className="font-black text-white uppercase">{asset.symbol}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 tabular-nums text-zinc-100 font-bold">
                              ${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-4 tabular-nums text-zinc-400 font-medium">
                              {asset.balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                            </td>
                            <td className="px-4 py-4 tabular-nums text-zinc-500 font-medium">
                              {(asset.balance - asset.available).toLocaleString(undefined, { minimumFractionDigits: 4 })}
                            </td>
                            <td className="px-4 py-4 tabular-nums text-zinc-500">
                              {mockCostPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-4">
                              <div className={`flex flex-col tabular-nums font-black ${mockPnl >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                                <span className="text-[12px]">{mockPnl >= 0 ? '+' : ''}{mockPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span className="text-[10px] opacity-70">{mockPnl >= 0 ? '+' : ''}{mockPnlPercent.toFixed(2)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right pr-4">
                               <div className="flex items-center justify-end gap-4">
                                 <button className="text-blue-400 hover:text-blue-300 font-black uppercase text-[10px] tracking-tight" onClick={() => setActivePair(`${asset.symbol}/USDT`)}>Trade</button>
                                 <button className="text-zinc-600 hover:text-zinc-300 font-black uppercase text-[10px] tracking-tight">TP/SL</button>
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            ) : historyTab === 'bots' ? (
              <div className="flex flex-col h-full">
                {!user ? (
                  <AuthCTA feature="bots" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-600 text-center animate-in fade-in duration-300">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="mb-4 opacity-10">
                      <path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2" /><path d="M15 13v2M9 13v2"/>
                    </svg>
                    <span className="text-[11px] font-black tracking-widest uppercase mb-6 opacity-30">No active bots found</span>
                    <button className="px-8 py-2.5 bg-zinc-900 text-white font-black rounded-full text-[12px] uppercase hover:bg-zinc-800 transition-all border border-white/5">Create Trading Bot</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {!user ? (
                  <AuthCTA feature="trade history" />
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
                          <td colSpan={4} className="py-20 text-center text-zinc-600 uppercase font-black text-[10px] tracking-widest opacity-20">No trade history</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column Group (Orderbook & Trade) */}
      <div className="flex shrink-0 h-full overflow-y-auto min-[1500px]:overflow-hidden bg-[#0a0a0a] border-l border-zinc-900 w-[300px] min-[1500px]:w-[640px] flex-col min-[1500px]:flex-row transition-all duration-300">
        
        <div className="w-full min-[1500px]:w-1/2 flex flex-col h-auto min-[1500px]:h-full border-r border-zinc-900/50 shrink-0">
          <div className="flex-1 min-[1500px]:h-full h-[480px] overflow-hidden">
             <OrderBook currentPrice={livePrice} />
          </div>
        </div>

        <div className="w-full min-[1500px]:w-1/2 flex flex-col h-fit min-[1500px]:h-full bg-black min-w-0">
          <div className="p-4 pb-0 shrink-0">
            <div className="flex gap-1 p-0.5 bg-zinc-900/50 rounded-lg mb-4">
              <button onClick={() => setSide('buy')} className={`flex-1 py-1.5 rounded-md text-[13px] font-bold transition-all ${side === 'buy' ? 'bg-[#00d18e] text-black shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}>Buy</button>
              <button onClick={() => setSide('sell')} className={`flex-1 py-1.5 rounded-md text-[13px] font-bold transition-all ${side === 'sell' ? 'bg-[#ff4d4f] text-white shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}>Sell</button>
            </div>

            <div className="flex gap-5 mb-2 border-b border-zinc-900">
              {['Limit', 'Market', 'TP/SL'].map(t => (
                <button key={t} onClick={() => setOrderType(t.toLowerCase() === 'tp/sl' ? 'tpsl' : t.toLowerCase() as any)} className={`text-[13px] font-medium pb-2 transition-all ${orderType === (t.toLowerCase() === 'tp/sl' ? 'tpsl' : t.toLowerCase()) ? 'text-white border-b-2 border-white' : 'text-zinc-500'}`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="h-auto min-[1500px]:flex-1 min-[1500px]:overflow-y-auto custom-scrollbar px-4 space-y-4 pt-4 pb-4">
            {orderType === 'tpsl' && (
              <div className="flex items-center border border-zinc-800 bg-[#111] rounded-xl px-3 h-12 focus-within:border-zinc-500 transition-all min-w-0">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest min-[1500px]:min-w-[60px] min-w-[50px] shrink-0">Trigger</span>
                <input 
                  type="number" 
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
                  placeholder="Price"
                  className="flex-1 bg-transparent border-none outline-none text-right text-[14px] font-medium text-white pr-2 placeholder:text-zinc-700 min-w-0" 
                />
                <span className="text-[11px] font-bold text-zinc-600 shrink-0 uppercase truncate max-w-[40px]">{activeQuote}</span>
              </div>
            )}

            <div className="flex items-center border rounded-xl px-3 h-12 group transition-all relative bg-[#111] border-zinc-800 focus-within:border-zinc-400 min-w-0">
              {orderType === 'tpsl' ? (
                /* DROPDOWN SELECTOR IN TP/SL MODE */
                <div className="relative h-full flex items-center" ref={tpslTypeRef}>
                  <div 
                    onClick={() => setIsTpslTypeDropdownOpen(!isTpslTypeDropdownOpen)}
                    className="flex items-center gap-1 cursor-pointer min-[1500px]:min-w-[70px] min-w-[60px] text-zinc-500 group-hover:text-zinc-300 transition-colors"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{tpslExecutionType}</span>
                    <svg className={`w-3 h-3 transition-transform ${isTpslTypeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                  
                  {isTpslTypeDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-zinc-200 text-black rounded-lg shadow-2xl py-1 z-50 w-24 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {['market', 'limit'].map((type) => (
                        <button 
                          key={type}
                          onClick={() => { setTpslExecutionType(type as any); setIsTpslTypeDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-300 transition-colors ${tpslExecutionType === type ? 'bg-zinc-400/30' : ''}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest min-[1500px]:min-w-[60px] min-w-[50px] shrink-0">Price</span>
              )}
              
              <input 
                type="text" 
                value={(orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market')) ? 'Market' : priceInput} 
                onChange={(e) => handlePriceChange(e.target.value)} 
                disabled={orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market')} 
                className="flex-1 bg-transparent border-none outline-none text-right text-[14px] font-medium text-white pr-2 placeholder:text-zinc-700 disabled:text-zinc-500 min-w-0" 
              />
              <span className="text-[11px] font-bold text-zinc-600 shrink-0 uppercase truncate max-w-[40px]">{activeQuote}</span>
            </div>

            <div className="flex items-center border rounded-xl px-3 h-12 group transition-all bg-[#111] border-zinc-800 focus-within:border-zinc-400 min-w-0">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest min-[1500px]:min-w-[60px] min-w-[50px] shrink-0">Amount</span>
              <input 
                type="number" 
                value={amount} 
                placeholder="0.00"
                onChange={(e) => handleAmountChange(e.target.value)} 
                className="flex-1 bg-transparent border-none outline-none text-right text-[14px] font-medium text-white pr-2 placeholder:text-zinc-700 min-w-0" 
              />
              <span className="text-[11px] font-bold text-zinc-600 shrink-0 uppercase truncate max-w-[40px]">{activeBase}</span>
            </div>

            {/* SLIDER UI */}
            <div className="px-1 py-1 relative group/slider">
              <div className="relative h-8 flex items-center">
                {/* Track Background */}
                <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-zinc-800 -translate-y-1/2 rounded-full overflow-hidden">
                   {/* Progress Fill */}
                   <div 
                    className={`h-full transition-all ${side === 'buy' ? 'bg-[#00d18e]' : 'bg-[#ff4d4f]'}`} 
                    style={{ width: `${percent}%` }}
                   />
                </div>
                
                {/* Anchor Dots */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between pointer-events-none px-0.5">
                  {[0, 25, 50, 75, 100].map((dot) => (
                    <div 
                      key={dot} 
                      className={`w-1.5 h-1.5 rounded-full border border-zinc-900 transition-colors ${percent >= dot ? 'bg-white' : 'bg-zinc-600'}`}
                    />
                  ))}
                </div>

                {/* Actual Input Range */}
                <input 
                  type="range" min="0" max="100" step="1" value={percent}
                  onChange={(e) => handlePercentChange(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer z-10 opacity-0"
                />

                {/* Visual Thumb */}
                <div 
                  className={`absolute top-1/2 w-4 h-4 rounded-full shadow-lg border-2 border-zinc-900 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all bg-white`} 
                  style={{ left: `${percent}%` }}
                />
              </div>
              
              {/* Percentage Labels */}
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 px-0.5 uppercase tracking-tight -mt-1 select-none">
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>

              {/* QUICK SELECT BUTTONS */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePercentChange(p)}
                    className="bg-zinc-900/50 border border-white/5 hover:border-white/20 rounded-lg py-1.5 text-[11px] font-bold text-zinc-400 hover:text-white transition-all"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex items-center border rounded-xl px-3 h-12 group transition-all bg-[#111] border-zinc-800 focus-within:border-zinc-400 min-w-0`}>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest min-[1500px]:min-w-[60px] min-w-[50px] shrink-0">Total</span>
              <input 
                type="number" 
                value={total} 
                placeholder="0.00"
                onChange={(e) => handleTotalChange(e.target.value)} 
                className="flex-1 bg-transparent border-none outline-none text-right text-[14px] font-medium text-white pr-2 placeholder:text-zinc-700 min-w-0" 
              />
              <span className="text-[11px] font-bold text-zinc-600 shrink-0 uppercase truncate max-w-[40px]">{activeQuote}</span>
            </div>

            {/* TP/SL Toggle Row (OKX Style) - ONLY in Limit Tab */}
            {orderType === 'limit' && (
              <div className="flex items-center gap-2 mt-2 px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${showTPSL ? 'bg-white border-white' : 'border-zinc-700 group-hover:border-zinc-500'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={showTPSL} 
                      onChange={() => setShowTPSL(!showTPSL)} 
                    />
                    {showTPSL && <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m5 13 4 4L19 7"/></svg>}
                  </div>
                  <span className="text-[11px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-tight">TP/SL</span>
                </label>
              </div>
            )}

            {/* Conditional TP/SL Inputs - ONLY in Limit Tab when enabled */}
            {orderType === 'limit' && showTPSL && (
              <div className="space-y-4 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center border border-zinc-800 bg-[#111] rounded-xl px-3 h-12 focus-within:border-zinc-500 transition-all min-w-0">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest min-[1500px]:min-w-[60px] min-w-[50px] shrink-0">TP</span>
                  <input 
                    type="number" 
                    value={tpInput}
                    onChange={(e) => setTpInput(e.target.value)}
                    placeholder="Take profit price"
                    className="flex-1 bg-transparent border-none outline-none text-right text-[14px] font-medium text-white pr-2 placeholder:text-zinc-700 min-w-0" 
                  />
                  <span className="text-[11px] font-bold text-zinc-600 shrink-0 uppercase truncate max-w-[40px]">{activeQuote}</span>
                </div>
                <div className="flex items-center border border-zinc-800 bg-[#111] rounded-xl px-3 h-12 focus-within:border-zinc-500 transition-all min-w-0">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest min-[1500px]:min-w-[60px] min-w-[50px] shrink-0">SL</span>
                  <input 
                    type="number" 
                    value={slInput}
                    onChange={(e) => setSlInput(e.target.value)}
                    placeholder="Stop loss price"
                    className="flex-1 bg-transparent border-none outline-none text-right text-[14px] font-medium text-white pr-2 placeholder:text-zinc-700 min-w-0" 
                  />
                  <span className="text-[11px] font-bold text-zinc-600 shrink-0 uppercase truncate max-w-[40px]">{activeQuote}</span>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-zinc-900/50 bg-black shrink-0">
              {user ? (
                <>
                  <div className="flex justify-between items-center text-[12px] font-normal text-zinc-500 px-1 mb-3">
                    <span>Available</span>
                    <span className="text-zinc-300 font-bold tabular-nums tracking-tight">{side === 'buy' ? `${quoteBalance.toLocaleString()} ${activeQuote}` : `${baseBalance.toFixed(4)} ${activeBase}`}</span>
                  </div>

                  <button 
                    onClick={handleTrade}
                    className={`w-full py-3.5 rounded-2xl font-black text-[14px] uppercase tracking-wider transition-all active:scale-[0.98] shadow-2xl ${
                      side === 'buy' ? 'bg-[#00d18e] hover:bg-[#00e099] text-black' : 'bg-[#ff4d4f] hover:bg-[#ff5c5e] text-white'
                    }`}
                  >
                    {side === 'buy' ? 'Buy' : 'Sell'} {activeBase}
                  </button>
                </>
              ) : (
                <div className="space-y-3 pt-2">
                  <button className="w-full py-4 apr-badge-glow text-white font-black rounded-full text-[13px] transition-all flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 12V22H4V12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H16.5C18.433 7 20 5.433 20 3.5C20 1.567 18.433 0 16.5 0C14.567 0 12 2 12 7ZM12 7H7.5C5.567 7 4 5.433 4 3.5C4 1.567 5.567 0 7.5 0C9.433 0 12 2 12 7Z"/></svg>
                    Sign up to claim $10
                  </button>
                  <button className="w-full py-4 bg-zinc-800 text-white font-black rounded-full text-[13px] transition-all hover:bg-zinc-700">
                    Log In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotTrading;
