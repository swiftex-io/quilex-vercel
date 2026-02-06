
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
        {/* Profile Details Header Section */}
        <div className="flex flex-wrap items-center gap-12 mb-10 py-6 border-b border-zinc-900/50">
          <div className="flex items-center gap-5 border-r border-zinc-800 pr-12">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-800 shadow-xl bg-zinc-900">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUid}`} alt="avatar" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight mb-1">
                {maskedEmail}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                {displayUid}
                <button className="hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-wrap gap-16 min-w-max items-start">
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1 opacity-70">
                Email <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={3}/></svg>
              </div>
              <div className="text-sm font-bold tracking-tight">{maskedEmail}</div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1 opacity-70">
                Identity verification <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={3}/></svg>
              </div>
              <button className="px-4 py-1.5 border border-zinc-700 rounded-full text-[11px] font-medium hover:bg-zinc-800 transition-all tracking-tight">Verify now</button>
            </div>

            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1 opacity-70">
                Country/Region <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={3}/></svg>
              </div>
              <div className="text-sm font-bold tracking-tight">United States</div>
            </div>
          </div>

          <button className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-[13px] font-bold flex items-center gap-2.5 hover:bg-zinc-800 transition-all shadow-lg ml-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            View profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Expanded Security Recommendation Card - With subtle yellow-to-gray gradient */}
            <div className="bg-gradient-to-r from-amber-500/10 to-[#111111] border border-amber-500/20 rounded-2xl overflow-hidden group hover:border-amber-500/30 transition-all shadow-2xl relative">
              <div className="p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 tracking-tight">Help us secure your account</h3>
                  <p className="text-zinc-500 text-[13px] font-medium max-w-lg leading-relaxed">Complete verification to unlock higher withdrawal limits and advanced security features.</p>
                </div>
                <button className="px-6 py-2.5 bg-white text-black rounded-full text-[13px] font-medium tracking-tighter flex items-center gap-2.5 hover:bg-gray-200 transition-all shadow-xl shrink-0 active:scale-95 group/btn whitespace-nowrap">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3H5C3.89543 3 3 3.89543 3 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M17 21H19C20.1046 21 21 20.1046 21 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="9.5" cy="10.5" r="1" fill="currentColor"/>
                    <circle cx="14.5" cy="10.5" r="1" fill="currentColor"/>
                    <path d="M12 12V14.5C12 14.5 12 15.5 11 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9 18C9.5 19 10.5 20 12 20C13.5 20 14.5 19 15 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Verify now
                </button>
              </div>
              {/* Subtle accent line on top */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-500/50 to-transparent"></div>
            </div>

            {/* Comprehensive Market Price Card */}
            <div className="bg-[#111111] border border-zinc-900 rounded-2xl p-10 shadow-2xl">
              <h3 className="text-2xl font-black mb-8 tracking-tight">Today's crypto prices</h3>
              
              <div className="flex gap-10 border-b border-zinc-900 mb-8">
                {priceTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPriceTab(tab)}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all tracking-tight ${
                      priceTab === tab ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <div className="grid grid-cols-12 px-3 py-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-3 text-right">Price</div>
                  <div className="col-span-3 text-right">24h Change</div>
                </div>
                {balances.filter(b => b.symbol !== 'USDT').slice(0, 8).map(asset => (
                  <div key={asset.symbol} className="grid grid-cols-12 px-3 py-5 items-center hover:bg-white/[0.03] transition-all rounded-xl group cursor-pointer">
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center font-black text-[11px] text-zinc-400 group-hover:bg-white group-hover:text-black transition-all">
                        {asset.symbol[0]}
                      </div>
                      <div>
                        <div className="font-bold text-[15px]">{asset.symbol}</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase opacity-60 tracking-tighter">{asset.name}</div>
                      </div>
                    </div>
                    <div className="col-span-3 text-right font-mono text-sm font-bold tracking-tight">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`col-span-3 text-right font-mono text-sm font-bold tracking-tight ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-10 py-4 text-xs font-bold text-zinc-600 hover:text-white transition-all tracking-widest border-t border-zinc-900">
                View more assets
              </button>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* Announcements Sidebar Widget */}
            <div className="bg-[#111111] border border-zinc-900 rounded-2xl p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black tracking-tight">Announcements</h3>
                <button className="text-[11px] font-bold text-zinc-500 hover:text-white flex items-center gap-1.5 group transition-all tracking-widest">
                  More <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="space-y-10">
                {announcements.map((ann, idx) => (
                  <div key={idx} className="group cursor-pointer">
                    <div className="text-[10px] text-zinc-600 font-mono font-bold mb-2.5 opacity-60 tracking-wider">{ann.date}</div>
                    <div className="text-[13px] font-bold text-zinc-400 group-hover:text-white leading-relaxed transition-colors line-clamp-2">
                      {ann.title}
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
