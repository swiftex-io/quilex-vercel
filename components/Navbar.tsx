
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Page } from '../types';
import { useExchangeStore } from '../store';
import AuthModal from './AuthModal';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { balances, user, signOut } = useExchangeStore();
  const [showAuth, setShowAuth] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Zatvaranje search-a na klik van njega
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
    if (!searchQuery.trim()) return balances.slice(0, 5);
    return balances.filter(asset => 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);
  }, [balances, searchQuery]);

  const navLinkClass = (page: Page) => `
    h-full px-2 text-[14px] font-medium transition-all hover:text-white relative flex items-center
    ${currentPage === page ? 'text-white' : 'text-zinc-400'}
  `;

  return (
    <>
      <nav className="h-16 flex items-center px-6 bg-black border-b border-zinc-900 z-[60] sticky top-0">
        {/* LEVA STRANA: Logo i Primarni Linkovi */}
        <div className="flex items-center h-full">
          <div 
            className="flex items-center gap-2 mr-10 cursor-pointer group shrink-0" 
            onClick={() => onNavigate(Page.HOME)}
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black group-hover:bg-blue-500 transition-colors">Q</div>
            <span className="text-xl font-bold tracking-tighter text-white">QUILEX</span>
          </div>

          <div className="hidden md:flex items-center gap-8 h-full">
            <button onClick={() => onNavigate(Page.TRADE)} className={navLinkClass(Page.TRADE)}>
              Trade
            </button>
            <button onClick={() => onNavigate(Page.MARKETS)} className={navLinkClass(Page.MARKETS)}>
              Markets
            </button>
            <button onClick={() => onNavigate(Page.REFERRAL)} className={navLinkClass(Page.REFERRAL)}>
              Referral
            </button>
          </div>
        </div>

        {/* DESNA STRANA: Search i Profil/Auth */}
        <div className="ml-auto flex items-center gap-6 h-full">
          {/* Search Bar */}
          <div className="hidden lg:flex items-center relative group" ref={searchRef}>
            <div className="absolute left-3 text-zinc-500 group-focus-within:text-white transition-colors pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 pl-9 pr-4 text-[12px] w-40 focus:w-60 focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-600 text-white"
            />
            
            {isSearchOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                  {searchQuery ? 'Search results' : 'Hot assets'}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map(asset => (
                    <button 
                      key={asset.symbol}
                      onClick={() => { onNavigate(Page.TRADE); setIsSearchOpen(false); }}
                      className="w-full flex items-center justify-between p-3 hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">{asset.symbol[0]}</div>
                        <span className="text-sm font-bold text-white">{asset.symbol}/USDT</span>
                      </div>
                      <span className={`text-xs font-mono font-bold ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate(Page.ASSETS)}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Assets"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M12 10v4M2 10h20"/></svg>
              </button>
              <button 
                onClick={() => onNavigate(Page.SETTINGS)}
                className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold hover:border-white transition-all overflow-hidden"
              >
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="avatar" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAuth(true)}
                className="text-[14px] font-medium text-zinc-400 hover:text-white"
              >
                Log in
              </button>
              <button 
                onClick={() => setShowAuth(true)}
                className="bg-white text-black px-4 py-1.5 rounded-lg text-[14px] font-bold hover:bg-zinc-200 transition-all"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Navbar;
