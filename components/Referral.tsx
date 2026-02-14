import React, { useState, useMemo, useEffect } from 'react';
import { useExchangeStore, TIER_DATA, ReferralTier } from '../store';

interface ReferralProps {
  isAffiliate?: boolean;
}

const Referral: React.FC<ReferralProps> = ({ isAffiliate }) => {
  const { referralCode, referralCount, earnings, getTier } = useExchangeStore();
  const currentTier = getTier();
  const nextTier: ReferralTier | null = 
    currentTier === 'Bronze' ? 'Silver' : 
    currentTier === 'Silver' ? 'Gold' : 
    currentTier === 'Gold' ? 'Platinum' : null;

  const [calcRefs, setCalcRefs] = useState(10);
  const [calcVolume, setCalcVolume] = useState(5000);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  // Simulate live activity ticker
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
      const act = activities[Math.floor(Math.random() * activities.length)];
      setRecentEvents(prev => [{ user: `Ref_${id}`, action: act, time: 'Just now' }, ...prev].slice(0, 5));
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const estimatedProfit = useMemo(() => {
    const commission = TIER_DATA[currentTier].commission / 100;
    const feeRate = 0.001; // 0.1%
    return calcRefs * calcVolume * feeRate * commission;
  }, [calcRefs, calcVolume, currentTier]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://quilex.io/ref/${referralCode}`);
    alert('Elite Invitation Link copied!');
  };

  const tierProgress = useMemo(() => {
    const tiers: ReferralTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentIndex = tiers.indexOf(currentTier);
    const totalTiers = tiers.length;

    if (!nextTier) return 100;

    // Base percentage for the current tier marker
    const baseProgress = (currentIndex / (totalTiers - 1)) * 100;
    
    // Requirements for math
    const currentReq = TIER_DATA[currentTier].requirement;
    const nextReq = TIER_DATA[nextTier].requirement;
    
    // The width of one segment between markers
    const tierStepWidth = 100 / (totalTiers - 1);
    
    // Fractional progress within the current segment
    const progressInTier = (referralCount - currentReq) / (nextReq - currentReq);
    
    return baseProgress + (progressInTier * tierStepWidth);
  }, [referralCount, currentTier, nextTier]);

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${currentTier === 'Platinum' ? 'bg-[#050505]' : 'bg-black'} text-white selection:bg-purple-500/30`}>
      <div className="max-w-7xl mx-auto px-8 py-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg`} style={{ backgroundColor: TIER_DATA[currentTier].color, color: '#000' }}>
                {currentTier} STATUS UNLOCKED
              </span>
              <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Growth Engine v2.4</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6">
              Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">Empire.</span>
            </h1>
            <p className="text-xl text-zinc-400 font-medium leading-relaxed">
              Don't just trade. Host the market. Invite your network to Quilex and earn a lifetime of passive income while climbing the elite ranks.
            </p>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-xl min-w-[320px] text-left">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Earnings Multiplier</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black text-white">{TIER_DATA[currentTier].commission}%</span>
              <span className="text-zinc-500 font-bold">Commission</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000" style={{ width: `${(TIER_DATA[currentTier].commission / 45) * 100}%` }}></div>
            </div>
            <p className="text-[11px] text-zinc-500 font-bold">You are currently in the Top 5% of earners.</p>
          </div>
        </div>

        {/* Milestone Tracker */}
        <div className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black tracking-tight">Milestone Roadmap</h2>
            {nextTier && (
              <span className="text-sm font-bold text-zinc-500">
                <span className="text-white">{TIER_DATA[nextTier].requirement - referralCount}</span> more invites to reach <span className="text-white">{nextTier}</span>
              </span>
            )}
          </div>
          <div className="relative pt-10 pb-4">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-900 -translate-y-1/2 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out" style={{ width: `${tierProgress}%` }}></div>
            </div>
            <div className="flex justify-between relative z-10">
              {(Object.keys(TIER_DATA) as ReferralTier[]).map((t) => {
                const isCompleted = referralCount >= TIER_DATA[t].requirement;
                const isCurrent = currentTier === t;
                return (
                  <div key={t} className="flex flex-col items-center group">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all border-4 ${
                      isCompleted ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-110' : 'bg-zinc-900 text-zinc-600 border-zinc-800 grayscale'
                    }`}>
                      {isCompleted ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m5 13 4 4L19 7"/></svg>
                      ) : (
                        <span className="font-black text-sm">{TIER_DATA[t].requirement}+</span>
                      )}
                    </div>
                    <span className={`mt-4 text-[11px] font-black uppercase tracking-widest ${isCurrent ? 'text-white' : 'text-zinc-500'}`}>{t}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Matrix & Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          
          {/* Benefit Matrix */}
          <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/5 rounded-2xl p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <svg width="60" height="60" className="text-white/5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21 16-4-4 4-4"/><path d="M17 12H3"/><path d="m7 20-4-4 4-4"/></svg>
            </div>
            <h3 className="text-2xl font-black mb-10 tracking-tight">Status Perks Matrix</h3>
            <div className="space-y-4">
              {(Object.keys(TIER_DATA) as ReferralTier[]).map((t) => (
                <div key={t} className={`flex items-center justify-between p-6 rounded-xl border transition-all ${currentTier === t ? 'bg-white/5 border-white/20' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                  <div className="flex items-center gap-6">
                    <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: TIER_DATA[t].color }}></div>
                    <div>
                      <div className="text-lg font-black">{t} Rank</div>
                      <div className="flex gap-2 mt-1">
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

          {/* Profit Calculator */}
          <div className="bg-zinc-950 border border-white/5 rounded-2xl p-10 flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                 <div className="text-5xl font-black tracking-tighter text-green-400 animate-pulse">
                   ${estimatedProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                   <span className="text-xs text-zinc-600 font-bold ml-1 uppercase">/mo</span>
                 </div>
               </div>
               <div className="absolute -bottom-4 -right-4 text-white/5">
                 <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
               </div>
            </div>
          </div>
        </div>

        {/* Invitation Center */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 bg-[#0d0d0d] border border-white/5 p-12 rounded-2xl shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="text-4xl font-black mb-4 tracking-tighter">Ready to Expand?</h2>
                <p className="text-zinc-500 font-medium mb-12 max-w-lg">Your elite invitation link tracks everything from first click to thousandth trade.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                   <div className="flex-1 bg-black border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-white/40 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-zinc-600 uppercase mb-1">Lifetime Link</span>
                        <span className="font-mono text-lg text-zinc-300 group-hover:text-white">quilex.io/ref/{referralCode}</span>
                      </div>
                      <button 
                        onClick={copyToClipboard} 
                        className="p-2.5 bg-white text-black rounded-lg hover:bg-zinc-100 transition-all flex items-center justify-center active:scale-95"
                        title="Copy Invitation Link"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      </button>
                   </div>
                   <button className="px-10 py-5 bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-black rounded-xl hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all uppercase tracking-widest text-xs">
                     Generate QR
                   </button>
                </div>

                <div className="flex flex-wrap gap-3">
                   {['Twitter', 'Telegram', 'WhatsApp', 'Facebook'].map(plat => (
                     <button key={plat} className="px-6 py-3 bg-zinc-900 border border-white/5 rounded-lg text-[11px] font-bold hover:bg-zinc-800 transition-all uppercase tracking-widest text-zinc-400 hover:text-white">
                       {plat}
                     </button>
                   ))}
                </div>
             </div>
             
             {/* Abstract design elements */}
             <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
             <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>
          </div>

          <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/5 rounded-2xl p-10">
             <h3 className="text-xl font-black mb-8 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               Recent Activity
             </h3>
             <div className="space-y-3">
                {recentEvents.length > 0 ? recentEvents.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-black/40 rounded-xl border border-white/5 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center font-black text-[10px] text-zinc-500">REF</div>
                      <div>
                        <div className="text-sm font-black">{ev.user}</div>
                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">{ev.action}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-zinc-700 uppercase">{ev.time}</span>
                  </div>
                )) : (
                  <div className="py-20 text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">Scanning network activity...</div>
                )}
             </div>
             <button className="w-full mt-10 py-5 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">
               View Full Dashboard
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Referral;