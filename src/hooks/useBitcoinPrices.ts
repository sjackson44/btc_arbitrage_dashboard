import useSWR from 'swr';
import { ExchangePrice } from '../types/exchange';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const fetchPrices = async (): Promise<ExchangePrice[]> => {
  const response = await fetch(`${API_BASE_URL}/api/prices/bitcoin`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  console.log('Raw API response:', data);
  return data;
};

export const useBitcoinPrices = () => {
  const { data, error, isValidating } = useSWR<ExchangePrice[]>(
    'bitcoin-prices',
    fetchPrices,
    {
      refreshInterval: API_CONFIG.REFRESH_INTERVAL,
      revalidateOnFocus: true,
      dedupingInterval: API_CONFIG.REFRESH_INTERVAL / 2,
      suspense: false,
      onSuccess: (data) => {
        console.log('SWR success:', data);
      },
      onError: (err) => {
        console.error('SWR error:', err);
      }
    }
  );

  if (error) {
    console.error('Hook error:', error);
  }

  if (data) {
    console.log('Hook data:', data);
  }

  return {
    prices: data || [],
    isLoading: !error && !data,
    isValidating,
    isError: !!error,
    error
  };
};