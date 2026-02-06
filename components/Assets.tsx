
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
  
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<any>(null);
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  
  const [hideZero, setHideZero] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'funding' | 'trading'>('all');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const totalBalanceUSD = balances.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);
  const btcPrice = balances.find(b => b.symbol === 'BTC')?.price || 65000;
  const totalInBTC = totalBalanceUSD / btcPrice;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAssetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBalances = useMemo(() => {
    return balances.filter(asset => {
      if (hideZero && asset.balance <= 0) return false;
      return true;
    });
  }, [balances, hideZero]);

  const searchableAssets = useMemo(() => {
    return balances.filter(asset => 
      asset.symbol.toLowerCase().includes(assetSearch.toLowerCase()) || 
      asset.name.toLowerCase().includes(assetSearch.toLowerCase())
    );
  }, [balances, assetSearch]);

  const handleFinishDeposit = async () => {
    await deposit(selectedAsset, 1000);
    setShowDepositFlow(false);
    setSelectedNetwork(null);
  };

  const transactionHistory = [
    { id: '1', type: 'Deposit', asset: 'BNB', amount: '+0.000000001', time: '2026-02-03 10:26:38', status: 'Deposit successful' },
    { id: '2', type: 'Deposit', asset: 'BNB', amount: '+0.006', time: '2026-02-03 10:26:38', status: 'Deposit successful' },
    { id: '3', type: 'Deposit', asset: 'BNB', amount: '+0.000000001', time: '2026-02-03 10:17:45', status: 'Deposit successful' },
    { id: '4', type: 'Deposit', asset: 'BNB', amount: '+0.012', time: '2026-02-03 10:17:39', status: 'Deposit successful' },
  ];

  const currentAssetDetails = balances.find(b => b.symbol === selectedAsset);

  const copyAddress = () => {
    navigator.clipboard.writeText('0x4813dca51ce7426d9ea6a0b212f758b7dbd4d313');
    alert('Address copied to clipboard!');
  };

  const TransactionHistoryTable = () => (
    <div className="bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl overflow-hidden p-8">
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

        {transactionHistory.map((tx) => (
          <div 
            key={tx.id} 
            className="grid grid-cols-12 items-center px-4 py-5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group"
          >
            <div className="col-span-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                   <path d="M12 17V7M7 12l5 5 5-5M17 17H7"/>
                </svg>
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

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-10 animate-in fade-in duration-500">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter mb-1">My Wallet</h1>
            <p className="text-gray-500 text-sm font-medium">Manage your funds across all accounts</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowDepositFlow(true)}
              className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all shadow-lg text-xs uppercase tracking-widest"
            >
              Deposit
            </button>
            <button className="px-6 py-3 bg-zinc-900 text-white font-medium rounded-xl border border-white/5 hover:bg-zinc-800 transition-all text-xs uppercase tracking-widest">
              Withdraw
            </button>
            <button className="px-6 py-3 bg-zinc-900 text-white font-medium rounded-xl border border-white/5 hover:bg-zinc-800 transition-all text-xs uppercase tracking-widest">
              Transfer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-10">
          <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-gray-500 font-medium text-[10px] uppercase tracking-widest mb-4">
                <span>Total Assets Value</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-baseline gap-4 mb-8">
                <span className="text-5xl font-bold tracking-tighter">
                  ${totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xl font-medium text-gray-500 tracking-tight">
                  ≈ {totalInBTC.toFixed(6)} BTC
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/5 pt-8">
                <div>
                  <div className="text-[10px] text-gray-600 font-medium uppercase tracking-widest mb-1">24h PnL</div>
                  <div className="text-sm font-semibold text-green-500">+$245.20 (+1.2%)</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-600 font-medium uppercase tracking-widest mb-1">Funding Account</div>
                  <div className="text-sm font-semibold text-white">${(totalBalanceUSD * 0.4).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-600 font-medium uppercase tracking-widest mb-1">Trading Account</div>
                  <div className="text-sm font-semibold text-white">${(totalBalanceUSD * 0.6).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-600 font-medium uppercase tracking-widest mb-1">Frozen in Orders</div>
                  <div className="text-sm font-semibold text-gray-500">$0.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assets List Section */}
        <div className="bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl overflow-hidden mb-10">
          <div className="px-8 py-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/20">
            <div className="flex gap-6">
              {['All Accounts', 'Funding', 'Trading'].map(label => (
                <button 
                  key={label}
                  onClick={() => setActiveTab(label.toLowerCase() as any)}
                  className={`text-xs font-semibold uppercase tracking-widest pb-1 border-b-2 transition-all ${
                    activeTab === label.toLowerCase() ? 'border-white text-white' : 'border-transparent text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

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
                {filteredBalances.map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center font-bold text-[11px] text-gray-500 group-hover:bg-white group-hover:text-black transition-all">
                          {asset.symbol[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{asset.symbol}</div>
                          <div className="text-[10px] text-gray-500 font-medium uppercase">{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-mono text-xs font-medium">{asset.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                    <td className="px-8 py-5 font-mono text-xs text-white">${(asset.balance * asset.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-[10px] font-semibold text-blue-500 hover:text-white uppercase tracking-widest transition-colors">Trade</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TransactionHistoryTable />
      </div>

      {/* CONTINUOUS DEPOSIT FLOW */}
      {showDepositFlow && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in slide-in-from-right duration-300">
          <header className="h-20 border-b border-white/5 flex items-center px-8 gap-6 justify-between shrink-0">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setShowDepositFlow(false)}
                className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-gray-400 hover:text-white"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
              <h2 className="text-3xl font-bold tracking-tight">Deposit</h2>
            </div>
            <button className="px-4 py-2 bg-blue-900/30 text-blue-400 rounded-full text-xs font-semibold flex items-center gap-2 border border-blue-500/20 hover:bg-blue-900/50 transition-all">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
               Deposit Guide
            </button>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* Timeline Guide */}
            <div className="hidden md:flex w-24 lg:w-32 flex-col items-center pt-16 relative border-r border-white/5">
               <div className="absolute top-16 bottom-16 w-[1.5px] bg-zinc-800 left-1/2 -translate-x-1/2"></div>
               {[1, 2, 3].map(step => (
                 <div key={step} className="relative z-10 flex flex-col items-center mb-40 last:mb-0">
                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                      (step === 1 || (step === 2 && selectedAsset) || (step === 3 && selectedNetwork)) ? 'bg-white border-white text-black shadow-xl' : 'bg-black border-zinc-800 text-zinc-600'
                    }`}>
                      <span className="text-sm font-bold">{step}</span>
                    </div>
                 </div>
               ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-8 lg:px-16 py-16 custom-scrollbar">
               <div className="max-w-7xl mx-auto flex flex-col gap-16">
                 
                 <div className="flex flex-col lg:flex-row gap-16">
                   <div className="flex-1 space-y-16">
                      {/* Step 1: Select Crypto */}
                      <section>
                        <h3 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-3">
                          <span className="hidden sm:inline text-zinc-500 text-sm">01</span> Select Crypto
                        </h3>
                        <div className="relative" ref={dropdownRef}>
                          <div 
                            onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
                            className={`bg-zinc-900/40 border rounded-xl p-6 flex items-center justify-between cursor-pointer transition-all group ${isAssetDropdownOpen ? 'border-white' : 'border-white/5 hover:border-white/20'}`}
                          >
                            <div className="flex items-center gap-5">
                               <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg">{selectedAsset[0]}</div>
                               <div>
                                 <div className="text-base font-bold text-white">{selectedAsset}</div>
                                 <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{currentAssetDetails?.name || 'Crypto'}</div>
                               </div>
                            </div>
                            <svg className={`w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-all ${isAssetDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                          </div>

                          {isAssetDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                               <div className="relative mb-4">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                 </div>
                                 <input 
                                   type="text" 
                                   autoFocus
                                   placeholder="Search for a coin..." 
                                   value={assetSearch}
                                   onChange={(e) => setAssetSearch(e.target.value)}
                                   className="w-full bg-zinc-900 border-none rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-1 focus:ring-white outline-none"
                                 />
                               </div>
                               <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
                                  {searchableAssets.map(asset => (
                                    <button 
                                      key={asset.symbol}
                                      onClick={() => {
                                        setSelectedAsset(asset.symbol);
                                        setSelectedNetwork(null);
                                        setIsAssetDropdownOpen(false);
                                        setAssetSearch('');
                                      }}
                                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                                    >
                                      <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs">{asset.symbol[0]}</div>
                                         <div>
                                           <div className="text-sm font-bold text-white">{asset.symbol}</div>
                                           <div className="text-[10px] text-zinc-500 font-medium">{asset.name}</div>
                                         </div>
                                      </div>
                                      {selectedAsset === asset.symbol && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-blue-500"><path d="M20 6L9 17l-5-5"/></svg>
                                      )}
                                    </button>
                                  ))}
                                  {searchableAssets.length === 0 && (
                                    <div className="py-10 text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">No assets found</div>
                                  )}
                               </div>
                            </div>
                          )}
                        </div>
                      </section>

                      {/* Step 2: Network */}
                      <section>
                        <h3 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-3">
                          <span className="hidden sm:inline text-zinc-500 text-sm">02</span> Network
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(ASSET_NETWORKS[selectedAsset] || DEFAULT_NETWORKS).map((net) => (
                            <button 
                              key={net.id}
                              onClick={() => setSelectedNetwork(net)}
                              className={`text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                                selectedNetwork?.id === net.id ? 'bg-white/5 border-white/20' : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700'
                              }`}
                            >
                              <div>
                                <div className="text-sm font-bold mb-0.5 text-white">{net.name}</div>
                                <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-wide">{net.fullName}</div>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedNetwork?.id === net.id ? 'border-white bg-white text-black' : 'border-zinc-800'
                              }`}>
                                {selectedNetwork?.id === net.id && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>}
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* Step 3: Address */}
                      <section className={`transition-all duration-500 ${selectedNetwork ? 'opacity-100 scale-100' : 'opacity-30 pointer-events-none'}`}>
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-xl font-bold tracking-tight flex items-center gap-3">
                             <span className="hidden sm:inline text-zinc-500 text-sm">03</span> Deposit Address
                          </h3>
                        </div>

                        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 lg:p-12 mb-8 shadow-2xl">
                          <div className="flex flex-col lg:flex-row gap-12 items-center">
                            <div className="w-44 h-44 bg-white p-3 rounded-xl shrink-0">
                               <div className="w-full h-full border-2 border-black relative p-2">
                                  <div className="grid grid-cols-5 grid-rows-5 gap-1 w-full h-full">
                                     {Array.from({length: 25}).map((_, i) => (
                                       <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-black' : 'bg-transparent'}`}></div>
                                     ))}
                                  </div>
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-lg flex items-center justify-center border border-white/20">
                                     <span className="text-white text-[10px] font-black">{selectedAsset[0]}</span>
                                  </div>
                               </div>
                            </div>

                            <div className="flex-1 w-full">
                              <div className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest mb-3">{selectedNetwork?.fullName || 'Select Network'} Address</div>
                              <div className="relative mb-8 group">
                                 <div className="flex-1 p-5 pr-14 bg-zinc-900 rounded-2xl border border-white/5 font-mono text-sm break-all font-semibold tracking-tight text-white shadow-inner">
                                   0x4813dca51ce7426d9ea6a0b212f758b7dbd4d313
                                 </div>
                                 <button 
                                   onClick={copyAddress}
                                   className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-zinc-500 hover:text-white transition-colors bg-zinc-800 rounded-lg hover:bg-zinc-700 active:scale-95"
                                   title="Copy Address"
                                 >
                                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                 </button>
                              </div>

                              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                                 <div>
                                   <span className="text-[9px] text-zinc-600 font-medium uppercase tracking-widest block mb-1">Minimum Deposit</span>
                                   <span className="text-sm font-semibold text-white">0.001 {selectedAsset}</span>
                                 </div>
                                 <div>
                                   <span className="text-[9px] text-zinc-600 font-medium uppercase tracking-widest block mb-1">Deposit Account</span>
                                   <button className="text-sm font-semibold text-white flex items-center gap-2 hover:text-blue-400 transition-colors">
                                     Spot <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 21l-4-4m0 0l4-4m-4 4h18M17 3l4 4m0 0l-4 4m4-4H3"/></svg>
                                   </button>
                                 </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                   </div>

                   {/* Right Column: Tips & Sidebar */}
                   <div className="w-full lg:w-[360px] space-y-6">
                      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8">
                         <h4 className="text-lg font-bold mb-6 tracking-tight">Tips</h4>
                         <ul className="space-y-6">
                            <li className="flex gap-4">
                               <span className="text-zinc-500 shrink-0 mt-1.5">•</span>
                               <p className="text-[11px] font-medium text-zinc-400 leading-relaxed">
                                  Quilex does not support users receiving airdrops. To avoid potential asset loss, please do not use your Quilex deposit address to receive airdrops or as a mining address.
                               </p>
                            </li>
                            <li className="flex gap-4">
                               <span className="text-zinc-500 shrink-0 mt-1.5">•</span>
                               <p className="text-[11px] font-medium text-zinc-400 leading-relaxed">
                                  This address only supports deposit of <span className="text-white">{selectedAsset}</span> assets. Do not deposit other assets to this address as they will not be recoverable.
                               </p>
                            </li>
                            <li className="flex gap-4">
                               <span className="text-zinc-500 shrink-0 mt-1.5">•</span>
                               <p className="text-[11px] font-medium text-zinc-400 leading-relaxed">
                                  Please note: If the single deposit amount is less than the minimum deposit amount, it will not be credited.
                               </p>
                            </li>
                            <li className="flex gap-4">
                               <span className="text-zinc-500 shrink-0 mt-1.5">•</span>
                               <p className="text-[11px] font-medium text-zinc-400 leading-relaxed">
                                  Do not trade with high-risk platforms. <button className="text-blue-400 font-semibold hover:underline">Learn More</button>
                               </p>
                            </li>
                         </ul>
                      </div>

                      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8">
                         <div className="flex justify-between items-center mb-6">
                            <h4 className="text-base font-bold tracking-tight">Deposit FAQ</h4>
                            <button className="text-[10px] text-zinc-500 font-bold flex items-center gap-1">View More <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></button>
                         </div>
                         <ul className="space-y-5">
                            {['How to Deposit on Quilex?', 'Have an uncredited deposit? Apply for return', 'View all deposit & withdrawal status'].map((faq, i) => (
                              <li key={i} className="group cursor-pointer">
                                 <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">{faq}</span>
                              </li>
                            ))}
                         </ul>
                      </div>

                      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 hover:bg-zinc-900 transition-all cursor-pointer group flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors">
                               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20M7 15h.01M11 15h2"/></svg>
                            </div>
                            <div>
                               <h5 className="text-sm font-bold text-white mb-0.5">Buy Crypto</h5>
                               <p className="text-[10px] text-zinc-500 font-medium max-w-[180px]">Supports Visa, Mastercard, PayPal and more.</p>
                            </div>
                         </div>
                         <svg className="w-4 h-4 text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                   </div>
                 </div>

                 {/* BOTTOM HISTORY SECTION */}
                 <div className="mt-8 border-t border-white/5 pt-16 pb-16">
                   <TransactionHistoryTable />
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
