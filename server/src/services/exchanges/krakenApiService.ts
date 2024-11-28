import { BaseApiService } from './baseApiService.js';

export class KrakenApiService extends BaseApiService {
  private static readonly API_URL = 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD';

  public async fetchPrice(): Promise<number> {
    try {
      const response = await BaseApiService.fetchWithRetry(KrakenApiService.API_URL);
      const data = await response.json();
      return this.parseTickerResponse(data);
    } catch (error) {
      console.error('Kraken API request failed:', error);
      throw new Error(`Error fetching Kraken price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseTickerResponse(data: any): number {
    if (!data?.result?.XXBTZUSD?.c?.[0]) {
      throw new Error('Invalid Kraken response format');
    }
    
    const price = parseFloat(data.result.XXBTZUSD.c[0]);
    if (isNaN(price) || price <= 0) {
      throw new Error(`Invalid Kraken price value: ${data.result.XXBTZUSD.c[0]}`);
    }
    
    return price;
  }
} 