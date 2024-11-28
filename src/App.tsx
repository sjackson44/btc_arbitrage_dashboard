import React from 'react';
import { Bitcoin } from 'lucide-react';
import { useBitcoinPrices } from './hooks/useBitcoinPrices';
import { calculateArbitrageOpportunities } from './utils/arbitrage';
import { ArbitrageTable } from './components/ArbitrageTable';
import { PriceList } from './components/PriceList';

function App() {
  const { prices, isLoading, isError, error } = useBitcoinPrices();
  const arbitrageOpportunities = calculateArbitrageOpportunities(prices);

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="h-full flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <Bitcoin className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-semibold text-center text-white mb-2">
              Unable to Load Price Data
            </h2>
            <p className="text-sm text-gray-300 text-center mb-4">
              {error?.message || 'An error occurred while fetching prices'}
            </p>
            <p className="text-xs text-gray-400 text-center">
              The system will automatically retry loading the data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center">
            <Bitcoin className="w-8 h-8 text-yellow-500 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Bitcoin Arbitrage Dashboard
            </h1>
          </div>
        </header>

        <main className="space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-700 border-t-blue-400"></div>
            </div>
          ) : (
            <>
              <section className="bg-gray-800 rounded-xl shadow-lg">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">
                    Current Prices
                  </h2>
                </div>
                <div className="p-6">
                  <PriceList />
                </div>
              </section>
              
              <section className="bg-gray-800 rounded-xl shadow-lg">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">
                    Arbitrage Opportunities
                  </h2>
                </div>
                <div className="p-6">
                  <ArbitrageTable opportunities={arbitrageOpportunities} />
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;