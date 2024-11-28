import { BaseApiService } from './baseApiService';
import { API_CONFIG } from '../../config/api';

export class BinanceApiService extends BaseApiService {
  public static async fetchPrice(): Promise<number> {
    try {
      // Try primary endpoint
      const response = await this.fetchWithRetry(
        API_CONFIG.ENDPOINTS.BINANCE.PRIMARY,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        }
      );
      
      const data = await response.json();
      console.log('Binance.US raw response:', data); // Add logging to see raw response
      return this.parseTickerResponse(data);
    } catch (error) {
      console.error('Primary Binance endpoint failed:', error);
      
      // Try fallback endpoint
      try {
        const response = await this.fetchWithRetry(
          'https://api.binance.us/api/v3/ticker/24hr?symbol=BTCUSD', // Use 24hr ticker endpoint instead
          {
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          }
        );
        
        const data = await response.json();
        console.log('Binance.US 24hr ticker response:', data);
        return parseFloat(data.lastPrice); // Use lastPrice from 24hr ticker
      } catch (fallbackError) {
        console.error('Fallback Binance endpoint failed:', fallbackError);
        throw new Error(`Error fetching Binance price: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private static parseTickerResponse(data: any): number {
    if (!data?.price && !data?.lastPrice) {
      console.error('Invalid Binance response:', data);
      throw new Error('Invalid Binance response format');
    }
    
    const price = parseFloat(data.price || data.lastPrice);
    if (isNaN(price) || price <= 0) {
      throw new Error(`Invalid Binance price value: ${data.price || data.lastPrice}`);
    }
    
    return price;
  }
}