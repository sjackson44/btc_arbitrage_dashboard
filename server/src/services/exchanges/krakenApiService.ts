import WebSocket from 'ws';
import { BaseApiService } from './baseApiService.js';
import { EventEmitter } from 'events';
import { RateLimiter } from '../../utils/rateLimiter.js';

export class KrakenApiService extends BaseApiService {
  private static readonly WS_URL = 'wss://ws.kraken.com';
  private ws: WebSocket | null = null;
  private eventEmitter = new EventEmitter();
  private lastPrice: number = 0;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private readonly RECONNECT_DELAY = 10000;
  private pingInterval: NodeJS.Timeout | null = null;
  private rateLimiter = new RateLimiter(2);

  constructor() {
    super();
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(KrakenApiService.WS_URL);
      
      this.ws.on('open', () => {
        this.reconnectAttempts = 0;
        this.subscribe();
        this.startPing();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing Kraken message:', error);
        }
      });

      this.ws.on('close', () => {
        this.stopPing();
        this.handleDisconnect();
      });

      this.ws.on('error', (error) => {
        console.error('Kraken WebSocket error:', error);
        this.stopPing();
        this.handleDisconnect();
      });

      this.ws.on('pong', () => {
      });

    } catch (error) {
      console.error('Error creating Kraken WebSocket:', error);
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
    }, 30000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private subscribe() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.rateLimiter.execute(() => {
        const subscribeMessage = {
          event: 'subscribe',
          pair: ['XBT/USD'],
          subscription: {
            name: 'ticker'
          }
        };
        this.ws?.send(JSON.stringify(subscribeMessage));
      });
    }
  }

  private handleMessage(message: any) {
    try {
      // Kraken sends ticker data as an array with specific indices
      if (Array.isArray(message) && message[2] === 'ticker' && message[3] === 'XBT/USD') {
        const tickerData = message[1];
        // 'c' contains [price, volume] of last trade
        const price = parseFloat(tickerData.c[0]);
        if (!isNaN(price) && price > 0) {
          this.lastPrice = price;
          this.eventEmitter.emit('price', this.lastPrice);
        }
      }
      // Handle subscription confirmation
      else if (message.event === 'subscriptionStatus' && message.status === 'subscribed') {
      }
    } catch (error) {
      console.error('Error handling Kraken message:', error, message);
    }
  }

  private handleDisconnect() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.RECONNECT_DELAY * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached for Kraken');
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
          reject(new Error('Timeout waiting for Kraken price'));
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