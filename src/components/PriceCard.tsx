import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, CircleDot } from 'lucide-react';

type Timeout = ReturnType<typeof setTimeout>;

interface PriceCardProps {
  exchange: string;
  price: number | null;
  isConnected: boolean;
  lastUpdated?: Date;
}

export const PriceCard: React.FC<PriceCardProps> = ({ exchange, price, isConnected, lastUpdated }) => {
  const [priceChange, setPriceChange] = useState<'up' | 'down' | 'none'>('none');
  const previousPrice = useRef<number | null>(null);
  const changeTimeout = useRef<Timeout | null>(null);

  useEffect(() => {
    if (price !== null && previousPrice.current !== null) {
      if (price > previousPrice.current) {
        setPriceChange('up');
      } else if (price < previousPrice.current) {
        setPriceChange('down');
      }

      // Reset the indicator after 2 seconds
      if (changeTimeout.current) {
        clearTimeout(changeTimeout.current);
      }
      changeTimeout.current = setTimeout(() => {
        setPriceChange('none');
      }, 2000);
    }
    previousPrice.current = price;

    return () => {
      if (changeTimeout.current) {
        clearTimeout(changeTimeout.current);
      }
    };
  }, [price]);

  const getPriceIcon = () => {
    switch (priceChange) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <CircleDot className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white">
              {exchange.toUpperCase()}
            </h3>
            <div className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`} />
          </div>
          <div className="transition-all duration-300">
            {getPriceIcon()}
          </div>
        </div>
        
        <div className="space-y-2">
          <p className={`text-3xl font-bold text-white transition-colors duration-300 ${
            priceChange === 'up' ? 'text-green-400' : 
            priceChange === 'down' ? 'text-red-400' : 
            'text-white'
          }`}>
            {price 
              ? `$${price.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}` 
              : '---'
            }
          </p>
          
          {lastUpdated && (
            <p className="text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};