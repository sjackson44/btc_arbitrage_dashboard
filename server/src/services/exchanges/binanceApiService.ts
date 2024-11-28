import { BaseApiService } from './baseApiService.js';

export class BinanceApiService extends BaseApiService {
  private static readonly API_URL = 'https://api.binance.us/api/v3/ticker/price?symbol=BTCUSDT';
  private static readonly FALLBACK_URL = 'https://api2.binance.us/api/v3/ticker/price?symbol=BTCUSDT';

  public async fetchPrice(): Promise<number> {
    try {
      // Try primary endpoint
      const response = await BaseApiService.fetchWithRetry(
        BinanceApiService.API_URL,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        }
      );
      
      const data = await response.json();
      return this.parseTickerResponse(data);
    } catch (error) {
      console.warn('Primary Binance endpoint failed, trying fallback:', error);
      
      // Try fallback endpoint
      const response = await BaseApiService.fetchWithRetry(
        BinanceApiService.FALLBACK_URL,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        }
      );
      
      const data = await response.json();
      return this.parseTickerResponse(data);
    }
  }

  private parseTickerResponse(data: any): number {
    if (!data?.price || typeof data.price !== 'string') {
      throw new Error('Invalid Binance response format');
    }
    
    const price = parseFloat(data.price);
    if (isNaN(price) || price <= 0) {
      throw new Error(`Invalid Binance price value: ${data.price}`);
    }
    
    return price;
  }
} 