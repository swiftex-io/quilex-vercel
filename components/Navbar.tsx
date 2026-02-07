import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Page } from '../types';
import { useExchangeStore } from '../store';
import AuthModal from './AuthModal';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { balances, user, signOut, setDepositModalOpen, setMarketsActiveTab } = useExchangeStore();
  const [showAuth, setShowAuth] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isMarketsOpen, setIsMarketsOpen] = useState(false);
  const [isEarnNavOpen, setIsEarnNavOpen] = useState(false);
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedLang, setSelectedLang] = useState('English');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const totalBalanceUSD = balances.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);
  const btcPrice = balances.find(b => b.symbol === 'BTC')?.price || 65000;
  const totalInBTC = totalBalanceUSD / btcPrice;

  const maskedEmail = user?.email ? `${user.email.split('@')[0].slice(0, 3)}***@${user.email.split('@')[1]}` : 'guest@quilex.io';
  const displayUid = user?.id?.slice(0, 16) || '805418618808070350';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return balances.slice(0, 8);
    return balances.filter(asset => 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);
  }, [balances, searchQuery]);

  const dropdownBaseClass = "bg-white text-black rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.18)] overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200";
  const dropdownItemClass = "w-full flex items-center gap-3.5 px-5 py-3 hover:bg-gray-50 transition-all text-left group";
  const dropdownTextClass = "text-[13px] font-medium text-gray-800 group-hover:text-black tracking-tight"; 
  const dropdownIconClass = "text-gray-400 group-hover:text-black transition-colors shrink-0";

  return (
    <>
      <nav className="h-16 flex items-center px-6 bg-black z-[60] sticky top-0 shadow-2xl">
        <div className="flex items-center gap-2 mr-10 cursor-pointer group shrink-0" onClick={() => onNavigate(Page.HOME)}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black transition-all group-hover:bg-blue-500 shadow-sm">Q</div>
          <span className="text-xl font-bold tracking-tighter text-white">QUILEX</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium tracking-tight h-full">
          {/* Trade Dropdown */}
          <div className="relative h-full flex items-center" onMouseEnter={() => setIsTradeOpen(true)} onMouseLeave={() => setIsTradeOpen(false)}>
            <button onClick={() => onNavigate(Page.TRADE)} className={`transition-all hover:text-white flex items-center gap-1.5 h-full ${currentPage === Page.TRADE ? 'text-white' : 'text-gray-400'}`}>
              Trade <svg className={`w-3 h-3 transition-transform duration-300 ${isTradeOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className={`absolute top-full left-0 z-[100] dropdown-container ${isTradeOpen ? 'is-visible' : ''}`}>
              <div className={`${dropdownBaseClass} w-[380px] py-4 px-2`}>
                <button onClick={() => { onNavigate(Page.TRADE); setIsTradeOpen(false); }} className={`${dropdownItemClass} rounded-2xl`}>
                  <span className={dropdownIconClass}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9-9a9 9 0 0 0-9 9"/></svg></span>
                  <div>
                    <div className={dropdownTextClass}>Spot</div>
                    <p className="text-[11px] text-gray-400 font-medium">Standard trading with deep liquidity</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Markets Dropdown */}
          <div className="relative h-full flex items-center" onMouseEnter={() => setIsMarketsOpen(true)} onMouseLeave={() => setIsMarketsOpen(false)}>
            <button onClick={() => onNavigate(Page.MARKETS)} className={`transition-all hover:text-white flex items-center gap-1.5 h-full ${currentPage === Page.MARKETS ? 'text-white' : 'text-gray-400'}`}>
              Markets <svg className={`w-3 h-3 transition-transform duration-300 ${isMarketsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className={`absolute top-full left-0 z-[100] dropdown-container ${isMarketsOpen ? 'is-visible' : ''}`}>
              <div className={`${dropdownBaseClass} w-[300px] py-4 px-2`}>
                <button onClick={() => { setMarketsActiveTab('Markets Overview'); onNavigate(Page.MARKETS); setIsMarketsOpen(false); }} className={`${dropdownItemClass} rounded-2xl`}>
                  <span className={dropdownIconClass}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8l4 4-4 4"/></svg></span>
                  <div>
                    <div className={dropdownTextClass}>Markets Overview</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Earn Dropdown with Animated Badge */}
          <div className="relative h-full flex items-center" onMouseEnter={() => setIsEarnNavOpen(true)} onMouseLeave={() => setIsEarnNavOpen(false)}>
            <button onClick={() => onNavigate(Page.SIMPLE_EARN)} className={`transition-all hover:text-white flex items-center gap-1.5 h-full ${currentPage === Page.SIMPLE_EARN ? 'text-white' : 'text-gray-400'}`}>
              Earn
              <span className="ml-1 hidden xl:inline-block apr-badge-glow text-black text-[9px] font-bold px-2 py-0.5 rounded-full tracking-tighter whitespace-nowrap">Up to 58% APR</span>
              <svg className={`w-3 h-3 transition-transform duration-300 ${isEarnNavOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className={`absolute top-full left-0 z-[100] dropdown-container ${isEarnNavOpen ? 'is-visible' : ''}`}>
              <div className={`${dropdownBaseClass} w-[380px] py-4 px-2`}>
                <button onClick={() => { onNavigate(Page.SIMPLE_EARN); setIsEarnNavOpen(false); }} className={`${dropdownItemClass} rounded-2xl`}>
                  <span className={dropdownIconClass}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
                  <div>
                    <div className={dropdownTextClass}>Simple Earn</div>
                    <p className="text-[11px] text-gray-400 font-medium">Passive income with daily rewards</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <div className="flex items-center relative mr-2 group" ref={searchRef}>
            <button onClick={() => { setIsSearchOpen(!isSearchOpen); if (!isSearchOpen) setTimeout(() => inputRef.current?.focus(), 50); }} className="xl:absolute xl:left-3.5 xl:top-1/2 xl:-translate-y-1/2 p-2.5 rounded-xl text-gray-400 hover:text-white transition-colors z-10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <input 
              ref={inputRef} type="text" placeholder="Search crypto" value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
              className="hidden xl:block bg-zinc-800/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-medium w-32 focus:w-48 focus:bg-zinc-800 focus:border-white/20 outline-none transition-all placeholder:text-gray-500 text-white"
            />
            {/* Search Dropdown */}
            <div className={`absolute top-full right-0 xl:left-0 mt-2 z-[100] dropdown-container ${isSearchOpen ? 'is-visible' : ''}`}>
              <div className={`${dropdownBaseClass} w-[310px] py-4`}>
                <div className="px-5 pb-3 text-[13px] font-bold text-black tracking-tight">{searchQuery ? 'Results' : 'Popular'}</div>
                {searchResults.map((asset) => (
                  <button key={asset.symbol} onClick={() => { onNavigate(Page.TRADE); setIsSearchOpen(false); }} className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition-all group">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden"><img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} className="w-full h-full object-cover" alt="" /></div>
                      <span className="text-[13px] font-bold">{asset.symbol}</span>
                    </div>
                    <div className="text-right"><div className="text-[11px] font-mono font-bold">${asset.price.toFixed(2)}</div></div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {user ? (
            <>
              <button onClick={() => { onNavigate(Page.ASSETS); setDepositModalOpen(true); }} className="hidden lg:block px-5 py-2 bg-white text-black text-[11px] font-semibold rounded-xl hover:bg-gray-200 transition-all mr-3 shadow-md">Deposit</button>
              
              {/* Wallet Dropdown */}
              <div className="relative h-16 flex items-center" onMouseEnter={() => setIsWalletOpen(true)} onMouseLeave={() => setIsWalletOpen(false)}>
                <button onClick={() => onNavigate(Page.ASSETS)} className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 ${isWalletOpen ? 'text-white bg-zinc-800' : 'text-gray-400 hover:text-white'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
                </button>
                <div className={`absolute top-full right-0 z-[100] dropdown-container ${isWalletOpen ? 'is-visible' : ''}`}>
                  <div className={`${dropdownBaseClass} w-80 p-6`}>
                    <div className="mb-4">
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Balance</div>
                      <div className="text-2xl font-bold tracking-tighter">${totalBalanceUSD.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { onNavigate(Page.ASSETS); setDepositModalOpen(true); setIsWalletOpen(false); }} className="py-2 bg-black text-white text-[11px] font-bold rounded-xl hover:bg-zinc-800">Deposit</button>
                      <button onClick={() => { onNavigate(Page.ASSETS); setIsWalletOpen(false); }} className="py-2 bg-gray-100 text-black text-[11px] font-bold rounded-xl">Wallet</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Settings Dropdown */}
              <div className="relative h-16 flex items-center" onMouseEnter={() => setIsUserOpen(true)} onMouseLeave={() => setIsUserOpen(false)}>
                <button onClick={() => onNavigate(Page.SETTINGS)} className={`p-2.5 rounded-xl transition-all ${isUserOpen ? 'text-white bg-zinc-800' : 'text-gray-400 hover:text-white'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
                <div className={`absolute top-full right-0 z-[100] dropdown-container ${isUserOpen ? 'is-visible' : ''}`}>
                  <div className={`${dropdownBaseClass} w-[280px] py-4`}>
                    <div className="px-5 pb-4 border-b border-gray-50 mb-2">
                      <div className="text-sm font-bold truncate">{maskedEmail}</div>
                      <div className="text-[10px] text-gray-400">UID: {displayUid}</div>
                    </div>
                    <button onClick={() => { onNavigate(Page.SETTINGS); setIsUserOpen(false); }} className={dropdownItemClass}>
                      <span className={dropdownIconClass}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                      <span className={dropdownTextClass}>Security</span>
                    </button>
                    <button onClick={() => { signOut(); setIsUserOpen(false); }} className={`${dropdownItemClass} text-red-600`}>
                      <span className="text-red-400 group-hover:text-red-600"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
                      <span className="text-[13px] font-bold">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} className="px-6 py-2.5 bg-white text-black text-[11px] font-semibold rounded-xl hover:bg-gray-200 transition-all shadow-xl">Sign in</button>
          )}
        </div>
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Navbar;