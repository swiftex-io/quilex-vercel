import React, { useState, useMemo, useEffect } from 'react';
import { useExchangeStore, TIER_DATA, ReferralTier } from '../store';

const Referral: React.FC = () => {
  const { referralCode, referralCount, referralVolume, earnings, getTier } = useExchangeStore();
  const currentTier = getTier();
  
  const tiers: ReferralTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const [calcRefs, setCalcRefs] = useState(10);
  const [calcVolume, setCalcVolume] = useState(5000);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    const activities = [
      'just made a $12k trade',
      'deposited 0.5 BTC',
      'joined the Gold tier',
      'unlocked a 50% fee discount',
      'earned $42.50 in commission'
    ];
    
    const interval = setInterval(() => {
      const id = Math.floor(Math.random() * 9000) + 1000;
      const username = `Ref_${id}`;
      const act = activities[Math.floor(Math.random() * activities.length)];
      setRecentEvents(prev => [{ user: username, action: act, time: 'Just now' }, ...prev].slice(0, 5));
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const estimatedProfit = useMemo(() => {
    const commission = TIER_DATA[currentTier].commission / 100;
    const feeRate = 0.001; 
    return calcRefs * calcVolume * feeRate * commission;
  }, [calcRefs, calcVolume, currentTier]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://quilex.io/ref/${referralCode}`);
    alert('Elite Invitation Link copied!');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/10">
      <div className="max-w-7xl mx-auto px-8 py-16">
        
        {/* Centralized High-Impact Header Dashboard */}
        <div className="flex flex-col items-center text-center mb-24 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg" style={{ backgroundColor: TIER_DATA[currentTier].color, color: '#000' }}>
              {currentTier} STATUS
            </span>
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Growth Engine v4.1</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
            Build Your <span className="text-white">Empire.</span>
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full max-w-5xl mt-8">
            <div className="flex flex-col items-center group cursor-default">
              <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-3 border-b border-zinc-800 pb-1 text-center w-32">Network Scale</span>
              <div className="text-5xl font-black tracking-tighter group-hover:text-blue-400 transition-colors">
                {referralCount}<span className="text-sm font-bold text-zinc-600 ml-1">REFS</span>
              </div>
            </div>
            <div className="flex flex-col items-center group cursor-default">
              <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-3 border-b border-zinc-800 pb-1 text-center w-32">Trade Volume</span>
              <div className="text-5xl font-black tracking-tighter group-hover:text-green-400 transition-colors">
                ${(referralVolume / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="flex flex-col items-center group cursor-default">
              <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-3 border-b border-zinc-800 pb-1 text-center w-32">Total Commission</span>
              <div className="text-5xl font-black tracking-tighter group-hover:text-white transition-colors">
                ${earnings.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Cards Grid */}
        <div className="mb-32 relative text-left">
          <div className="flex justify-between items-center mb-12">
            <div>
               <h2 className="text-3xl font-black tracking-tighter mb-2">Milestone Roadmap</h2>
               <p className="text-sm text-zinc-500 font-medium">Earn elite rewards by hitting network and volume benchmarks.</p>
            </div>
            
            {/* Multiplier with Tooltip */}
            <div className="flex items-center gap-3 bg-zinc-900/40 border border-white/5 px-6 py-3 rounded-2xl relative group/multiplier">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Multiplier</span>
              <span className="text-2xl font-black text-white">{TIER_DATA[currentTier].commission}%</span>
              
              <div className="relative cursor-help ml-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-500 hover:text-white transition-colors"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                
                {/* Custom Tooltip */}
                <div className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/multiplier:opacity-100 group-hover/multiplier:visible transition-all z-50 pointer-events-none">
                  <div className="text-[10px] font-black uppercase text-white mb-2 tracking-widest text-left">Earnings Multiplier</div>
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed text-left">
                    This percentage represents your direct share of the trading fees generated by your referred users. As you climb the levels, this multiplier amplifies your passive revenue significantly.
                  </p>
                  <div className="absolute top-full right-4 w-2 h-2 bg-zinc-900 border-r border-b border-white/10 rotate-45 -mt-1"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((t, index) => {
              const data = TIER_DATA[t];
              const isCompleted = referralCount >= data.requirement && referralVolume >= data.volRequirement;
              const isCurrent = currentTier === t;
              
              return (
                <div 
                  key={t}
                  className={`relative overflow-hidden rounded-3xl border transition-all duration-700 p-8 flex flex-col h-full group ${
                    isCurrent ? 'border-white/40 ring-1 ring-white/10' : 'border-white/5 hover:border-white/10'
                  } bg-[#080808]`}
                  style={{
                    background: `linear-gradient(90deg, ${data.color}25 0%, ${data.color}08 40%, transparent 100%)`
                  }}
                >
                  {/* Smooth Side Glow Overlay */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-[100px] pointer-events-none transition-opacity duration-700 opacity-30 group-hover:opacity-60"
                    style={{
                      background: `radial-gradient(circle at 0% 50%, ${data.color}40 0%, transparent 100%)`
                    }}
                  ></div>

                  {/* Decorative High-Contrast Side Flash */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-500 opacity-40 group-hover:opacity-100"
                    style={{ backgroundColor: data.color, boxShadow: `0 0 15px ${data.color}80` }}
                  ></div>

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div 
                      className={`text-5xl font-black tracking-tighter transition-all duration-500 ${isCurrent ? 'opacity-40 scale-110' : 'opacity-10 group-hover:opacity-20'}`}
                      style={{ color: data.color }}
                    >
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    {isCurrent && (
                      <span className="bg-white text-black px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl animate-pulse">
                        Active Rank
                      </span>
                    )}
                  </div>

                  <div className="flex-1 relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-40">Tier Rank</div>
                    <div className="text-3xl font-black mb-6 tracking-tight text-white group-hover:translate-x-1 transition-transform duration-500">{t}</div>
                    
                    <div className="mb-8">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-40">Monthly Projection</div>
                      <div className="text-4xl font-black tracking-tighter text-white">
                        {data.avgEarn}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5 relative z-10">
                    <div className={`flex items-center justify-between text-[11px] font-bold transition-colors ${referralCount >= data.requirement ? 'text-green-400' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                      <span className="uppercase tracking-wider">Active Refs</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{data.requirement}+</span>
                        {referralCount >= data.requirement && (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-black">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center justify-between text-[11px] font-bold transition-colors ${referralVolume >= data.volRequirement ? 'text-green-400' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                      <span className="uppercase tracking-wider">Network Vol</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">${(data.volRequirement / 1000).toFixed(0)}k+</span>
                        {referralVolume >= data.volRequirement && (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-black">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Matrix & Calculator (Row 1: 3:2 Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          
          <div className="lg:col-span-3 bg-[#0d0d0d] border border-white/5 rounded-2xl p-10 shadow-2xl relative overflow-hidden text-left">
            <h3 className="text-2xl font-black mb-10 tracking-tight">Status Perks Matrix</h3>
            <div className="space-y-4">
              {tiers.map((t) => (
                <div key={t} className={`flex items-center justify-between p-6 rounded-xl border transition-all ${currentTier === t ? 'bg-white/5 border-white/20' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                  <div className="flex items-center gap-6">
                    <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: TIER_DATA[t].color }}></div>
                    <div>
                      <div className="text-lg font-black">{t} Rank</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {TIER_DATA[t].perks.map(p => (
                          <span key={p} className="text-[9px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md uppercase">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-10 text-right">
                    <div>
                      <div className="text-[10px] font-black text-zinc-600 uppercase mb-1">Fee Disc.</div>
                      <div className="text-xl font-bold">{TIER_DATA[t].feeDiscount}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-zinc-600 uppercase mb-1">Earn Boost</div>
                      <div className="text-xl font-bold text-green-400">+{TIER_DATA[t].aprBoost}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-zinc-950 border border-white/5 rounded-2xl p-10 flex flex-col justify-between group overflow-hidden relative text-left">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div>
              <h3 className="text-2xl font-black mb-8 tracking-tight">Revenue Simulator</h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-[11px] font-black uppercase text-zinc-500 mb-3">
                    <span>Active Referrals</span>
                    <span className="text-white">{calcRefs}</span>
                  </div>
                  <input 
                    type="range" min="1" max="500" value={calcRefs} 
                    onChange={(e) => setCalcRefs(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-black uppercase text-zinc-500 mb-3">
                    <span>Avg Monthly Vol.</span>
                    <span className="text-white">${calcVolume.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="1000" max="100000" step="1000" value={calcVolume} 
                    onChange={(e) => setCalcVolume(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 bg-zinc-900/40 rounded-xl border border-white/5 relative overflow-hidden">
               <div className="relative z-10">
                 <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Estimated passive income</div>
                 <div className="text-5xl font-black tracking-tighter text-green-400">
                   ${estimatedProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                   <span className="text-xs text-zinc-600 font-bold ml-1 uppercase">/mo</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Row 2: 3:2 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 bg-[#0d0d0d] border border-white/5 p-8 rounded-2xl shadow-2xl relative overflow-hidden text-left">
             <div className="relative z-10">
                <h2 className="text-2xl font-black mb-2 tracking-tighter">Ready to Expand?</h2>
                <p className="text-zinc-500 font-medium mb-8 max-w-sm text-[13px]">Your elite invitation link tracks everything from first click to thousandth trade.</p>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                   <div className="flex-1 bg-black border border-white/10 rounded-xl py-2 px-4 flex items-center justify-between group hover:border-white/20 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-600 uppercase mb-0.5">Lifetime Link</span>
                        <span className="font-mono text-[13px] text-zinc-300 group-hover:text-white">quilex.io/ref/{referralCode}</span>
                      </div>
                      <button 
                        onClick={copyToClipboard} 
                        className="p-1.5 bg-white text-black rounded-lg hover:bg-zinc-100 transition-all flex items-center justify-center active:scale-95"
                        title="Copy Invitation Link"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      </button>
                   </div>
                   <button className="px-5 py-2.5 bg-zinc-100 text-black font-black rounded-xl hover:bg-white transition-all uppercase tracking-widest text-[10px] shrink-0">
                     Generate QR
                   </button>
                </div>

                <div className="flex flex-wrap gap-2">
                   {['Twitter', 'Telegram', 'WhatsApp'].map(plat => (
                     <button key={plat} className="px-3 py-2 bg-zinc-900 border border-white/5 rounded-lg text-[9px] font-bold hover:bg-zinc-800 transition-all uppercase tracking-widest text-zinc-500 hover:text-white">
                       {plat}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/5 rounded-2xl p-8 text-left">
             <h3 className="text-lg font-black mb-6 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               Recent Activity
             </h3>
             <div className="space-y-2">
                {recentEvents.length > 0 ? recentEvents.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ev.user}`} 
                          alt="avatar" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <div className="text-[13px] font-black">{ev.user}</div>
                        <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight">{ev.action}</div>
                      </div>
                    </div>
                    <span className="text-[8px] font-black text-zinc-700 uppercase">{ev.time}</span>
                  </div>
                )) : (
                  <div className="py-12 text-center text-zinc-700 text-[10px] font-bold uppercase tracking-widest">Scanning network activity...</div>
                )}
             </div>
             <button className="w-full mt-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-600 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5">
               View Full Dashboard
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Referral;