import React from 'react';
import { PriceCard } from './PriceCard';

interface PriceListProps {
  prices: {
    [key: string]: number | null;
  };
  connectionStatus: {
    [key: string]: boolean;
  };
  lastUpdated: {
    [key: string]: Date;
  };
}

export const PriceList: React.FC<PriceListProps> = ({ prices, connectionStatus, lastUpdated }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(prices).map(([exchange, price]) => (
        <PriceCard
          key={exchange}
          exchange={exchange}
          price={price}
          isConnected={connectionStatus[exchange] || false}
          lastUpdated={lastUpdated[exchange]}
        />
      ))}
    </div>
  );
}; 