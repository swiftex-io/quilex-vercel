import React, { useState, useEffect, useRef } from 'react';
import { Page, LayoutType, Notification } from './types';
import Navbar from './components/Navbar';
import Home from './components/Home';
import SpotTrading from './components/SpotTrading';
import Assets from './components/Assets';
import Referral from './components/Referral';
import Settings from './components/Settings';
import Footer from './components/Footer';
import Markets from './components/Markets';
import SimpleEarn from './components/SimpleEarn';
import SpotDCA from './components/SpotDCA';
import { useExchangeStore } from './store';

const NotificationToast: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 5000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, []);

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <div className="w-8 h-8 rounded-full bg-[#00d18e]/10 flex items-center justify-center text-[#00d18e]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m20 6-11 11-5-5"/></svg></div>;
      case 'info': return <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></div>;
      case 'warning': return <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 8v4M12 16h.01M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0z"/></svg></div>;
      default: return null;
    }
  };

  return (
    <div className="w-80 bg-[#0d0d0d] border border-zinc-800 rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-right duration-300">
      <div className="p-4 flex gap-4">
        {getIcon()}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="text-[13px] font-bold text-white">{notification.title}</h4>
            <button onClick={() => onDismiss(notification.id)} className="text-zinc-600 hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-relaxed">{notification.message}</p>
        </div>
      </div>
      <div className="h-0.5 bg-zinc-800 w-full relative">
        <div className="h-full bg-zinc-500 transition-all ease-linear" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const { updatePrices, balances, initialize, isSyncing, notifications, removeNotification } = useExchangeStore();
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
          const change = 1 + (Math.random() - 0.5) * 0.0008;
          simulationMap[`${asset.symbol}USDT`] = currentPrice * change;
        }
      });
      updatePrices(simulationMap);
    };

    const interval = setInterval(simulatePrices, 1000);
    return () => clearInterval(interval);
  }, [updatePrices]);

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
      case Page.SPOT_DCA: return <SpotDCA />;
      default: return <Home onTrade={() => setCurrentPage(Page.TRADE)} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-blue-500/30">
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

      {/* Notifications Overlay */}
      <div className="fixed top-20 right-6 z-[1000] flex flex-col gap-4 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <NotificationToast notification={n} onDismiss={removeNotification} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;