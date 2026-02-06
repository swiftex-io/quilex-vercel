import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useExchangeStore } from '../store';

declare global {
  interface Window {
    VANTA: any;
  }
}

const SimpleEarn: React.FC = () => {
  const { balances } = useExchangeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('All products');
  const [termFilter, setTermFilter] = useState('All terms');
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  // Vanta.js DOTS effect
  useEffect(() => {
    if (!vantaEffect && vantaRef.current && window.VANTA) {
      const effect = window.VANTA.DOTS({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0xd7ff20,
        color2: 0xf1ff20,
        size: 2.90,
        spacing: 28.00,
        backgroundColor: 0x000000
      });
      setVantaEffect(effect);
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  // Mock APY data mapped to balances
  const earnProducts = useMemo(() => {
    const assetsWithAPY = balances.filter(b => b.symbol !== 'USDT' && b.symbol !== 'USDC').map(asset => {
      // Deterministic mock APY
      let apy = 1.25;
      if (asset.symbol === 'BTC') apy = 0.03;
      if (asset.symbol === 'ETH') apy = 1.86;
      if (asset.symbol === 'SOL') apy = 7.42;
      if (asset.symbol === 'DOT') apy = 9.88;
      if (asset.symbol === 'ATOM') apy = 16.74;
      if (apy === 1.25) apy = 2.45 + (asset.symbol.charCodeAt(0) % 10);

      return {
        ...asset,
        apy: apy.toFixed(2),
        term: 'Flexible'
      };
    });

    return assetsWithAPY.filter(p => 
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [balances, searchQuery]);

  return (
    <div className="bg-black min-h-screen text-white pb-32 selection:bg-[#d7ff20]/20 font-sans">
      {/* Hero Section */}
      <div ref={vantaRef} className="relative pt-24 pb-36 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Background Overlay to ensure readability */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
        
        {/* Subtle Gradient for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#d7ff20]/10 via-transparent to-transparent blur-[120px] pointer-events-none opacity-40"></div>

        <div className="relative z-10 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-1000">
          <h1 className="text-6xl md:text-9xl font-black mb-2 tracking-tighter leading-[0.95] bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent uppercase">
            Quilex Earn
          </h1>
          <p className="text-xl md:text-2xl font-light text-[#d7ff20] mb-8 tracking-wide opacity-90">
            New user exclusive: Up to 600% APR
          </p>
          <p className="text-sm md:text-base text-zinc-500 mb-10 max-w-xl mx-auto font-normal leading-relaxed opacity-70">
            Hold crypto, earn rewards, it's that simple. <br className="hidden md:block" />
            Join the next generation of automated passive income.
          </p>

          <button className="px-10 py-3.5 bg-[#d7ff20] text-black font-semibold rounded-xl text-[11px] hover:bg-white transition-all shadow-[0_0_30px_rgba(215,255,32,0.15)] active:scale-95 uppercase tracking-[0.2em]">
            Start Staking
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 border-y border-zinc-900 py-12">
          <div className="flex flex-col items-center md:border-r border-zinc-900">
            <div className="text-3xl font-medium mb-1 tracking-tight">1M+</div>
            <div className="text-zinc-600 text-[9px] font-semibold uppercase tracking-[0.25em]">Users Worldwide</div>
          </div>
          <div className="flex flex-col items-center md:border-r border-zinc-900 px-8">
            <div className="text-3xl font-medium mb-1 tracking-tight">24/7</div>
            <div className="text-zinc-600 text-[9px] font-semibold uppercase tracking-[0.25em] text-center">Customer Support</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-medium mb-1 tracking-tight">100K+</div>
            <div className="text-zinc-600 text-[9px] font-semibold uppercase tracking-[0.25em]">Five Star Ratings</div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-[1400px] mx-auto px-8 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-6">
          <h2 className="text-xl font-medium tracking-tight">Products</h2>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button className="bg-zinc-900/40 border border-zinc-800 rounded-lg px-3.5 py-1.5 text-[11px] font-normal flex items-center gap-2 hover:border-zinc-700 transition-all min-w-[130px] text-zinc-400">
              {productFilter}
              <svg className="ml-auto w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <button className="bg-zinc-900/40 border border-zinc-800 rounded-lg px-3.5 py-1.5 text-[11px] font-normal flex items-center gap-2 hover:border-zinc-700 transition-all min-w-[130px] text-zinc-400">
              {termFilter}
              <svg className="ml-auto w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <div className="relative flex-1 md:flex-none md:w-[240px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search crypto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg py-1.5 pl-9 pr-3 text-[11px] font-normal focus:border-zinc-700 outline-none transition-all placeholder:text-zinc-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Products Table - Matches Markets.tsx style with thinner fonts */}
        <div className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] text-zinc-600 font-normal border-b border-zinc-900 tracking-tight">
                  <th className="px-8 py-3.5 font-normal">Token</th>
                  <th className="px-8 py-3.5 font-normal">Market APY</th>
                  <th className="px-8 py-3.5 font-normal">Term</th>
                  <th className="px-8 py-3.5 text-right font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {earnProducts.length > 0 ? earnProducts.map((product) => (
                  <tr key={product.symbol} className="hover:bg-zinc-900/20 transition-all group cursor-pointer">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/5">
                           <img src={`https://assets.coincap.io/assets/icons/${product.symbol.toLowerCase()}@2x.png`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-white group-hover:text-[#d7ff20] transition-colors">{product.symbol}</span>
                          <span className="text-[9px] text-zinc-600 font-normal uppercase tracking-tight">{product.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 font-mono">
                      <span className="text-[13px] font-normal text-[#00d18e]">{product.apy}%</span>
                    </td>
                    <td className="px-8 py-4">
                       <span className="text-[12px] text-zinc-500 font-normal">{product.term}</span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="px-3.5 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-[#d7ff20] transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 uppercase tracking-tighter">
                          Subscribe
                        </button>
                        <svg className="w-4 h-4 text-zinc-800 transition-colors group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center">
                      <p className="text-zinc-600 text-[11px] font-normal uppercase tracking-widest opacity-60">No products available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-xl flex flex-col justify-between group hover:border-zinc-800 transition-colors">
            <div>
              <h3 className="text-base font-medium mb-3 tracking-tight">Simple Earn Overview</h3>
              <p className="text-zinc-500 text-[12px] leading-relaxed mb-6 font-normal opacity-80">
                Simple Earn is a principal-protected product that provides flexible or fixed terms with daily rewards. Your assets are used to generate yield through institutional-grade DeFi and lending protocols.
              </p>
            </div>
            <button className="text-[#d7ff20] text-[10px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-all">
              Learn more about yield <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-xl flex flex-col justify-between group hover:border-zinc-800 transition-colors">
            <div>
              <h3 className="text-base font-medium mb-3 tracking-tight">Safety & Security</h3>
              <p className="text-zinc-500 text-[12px] leading-relaxed mb-6 font-normal opacity-80">
                Your principal is protected by Quilex. We use industry-standard risk management frameworks to ensure that rewards are distributed consistently while maintaining 100% solvency of the pool.
              </p>
            </div>
            <button className="text-[#d7ff20] text-[10px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-all">
              Review safety report <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEarn;
