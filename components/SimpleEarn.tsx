
import React from 'react';
import { useExchangeStore } from '../store';

const SimpleEarn: React.FC = () => {
  return (
    <div className="bg-black min-h-screen text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-24 pb-32 px-6 flex flex-col items-center text-center">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-600/20 via-blue-500/10 to-transparent blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[1.1]">
            Earn APR on your crypto <br />
            with Quilex Earn
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Hold crypto, earn rewards, it's that simple. <br className="hidden md:block" />
            Make your crypto work for you.
          </p>

          <button className="px-10 py-4 bg-[#00f2ff] text-black font-black rounded-full text-base hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(0,242,255,0.3)] active:scale-95 mb-24">
            Start Staking
          </button>

          {/* Mobile Mockup */}
          <div className="relative mx-auto w-[280px] h-[560px] md:w-[320px] md:h-[640px] bg-zinc-950 rounded-[48px] border-[8px] border-zinc-900 shadow-2xl overflow-hidden flex flex-col">
            {/* Status Bar */}
            <div className="h-10 flex items-center justify-between px-8 pt-4">
              <span className="text-[12px] font-bold">9:41</span>
              <div className="flex items-center gap-1.5">
                <svg width="14" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-12-18h24z"/></svg>
                <div className="w-5 h-2.5 rounded-sm border border-white/30 relative"><div className="absolute left-0.5 top-0.5 bottom-0.5 w-3 bg-white rounded-px"></div></div>
              </div>
            </div>

            <div className="p-6 flex flex-col h-full">
              <div className="mb-8 flex items-center justify-between">
                <button className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
              </div>

              {/* Solana Mock Info */}
              <div className="mb-10 text-left">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M0 16l3-3 18 3-3 3H0zm24-8l-3 3-18-3 3-3h18zM0 8l3-3 18 3-3 3H0z"/></svg>
                </div>
                <h2 className="text-2xl font-bold mb-1">Solana</h2>
                <div className="text-3xl font-black mb-1">$300.68</div>
                <div className="text-xs text-zinc-500 font-bold">1.959686 SOL</div>
              </div>

              {/* Staking Card */}
              <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">APR</span>
                  <span className="text-sm font-black text-white">5.5%</span>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase">Rewards <br /><span className="text-zinc-600">30-day</span></div>
                      <div className="text-right">
                        <div className="text-[11px] font-bold">0.001850 SOL</div>
                        <div className="text-[9px] text-zinc-600 font-bold">$0.29</div>
                      </div>
                   </div>
                   <div className="flex justify-between border-t border-white/5 pt-4">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase">Total Rewards</div>
                      <div className="text-[11px] font-bold">0.001850 SOL</div>
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto grid grid-cols-2 gap-3 mb-4">
                <button className="py-3 rounded-2xl bg-zinc-800 text-[11px] font-black uppercase tracking-wider">Unstake</button>
                <button className="py-3 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-wider">Stake</button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 mt-24 border-t border-zinc-900 pt-16 max-w-5xl mx-auto">
            <div className="flex flex-col items-center md:border-r border-zinc-900">
              <div className="text-4xl font-black mb-2 tracking-tighter">1M+</div>
              <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Users Worldwide</div>
            </div>
            <div className="flex flex-col items-center md:border-r border-zinc-900 px-8">
              <div className="text-4xl font-black mb-2 tracking-tighter">24/7</div>
              <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest text-center">Customer Support</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-black mb-2 tracking-tighter">100K+</div>
              <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Five Star Ratings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEarn;
