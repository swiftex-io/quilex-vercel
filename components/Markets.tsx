
import React, { useState, useMemo } from 'react';
import { useExchangeStore } from '../store';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Line, ComposedChart } from 'recharts';

interface MarketsProps {
  onTrade: () => void;
}

const Markets: React.FC<MarketsProps> = ({ onTrade }) => {
  const { balances } = useExchangeStore();
  const [activeSubTab, setActiveSubTab] = useState<'Markets' | 'Rankings' | 'Trading data'>('Markets');
  const [cryptoFilter, setCryptoFilter] = useState('All');

  // Mock data for charts and indicators
  const macroData = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    time: `${i}:00`,
    cap: 2.2 + Math.random() * 0.2,
    vol: 300 + Math.random() * 100
  })), []);

  const etfFlows = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    date: i,
    flow: (Math.random() - 0.4) * 800,
    price: 60000 + Math.random() * 10000
  })), []);

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
      {/* Top 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Hot Crypto Card */}
        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl group hover:bg-zinc-900/50 transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[14px] font-normal flex items-center gap-1">
              Hot crypto <svg className="w-3 h-3 text-zinc-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m9 5 7 7-7 7"/></svg>
            </h3>
            <div className="flex bg-zinc-800/50 p-0.5 rounded-lg text-[10px] text-zinc-500 font-normal">
              <button className="px-2 py-0.5 bg-zinc-700 text-white rounded-md">Spot</button>
              <button className="px-2 py-0.5">Futures</button>
            </div>
          </div>
          <div className="space-y-4">
            {balances.slice(0, 3).map(asset => (
              <div key={asset.symbol} onClick={onTrade} className="flex justify-between items-center cursor-pointer group/item">
                <div className="flex items-center gap-2">
                  <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} className="w-5 h-5 rounded-full" alt="" />
                  <span className="text-xs font-normal text-zinc-200 group-hover/item:text-white transition-colors">{asset.symbol}/USDT</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-normal tracking-tight">{asset.price.toLocaleString()}</div>
                  <div className={`text-[10px] ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Listings Card */}
        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl group hover:bg-zinc-900/50 transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[14px] font-normal flex items-center gap-1">
              New listings <svg className="w-3 h-3 text-zinc-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m9 5 7 7-7 7"/></svg>
            </h3>
          </div>
          <div className="space-y-4">
            {[ {s: 'ZAMA', p: 0.02893, c: 2.41}, {s: 'USAT', p: 1.0008, c: -0.04}, {s: 'SENT', p: 0.02959, c: -6.60} ].map(item => (
              <div key={item.s} onClick={onTrade} className="flex justify-between items-center cursor-pointer group/item">
                <div className="flex items-center gap-2">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.s}`} className="w-5 h-5 rounded-full" alt="" />
                  <span className="text-xs font-normal text-zinc-200 group-hover/item:text-white transition-colors">{item.s}/USDT</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-normal tracking-tight">{item.p.toFixed(item.p < 1 ? 5 : 2)}</div>
                  <div className={`text-[10px] ${item.c >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{item.c >= 0 ? '+' : ''}{item.c.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Macro Data Card */}
        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl group hover:bg-zinc-900/50 transition-all">
          <h3 className="text-[14px] font-normal mb-4">Macro data</h3>
          <div className="flex justify-between text-[11px] text-zinc-500 mb-4">
            <div>
              <div className="mb-1">Market cap</div>
              <div className="text-white text-sm">$2.34T <span className="text-[#ff4d4f] text-[10px]">-5.29%</span></div>
            </div>
            <div className="text-right">
              <div className="mb-1">Volume</div>
              <div className="text-white text-sm">$360.86B <span className="text-[#00d18e] text-[10px]">+58.35%</span></div>
            </div>
          </div>
          <div className="h-10 w-full overflow-hidden flex items-end gap-0.5">
            {macroData.slice(0, 20).map((d, i) => (
              <div key={i} className="flex-1 bg-zinc-800" style={{ height: `${20 + Math.random() * 80}%` }}></div>
            ))}
          </div>
        </div>

        {/* ETF Flows Card */}
        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl group hover:bg-zinc-900/50 transition-all">
          <h3 className="text-[14px] font-normal mb-4">BTC ETF flows</h3>
          <div className="flex justify-between text-[11px] text-zinc-500 mb-4">
            <div>
              <div className="mb-1">Daily net</div>
              <div className="text-[#ff4d4f] text-sm">-$110.60M</div>
            </div>
            <div className="text-right">
              <div className="mb-1">Last 30D</div>
              <div className="text-[#ff4d4f] text-sm">-$604.20M</div>
            </div>
          </div>
          <div className="h-10 flex items-center gap-1">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className={`flex-1 rounded-sm ${i % 3 === 0 ? 'bg-[#ff4d4f]' : 'bg-[#00d18e]'}`} style={{ height: `${30 + Math.random() * 70}%` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table Controls */}
      <div className="flex items-center gap-6 mb-8 overflow-x-auto no-scrollbar border-b border-zinc-900 py-2">
        {['Favorites', 'Crypto', 'Spot', 'Futures', 'Options'].map(tab => (
          <button key={tab} className={`text-sm font-normal transition-all pb-2 ${tab === 'Crypto' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-white'}`}>{tab}</button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-6 overflow-x-auto no-scrollbar">
        {['All', 'Top', 'New', 'AI', 'Solana', 'RWA', 'Meme', 'Payment', 'DeFi', 'Layer 1'].map(filter => (
          <button key={filter} onClick={() => setCryptoFilter(filter)} className={`text-[11px] px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${cryptoFilter === filter ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {filter}
          </button>
        ))}
        <button className="ml-auto flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 7H4M16 12H8M12 17H12"/></svg> Filters
        </button>
      </div>

      {/* Main Market Table */}
      <div className="bg-black">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-zinc-600 font-normal border-b border-zinc-900">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">24h change</th>
              <th className="px-4 py-3">Last 24h</th>
              <th className="px-4 py-3">24h range</th>
              <th className="px-4 py-3">Market cap</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/50">
            {balances.slice(0, 15).map((asset) => (
              <tr key={asset.symbol} onClick={onTrade} className="hover:bg-zinc-900/30 transition-all group cursor-pointer">
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <button onClick={(e) => e.stopPropagation()} className="text-zinc-800 hover:text-amber-500 transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg></button>
                    <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} className="w-8 h-8 rounded-full" alt="" />
                    <div className="flex flex-col">
                      <span className="text-sm font-normal text-white">{asset.symbol}</span>
                      <span className="text-[10px] text-zinc-600 font-normal uppercase">{asset.name}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5 font-mono text-sm">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className={`px-4 py-5 font-normal text-sm ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </td>
                <td className="px-4 py-5">{renderSparkline(asset.change24h)}</td>
                <td className="px-4 py-5">
                  <div className="w-32">
                    <div className="flex justify-between text-[8px] text-zinc-600 mb-1">
                      <span>${(asset.price * 0.95).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      <span>${(asset.price * 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="h-0.5 bg-zinc-800 rounded-full relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5 text-sm text-zinc-400 font-normal">${(Math.random() * 500).toFixed(2)}B</td>
                <td className="px-4 py-5 text-right">
                  <div className="flex items-center justify-end gap-3 text-[12px] font-normal">
                    <button onClick={(e) => { e.stopPropagation(); }} className="text-zinc-600 hover:text-white transition-colors">Details</button>
                    <span className="text-zinc-900">|</span>
                    <button className="text-white hover:text-blue-400 transition-colors">Trade</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRankingsTab = () => {
    const categories = [
      { name: 'Hot crypto', assets: balances.slice(0, 7) },
      { name: 'Top gainers', assets: balances.filter(b => b.change24h > 0).sort((a,b) => b.change24h - a.change24h).slice(0, 7) },
      { name: 'Top losers', assets: balances.filter(b => b.change24h < 0).sort((a,b) => a.change24h - b.change24h).slice(0, 7) },
      { name: 'New listings', assets: balances.slice(5, 12) },
      { name: 'Largest market cap', assets: balances.slice(0, 7) },
      { name: 'Highest turnover', assets: balances.slice(1, 8) }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {categories.map((cat, i) => (
          <div key={i} className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-normal flex items-center gap-2">
                <span className="text-zinc-500">
                  {i === 1 ? '↗' : i === 2 ? '↘' : i === 3 ? '🔔' : i === 4 ? '📊' : i === 5 ? '🔄' : '🔥'}
                </span>
                {cat.name}
              </h3>
              <button className="text-[11px] text-zinc-600 hover:text-white">More &gt;</button>
            </div>
            <div className="grid grid-cols-12 text-[10px] text-zinc-600 mb-4 px-1">
              <div className="col-span-8">Name | Turnover</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">24h</div>
            </div>
            <div className="space-y-4">
              {cat.assets.map((asset, idx) => (
                <div key={idx} onClick={onTrade} className="grid grid-cols-12 items-center group cursor-pointer hover:bg-zinc-900/40 -mx-2 px-2 py-1 rounded-lg transition-all">
                  <div className="col-span-8 flex items-center gap-3">
                    <span className="text-[11px] font-normal text-zinc-700 w-3">{idx + 1}</span>
                    <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} className="w-6 h-6 rounded-full" alt="" />
                    <div className="flex flex-col">
                      <span className="text-[13px] font-normal text-white group-hover:text-blue-400 transition-colors">{asset.symbol}<span className="text-zinc-700">/USDT</span></span>
                      <span className="text-[9px] text-zinc-700 font-normal tracking-tight">${(Math.random() * 2).toFixed(2)}B</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-[12px] font-mono font-normal text-zinc-200">{asset.price > 1000 ? asset.price.toLocaleString(undefined, { maximumFractionDigits: 1 }) : asset.price.toFixed(asset.price < 0.1 ? 4 : 2)}</div>
                    <div className="text-[9px] text-zinc-700">${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className={`col-span-2 text-right text-[12px] font-normal ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTradingDataTab = () => (
    <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-500 pb-20">
      <div className="col-span-8 space-y-6">
        {/* Large Macro Data Chart */}
        <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-normal">Macro data ⓘ</h3>
            <div className="flex bg-zinc-900 p-1 rounded-lg text-[10px] text-zinc-500 font-normal">
              {['24h', '7D', '30D', '1Y'].map(t => <button key={t} className={`px-3 py-1 rounded-md ${t === '24h' ? 'bg-zinc-800 text-white' : ''}`}>{t}</button>)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-[11px] text-zinc-500 mb-1">Market cap</div>
              <div className="text-xl font-normal">$2.34T <span className="text-[#ff4d4f] text-xs">-5.29%</span></div>
            </div>
            <div>
              <div className="text-[11px] text-zinc-500 mb-1">Turnover</div>
              <div className="text-xl font-normal">$360.86B <span className="text-[#00d18e] text-xs">+58.35%</span></div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={macroData}>
                <defs>
                  <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis orientation="right" hide domain={['dataMin', 'dataMax']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area type="monotone" dataKey="cap" stroke="#ff4d4f" fillOpacity={1} fill="url(#colorCap)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BTC ETF Flows Chart */}
        <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-normal">BTC ETF flows ⓘ</h3>
            <div className="flex gap-2 text-[10px] text-zinc-500">
               <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-sm bg-[#00d18e]"></span> Inflows</div>
               <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-sm bg-[#ff4d4f]"></span> Outflows</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div>
              <div className="text-[10px] text-zinc-500 mb-1">Daily total net flows</div>
              <div className="text-base font-normal text-[#ff4d4f]">-$110.60M</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 mb-1">Last 30D total net flows</div>
              <div className="text-base font-normal text-[#ff4d4f]">-$604.20M</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 mb-1">Cumulative total net flows</div>
              <div className="text-base font-normal text-white">$52.59B</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 mb-1">% of BTC market cap</div>
              <div className="text-base font-normal text-white">11.09%</div>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={etfFlows}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="flow">
                  {etfFlows.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.flow >= 0 ? '#00d18e' : '#ff4d4f'} opacity={0.6} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="price" stroke="#f7931a" dot={false} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Right Sidebar Lists */}
      <div className="col-span-4 space-y-6">
        <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
          <h3 className="text-base font-normal mb-6 flex items-center justify-between">
            Trading calendar <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m9 5 7 7-7 7"/></svg>
          </h3>
          <div className="space-y-6">
            {[
              { title: 'LAYER unlock', meta: '98.94M/9.89%', date: 'Feb 10, 16:00', icon: '🔒' },
              { title: 'Unemployment Rate (U.S.)', date: 'Feb 11, 05:30', icon: '📈' },
              { title: 'Non Farm Payrolls (U.S.)', date: 'Feb 11, 05:30', icon: '💼' },
              { title: 'Inflation Rate MoM (U.S.)', date: 'Feb 13, 05:30', icon: '📊' },
              { title: 'Inflation Rate YoY (U.S.)', date: 'Feb 13, 05:30', icon: '💹' }
            ].map((ev, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-sm">{ev.icon}</div>
                  <div>
                    <div className="text-[13px] font-normal text-white group-hover:text-blue-400 transition-colors">{ev.title}</div>
                    {ev.meta && <div className="text-[10px] text-zinc-600 font-normal">{ev.meta}</div>}
                  </div>
                </div>
                <div className="text-[10px] text-zinc-600 font-normal">{ev.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
          <h3 className="text-base font-normal mb-6 flex items-center justify-between">
            Trade radar <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m9 5 7 7-7 7"/></svg>
          </h3>
          <div className="flex gap-2 mb-6 text-[10px] font-normal text-zinc-500 overflow-x-auto no-scrollbar">
            {['All', 'Whales', 'Price swings', 'Unlocks'].map(f => <button key={f} className={`px-3 py-1 rounded-md ${f === 'All' ? 'bg-zinc-800 text-white' : ''}`}>{f}</button>)}
          </div>
          <div className="space-y-6">
            {[
              { s: 'BTC', c: -5.55, msg: 'Price surged +0.48% in the last 5m.', t: '2m ago' },
              { s: 'YFI', c: 1.55, msg: 'Price surged +1.15% in the last 5m.', t: '2m ago' },
              { s: 'RIO', c: 10.09, msg: 'Price dipped -3.67% in the last 5m.', t: '2m ago' },
              { s: 'RIO', c: 10.09, msg: 'Price dipped -1.64% in the last 5m.', t: '3m ago' }
            ].map((radar, i) => (
              <div key={i} onClick={onTrade} className="flex flex-col gap-1 cursor-pointer group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <img src={`https://assets.coincap.io/assets/icons/${radar.s.toLowerCase()}@2x.png`} className="w-5 h-5 rounded-full" alt="" />
                    <span className="text-[12px] font-normal">{radar.s} <span className={`text-[10px] ${radar.c >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{radar.c >= 0 ? '+' : ''}{radar.c}%</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">Price swing</span>
                    <span className="text-[9px] text-zinc-700 font-normal">{radar.t}</span>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-500 font-normal group-hover:text-white transition-colors pl-7">{radar.msg}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-white/10 pb-20 overflow-x-hidden">
      {/* Markets Top Navigation Sub-Tabs (Settings style) */}
      <div className="bg-[#0a0a0a] border-b border-zinc-900 px-8 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto flex gap-8 overflow-x-auto no-scrollbar">
          {['Markets', 'Rankings', 'Trading data'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveSubTab(item as any)}
              className={`py-4 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap tracking-tight ${
                activeSubTab === item 
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
        {activeSubTab === 'Markets' && renderMarketsTab()}
        {activeSubTab === 'Rankings' && renderRankingsTab()}
        {activeSubTab === 'Trading data' && renderTradingDataTab()}
      </div>
    </div>
  );
};

export default Markets;
