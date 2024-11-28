import WebSocket from 'ws';
import { BaseApiService } from './baseApiService.js';
import { EventEmitter } from 'events';
import { RateLimiter } from '../../utils/rateLimiter.js';

export class CoinbaseApiService extends BaseApiService {
  private static readonly WS_URL = 'wss://ws-feed.exchange.coinbase.com';
  private ws: WebSocket | null = null;
  private eventEmitter = new EventEmitter();
  private lastPrice: number = 0;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 5000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private rateLimiter = new RateLimiter(8);

  constructor() {
    super();
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(CoinbaseApiService.WS_URL);
      
      this.ws.on('open', () => {
        this.reconnectAttempts = 0;
        this.subscribe();
        this.startHeartbeat();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing Coinbase message:', error);
        }
      });

      this.ws.on('close', () => {
        this.stopHeartbeat();
        this.handleDisconnect();
      });

      this.ws.on('error', (error) => {
        console.error('Coinbase WebSocket error:', error);
        this.stopHeartbeat();
        this.handleDisconnect();
      });

    } catch (error) {
      console.error('Error creating Coinbase WebSocket:', error);
      this.handleDisconnect();
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private subscribe() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.rateLimiter.execute(() => {
        const subscribeMessage = {
          type: 'subscribe',
          channels: [
            {
              name: 'ticker',
              product_ids: ['BTC-USD']
            }
          ]
        };
        this.ws?.send(JSON.stringify(subscribeMessage));
      });
    }
  }

  private handleMessage(message: any) {
    if (message.type === 'ticker' && message.product_id === 'BTC-USD') {
      const price = parseFloat(message.price);
      if (!isNaN(price) && price > 0) {
        this.lastPrice = price;
        this.eventEmitter.emit('price', this.lastPrice);
      }
    }
  }

  private handleDisconnect() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.RECONNECT_DELAY * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached for Coinbase');
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
          reject(new Error('Timeout waiting for Coinbase price'));
        }, 10000); // Increased timeout to 10 seconds

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
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
} 