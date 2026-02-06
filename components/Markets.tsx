
import React, { useState, useMemo } from 'react';
import { useExchangeStore } from '../store';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MarketsProps {
  onTrade: () => void;
}

const Sparkline = ({ data, color }: { data: any[], color: string }) => (
  <div className="w-24 h-10">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <Area type="monotone" dataKey="val" stroke={color} fill="transparent" strokeWidth={1.5} animationDuration={0} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const Markets: React.FC<MarketsProps> = ({ onTrade }) => {
  const { balances } = useExchangeStore();
  const [activeTab, setActiveTab] = useState('Crypto');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Top', 'AI', 'Solana', 'RWA', 'Meme', 'DeFi', 'Layer 1', 'Gaming', 'Layer 2', 'Proof of Work', 'Storage', 'Fan Tokens', 'NFT', 'DePIN'];

  // Mock Sparkline Data
  const generateSparkData = () => Array.from({ length: 10 }, (_, i) => ({ val: Math.random() * 100 }));

  const topCards = [
    {
      title: 'Hot crypto',
      items: balances.slice(0, 3).map(b => ({
        symbol: b.symbol,
        price: b.price,
        change: b.change24h,
        icon: b.symbol[0]
      }))
    },
    {
      title: 'New listings',
      items: [
        { symbol: 'ZAMA', price: 0.02872, change: 8.38 },
        { symbol: 'USAT', price: 1.0020, change: 0.00 },
        { symbol: 'SENT', price: 0.02912, change: 5.47 }
      ]
    },
    {
      title: 'Macro data',
      data: {
        cap: '$2.31T',
        capChange: -8.42,
        volume: '$358.32B',
        volumeChange: 62.70,
        dominance: '56.4%'
      }
    },
    {
      title: 'BTC ETF flows',
      data: {
        dailyNet: '-$110.60M',
        last30D: '-$604.20M'
      }
    }
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto bg-black text-white font-sans select-none">
      {/* Top 4 Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {topCards.map((card, idx) => (
          <div key={idx} className="bg-[#111] border border-zinc-900 rounded-xl p-5 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                {card.title} <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="m9 5 7 7-7 7" strokeWidth={3}/></svg>
              </h3>
              <span className="text-[10px] text-zinc-600 font-bold uppercase">USD</span>
            </div>

            {card.items ? (
              <div className="space-y-3">
                {card.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500">{item.symbol[0]}</div>
                      <span className="text-xs font-bold">{item.symbol}<span className="text-zinc-600">/USD</span></span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold tracking-tight">{item.price.toLocaleString(undefined, { minimumFractionDigits: item.price < 1 ? 5 : 1 })}</div>
                      <div className={`text-[10px] font-bold ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : card.title === 'Macro data' ? (
              <div className="space-y-4">
                <div className="flex gap-6">
                  <div>
                    <div className="text-[9px] text-zinc-600 font-bold uppercase mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span> Market cap
                    </div>
                    <div className="text-sm font-bold">{card.data?.cap} <span className="text-red-500 text-[10px]">{card.data?.capChange}%</span></div>
                  </div>
                  <div>
                    <div className="text-[9px] text-zinc-600 font-bold uppercase mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span> Volume
                    </div>
                    <div className="text-sm font-bold">{card.data?.volume} <span className="text-green-500 text-[10px]">+{card.data?.volumeChange}%</span></div>
                  </div>
                </div>
                <div className="h-16 w-full relative">
                  <div className="absolute inset-0 flex items-end gap-[2px]">
                    {Array.from({length: 20}).map((_, i) => (
                      <div key={i} className="flex-1 bg-zinc-900" style={{height: `${30 + Math.random() * 70}%`}}></div>
                    ))}
                  </div>
                  <div className="absolute inset-0 top-1/2">
                    <svg className="w-full h-1/2 text-pink-500 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path d="M0,10 L10,8 L20,12 L30,5 L40,15 L50,8 L60,10 L70,14 L80,9 L90,11 L100,7" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="flex gap-8">
                   <div>
                     <div className="text-[9px] text-zinc-600 font-bold uppercase mb-1">Daily net</div>
                     <div className="text-sm font-bold text-pink-500">{card.data?.dailyNet}</div>
                   </div>
                   <div>
                     <div className="text-[9px] text-zinc-600 font-bold uppercase mb-1">Last 30D</div>
                     <div className="text-sm font-bold text-pink-500">{card.data?.last30D}</div>
                   </div>
                 </div>
                 <div className="flex items-end gap-1 h-12 pt-4">
                    {Array.from({length: 24}).map((_, i) => (
                      <div key={i} className={`flex-1 rounded-sm ${i === 15 || i === 18 ? 'bg-green-500' : 'bg-pink-900/40'}`} style={{height: `${20 + Math.random() * 80}%`}}></div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Primary Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-zinc-900">
        {['Favorites', 'Crypto', 'Spot'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
          </button>
        ))}
        <div className="ml-auto p-2 cursor-pointer text-zinc-600 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${
              activeCategory === cat ? 'bg-white/10 text-white' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
            }`}
          >
            {cat}
          </button>
        ))}
        <button className="ml-auto px-3 py-1.5 bg-zinc-900 rounded-lg text-[11px] font-bold text-zinc-400 flex items-center gap-2 hover:bg-zinc-800 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M3 4h18M6 10h12M9 16h6"/></svg>
          Filters
        </button>
      </div>

      {/* Main Markets Table */}
      <div className="w-full">
        <table className="w-full text-left">
          <thead className="text-[10px] text-zinc-600 font-black uppercase tracking-widest border-b border-zinc-900/50">
            <tr>
              <th className="px-4 py-4 w-12 text-center"></th>
              <th className="px-4 py-4 cursor-pointer hover:text-zinc-300 transition-colors">Name <svg className="w-2.5 h-2.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th className="px-4 py-4 cursor-pointer hover:text-zinc-300 transition-colors">Price <svg className="w-2.5 h-2.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th className="px-4 py-4 cursor-pointer hover:text-zinc-300 transition-colors">Change <svg className="w-2.5 h-2.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th className="px-4 py-4">Last 24h</th>
              <th className="px-4 py-4">24h range</th>
              <th className="px-4 py-4 cursor-pointer hover:text-zinc-300 transition-colors">Market cap <svg className="w-2.5 h-2.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th className="px-4 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/30">
            {balances.filter(b => b.symbol !== 'USDT').map((asset, idx) => (
              <tr key={asset.symbol} className="hover:bg-zinc-900/20 transition-all group">
                <td className="px-4 py-5 text-center">
                   <button className="text-zinc-700 hover:text-amber-500 transition-colors">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                   </button>
                </td>
                <td className="px-4 py-5">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center font-black text-[11px] text-zinc-500 group-hover:bg-zinc-800 transition-colors">
                         {asset.symbol[0]}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-white tracking-tight">{asset.symbol}</div>
                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">{asset.name}</div>
                      </div>
                   </div>
                </td>
                <td className="px-4 py-5">
                   <span className="text-[13px] font-mono font-bold tracking-tight">
                     ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                   </span>
                </td>
                <td className="px-4 py-5">
                   <span className={`text-[13px] font-mono font-bold tracking-tight ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                     {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                   </span>
                </td>
                <td className="px-4 py-5">
                   <Sparkline data={generateSparkData()} color={asset.change24h >= 0 ? '#22c55e' : '#ef4444'} />
                </td>
                <td className="px-4 py-5">
                   <div className="w-32 flex flex-col gap-1.5">
                      <div className="flex justify-between text-[8px] font-bold text-zinc-600 font-mono">
                         <span>${(asset.price * 0.95).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                         <span>${(asset.price * 1.05).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full relative overflow-visible">
                         <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[2px] h-3 bg-zinc-400"></div>
                         <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full border-2 border-black" style={{left: `${30 + Math.random() * 40}%`}}></div>
                      </div>
                   </div>
                </td>
                <td className="px-4 py-5">
                   <span className="text-[13px] font-mono font-bold text-zinc-300 tracking-tight">
                     ${(asset.price * 12000000 / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}B
                   </span>
                </td>
                <td className="px-4 py-5 text-right">
                   <div className="flex justify-end gap-3 text-[11px] font-bold">
                      <button className="text-zinc-500 hover:text-white transition-colors">Details</button>
                      <span className="text-zinc-800">|</span>
                      <button onClick={onTrade} className="text-zinc-500 hover:text-white transition-colors">Trade</button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Markets;
