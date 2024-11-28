import React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { ExchangePrice } from '../types/exchange';
import '../styles/PriceCard.css';

interface PriceCardProps {
  price: ExchangePrice;
}

export const PriceCard: React.FC<PriceCardProps> = ({ price }) => {
  console.log('PriceCard render:', { price });

  // Early return for invalid data
  if (!price || typeof price !== 'object') {
    console.error('Invalid price data received:', price);
    return (
      <div className="price-card error">
        <h2>Invalid Data</h2>
      </div>
    );
  }

  // Validate required fields
  const isValid = 
    typeof price.exchange === 'string' &&
    (typeof price.price === 'number' || price.price === null) &&
    typeof price.timestamp === 'string';

  if (!isValid) {
    console.error('Price object missing required fields:', price);
    return (
      <div className="price-card error">
        <h2>Invalid Price Data</h2>
      </div>
    );
  }

  const formattedPrice = price.price !== null 
    ? price.price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })
    : 'N/A';

  const getTimeAgo = () => {
    try {
      const timestamp = parseISO(price.timestamp);
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown time';
    }
  };

  return (
    <div className={`price-card ${price.error ? 'error' : ''}`}>
      <div className="card-header">
        <h2 className="text-lg sm:text-xl font-semibold">{price.exchange.toUpperCase()}</h2>
        {price.error ? (
          <AlertTriangle className="error-icon w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <TrendingUp className="trend-icon w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </div>
      <div className="price text-2xl sm:text-3xl">{formattedPrice}</div>
      <div className="timestamp text-sm text-gray-500">{getTimeAgo()}</div>
      {price.error && <div className="error-message mt-2">{price.error}</div>}
    </div>
  );
};