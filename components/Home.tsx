
import React from 'react';

interface HomeProps {
  onTrade: () => void;
}

const Home: React.FC<HomeProps> = ({ onTrade }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-black px-6">
      <div className="max-w-4xl text-center">
        {/* Main Hero Header - Kept font-black as per user request */}
        <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          The Next Gen Exchange.
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
          Trade Bitcoin, Ethereum, and over 100+ cryptocurrencies with the lowest fees and the most advanced tools.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onTrade}
            className="px-10 py-5 bg-white text-black font-bold rounded-xl text-base hover:bg-gray-200 transition-all transform hover:scale-105"
          >
            Trade Now
          </button>
          <button className="px-10 py-5 bg-zinc-900 text-white font-bold rounded-xl text-base border border-gray-800 hover:bg-zinc-800 transition-all">
            Learn More
          </button>
        </div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 text-center border-t border-gray-900 pt-12">
          <div>
            <div className="text-3xl font-bold mb-1">$2.4B+</div>
            <div className="text-gray-500 text-sm font-semibold">24h Volume</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">0.1%</div>
            <div className="text-gray-500 text-sm font-semibold">Trading Fee</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">20M+</div>
            <div className="text-gray-500 text-sm font-semibold">Users Worldwide</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">100%</div>
            <div className="text-gray-500 text-sm font-semibold">Proof of Reserves</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
