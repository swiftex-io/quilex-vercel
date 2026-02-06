
import React, { useState } from 'react';
import { useExchangeStore } from '../store';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [priceTab, setPriceTab] = useState('Top');
  const { user, balances } = useExchangeStore();

  const tabs = [
    'Overview', 'Profile', 'Security', 'Verification', 
    'Preferences'
  ];

  const priceTabs = ['Favorites', 'Top', 'Hot', 'Gainers', 'New'];

  // Mock announcements
  const announcements = [
    { date: '01/30/2026', title: 'QUILEX to list ZAMA (Zama) for spot trading and convert pre-market futures' },
    { date: '01/30/2026', title: 'QUILEX to support Sei network mainnet upgrade' },
    { date: '01/29/2026', title: 'QUILEX to support Story Network Mainnet Upgrade' },
    { date: '01/27/2026', title: 'QUILEX will launch USAT/USD for spot trading' },
  ];

  const maskedEmail = user?.email ? `${user.email.split('@')[0].slice(0, 3)}***@${user.email.split('@')[1]}` : 'vir***@proton.me';
  const displayUid = user?.id?.slice(0, 16) || '805418618808070350';

  const renderCryptoIcon = (symbol: string) => (
    <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center font-black text-[11px] text-zinc-400 transition-all overflow-hidden relative">
      <img 
        src={`https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`} 
        alt={symbol}
        className="w-full h-full object-cover relative z-10"
        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Settings Tab Navigation */}
      <div className="bg-black border-b border-zinc-900 px-8">
        <div className="max-w-[1400px] mx-auto flex gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-white text-white' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-8">
        <div className="flex flex-wrap items-center gap-12 mb-10 py-6 border-b border-zinc-900/50">
          <div className="flex items-center gap-5 border-r border-zinc-800 pr-12">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-800 shadow-xl bg-zinc-900">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUid}`} alt="avatar" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight mb-1">{maskedEmail}</div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                {displayUid}
                <button className="hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-[#111111] border border-zinc-900 rounded-2xl p-10 shadow-2xl">
              <h3 className="text-2xl font-black mb-8 tracking-tight">Today's crypto prices</h3>
              <div className="space-y-1">
                <div className="grid grid-cols-12 px-3 py-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-3 text-right">Price</div>
                  <div className="col-span-3 text-right">24h Change</div>
                </div>
                {balances.filter(b => b.symbol !== 'USDT').slice(0, 8).map(asset => (
                  <div key={asset.symbol} className="grid grid-cols-12 px-3 py-5 items-center hover:bg-white/[0.03] transition-all rounded-xl group cursor-pointer">
                    <div className="col-span-6 flex items-center gap-4">
                      {renderCryptoIcon(asset.symbol)}
                      <div>
                        <div className="font-bold text-[15px]">{asset.symbol}</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase opacity-60 tracking-tighter">{asset.name}</div>
                      </div>
                    </div>
                    <div className="col-span-3 text-right font-mono text-sm font-bold tracking-tight">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className={`col-span-3 text-right font-mono text-sm font-bold tracking-tight ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
