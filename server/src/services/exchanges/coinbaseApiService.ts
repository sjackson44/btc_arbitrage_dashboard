import { BaseApiService } from './baseApiService.js';

export class CoinbaseApiService extends BaseApiService {
  private static readonly API_URL = 'https://api.coinbase.com/v2/prices/BTC-USD/spot';

  public async fetchPrice(): Promise<number> {
    try {
      const response = await BaseApiService.fetchWithRetry(CoinbaseApiService.API_URL);
      const data = await response.json();
      return this.parseTickerResponse(data);
    } catch (error) {
      console.error('Coinbase API request failed:', error);
      throw new Error(`Error fetching Coinbase price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseTickerResponse(data: any): number {
    if (!data?.data?.amount || typeof data.data.amount !== 'string') {
      throw new Error('Invalid Coinbase response format');
    }
    
    const price = parseFloat(data.data.amount);
    if (isNaN(price) || price <= 0) {
      throw new Error(`Invalid Coinbase price value: ${data.data.amount}`);
    }
    
    return price;
  }
} 