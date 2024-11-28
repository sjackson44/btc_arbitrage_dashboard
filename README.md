# Bitcoin Arbitrage Dashboard

A real-time dashboard that tracks Bitcoin prices across major cryptocurrency exchanges (Binance, Coinbase, and Kraken) and identifies arbitrage opportunities.

## Features

- Real-time price tracking from multiple exchanges
- Automatic price updates every 10 seconds
- Arbitrage opportunity calculations
- Responsive design with Tailwind CSS
- Error handling and retry mechanisms
- Rate limiting for API calls
- CORS proxy support for API access

## System Architecture

The system consists of two main components:

### Backend Server
- WebSocket server for real-time price updates
- Price aggregation from multiple exchanges
- Rate-limited API calls to exchanges
- Arbitrage calculations
- Error handling and retry logic
- Data validation and sanitization

### Frontend Dashboard
- Real-time price display
- Arbitrage opportunity table
- Responsive design
- Dark/light mode support
- Automatic reconnection handling

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- WebSocket support

## Local Development Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bitcoin-arbitrage-dashboard
```

2. Install dependencies for both server and client:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Create a `.env` file in the server directory:
```bash
PORT=3000
WS_PORT=8080
BINANCE_API_KEY=your_binance_api_key
COINBASE_API_KEY=your_coinbase_api_key
KRAKEN_API_KEY=your_kraken_api_key
```

4. Start the server:
```bash
# In the server directory
npm run dev
```

5. Start the client:
```bash
# In the client directory
npm run dev
```

The application will be available at `http://localhost:5173`

## Server Architecture

```
server/
├── src/
│   ├── websocket/          # WebSocket server implementation
│   ├── exchanges/          # Exchange-specific API handlers
│   ├── services/           # Business logic services
│   │   ├── price/         # Price aggregation service
│   │   └── arbitrage/     # Arbitrage calculation service
│   ├── utils/             # Utility functions
│   └── config/            # Server configuration
```

### Server Features

- **WebSocket Communication**
  - Real-time price updates to connected clients
  - Automatic client reconnection handling
  - Connection health monitoring

- **Exchange Integration**
  - Parallel price fetching from multiple exchanges
  - Rate limiting and request queuing
  - Error handling with automatic retries
  - Fallback endpoints support

- **Data Processing**
  - Price normalization across exchanges
  - Arbitrage opportunity detection
  - Data validation and sanitization
  - Caching for improved performance

## API Rate Limits

The server respects the following rate limits:

- Binance: 1200 requests per minute
- Coinbase: 10000 requests per minute
- Kraken: 15 requests per minute

## Error Handling

The server implements:
- Automatic retries with exponential backoff
- Fallback endpoints for each exchange
- Graceful error recovery
- Client notification of service status

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Vite](https://vitejs.dev/) - Frontend build tool
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [SWR](https://swr.vercel.app/) - Data fetching
- [Lucide React](https://lucide.dev/) - Icons
- [ws](https://github.com/websockets/ws) - WebSocket client & server implementation