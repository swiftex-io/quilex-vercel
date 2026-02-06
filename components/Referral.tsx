
import React, { useState } from 'react';
import { useExchangeStore } from '../store';

interface ReferralProps {
  isAffiliate?: boolean;
}

const Referral: React.FC<ReferralProps> = ({ isAffiliate }) => {
  const { referralCode, referralCount, earnings } = useExchangeStore();
  const [commissionSplit, setCommissionSplit] = useState(80); // 80% to user, 20% to friend

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://quilex.io/ref/${referralCode}`);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="mb-14">
        <h1 className="text-5xl font-black mb-4 tracking-tight">
          {isAffiliate ? 'Partnership Hub' : 'Referral Center'}
        </h1>
        <p className="text-gray-400 max-w-3xl text-lg font-medium leading-relaxed">
          {isAffiliate 
            ? 'Access institutional-grade tools to grow your community. Track conversions, manage API keys, and optimize your commission structures.'
            : 'Grow the Quilex ecosystem. Invite friends and earn passive income from every trade they make, forever.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-950 border border-gray-800 p-8 rounded-2xl shadow-xl hover:border-gray-700 transition-colors">
          <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Commission Earned</div>
          <div className="text-4xl font-black mb-4 text-green-500">${earnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <button className="text-xs font-black text-blue-400 hover:text-blue-300 uppercase tracking-wider">Withdraw Earnings</button>
        </div>
        <div className="bg-zinc-950 border border-gray-800 p-8 rounded-2xl shadow-xl hover:border-gray-700 transition-colors">
          <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Active Referrals</div>
          <div className="text-4xl font-black mb-4">{referralCount}</div>
          <div className="text-[10px] font-bold text-gray-500 bg-zinc-900 w-fit px-2 py-1 rounded-md uppercase tracking-tighter">+12 THIS MONTH</div>
        </div>
        <div className="bg-zinc-950 border border-gray-800 p-8 rounded-2xl shadow-xl hover:border-gray-700 transition-colors">
          <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Partner Tier Status</div>
          <div className="text-4xl font-black mb-4 text-purple-400">{isAffiliate ? 'Platinum' : 'Standard'}</div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-4">
             <div className="bg-purple-500 h-full w-[65%]"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-zinc-950 border border-gray-800 p-10 rounded-2xl shadow-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black mb-2">Share the future.</h2>
            <p className="text-gray-500 text-sm mb-8">Personalize your invitation link and distribute it across your network.</p>
            
            <div className="bg-zinc-900 p-6 rounded-2xl flex items-center justify-between mb-8 border border-white/5 group">
              <div>
                <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Your Referral Link</div>
                <span className="font-mono text-lg text-gray-200 group-hover:text-white transition-colors">quilex.io/ref/{referralCode}</span>
              </div>
              <button 
                onClick={copyToClipboard}
                className="bg-white text-black px-6 py-3 rounded-xl text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Copy
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4">
               <button className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-black transition-all border border-gray-800">Twitter (X)</button>
               <button className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-black transition-all border border-gray-800">Telegram</button>
               <button className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-black transition-all border border-gray-800">Reddit</button>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-gray-900">
             <div className="flex justify-between items-center mb-6">
                <span className="font-black text-xl">Commission Rebate</span>
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Dynamic Mode</span>
             </div>
             
             <input 
               type="range" 
               min="0" 
               max="100" 
               value={commissionSplit} 
               onChange={(e) => setCommissionSplit(parseInt(e.target.value))}
               className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-white mb-6"
             />

             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-gray-800">
                   <div className="text-[10px] font-black text-gray-500 uppercase mb-1">You Receive</div>
                   <div className="text-2xl font-black">{commissionSplit}%</div>
                </div>
                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-gray-800">
                   <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Friend Receives</div>
                   <div className="text-2xl font-black">{100 - commissionSplit}%</div>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-zinc-950 border border-gray-800 p-10 rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-black mb-8">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between p-5 bg-zinc-900/30 rounded-2xl border border-gray-900/50 hover:bg-zinc-900 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-tr from-zinc-800 to-zinc-700 rounded-2xl flex items-center justify-center text-xs font-black shadow-inner">ID</div>
                  <div>
                    <div className="text-sm font-black">QuilexUser_{8000 + i * 23}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Verified • LVL 1</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-green-500">+${(Math.random() * 50).toFixed(2)}</div>
                  <div className="text-[10px] text-gray-500 font-bold">REBATE</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 text-xs font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
            Export History (.CSV)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Referral;
