import { ExchangePrice } from '../types/exchange';
import { API_CONFIG } from '../config/api';

const handleResponse = async (response: Response, exchange: string): Promise<number | null> => {
  if (!response.ok) {
    throw new Error(`${exchange} API returned ${response.status}: ${response.statusText}`);
  }
  
  try {
    const data = await response.json();
    
    switch (exchange) {
      case 'Binance':
        return data.price ? parseFloat(data.price) : null;
      case 'Coinbase':
        // Handle both spot price and exchange rates endpoints
        if (data.data?.amount) {
          return parseFloat(data.data.amount);
        } else if (data.data?.rates?.USD) {
          return 1 / parseFloat(data.data.rates.USD);
        }
        return null;
      case 'Kraken':
        if (data.error && data.error.length > 0) {
          throw new Error(data.error[0]);
        }
        // Try both XXBTZUSD and XBT/USD pairs
        const price = data.result?.XXBTZUSD?.c?.[0] || data.result?.['XBT/USD']?.c?.[0];
        return price ? parseFloat(price) : null;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error parsing ${exchange} response:`, error);
    throw new Error(`Failed to parse ${exchange} response`);
  }
};

const fetchWithRetry = async (
  exchange: { name: string; url: string; fallbackUrl: string; headers: Record<string, string> },
  timeout: number
): Promise<number> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const fetchOptions = {
    headers: {
      ...exchange.headers,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    signal: controller.signal,
    mode: 'cors' as RequestMode
  };

  try {
    let lastError: Error | null = null;

    // Try primary URL
    try {
      const response = await fetch(exchange.url, fetchOptions);
      const price = await handleResponse(response, exchange.name);
      if (price !== null && price > 0 && !isNaN(price)) {
        return price;
      }
      throw new Error('Invalid price received');
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Primary endpoint failed for ${exchange.name}:`, lastError.message);
    }

    // Try fallback URL
    try {
      const fallbackResponse = await fetch(exchange.fallbackUrl, fetchOptions);
      const price = await handleResponse(fallbackResponse, exchange.name);
      if (price !== null && price > 0 && !isNaN(price)) {
        return price;
      }
      throw new Error('Invalid price received from fallback endpoint');
    } catch (error) {
      const newError = error instanceof Error ? error : new Error('Unknown error');
      throw new Error(`Both primary and fallback endpoints failed for ${exchange.name}. Primary: ${lastError?.message}, Fallback: ${newError.message}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

export const fetchExchangePrices = async (): Promise<ExchangePrice[]> => {
  const now = new Date();
  const prices: ExchangePrice[] = [];
  const errors: string[] = [];

  const exchanges = [
    {
      name: 'Binance',
      url: API_CONFIG.ENDPOINTS.BINANCE,
      fallbackUrl: API_CONFIG.FALLBACK_ENDPOINTS.BINANCE,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    },
    {
      name: 'Coinbase',
      url: API_CONFIG.ENDPOINTS.COINBASE,
      fallbackUrl: API_CONFIG.FALLBACK_ENDPOINTS.COINBASE,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    },
    {
      name: 'Kraken',
      url: API_CONFIG.ENDPOINTS.KRAKEN,
      fallbackUrl: API_CONFIG.FALLBACK_ENDPOINTS.KRAKEN,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }
  ];

  const results = await Promise.allSettled(
    exchanges.map(async (exchange) => {
      try {
        const price = await fetchWithRetry(exchange, API_CONFIG.TIMEOUT);
        return {
          exchange: exchange.name,
          price,
          lastUpdated: now
        };
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : error instanceof DOMException && error.name === 'AbortError'
            ? 'Request timeout'
            : 'Unknown error';
        errors.push(`${exchange.name}: ${errorMessage}`);
        throw error;
      }
    })
  );

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      prices.push(result.value);
    }
  });

  if (prices.length === 0) {
    throw new Error(`Failed to fetch prices: ${errors.join(', ')}`);
  }

  return prices;
};