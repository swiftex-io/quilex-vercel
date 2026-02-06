
import React, { useState, useEffect, useRef } from 'react';
import { Page, LayoutType } from './types';
import Navbar from './components/Navbar';
import Home from './components/Home';
import SpotTrading from './components/SpotTrading';
import Assets from './components/Assets';
import Referral from './components/Referral';
import Settings from './components/Settings';
import Footer from './components/Footer';
import Markets from './components/Markets';
import SimpleEarn from './components/SimpleEarn';
import { useExchangeStore } from './store';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const { updatePrices, balances, initialize, isSyncing } = useExchangeStore();
  const balancesRef = useRef(balances);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    balancesRef.current = balances;
  }, [balances]);

  useEffect(() => {
    const simulatePrices = () => {
      const simulationMap: Record<string, number> = {};
      balancesRef.current.forEach(asset => {
        if (asset.symbol !== 'USDT') {
          const currentPrice = asset.price;
          const change = 1 + (Math.random() - 0.5) * 0.0004;
          simulationMap[`${asset.symbol}USDT`] = currentPrice * change;
        }
      });
      updatePrices(simulationMap);
    };

    const interval = setInterval(simulatePrices, 3000);
    return () => clearInterval(interval);
  }, [updatePrices]);

  // Determine layout based on page
  const getLayoutType = (page: Page): LayoutType => {
    if (page === Page.TRADE) return 'trading';
    return 'default';
  };

  const layout = getLayoutType(currentPage);
  const btcPrice = balances.find(b => b.symbol === 'BTC')?.price || 65432.50;

  const renderContent = () => {
    switch (currentPage) {
      case Page.HOME: return <Home onTrade={() => setCurrentPage(Page.TRADE)} />;
      case Page.MARKETS: return <Markets onTrade={() => setCurrentPage(Page.TRADE)} />;
      case Page.TRADE: return <SpotTrading />;
      case Page.ASSETS: return <Assets />;
      case Page.REFERRAL: return <Referral />;
      case Page.AFFILIATE: return <Referral isAffiliate />;
      case Page.SETTINGS: return <Settings />;
      case Page.SIMPLE_EARN: return <SimpleEarn />;
      default: return <Home onTrade={() => setCurrentPage(Page.TRADE)} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-blue-500/30">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className={`flex-1 ${layout === 'trading' ? 'overflow-hidden' : 'overflow-auto'}`}>
        {renderContent()}
      </main>

      {layout === 'default' && <Footer />}

      {/* Persistent Status Bar */}
      <div className="h-8 border-t border-zinc-900 flex items-center px-4 text-[10px] text-zinc-500 justify-between bg-black shrink-0 z-[70]">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-bold uppercase tracking-wider text-green-500/80">Systems Operational</span>
          </div>
          <div className="h-3 w-[1px] bg-zinc-800"></div>
          <div className="flex items-center gap-2">
            <span className="opacity-60 uppercase font-bold tracking-tight">BTC/USDT:</span>
            <span className="text-white font-mono">${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="flex gap-4 items-center font-mono opacity-50 uppercase tracking-tighter">
          <span>{isSyncing ? 'SYNC_ACTIVE' : 'STABLE_CORE_V2'}</span>
          <span>{new Date().toLocaleTimeString([], { hour12: false })}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
