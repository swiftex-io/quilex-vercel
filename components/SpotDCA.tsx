import React, { useState } from 'react';
import { useExchangeStore } from '../store';

const SpotDCA: React.FC = () => {
  const { balances } = useExchangeStore();
  const [searchToken, setSearchToken] = useState('');
  const [activeRange, setActiveRange] = useState('1Y');

  const featuredCards = [
    {
      title: 'Major Tokens',
      users: '933',
      roi: '-21.21%',
      isNegative: true,
      allocation: ['BTC', 'ETH', 'SOL'],
      color: '#00d18e'
    },
    {
      title: 'POW',
      users: '722',
      roi: '-8.21%',
      isNegative: true,
      allocation: ['BTC', 'LTC', 'BCH', 'ETC'],
      color: '#00d18e'
    },
    {
      title: 'Public chain coins',
      users: '609',
      roi: '-20.85%',
      isNegative: true,
      allocation: ['ETH', 'SOL', 'DOT', 'ADA', 'AVAX'],
      color: '#00d18e'
    }
  ];

  const dcaTokens = [
    { symbol: 'BTC', name: 'Bitcoin', roi: '+48.20%', isNegative: false },
    { symbol: 'ETH', name: 'Ethereum', roi: '+38.08%', isNegative: false },
    { symbol: 'SOL', name: 'Solana', roi: '+124.5%', isNegative: false },
    { symbol: 'BNB', name: 'BNB', roi: '+12.4%', isNegative: false },
    { symbol: 'XRP', name: 'Ripple', roi: '-5.2%', isNegative: true },
  ];

  const ranges = ['5Y', '3Y', '1Y', '6M', '3M', '1M'];

  const renderIcon = (symbol: string, size: string = "w-6 h-6") => (
    <div className={`${size} rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-white/5`}>
      <img src={`https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`} className="w-full h-full object-cover" alt={symbol} />
    </div>
  );

  const renderSparkline = (isNegative: boolean) => {
    const color = isNegative ? '#ff4d4f' : '#00d18e';
    return (
      <svg className="w-24 h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path 
          d="M0,25 Q15,10 30,20 T60,15 T100,5" 
          fill="none" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        <path 
          d="M0,25 Q15,10 30,20 T60,15 T100,5 V30 H0 Z" 
          fill={isNegative ? "rgba(255,77,79,0.1)" : "rgba(0,209,142,0.1)"}
        />
      </svg>
    );
  };

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12">
        
        {/* Hero Section */}
        <div className="relative pt-20 pb-20 flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-black mb-4 tracking-tight">Spot DCA</h1>
            <p className="text-xl text-zinc-400 font-medium mb-10">Steady growth through ups and downs</p>
            
            <div className="flex gap-12 mb-10">
              <div className="flex flex-col">
                <div className="text-zinc-500 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider mb-2">
                  My Holdings <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-40"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <div className="text-3xl font-bold">0.00</div>
              </div>
              <div className="flex flex-col">
                <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Total PNL</div>
                <div className="text-3xl font-bold">0.00</div>
              </div>
              <div className="flex flex-col">
                <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Active</div>
                <div className="text-3xl font-bold">0</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 tracking-tight">Create DCA Bot</button>
              <button className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold rounded-full hover:bg-zinc-800 transition-all tracking-tight">My DCA Bots</button>
            </div>
          </div>
        </div>

        {/* Recommended Bots Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {featuredCards.map((card, idx) => (
            <div key={idx} className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all group">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                  <div className="text-[11px] text-zinc-500 font-bold flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {card.users} Users
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-blue-600/10 text-blue-400 text-[11px] font-bold rounded-full hover:bg-blue-600 hover:text-white transition-all">Create DCA Bot</button>
              </div>

              <div className="flex justify-between items-end mb-8">
                <div>
                  <div className={`text-3xl font-black tracking-tighter ${card.isNegative ? 'text-red-500' : 'text-green-500'}`}>
                    {card.roi}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1">1-Year ROI</div>
                </div>
                {renderSparkline(card.isNegative)}
              </div>

              <div className="space-y-4">
                <div className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest">Token Allocation</div>
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {card.allocation.slice(0, 3).map((sym) => (
                      <div key={sym} className="border-2 border-[#0d0d0d] rounded-full">
                        {renderIcon(sym, "w-8 h-8")}
                      </div>
                    ))}
                    {card.allocation.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold border-2 border-[#0d0d0d] text-zinc-500">
                        +{card.allocation.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DCA Plans List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <h2 className="text-4xl font-black tracking-tight">DCA Plans</h2>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search Token"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                className="bg-[#0d0d0d] border border-white/5 rounded-full py-2.5 pl-12 pr-6 text-sm font-medium w-64 focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-8">DCA Tokens</div>
            
            <div className="bg-[#080808] rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/40 text-[11px] text-zinc-500 uppercase font-bold tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-8 py-4 font-bold">Token</th>
                    <th className="px-8 py-4 font-bold text-center">Historical ROI</th>
                    <th className="px-8 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dcaTokens.map((token) => (
                    <tr key={token.symbol} className="hover:bg-zinc-900/20 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          {renderIcon(token.symbol, "w-10 h-10")}
                          <span className="text-lg font-bold group-hover:text-blue-400 transition-colors">{token.symbol}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-4">
                          <div className="flex items-center gap-2">
                             <span className={`text-base font-bold ${token.isNegative ? 'text-red-500' : 'text-green-500'}`}>{token.roi}</span>
                             <svg width="14" height="14" className={token.isNegative ? 'text-red-500' : 'text-green-500'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20V4M5 11l7-7 7 7"/></svg>
                          </div>
                          <div className="flex gap-1.5">
                            {ranges.map(r => (
                              <button 
                                key={r}
                                onClick={() => setActiveRange(r)}
                                className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all ${activeRange === r ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-500 transition-all">Create DCA Bot</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotDCA;