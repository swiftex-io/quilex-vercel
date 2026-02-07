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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<any>(null);

  useEffect(() => {
    const initVanta = () => {
      if (!vantaEffectRef.current && vantaRef.current && window.VANTA) {
        vantaEffectRef.current = window.VANTA.DOTS({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xd7ff20,
          color2: 0x222222,
          size: 2.20,
          spacing: 35.00,
          showLines: false,
          backgroundColor: 0x000000
        });
      }
    };

    const destroyVanta = () => {
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          initVanta();
        } else {
          destroyVanta();
        }
      },
      { threshold: 0.05 }
    );

    if (vantaRef.current) observer.observe(vantaRef.current);

    return () => {
      observer.disconnect();
      destroyVanta();
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const earnProducts = useMemo(() => {
    const assetsWithAPY = balances.filter(b => b.symbol !== 'USDT' && b.symbol !== 'USDC').map(asset => {
      let apy = 1.25;
      if (asset.symbol === 'BTC') apy = 0.03;
      if (asset.symbol === 'ETH') apy = 1.86;
      if (asset.symbol === 'SOL') apy = 7.42;
      if (asset.symbol === 'DOT') apy = 9.88;
      if (asset.symbol === 'ATOM') apy = 16.74;
      if (apy === 1.25) apy = 2.45 + (asset.symbol.charCodeAt(0) % 10);

      const seed = asset.symbol.charCodeAt(0) + asset.symbol.charCodeAt(asset.symbol.length - 1);
      const lockedAmount = asset.price > 1000 ? (seed * 12.5) : (seed * 15420.5);
      const tvl = lockedAmount * asset.price;

      return {
        ...asset,
        apy: apy.toFixed(2),
        term: 'Flexible',
        lockedAmount: lockedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        tvl: tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })
      };
    });

    return assetsWithAPY.filter(p => 
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [balances, searchQuery]);

  const totalPages = Math.ceil(earnProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return earnProducts.slice(start, start + itemsPerPage);
  }, [earnProducts, currentPage]);

  return (
    <div className="bg-black min-h-screen text-white pb-32 selection:bg-[#d7ff20]/20 font-sans">
      <div ref={vantaRef} className="relative pt-24 pb-36 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#d7ff20]/10 via-transparent to-transparent blur-[120px] pointer-events-none opacity-40"></div>
        <div className="relative z-10 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-1000">
          <h1 className="text-4xl md:text-7xl font-black mb-3 tracking-tighter leading-none text-white">Quilex Earn</h1>
          <p className="text-lg md:text-xl font-light text-[#d7ff20] mb-8 tracking-wide opacity-90">New user exclusive: Up to 600% APR</p>
          <p className="text-sm md:text-base text-zinc-500 mb-10 max-w-xl mx-auto font-normal leading-relaxed opacity-70">
            Hold crypto, earn rewards, it's that simple. <br className="hidden md:block" />
            Join the next generation of passive income.
          </p>
          <button className="px-10 py-3.5 bg-[#d7ff20] text-black font-semibold rounded-xl text-[11px] hover:bg-white transition-all shadow-[0_0_30px_rgba(215,255,32,0.15)] active:scale-95 uppercase tracking-[0.2em]">Start Staking</button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 border-y border-zinc-900 py-12">
          <div className="flex flex-col items-center md:border-r border-zinc-900"><div className="text-3xl font-medium mb-1 tracking-tight">1M+</div><div className="text-zinc-600 text-[9px] font-semibold uppercase tracking-[0.25em]">Users Worldwide</div></div>
          <div className="flex flex-col items-center md:border-r border-zinc-900 px-8"><div className="text-3xl font-medium mb-1 tracking-tight">24/7</div><div className="text-zinc-600 text-[9px] font-semibold uppercase tracking-[0.25em] text-center">Support</div></div>
          <div className="flex flex-col items-center"><div className="text-3xl font-medium mb-1 tracking-tight">100K+</div><div className="text-zinc-600 text-[9px] font-semibold uppercase tracking-[0.25em]">Global Ratings</div></div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-6">
          <h2 className="text-xl font-medium tracking-tight">Yield Products</h2>
          <div className="relative flex-1 md:flex-none md:w-[240px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input type="text" placeholder="Search tokens" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg py-1.5 pl-9 pr-3 text-[11px] font-normal focus:border-zinc-700 outline-none transition-all text-white" />
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] text-zinc-600 font-normal border-b border-zinc-900 tracking-tight">
                  <th className="px-8 py-4">Token</th>
                  <th className="px-8 py-4">Market APY</th>
                  <th className="px-8 py-4 text-right">Total Locked</th>
                  <th className="px-8 py-4 text-right">TVL (USD)</th>
                  <th className="px-8 py-4 text-center">Term</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {paginatedProducts.length > 0 ? paginatedProducts.map((product) => (
                  <tr key={product.symbol} className="hover:bg-zinc-900/20 transition-all group cursor-pointer">
                    <td className="px-8 py-5">
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
                    <td className="px-8 py-5 font-mono text-[13px] text-[#00d18e]">{product.apy}%</td>
                    <td className="px-8 py-5 text-right font-mono text-[12px] text-zinc-300">{product.lockedAmount} {product.symbol}</td>
                    <td className="px-8 py-5 text-right font-mono text-[12px] text-zinc-500">${product.tvl}</td>
                    <td className="px-8 py-5 text-center text-[12px] text-zinc-500">{product.term}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="px-3.5 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-[#d7ff20] transition-all opacity-0 group-hover:opacity-100 uppercase tracking-tighter">Subscribe</button>
                        <svg className="w-4 h-4 text-zinc-800 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-zinc-600 text-[11px] uppercase">No results found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-zinc-950/20">
              <div className="text-[11px] text-zinc-500 font-medium">Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span></div>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white disabled:opacity-30"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg></button>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white disabled:opacity-30"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleEarn;