
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useExchangeStore } from '../store';

const SimpleEarn: React.FC = () => {
  const { balances } = useExchangeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('All products');
  const [termFilter, setTermFilter] = useState('All terms');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // WebGL-like Particle Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 600;
      init();
    };

    const init = () => {
      particles = [];
      const count = Math.min(window.innerWidth / 10, 100);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 242, 255, 0.5)';
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.strokeStyle = `rgba(0, 242, 255, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
    <div className="bg-black min-h-screen text-white pb-32">
      {/* Hero Section */}
      <div className="relative pt-32 pb-48 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Canvas Animation Background */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        />
        
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-1000">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[1.05] bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Earn APR on your crypto <br />
            with Quilex Earn
          </h1>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Hold crypto, earn rewards, it's that simple. <br className="hidden md:block" />
            Make your crypto work for you.
          </p>

          <button className="px-12 py-5 bg-[#00f2ff] text-black font-black rounded-full text-lg hover:bg-cyan-300 transition-all shadow-[0_0_40px_rgba(0,242,255,0.4)] active:scale-95">
            Start Staking
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 border-y border-zinc-900 py-16">
          <div className="flex flex-col items-center md:border-r border-zinc-900">
            <div className="text-5xl font-black mb-2 tracking-tighter">1M+</div>
            <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Users Worldwide</div>
          </div>
          <div className="flex flex-col items-center md:border-r border-zinc-900 px-8">
            <div className="text-5xl font-black mb-2 tracking-tighter">24/7</div>
            <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest text-center">Customer Support</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-black mb-2 tracking-tighter">100K+</div>
            <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Five Star Ratings</div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-[1400px] mx-auto px-8 mt-24">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-6">
          <h2 className="text-4xl font-black tracking-tight">Products</h2>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative group">
              <button className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-3 hover:border-zinc-600 transition-all min-w-[160px]">
                {productFilter}
                <svg className="ml-auto w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>

            <div className="relative group">
              <button className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-3 hover:border-zinc-600 transition-all min-w-[160px]">
                {termFilter}
                <svg className="ml-auto w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>

            <div className="relative flex-1 md:flex-none md:w-[320px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search crypto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-[#0a0a0a] border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[12px] text-zinc-500 font-bold uppercase tracking-widest border-b border-zinc-900">
                <th className="px-10 py-6 font-bold">Token</th>
                <th className="px-10 py-6 font-bold">Market APY</th>
                <th className="px-10 py-6 font-bold">Term</th>
                <th className="px-10 py-6 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {earnProducts.length > 0 ? earnProducts.map((product) => (
                <tr key={product.symbol} className="hover:bg-zinc-900/40 transition-colors group cursor-pointer">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/5">
                         <img src={`https://assets.coincap.io/assets/icons/${product.symbol.toLowerCase()}@2x.png`} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-white">{product.symbol}</span>
                        <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-tight">{product.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-xl font-black text-white">{product.apy}%</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                       <span className="text-lg font-bold text-white">{product.term}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-6">
                      <button className="px-8 py-2.5 bg-white text-black text-sm font-black rounded-full hover:bg-zinc-200 transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0">
                        Subscribe
                      </button>
                      <svg className="w-5 h-5 text-zinc-600 transition-transform group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      </div>
                      <p className="text-zinc-500 font-bold tracking-tight">No products found for "{searchQuery}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-zinc-950 border border-zinc-900 p-10 rounded-[40px] flex flex-col justify-between group">
            <div>
              <h3 className="text-2xl font-black mb-4">Quilex Simple Earn</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                Simple Earn is a principal-protected product that provides flexible or fixed terms with daily rewards. Your assets are used to generate yield through institutional-grade DeFi and lending protocols.
              </p>
            </div>
            <button className="text-cyan-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
              Learn more about yield <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 p-10 rounded-[40px] flex flex-col justify-between group">
            <div>
              <h3 className="text-2xl font-black mb-4">Risk Protection</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                Your principal is always protected. Quilex uses advanced risk management frameworks to ensure that rewards are distributed consistently while maintaining 100% solvency of the Earn pool.
              </p>
            </div>
            <button className="text-cyan-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
              Review safety report <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEarn;
