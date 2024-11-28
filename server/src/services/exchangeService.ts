import { BinanceApiService } from './exchanges/binanceApiService.js';
import { CoinbaseApiService } from './exchanges/coinbaseApiService.js';
import { KrakenApiService } from './exchanges/krakenApiService.js';
import { ExchangePrice } from '../types/exchange.js';

export class ExchangeService {
  private exchanges = {
    binance: new BinanceApiService(),
    coinbase: new CoinbaseApiService(),
    kraken: new KrakenApiService()
  };

  async fetchAllPrices(): Promise<ExchangePrice[]> {
    const now = new Date().toISOString();

    const prices = await Promise.all(
      Object.entries(this.exchanges).map(async ([exchange, service]) => {
        try {
          const price = await service.fetchPrice();
          return {
            exchange,
            price,
            timestamp: now
          };
        } catch (error) {
          console.error(`Error fetching ${exchange} price:`, error);
          return {
            exchange,
            price: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: now
          };
        }
      })
    );

    return prices;
  }
} 