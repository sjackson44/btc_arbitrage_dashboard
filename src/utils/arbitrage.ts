import { ExchangePrice } from '../types/exchange';

export interface ArbitrageOpportunity {
  buyExchange: string;
  sellExchange: string;
  priceDifference: number;
  percentageDifference: number;
}

export const calculateArbitrageOpportunities = (prices: ExchangePrice[]): ArbitrageOpportunity[] => {
  const opportunities: ArbitrageOpportunity[] = [];

  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      const price1 = prices[i].price;
      const price2 = prices[j].price;

      if (price1 === null || price2 === null) continue;

      const priceDifference = Math.abs(price1 - price2);
      const averagePrice = (price1 + price2) / 2;
      const percentageDifference = (priceDifference / averagePrice) * 100;

      opportunities.push({
        buyExchange: price1 < price2 ? prices[i].exchange : prices[j].exchange,
        sellExchange: price1 < price2 ? prices[j].exchange : prices[i].exchange,
        priceDifference,
        percentageDifference
      });
    }
  }

  return opportunities.sort((a, b) => b.percentageDifference - a.percentageDifference);
};