import Binance from 'binance-api-node';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

class MarketDataService extends EventEmitter {
  private client: any;
  private priceCache: Map<string, PriceData> = new Map();
  private binanceWs: WebSocket | null = null;
  private symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'DOGEUSDT', 'XRPUSDT'];
  private reconnectInterval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private useRestFallback = false;
  private restPollInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.client = Binance({
      apiKey: process.env.BINANCE_API_KEY || '',
      apiSecret: process.env.BINANCE_API_SECRET || '',
    });
    this.initialize();
  }

  private async initialize() {
    try {
      // Get initial 24h ticker data
      await this.fetch24hTicker();

      // Connect to real-time WebSocket
      this.connectWebSocket();

      // Update 24h data periodically
      setInterval(() => this.fetch24hTicker(), 60000); // Every minute
    } catch (error) {
      console.error('Failed to initialize market data service:', error);
    }
  }

  private async fetch24hTicker() {
    try {
      const ticker24h = await this.client.dailyStats();

      this.symbols.forEach(symbol => {
        const symbolData = ticker24h.find((t: any) => t.symbol === symbol);
        if (symbolData) {
          const cachedData = this.priceCache.get(symbol);
          this.priceCache.set(symbol, {
            symbol: symbol.replace('USDT', ''),
            price: parseFloat(symbolData.lastPrice),
            change24h: parseFloat(symbolData.priceChangePercent),
            volume24h: parseFloat(symbolData.quoteVolume),
            timestamp: Date.now(),
          });

          // Only emit if price changed
          if (!cachedData || cachedData.price !== parseFloat(symbolData.lastPrice)) {
            this.emitPriceUpdate(symbol.replace('USDT', ''));
          }
        }
      });
    } catch (error) {
      console.error('Error fetching 24h ticker:', error);
    }
  }

  private connectWebSocket() {
    try {
      // Binance International WebSocket endpoint (more reliable)
      const streams = this.symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

      this.binanceWs = new WebSocket(wsUrl);

      this.binanceWs.on('open', () => {
        console.log('Binance WebSocket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.useRestFallback = false;

        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }

        if (this.restPollInterval) {
          clearInterval(this.restPollInterval);
          this.restPollInterval = null;
        }
      });

      this.binanceWs.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.data && message.data.s) {
            this.handleTickerUpdate(message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      this.binanceWs.on('error', (error: Error) => {
        console.error('Binance WebSocket error:', error);
      });

      this.binanceWs.on('close', () => {
        console.log('Binance WebSocket disconnected');
        this.isConnected = false;
        this.scheduleReconnect();
      });

    } catch (error) {
      console.error('Error connecting to Binance WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;

    if (this.reconnectAttempts >= this.maxReconnectAttempts && !this.useRestFallback) {
      console.warn(`WebSocket failed after ${this.maxReconnectAttempts} attempts, falling back to REST API polling`);
      this.useRestFallback = true;
      this.startRestFallback();
      return;
    }

    if (!this.reconnectInterval && !this.useRestFallback) {
      console.log(`Scheduling WebSocket reconnect in 5 seconds... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.reconnectInterval = setInterval(() => {
        if (!this.isConnected && !this.useRestFallback) {
          console.log(`Attempting to reconnect... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.connectWebSocket();
        }
      }, 5000);
    }
  }

  private startRestFallback() {
    console.log('Starting REST API fallback mode - polling every 5 seconds');

    // Initial fetch
    this.fetchAndEmitPrices();

    // Poll every 5 seconds
    this.restPollInterval = setInterval(() => {
      this.fetchAndEmitPrices();
    }, 5000);
  }

  private async fetchAndEmitPrices() {
    try {
      const ticker24h = await this.client.dailyStats();

      this.symbols.forEach(symbol => {
        const symbolData = ticker24h.find((t: any) => t.symbol === symbol);
        if (symbolData) {
          const cachedData = this.priceCache.get(symbol);
          const newPrice = parseFloat(symbolData.lastPrice);

          this.priceCache.set(symbol, {
            symbol: symbol.replace('USDT', ''),
            price: newPrice,
            change24h: parseFloat(symbolData.priceChangePercent),
            volume24h: parseFloat(symbolData.quoteVolume),
            timestamp: Date.now(),
          });

          // Emit update if price changed
          if (!cachedData || cachedData.price !== newPrice) {
            this.emitPriceUpdate(symbol.replace('USDT', ''));
          }
        }
      });
    } catch (error) {
      console.error('Error in REST fallback:', error);
    }
  }

  private handleTickerUpdate(ticker: any) {
    const symbol = ticker.s.replace('USDT', '');
    const price = parseFloat(ticker.c);
    const change24h = parseFloat(ticker.P);
    const volume24h = parseFloat(ticker.q);

    const cachedData = this.priceCache.get(ticker.s);

    this.priceCache.set(ticker.s, {
      symbol,
      price,
      change24h,
      volume24h,
      timestamp: Date.now(),
    });

    // Emit update if price changed
    if (!cachedData || cachedData.price !== price) {
      this.emitPriceUpdate(symbol);
    }
  }

  private emitPriceUpdate(symbol: string) {
    const data = this.priceCache.get(symbol + 'USDT');
    if (data) {
      this.emit('priceUpdate', data);
    }
  }

  public getAllPrices(): PriceData[] {
    return Array.from(this.priceCache.values());
  }

  public getPrice(symbol: string): PriceData | undefined {
    return this.priceCache.get(symbol + 'USDT');
  }

  public disconnect() {
    if (this.binanceWs) {
      this.binanceWs.close();
      this.binanceWs = null;
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.restPollInterval) {
      clearInterval(this.restPollInterval);
      this.restPollInterval = null;
    }
  }
}

export default new MarketDataService();
