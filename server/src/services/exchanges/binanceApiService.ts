import WebSocket from 'ws';
import { BaseApiService } from './baseApiService.js';
import { EventEmitter } from 'events';
import { RateLimiter } from '../../utils/rateLimiter.js';

export class BinanceApiService extends BaseApiService {
  private static readonly WS_URL = 'wss://stream.binance.us:9443/ws/btcusdt@ticker';
  private ws: WebSocket | null = null;
  private eventEmitter = new EventEmitter();
  private lastPrice: number = 0;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private readonly RECONNECT_DELAY = 2000;
  private pingInterval: NodeJS.Timeout | null = null;
  private rateLimiter = new RateLimiter(5); // 5 messages per second

  constructor() {
    super();
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(BinanceApiService.WS_URL);
      
      this.ws.on('open', () => {
        this.reconnectAttempts = 0;
        this.startPing();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing Binance message:', error);
        }
      });

      this.ws.on('close', () => {
        this.stopPing();
        this.handleDisconnect();
      });

      this.ws.on('error', (error) => {
        console.error('Binance WebSocket error:', error);
        this.stopPing();
        this.handleDisconnect();
      });

      this.ws.on('pong', () => {
      });

    } catch (error) {
      console.error('Error creating Binance WebSocket:', error);
      this.handleDisconnect();
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.rateLimiter.execute(() => {
          this.ws?.ping();
        });
      }
    }, 120000); // 2 minutes
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleMessage(message: any) {
    try {
      // Handle 24hr ticker event
      if (message.s === 'BTCUSDT') {
        const price = parseFloat(message.c); // Current price is in the 'c' field
        if (!isNaN(price) && price > 0) {
          this.lastPrice = price;
          this.eventEmitter.emit('price', this.lastPrice);
        }
      }
    } catch (error) {
      console.error('Error handling Binance message:', error, message);
    }
  }

  private handleDisconnect() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.RECONNECT_DELAY * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached for Binance');
    }
  }

  public async fetchPrice(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.lastPrice > 0) {
        resolve(this.lastPrice);
      } else {
        // Wait for the first price update
        const timeout = setTimeout(() => {
          this.eventEmitter.removeListener('price', priceHandler);
          reject(new Error('Timeout waiting for Binance price'));
        }, 10000);

        const priceHandler = (price: number) => {
          clearTimeout(timeout);
          this.eventEmitter.removeListener('price', priceHandler);
          resolve(price);
        };

        this.eventEmitter.once('price', priceHandler);
      }
    });
  }

  public onPrice(callback: (price: number) => void) {
    this.eventEmitter.on('price', callback);
  }

  public disconnect() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
} 