export interface ExchangePrice {
  exchange: string;
  price: number | null;
  error?: string;
  timestamp: string;
}