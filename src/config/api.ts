export const API_CONFIG = {
  REFRESH_INTERVAL: 10000, // 10 seconds
  ENDPOINTS: {
    BINANCE: {
      PRIMARY: 'https://api.binance.us/api/v3/ticker/price?symbol=BTCUSDT',
      FALLBACK: 'https://api.binance.us/api/v3/ticker/24hr?symbol=BTCUSDT'
    },
    COINBASE: {
      PRIMARY: 'https://api.coinbase.com/v2/prices/BTC-USD/spot'
    },
    KRAKEN: {
      PRIMARY: 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD'
    }
  },
  RATE_LIMITS: {
    BINANCE: {
      WEIGHT_LIMIT: 1200,
      WINDOW_MS: 60000
    },
    COINBASE: {
      REQUEST_LIMIT: 10000,
      WINDOW_MS: 60000
    },
    KRAKEN: {
      TIER_1_LIMIT: 15,
      WINDOW_MS: 60000
    }
  }
};