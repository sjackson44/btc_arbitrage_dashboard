export interface ExchangePrice {
  exchange: string;
  price: number | null;
  error?: string;
  timestamp: string;
}

export interface ArbitrageOpportunity {
  buyExchange: string;
  sellExchange: string;
  priceDifference: number;
  percentageDifference: number;
}