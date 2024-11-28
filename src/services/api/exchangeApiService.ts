import { BaseApiService } from './baseApiService';
import { API_CONFIG } from '../../config/api';
import { RateLimiter } from '../utils/rateLimiter';
import { BinanceApiService } from './binanceApiService';

export class ExchangeApiService extends BaseApiService {
  private static rateLimiters: { [key: string]: RateLimiter } = {
    BINANCE: new RateLimiter(
      API_CONFIG.RATE_LIMITS.BINANCE.WEIGHT_LIMIT,
      API_CONFIG.RATE_LIMITS.BINANCE.WINDOW_MS
    ),
    COINBASE: new RateLimiter(
      API_CONFIG.RATE_LIMITS.COINBASE.REQUEST_LIMIT,
      API_CONFIG.RATE_LIMITS.COINBASE.WINDOW_MS
    ),
    KRAKEN: new RateLimiter(
      API_CONFIG.RATE_LIMITS.KRAKEN.TIER_1_LIMIT,
      API_CONFIG.RATE_LIMITS.KRAKEN.WINDOW_MS
    )
  };

  public static async fetchPrice(exchange: string): Promise<number> {
    const rateLimiter = this.rateLimiters[exchange];
    if (!rateLimiter.canMakeRequest()) {
      throw new Error(`Rate limit exceeded for ${exchange}`);
    }

    try {
      let price: number;
      
      switch (exchange) {
        case 'BINANCE':
          price = await BinanceApiService.fetchPrice();
          break;
        case 'COINBASE':
          price = await this.fetchCoinbasePrice();
          break;
        case 'KRAKEN':
          price = await this.fetchKrakenPrice();
          break;
        default:
          throw new Error(`Unsupported exchange: ${exchange}`);
      }

      rateLimiter.incrementRequests();
      return price;
    } catch (error) {
      throw error;
    }
  }

  private static async fetchCoinbasePrice(): Promise<number> {
    try {
      const response = await this.fetchWithRetry(
        API_CONFIG.ENDPOINTS.COINBASE.PRIMARY,
        {
          headers: API_CONFIG.HEADERS.COINBASE,
          mode: 'cors'
        }
      );
      const data = await response.json();
      
      if (!data?.data?.amount) {
        throw new Error('Invalid Coinbase response format');
      }
      
      const price = parseFloat(data.data.amount);
      if (isNaN(price) || price <= 0) {
        throw new Error('Invalid price data from Coinbase');
      }
      
      return price;
    } catch (error) {
      throw new Error(`Error fetching COINBASE price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async fetchKrakenPrice(): Promise<number> {
    try {
      const response = await this.fetchWithRetry(
        API_CONFIG.ENDPOINTS.KRAKEN.PRIMARY,
        {
          headers: API_CONFIG.HEADERS.KRAKEN,
          mode: 'cors'
        }
      );
      const data = await response.json();
      
      if (data.error?.length > 0) {
        throw new Error(`Kraken API error: ${data.error[0]}`);
      }

      const result = data.result;
      const price = parseFloat(result?.XXBTZUSD?.c?.[0]);

      if (!price || isNaN(price) || price <= 0) {
        throw new Error('Invalid price data from Kraken');
      }

      return price;
    } catch (error) {
      throw new Error(`Error fetching KRAKEN price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}