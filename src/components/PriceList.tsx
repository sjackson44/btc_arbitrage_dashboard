import React from 'react';
import { useBitcoinPrices } from '../hooks/useBitcoinPrices';
import { PriceCard } from './PriceCard';
import { ExchangePrice } from '../types/exchange';

export const PriceList = () => {
  const { prices, isLoading, isError, error } = useBitcoinPrices();

  if (isLoading) {
    return <div className="text-center p-4">Loading prices...</div>;
  }

  if (isError) {
    return (
      <div className="text-center p-4 text-red-500">
        Error: {error?.message || 'Failed to fetch prices'}
      </div>
    );
  }

  if (!Array.isArray(prices) || prices.length === 0) {
    return <div className="text-center p-4">No prices available</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {prices.map((price, index) => (
        <PriceCard 
          key={price?.exchange || index} 
          price={price} 
        />
      ))}
    </div>
  );
}; 