
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Page } from '../types';
import { useExchangeStore } from '../store';
import AuthModal from './AuthModal';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { balances, user, profile, signOut, isGuest, setDepositModalOpen } = useExchangeStore();
  const [showAuth, setShowAuth] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isMarketsOpen, setIsMarketsOpen] = useState(false);
  const [isEarnNavOpen, setIsEarnNavOpen] = useState(false);
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  
  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const [selectedLang, setSelectedLang] = useState('English');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const totalBalanceUSD = balances.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);
  const maskedEmail = user?.email ? `${user.email.split('@')[0].slice(0, 3)}***@${user.email.split('@')[1]}` : 'guest@quilex.io';
  const displayUid = user?.id?.slice(0, 16) || '805418618808070350';

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered results for search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show "Popular" (first 8 as mock popular)
      return balances.slice(0, 8);
    }
    return balances.filter(asset => 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);
  }, [balances, searchQuery]);

  // Standardized UI constants
  const dropdownBaseClass = "bg-white text-black rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.18)] overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200";
  const dropdownItemClass = "w-full flex items-center gap-3.5 px-5 py-3 hover:bg-gray-50 transition-all text-left group";
  const dropdownTextClass = "text-[13px] font-medium text-gray-800 group-hover:text-black tracking-tight"; 
  const dropdownIconClass = "text-gray-400 group-hover:text-black transition-colors shrink-0";

  const SearchDropdownContent = () => (
    <div className={`absolute top-full left-0 mt-2 z-[100] dropdown-container ${isSearchOpen ? 'is-visible' : ''}`}>
      <div className={`${dropdownBaseClass} w-[340px] py-6`}>
        <div className="px-6 pb-4 text-[15px] font-bold text-black tracking-tight">
          {searchQuery ? 'Search results' : 'Popular searches'}
        </div>
        <div className="space-y-1">
          {searchResults.map((asset, idx) => (
            <button 
              key={asset.symbol} 
              onClick={() => {
                onNavigate(Page.TRADE);
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="w-full flex items-center px-6 py-3 hover:bg-gray-50 transition-all group"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className={`text-[13px] font-bold w-4 ${idx < 3 && !searchQuery ? 'text-orange-500' : 'text-gray-300'}`}>
                  {idx + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-500 overflow-hidden">
                   {asset.symbol[0]}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-black">{asset.symbol}/USD</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-medium text-black">
                  {asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </div>
                <div className={`text-[11px] font-medium ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const MarketsDropdownContent = () => (
    <div className={`absolute top-full left-0 z-[100] dropdown-container ${isMarketsOpen ? 'is-visible' : ''}`}>
      <div className={`${dropdownBaseClass} w-[300px] py-4 px-2`}>
        <div className="space-y-1">
          {[
            { title: 'Markets Overview', desc: 'Prices and trends', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8l4 4-4 4"/></svg>, page: Page.MARKETS },
            { title: 'Market Data', desc: 'Real-time analytics', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>, page: Page.MARKETS }
          ].map((item, idx) => (
            <button key={idx} onClick={() => { onNavigate(item.page); setIsMarketsOpen(false); }} className={`${dropdownItemClass} rounded-2xl`}>
              <span className={dropdownIconClass}>{item.icon}</span>
              <div>
                <div className={dropdownTextClass}>{item.title}</div>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav className="h-16 flex items-center px-6 bg-black z-[60] sticky top-0 shadow-2xl">
        <div className="flex items-center gap-2 mr-10 cursor-pointer group" onClick={() => onNavigate(Page.HOME)}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black transition-all group-hover:bg-blue-500 shadow-sm">Q</div>
          <span className="text-xl font-bold tracking-tighter text-white">QUILEX</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium tracking-tight h-full">
          <div className="relative h-full flex items-center" onMouseEnter={() => setIsTradeOpen(true)} onMouseLeave={() => setIsTradeOpen(false)}>
            <button onClick={() => onNavigate(Page.TRADE)} className={`transition-all hover:text-white flex items-center gap-1.5 h-full ${currentPage === Page.TRADE ? 'text-white' : 'text-gray-400'}`}>
              Trade
              <svg className={`w-3 h-3 transition-transform duration-300 ${isTradeOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>

          <div className="relative h-full flex items-center" onMouseEnter={() => setIsMarketsOpen(true)} onMouseLeave={() => setIsMarketsOpen(false)}>
            <button onClick={() => onNavigate(Page.MARKETS)} className={`transition-all hover:text-white flex items-center gap-1.5 h-full ${currentPage === Page.MARKETS ? 'text-white' : 'text-gray-400'}`}>
              Markets
              <svg className={`w-3 h-3 transition-transform duration-300 ${isMarketsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <MarketsDropdownContent />
          </div>

          <button onClick={() => onNavigate(Page.REFERRAL)} className={`transition-all hover:text-white relative h-full flex items-center ${currentPage === Page.REFERRAL ? 'text-white' : 'text-gray-400'}`}>
            Referral
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <div className="hidden lg:flex items-center relative mr-4 group" ref={searchRef}>
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-focus-within:text-white transition-colors z-10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search coins" 
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              className="bg-zinc-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-medium w-32 focus:w-48 focus:bg-zinc-800 focus:border-transparent outline-none transition-all placeholder:text-gray-600 text-white shadow-inner relative z-[1]"
            />
            <SearchDropdownContent />
          </div>

          {user ? (
            <div className="relative h-16 flex items-center" onMouseEnter={() => setIsUserOpen(true)} onMouseLeave={() => setIsUserOpen(false)}>
              <button onClick={() => onNavigate(Page.SETTINGS)} className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${currentPage === Page.SETTINGS || isUserOpen ? 'text-white bg-zinc-800' : 'text-gray-400 hover:text-white hover:bg-zinc-800'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} className="px-6 py-2.5 bg-white text-black text-[11px] font-semibold tracking-tight rounded-xl hover:bg-gray-200 transition-all shadow-xl">Sign in</button>
          )}
        </div>
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Navbar;
