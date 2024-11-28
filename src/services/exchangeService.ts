import { ExchangePrice } from '../types/exchange';
import { ExchangeApiService } from './api/exchangeApiService';

class ExchangeService {
  private static instance: ExchangeService;
  // Define exchanges in alphabetical order
  private readonly exchanges = ['BINANCE', 'COINBASE', 'KRAKEN'];

  private constructor() {}

  public static getInstance(): ExchangeService {
    if (!ExchangeService.instance) {
      ExchangeService.instance = new ExchangeService();
    }
    return ExchangeService.instance;
  }

  public async fetchAllPrices(): Promise<ExchangePrice[]> {
    const now = new Date();
    const prices: ExchangePrice[] = [];

    await Promise.all(
      this.exchanges.map(async (exchange) => {
        try {
          const price = await ExchangeApiService.fetchPrice(exchange);
          prices.push({
            exchange,
            price,
            lastUpdated: now
          });
        } catch (error) {
          console.error(`Error fetching ${exchange} price:`, error);
          prices.push({
            exchange,
            price: NaN,
            lastUpdated: now
          });
        }
      })
    );

    // Sort prices to maintain consistent order
    return prices.sort((a, b) => a.exchange.localeCompare(b.exchange));
  }
}

export const exchangeService = ExchangeService.getInstance();