import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useExchangeStore } from '../store';

const DEFAULT_NETWORKS = [
  { id: 'bsc', name: 'BSC', fullName: 'BNB Smart Chain(BEP20)' },
  { id: 'eth', name: 'ETH', fullName: 'Ethereum(ERC20)' }
];

const ASSET_NETWORKS: Record<string, { id: string; name: string; fullName: string }[]> = {
  'USDT': [
    { id: 'bsc', name: 'BSC', fullName: 'BNB Smart Chain(BEP20)' },
    { id: 'eth', name: 'ETH', fullName: 'Ethereum(ERC20)' },
    { id: 'tron', name: 'TRX', fullName: 'Tron(TRC20)' },
    { id: 'sol', name: 'SOL', fullName: 'Solana' }
  ],
  'BTC': [
    { id: 'btc', name: 'BTC', fullName: 'Bitcoin' },
    { id: 'bsc', name: 'BSC', fullName: 'BNB Smart Chain(BEP20)' }
  ],
  'ETH': [
    { id: 'eth', name: 'ETH', fullName: 'Ethereum(ERC20)' },
    { id: 'arb', name: 'Arbitrum', fullName: 'Arbitrum One' },
    { id: 'opt', name: 'Optimism', fullName: 'OP Mainnet' }
  ],
  'TRX': [
    { id: 'tron', name: 'TRX', fullName: 'Tron(TRC20)' }
  ],
  'SOL': [
    { id: 'sol', name: 'SOL', fullName: 'Solana' }
  ],
  'BNB': [
    { id: 'bsc', name: 'BSC', fullName: 'BNB Smart Chain(BEP20)' }
  ]
};

const Assets: React.FC = () => {
  const { balances, deposit, isDepositModalOpen: showDepositFlow, setDepositModalOpen: setShowDepositFlow } = useExchangeStore();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<any>(null);
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  
  const [hideSmallBalances, setHideSmallBalances] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const totalBalanceUSD = balances.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);
  const btcPrice = balances.find(b => b.symbol === 'BTC')?.price || 65000;
  const totalInBTC = totalBalanceUSD / btcPrice;

  // Mock PNL data
  const pnlAmount = totalBalanceUSD * 0.0245; // 2.45% gain
  const pnlPercentage = 2.45;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAssetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset pagination when searching or filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [assetSearch, hideSmallBalances, activeTab]);

  const filteredBalances = useMemo(() => {
    // 1. Filter by search
    let result = balances.filter(asset => 
      asset.symbol.toLowerCase().includes(assetSearch.toLowerCase()) ||
      asset.name.toLowerCase().includes(assetSearch.toLowerCase())
    );

    // 2. Filter by small balance if enabled (threshold: 1 USD)
    if (hideSmallBalances) {
      result = result.filter(asset => (asset.balance * asset.price) >= 1);
    }

    // 3. Sort assets so those with balance > 0 come first
    return [...result].sort((a, b) => {
      const aVal = a.balance > 0 ? 1 : 0;
      const bVal = b.balance > 0 ? 1 : 0;
      return bVal - aVal;
    });
  }, [balances, hideSmallBalances, assetSearch]);

  // Derived pagination data
  const totalPages = Math.ceil(filteredBalances.length / itemsPerPage);
  const paginatedBalances = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBalances.slice(start, start + itemsPerPage);
  }, [filteredBalances, currentPage]);

  const handleFinishDeposit = async () => {
    await deposit(selectedAsset, 1000);
    setShowDepositFlow(false);
    setSelectedNetwork(null);
  };

  const renderCryptoIcon = (symbol: string, sizeClass: string = "w-9 h-9") => (
    <div className={`${sizeClass} rounded-xl bg-zinc-900 flex items-center justify-center font-bold text-[11px] text-gray-500 overflow-hidden relative`}>
      <img 
        src={`https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`} 
        alt={symbol}
        className="w-full h-full object-cover relative z-10"
        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
      />
    </div>
  );

  const TransactionHistoryTable = () => (
    <div className="bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl overflow-hidden p-8 mt-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold tracking-tight">Recent Transactions</h2>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-12 px-4 mb-4 text-[11px] font-medium text-gray-600 uppercase tracking-widest">
          <div className="col-span-3">Type</div>
          <div className="col-span-3">Amount</div>
          <div className="col-span-4">Time</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {[
          { id: '1', type: 'Deposit', asset: 'BNB', amount: '+0.000000001', time: '2026-02-03 10:26:38', status: 'Deposit successful' },
          { id: '2', type: 'Deposit', asset: 'BNB', amount: '+0.006', time: '2026-02-03 10:26:38', status: 'Deposit successful' },
        ].map((tx) => (
          <div key={tx.id} className="grid grid-cols-12 items-center px-4 py-5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group">
            <div className="col-span-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors overflow-hidden relative">
                <img 
                  src={`https://assets.coincap.io/assets/icons/${tx.asset.toLowerCase()}@2x.png`} 
                  alt={tx.asset}
                  className="w-full h-full object-cover relative z-10"
                  onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                />
                <span className="absolute z-0">↓</span>
              </div>
              <span className="text-sm font-semibold text-gray-200">{tx.type}</span>
            </div>
            <div className="col-span-3">
              <span className="text-sm font-semibold tracking-tight text-white font-mono">{tx.amount} {tx.asset}</span>
            </div>
            <div className="col-span-4">
              <span className="text-sm font-medium text-gray-400 font-mono tracking-tight group-hover:text-gray-300">{tx.time}</span>
            </div>
            <div className="col-span-2 flex justify-end items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
              <span className="text-[13px] font-semibold text-gray-200 tracking-tight whitespace-nowrap">{tx.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-6 mb-12">
        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          {/* Subtle gradient background for the card */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.015] blur-[100px] rounded-full -mr-40 -mt-40 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-gray-500 font-medium text-[10px] uppercase tracking-widest mb-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Total Assets Value</span>
              </div>
              <div className="flex flex-col sm:flex-row items-baseline gap-4 mb-4">
                <span className="text-2xl md:text-4xl font-medium tracking-tighter text-white">${totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-base md:text-lg font-medium text-zinc-500 tracking-tight">≈ {totalInBTC.toFixed(6)} BTC</span>
              </div>
              
              <div className="flex items-center gap-3 text-[13px] font-semibold">
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full">
                  <span className="text-zinc-500 font-medium">Today's PNL:</span>
                  <span className={`${pnlAmount >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'} flex items-center gap-1`}>
                    {pnlAmount >= 0 ? '+' : ''}${Math.abs(pnlAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-[11px] opacity-80">
                      ({pnlAmount >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => setShowDepositFlow(true)} 
                className="flex-1 md:flex-none px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] text-xs uppercase tracking-widest active:scale-95"
              >
                Deposit
              </button>
              <button 
                className="flex-1 md:flex-none px-8 py-3.5 bg-zinc-900 text-white font-bold rounded-xl border border-white/10 hover:bg-zinc-800 transition-all text-xs uppercase tracking-widest active:scale-95"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table Section */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight">My Assets</h2>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 ml-auto">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search coins"
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="bg-zinc-900 border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-[11px] font-medium w-36 focus:w-48 focus:border-white/20 outline-none transition-all placeholder:text-gray-600 text-white"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={hideSmallBalances}
                  onChange={(e) => setHideSmallBalances(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-3.5 h-3.5 border-2 border-zinc-700 rounded-sm peer-checked:bg-white peer-checked:border-white transition-all"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><path d="M5 13l4 4L19 7"/></svg>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-gray-500 group-hover:text-gray-300 transition-colors">Hide small balances</span>
            </label>

            <button className="text-[11px] font-semibold text-blue-500 hover:text-white transition-colors tracking-tight">
              Convert small amounts to USDC
            </button>
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] text-gray-600 font-medium uppercase tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-8 py-4">Asset</th>
                  <th className="px-8 py-4">Total Balance</th>
                  <th className="px-8 py-4">Available</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedBalances.length > 0 ? paginatedBalances.map((asset) => {
                  const hasBalance = asset.balance > 0;
                  return (
                    <tr 
                      key={asset.symbol} 
                      className={`transition-colors group ${hasBalance ? 'bg-zinc-900/40 hover:bg-zinc-800/50' : 'hover:bg-white/[0.02] opacity-60 hover:opacity-100'}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          {renderCryptoIcon(asset.symbol)}
                          <div>
                            <div className="font-semibold text-sm">{asset.symbol}</div>
                            <div className="text-[10px] text-gray-500 font-medium uppercase">{asset.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-xs font-medium">{asset.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                      <td className="px-8 py-5 font-mono text-xs text-white">${(asset.balance * asset.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-8 py-5 text-right"><button className="text-[10px] font-semibold text-blue-500 hover:text-white uppercase tracking-widest transition-colors">Trade</button></td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-gray-600 text-xs font-medium uppercase tracking-widest">
                      No assets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between">
              <div className="text-[11px] text-gray-500 font-medium">
                Showing <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredBalances.length)}</span> of <span className="text-white">{filteredBalances.length}</span> assets
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-zinc-900 text-gray-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] h-8 rounded-lg text-[11px] font-bold transition-all ${currentPage === page ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-zinc-900'}`}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-zinc-900 text-gray-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <TransactionHistoryTable />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/10 overflow-x-hidden">
      {/* Wallet Tab Navigation - Consistent with Settings and Markets */}
      <div className="bg-[#0a0a0a] border-b border-zinc-900 px-8 sticky top-0 z-[45] backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto flex gap-8 overflow-x-auto no-scrollbar">
          {['Overview', 'Spot', 'Fees', 'Earn'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap tracking-tight ${
                activeTab === tab 
                  ? 'border-white text-white' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-10">
        {activeTab === 'Overview' && renderOverview()}
        
        {/* Placeholder for other tabs */}
        {!['Overview'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-700">
             <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7-7-7M5 12h14"/></svg>
             </div>
             <h3 className="text-2xl font-bold mb-2">{activeTab}</h3>
             <p className="text-zinc-500 text-sm max-w-xs">This section is currently under development as part of the wallet infrastructure upgrade.</p>
          </div>
        )}
      </div>

      {showDepositFlow && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in slide-in-from-right duration-300">
          <header className="h-20 border-b border-white/5 flex items-center px-8 gap-6 justify-between shrink-0">
            <div className="flex items-center gap-6">
              <button onClick={() => setShowDepositFlow(false)} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-gray-400 hover:text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
              <h2 className="text-3xl font-bold tracking-tight">Deposit</h2>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 lg:px-16 py-16 custom-scrollbar">
               <div className="max-w-7xl mx-auto flex flex-col gap-16">
                 <div className="flex flex-col lg:flex-row gap-16">
                   <div className="flex-1 space-y-16">
                      <section>
                        <h3 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-3"><span className="hidden sm:inline text-zinc-500 text-sm">01</span> Select Crypto</h3>
                        <div className="relative" ref={dropdownRef}>
                          <div onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)} className={`bg-zinc-900/40 border rounded-xl p-6 flex items-center justify-between cursor-pointer transition-all group ${isAssetDropdownOpen ? 'border-white' : 'border-white/5 hover:border-white/20'}`}>
                            <div className="flex items-center gap-5">
                               {renderCryptoIcon(selectedAsset, "w-11 h-11")}
                               <div>
                                 <div className="text-base font-bold text-white">{selectedAsset}</div>
                                 <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Select Crypto</div>
                               </div>
                            </div>
                            <svg className={`w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-all ${isAssetDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        </div>
                      </section>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;