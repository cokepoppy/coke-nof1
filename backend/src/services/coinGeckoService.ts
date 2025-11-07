import axios from 'axios';
import { EventEmitter } from 'events';

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

class CoinGeckoService extends EventEmitter {
  private priceCache: Map<string, PriceData> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // CoinGecko coin IDs mapping
  private coinIds: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'BNB': 'binancecoin',
    'DOGE': 'dogecoin',
    'XRP': 'ripple',
  };

  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    console.log('Initializing CoinGecko market data service...');

    try {
      // Fetch initial prices
      await this.fetchPrices();

      // Start polling every 10 seconds (CoinGecko free tier limit)
      this.startPolling();

      console.log('CoinGecko service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize CoinGecko service:', error);
      // Retry after 10 seconds
      setTimeout(() => this.initialize(), 10000);
    }
  }

  private startPolling() {
    if (this.isRunning) return;

    this.isRunning = true;
    // CoinGecko免费API限制：建议每60秒拉取一次，避免触发限流
    const pollInterval = parseInt(process.env.COINGECKO_POLL_INTERVAL_MS || '60000');

    this.pollInterval = setInterval(() => {
      this.fetchPrices();
    }, pollInterval);

    console.log(`Started price polling (every ${pollInterval / 1000} seconds)`);
  }

  private async fetchPrices() {
    try {
      const coinIdsString = Object.values(this.coinIds).join(',');

      // CoinGecko API endpoint (no API key required for basic usage)
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: coinIdsString,
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_24hr_vol: true,
        },
        timeout: 8000,
      });

      const data = response.data;

      // Update cache and emit events
      Object.entries(this.coinIds).forEach(([symbol, coinId]) => {
        if (data[coinId]) {
          const cachedData = this.priceCache.get(symbol);
          const newPrice = data[coinId].usd;

          const priceData: PriceData = {
            symbol,
            price: newPrice,
            change24h: data[coinId].usd_24h_change || 0,
            volume24h: data[coinId].usd_24h_vol || 0,
            timestamp: Date.now(),
          };

          this.priceCache.set(symbol, priceData);

          // Emit update if price changed or first time
          if (!cachedData || cachedData.price !== newPrice) {
            this.emit('priceUpdate', priceData);
            console.log(`Price update: ${symbol} = $${newPrice.toFixed(2)} (${priceData.change24h >= 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%)`);
          }
        }
      });

    } catch (error: any) {
      if (error.response?.status === 429) {
        console.warn('CoinGecko API rate limit reached. Consider increasing COINGECKO_POLL_INTERVAL_MS (current: every 60s)');
      } else {
        console.error('Error fetching prices from CoinGecko:', error.message);
      }
    }
  }

  public getAllPrices(): PriceData[] {
    return Array.from(this.priceCache.values());
  }

  public getPrice(symbol: string): PriceData | undefined {
    return this.priceCache.get(symbol);
  }

  public disconnect() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isRunning = false;
    console.log('CoinGecko service disconnected');
  }
}

export default new CoinGeckoService();
