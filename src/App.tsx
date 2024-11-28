import { useState, useEffect } from 'react';
import { Bitcoin } from 'lucide-react';
import { PriceList } from './components/PriceList';
import { ArbitrageTable } from './components/ArbitrageTable';
import { useBitcoinPrices } from './hooks/useBitcoinPrices';
import { calculateArbitrageOpportunities } from './utils/arbitrage';

export const App = () => {
  const { prices, isLoading, isError } = useBitcoinPrices();
  const [connectionStatus, setConnectionStatus] = useState({
    binance: false,
    coinbase: false,
    kraken: false
  });

  const [lastUpdated, setLastUpdated] = useState<{[key: string]: Date}>({
    binance: new Date(),
    coinbase: new Date(),
    kraken: new Date()
  });

  const [formattedPrices, setFormattedPrices] = useState<{[key: string]: number | null}>({
    binance: null,
    coinbase: null,
    kraken: null
  });

  useEffect(() => {
    if (Array.isArray(prices)) {
      const newPrices: {[key: string]: number | null} = {};
      const newStatus: {[key: string]: boolean} = { ...connectionStatus };
      const newLastUpdated: {[key: string]: Date} = { ...lastUpdated };

      prices.forEach(price => {
        if (price && price.exchange) {
          newPrices[price.exchange.toLowerCase()] = price.price;
          newStatus[price.exchange.toLowerCase()] = !price.error;
          newLastUpdated[price.exchange.toLowerCase()] = new Date();
        }
      });
      setFormattedPrices(newPrices);
      setConnectionStatus({
        binance: newStatus.binance || false,
        coinbase: newStatus.coinbase || false,
        kraken: newStatus.kraken || false
      });
      setLastUpdated(newLastUpdated);
    }
  }, [prices]);

  const opportunities = calculateArbitrageOpportunities(prices || []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-700 border-t-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <Bitcoin className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-semibold text-center text-white mb-2">
              Unable to Load Price Data
            </h2>
            <p className="text-sm text-gray-300 text-center">
              The system will automatically retry loading the data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center">
            <Bitcoin className="w-8 h-8 text-yellow-500 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Bitcoin Arbitrage Dashboard
            </h1>
          </div>
        </header>

        <main className="space-y-8">
          <section className="bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                Current Prices
              </h2>
            </div>
            <div className="p-6">
              <PriceList 
                prices={formattedPrices}
                connectionStatus={connectionStatus}
                lastUpdated={lastUpdated}
              />
            </div>
          </section>

          <section className="bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                Arbitrage Opportunities
              </h2>
            </div>
            <div className="p-6">
              <ArbitrageTable 
                opportunities={opportunities}
                connectionStatus={connectionStatus}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;