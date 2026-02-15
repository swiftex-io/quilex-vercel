import React, { useState, useMemo, useEffect } from 'react';
import { useExchangeStore } from '../store';

interface MarketsProps {
  onTrade: () => void;
}

const Markets: React.FC<MarketsProps> = ({ onTrade }) => {
  const { balances, marketsActiveTab, setMarketsActiveTab } = useExchangeStore();
  const [cryptoFilter, setCryptoFilter] = useState('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [cryptoFilter]);

  const filteredAssets = useMemo(() => {
    let result = [...balances];
    
    if (cryptoFilter === 'Meme') {
      result = result.filter(a => ['DOGE', 'SHIB', 'PEPE'].includes(a.symbol));
    } else if (cryptoFilter === 'AI') {
      result = result.filter(a => ['RNDR', 'NEAR', 'ICP'].includes(a.symbol));
    } else if (cryptoFilter === 'Solana') {
      result = result.filter(a => ['SOL'].includes(a.symbol));
    } else if (cryptoFilter === 'Layer 1') {
      result = result.filter(a => ['BTC', 'ETH', 'BNB', 'ADA', 'AVAX', 'DOT', 'ATOM'].includes(a.symbol));
    } else if (cryptoFilter === 'Top') {
      result = result.sort((a, b) => b.price * 1000 - a.price * 1000).slice(0, 15);
    }
    
    return result;
  }, [balances, cryptoFilter]);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssets.slice(start, start + itemsPerPage);
  }, [filteredAssets, currentPage]);

  const renderSparkline = (change: number) => {
    const color = change >= 0 ? '#00d18e' : '#ff4d4f';
    const points = Array.from({ length: 12 }, (_, i) => ({
      x: i * 8.3,
      y: 15 + (Math.random() - 0.5) * 15
    }));
    const d = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    return (
      <svg className="w-16 h-6" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  };

  const renderMarketsTab = () => (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#111111] p-6 rounded-2xl group transition-all shadow-xl text-left border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[14px] font-bold text-white tracking-tight flex items-center gap-1">
              Hot crypto <svg className="w-3 h-3 text-zinc-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m9 5 7 7-7 7"/></svg>
            </h3>
            <div className="flex bg-zinc-800/50 p-0.5 rounded-lg text-[10px] text-zinc-500 font-normal">
              <button className="px-2 py-0.5 bg-zinc-700 text-white rounded-md">Spot</button>
              <button className="px-2 py-0.5">Futures</button>
            </div>
          </div>
          <div className="space-y-1">
            {balances.slice(0, 3).map(asset => (
              <div key={asset.symbol} onClick={onTrade} className="flex justify-between items-center cursor-pointer hover:bg-white/[0.04] -mx-2 px-2 py-2 rounded-lg transition-all group/row">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <span className="text-sm font-bold text-white">{asset.symbol}<span className="text-zinc-600">/USDT</span></span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold tracking-tight text-zinc-200">{asset.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
                  <div className={`text-[11px] font-bold ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl group transition-all shadow-xl text-left border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[14px] font-bold text-white tracking-tight flex items-center gap-1">
              New listings <svg className="w-3 h-3 text-zinc-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m9 5 7 7-7 7"/></svg>
            </h3>
          </div>
          <div className="space-y-1">
            {[ {s: 'ZAMA', p: 0.02893, c: 2.41}, {s: 'USAT', p: 1.0008, c: -0.04}, {s: 'SENT', p: 0.02959, c: -6.60} ].map(item => (
              <div key={item.s} onClick={onTrade} className="flex justify-between items-center cursor-pointer hover:bg-white/[0.04] -mx-2 px-2 py-2 rounded-lg transition-all group/row">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.s}`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <span className="text-sm font-bold text-white">{item.s}<span className="text-zinc-600">/USDT</span></span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold tracking-tight text-zinc-200">{item.p.toFixed(item.p < 1 ? 5 : 2)}</div>
                  <div className={`text-[11px] font-bold ${item.c >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{item.c >= 0 ? '+' : ''}{item.c.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl group transition-all shadow-xl text-left border border-white/5">
          <h3 className="text-[14px] font-bold text-white tracking-tight mb-6 flex items-center gap-1">
            Macro data <svg className="w-3 h-3 text-zinc-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m9 5 7 7-7 7"/></svg>
          </h3>
          <div className="flex justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f]"></div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Market cap</span>
              </div>
              <div className="text-sm font-black text-white">$2.34T <span className="text-[#ff4d4f] text-[11px]">-5.29%</span></div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 mb-1.5 justify-end">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Volume</span>
              </div>
              <div className="text-sm font-black text-white">$360.86B <span className="text-[#00d18e] text-[11px]">+58.35%</span></div>
            </div>
          </div>
          <div className="h-10 w-full overflow-hidden flex items-end gap-0.5 mt-auto">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 bg-zinc-800" style={{ height: `${20 + Math.random() * 80}%` }}></div>
            ))}
          </div>
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl group transition-all shadow-xl text-left border border-white/5">
          <h3 className="text-[14px] font-bold text-white tracking-tight mb-6 flex items-center gap-1">
            BTC ETF flows <svg className="w-3 h-3 text-zinc-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m9 5 7 7-7 7"/></svg>
          </h3>
          <div className="flex justify-between mb-6">
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mb-1.5">Daily net</div>
              <div className="text-sm font-black text-[#ff4d4f]">-$110.6M</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mb-1.5">Last 30D</div>
              <div className="text-sm font-black text-[#ff4d4f]">-$604.2M</div>
            </div>
          </div>
          <div className="h-10 flex items-center gap-1 mt-auto">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className={`flex-1 rounded-sm ${i % 3 === 0 ? 'bg-[#ff4d4f]' : 'bg-[#00d18e]'}`} style={{ height: `${30 + Math.random() * 70}%` }}></div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8 overflow-x-auto no-scrollbar border-b border-zinc-900 py-2">
        {[
          { label: 'Favorites', soon: false },
          { label: 'Crypto', soon: false },
          { label: 'Spot', soon: false },
          { label: 'Futures', soon: true }
        ].map(tab => (
          <button 
            key={tab.label} 
            disabled={tab.soon}
            className={`text-sm font-medium transition-all pb-2 flex items-center gap-2 ${
              tab.label === 'Crypto' ? 'text-white border-b-2 border-white' : 
              tab.soon ? 'text-zinc-700 cursor-not-allowed opacity-60' : 'text-zinc-500 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.soon && (
              <span className="bg-blue-500/10 text-blue-500 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Soon</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-6 overflow-x-auto no-scrollbar">
        {['All', 'Top', 'New', 'AI', 'Solana', 'RWA', 'Meme', 'Payment', 'DeFi', 'Layer 1'].map(filter => (
          <button key={filter} onClick={() => setCryptoFilter(filter)} className={`text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${cryptoFilter === filter ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {filter}
          </button>
        ))}
        <button className="ml-auto flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 7H4M16 12H8M12 17H12"/></svg> Filters
        </button>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[12px] text-zinc-600 border-b border-zinc-900 tracking-tight">
              <th className="px-8 py-3 font-medium">Name</th>
              <th className="px-8 py-3 font-medium">Price</th>
              <th className="px-8 py-3 font-medium">24h change</th>
              <th className="px-8 py-3 font-medium">Last 24h</th>
              <th className="px-8 py-3 font-medium">24h range</th>
              <th className="px-8 py-3 font-medium">Market cap</th>
              <th className="px-8 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/50">
            {paginatedAssets.length > 0 ? paginatedAssets.map((asset) => (
              <tr key={asset.symbol} onClick={onTrade} className="hover:bg-zinc-900/30 transition-all group cursor-pointer">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3 text-left">
                    <button onClick={(e) => e.stopPropagation()} className="text-zinc-800 hover:text-amber-500 transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg></button>
                    <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} className="w-8 h-8 rounded-full" alt="" />
                    <div className="flex flex-col">
                      <span className="text-sm font-normal text-white">{asset.symbol}</span>
                      <span className="text-[10px] text-zinc-600 font-normal uppercase">{asset.name}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 font-mono text-sm">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className={`px-8 py-5 font-normal text-sm ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </td>
                <td className="px-8 py-5">{renderSparkline(asset.change24h)}</td>
                <td className="px-8 py-5">
                  <div className="w-32">
                    <div className="flex justify-between text-[10px] text-zinc-600 mb-1 font-medium">
                      <span>${(asset.price * 0.95).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      <span>${(asset.price * 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="h-0.5 bg-zinc-800 rounded-full relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -ml-1.5 flex items-center justify-center">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 0L11.1962 7.5H0.803848L6 0Z" fill="white"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-zinc-400 font-normal">${(Math.random() * 500).toFixed(2)}B</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={(e) => { e.stopPropagation(); }} className="text-[13px] font-bold text-zinc-500 hover:text-white transition-colors">Details</button>
                    <button className="px-6 py-1.5 bg-white text-black text-[13px] font-bold rounded-full hover:bg-zinc-200 transition-all shadow-lg">Trade</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-8 py-10 text-center text-zinc-600 text-xs font-medium uppercase tracking-widest">
                  No assets found for this category
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-zinc-950">
            <div className="text-[11px] text-zinc-500 font-medium">
              Showing <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredAssets.length)}</span> of <span className="text-white">{filteredAssets.length}</span> pairs
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[32px] h-8 rounded-lg text-[11px] font-bold transition-all ${currentPage === page ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderRankingsTab = () => {
    const categories = [
      { name: 'Hot crypto', assets: balances.slice(0, 4), hasCta: true },
      { name: 'Top gainers', assets: balances.filter(b => b.change24h > 0).sort((a,b) => b.change24h - a.change24h).slice(0, 5) },
      { name: 'Top losers', assets: balances.filter(b => b.change24h < 0).sort((a,b) => a.change24h - b.change24h).slice(0, 5) },
      { name: 'New listings', assets: balances.slice(5, 10) },
      { name: 'Largest market cap', assets: balances.slice(0, 5) },
      { name: 'Highest turnover', assets: balances.slice(1, 6) }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {categories.map((cat, i) => (
          <div key={i} className="bg-[#111111] rounded-2xl p-6 shadow-xl group/card text-left border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[14px] font-bold text-white tracking-tight flex items-center gap-2">
                <span className="text-zinc-500">
                  {i === 1 ? '↗' : i === 2 ? '↘' : i === 3 ? '🔔' : i === 4 ? '📊' : i === 5 ? '🔄' : '🔥'}
                </span>
                {cat.name}
              </h3>
              <button className="text-[11px] font-bold text-zinc-600 hover:text-white transition-colors">More &gt;</button>
            </div>
            <div className="grid grid-cols-12 text-[12px] text-zinc-600 font-medium tracking-tight mb-4 px-1">
              <div className="col-span-8">Name | Turnover</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">24h</div>
            </div>
            <div className="space-y-1">
              {cat.assets.map((asset, idx) => (
                <div key={idx} onClick={onTrade} className="grid grid-cols-12 items-center cursor-pointer hover:bg-white/[0.04] -mx-2 px-2 py-2 rounded-lg transition-all group/row">
                  <div className="col-span-8 flex items-center gap-3">
                    <span className="text-[11px] font-bold text-zinc-700 w-3">{idx + 1}</span>
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5">
                      <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover/row:text-blue-400 transition-colors">{asset.symbol}<span className="text-zinc-600">/USDT</span></span>
                      <span className="text-[9px] text-zinc-700 font-bold tracking-tight">${(Math.random() * 2).toFixed(2)}B</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-[12px] font-mono font-bold text-zinc-200">{asset.price > 1000 ? asset.price.toLocaleString(undefined, { maximumFractionDigits: 1 }) : asset.price.toFixed(asset.price < 0.1 ? 4 : 2)}</div>
                    <div className="text-[9px] text-zinc-700 font-bold">${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className={`col-span-2 text-right text-[12px] font-bold ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </div>
                </div>
              ))}
              
              {cat.hasCta && (
                <div className="grid grid-cols-12 items-center bg-blue-500/5 border border-dashed border-blue-500/20 -mx-2 mt-2 p-3 rounded-lg cursor-pointer hover:bg-blue-500/10 transition-all group/cta">
                  <div className="col-span-8 flex items-center gap-3">
                    <span className="text-[11px] font-bold text-blue-500/50 w-3">5</span>
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-blue-400">Promote your coin</span>
                      <span className="text-[9px] text-blue-500/60 font-bold tracking-tight uppercase">Get listed here</span>
                    </div>
                  </div>
                  <div className="col-span-4 text-right">
                    <button className="bg-white hover:bg-zinc-200 text-black text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-wider transition-all transform active:scale-95 shadow-lg">
                      Promote
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-black min-h-screen text-white pb-20 overflow-x-hidden">
      <div className="bg-[#0a0a0a] border-b border-zinc-900 px-8 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto flex gap-8 overflow-x-auto no-scrollbar">
          {['Markets Overview', 'Rankings'].map((item) => (
            <button
              key={item}
              onClick={() => setMarketsActiveTab(item as any)}
              className={`py-4 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap tracking-tight ${
                marketsActiveTab === item 
                  ? 'border-white text-white' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-10">
        {marketsActiveTab === 'Markets Overview' && renderMarketsTab()}
        {marketsActiveTab === 'Rankings' && renderRankingsTab()}
      </div>
    </div>
  );
};

export default Markets;