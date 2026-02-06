
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
    // Sort assets so those with balance > 0 come first
    const sorted = [...balances].sort((a, b) => {
      const aVal = a.balance > 0 ? 1 : 0;
      const bVal = b.balance > 0 ? 1 : 0;
      return bVal - aVal;
    });

    return sorted.filter(asset => {
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

  const copyAddress = () => {
    navigator.clipboard.writeText('0x4813dca51ce7426d9ea6a0b212f758b7dbd4d313');
    alert('Address copied to clipboard!');
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

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-10 animate-in fade-in duration-500">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter mb-1">My Wallet</h1>
            <p className="text-gray-500 text-sm font-medium">Manage your funds across all accounts</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDepositFlow(true)} className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all shadow-lg text-xs uppercase tracking-widest">Deposit</button>
            <button className="px-6 py-3 bg-zinc-900 text-white font-medium rounded-xl border border-white/5 hover:bg-zinc-800 transition-all text-xs uppercase tracking-widest">Withdraw</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-10">
          <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-gray-500 font-medium text-[10px] uppercase tracking-widest mb-4"><span>Total Assets Value</span></div>
              <div className="flex flex-col sm:flex-row items-baseline gap-4 mb-8">
                <span className="text-5xl font-bold tracking-tighter">${totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-xl font-medium text-gray-500 tracking-tight">≈ {totalInBTC.toFixed(6)} BTC</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl overflow-hidden mb-10">
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
                {filteredBalances.map((asset) => {
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
                })}
              </tbody>
            </table>
          </div>
        </div>

        <TransactionHistoryTable />
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
