import type { CoinPrice } from "@shared/schema";

const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY;
const CMC_BASE_URL = "https://pro-api.coinmarketcap.com/v1";

interface CMCQuote {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
      volume_24h: number;
      market_cap: number;
    };
  };
}

// Top coins to track
const POPULAR_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'MATIC', 'DOT', 'AVAX'];

export class CoinMarketCapService {
  private priceCache: Map<string, CoinPrice> = new Map();
  private topCoinsCache: CoinPrice[] = [];
  private lastUpdate: number = 0;
  private lastTopCoinsUpdate: number = 0;

  async getLatestPrices(symbols?: string[]): Promise<Record<string, CoinPrice>> {
    const targetSymbols = symbols || POPULAR_SYMBOLS;
    const now = Date.now();

    // Cache for 10 seconds to avoid rate limits
    if (now - this.lastUpdate < 10000 && this.priceCache.size > 0) {
      const result: Record<string, CoinPrice> = {};
      targetSymbols.forEach(symbol => {
        const cached = this.priceCache.get(symbol);
        if (cached) result[symbol] = cached;
      });
      return result;
    }

    try {
      const response = await fetch(
        `${CMC_BASE_URL}/cryptocurrency/quotes/latest?symbol=${targetSymbols.join(',')}&convert=USD`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': CMC_API_KEY || '',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CMC API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result: Record<string, CoinPrice> = {};

      targetSymbols.forEach(symbol => {
        const quote: CMCQuote = data.data[symbol];
        if (quote) {
          const coinPrice: CoinPrice = {
            symbol: quote.symbol,
            name: quote.name,
            price: quote.quote.USD.price,
            change24h: quote.quote.USD.percent_change_24h,
            volume24h: quote.quote.USD.volume_24h,
            marketCap: quote.quote.USD.market_cap,
            high24h: quote.quote.USD.price * (1 + Math.abs(quote.quote.USD.percent_change_24h) / 100),
            low24h: quote.quote.USD.price * (1 - Math.abs(quote.quote.USD.percent_change_24h) / 100),
            sparkline: this.generateSparkline(quote.quote.USD.price, quote.quote.USD.percent_change_24h),
          };
          result[symbol] = coinPrice;
          this.priceCache.set(symbol, coinPrice);
        }
      });

      this.lastUpdate = now;
      return result;
    } catch (error) {
      console.error('CoinMarketCap API error:', error);
      
      // Return cached data if available
      const result: Record<string, CoinPrice> = {};
      targetSymbols.forEach(symbol => {
        const cached = this.priceCache.get(symbol);
        if (cached) result[symbol] = cached;
      });
      return result;
    }
  }

  async getCoinPrice(symbol: string): Promise<CoinPrice | null> {
    const prices = await this.getLatestPrices([symbol]);
    return prices[symbol] || null;
  }

  async getTopCoins(limit: number = 200): Promise<CoinPrice[]> {
    const now = Date.now();

    // Cache for 60 seconds to avoid rate limits
    if (now - this.lastTopCoinsUpdate < 60000 && this.topCoinsCache.length > 0) {
      return this.topCoinsCache.slice(0, limit);
    }

    try {
      const response = await fetch(
        `${CMC_BASE_URL}/cryptocurrency/listings/latest?start=1&limit=${limit}&convert=USD`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': CMC_API_KEY || '',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CMC API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result: CoinPrice[] = [];

      data.data.forEach((coin: any) => {
        const coinPrice: CoinPrice = {
          symbol: coin.symbol,
          name: coin.name,
          price: coin.quote.USD.price,
          change24h: coin.quote.USD.percent_change_24h,
          volume24h: coin.quote.USD.volume_24h,
          marketCap: coin.quote.USD.market_cap,
          high24h: coin.quote.USD.price * (1 + Math.abs(coin.quote.USD.percent_change_24h) / 100),
          low24h: coin.quote.USD.price * (1 - Math.abs(coin.quote.USD.percent_change_24h) / 100),
          sparkline: this.generateSparkline(coin.quote.USD.price, coin.quote.USD.percent_change_24h),
          logoUrl: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
          cmcId: coin.id,
        };
        result.push(coinPrice);
      });

      this.topCoinsCache = result;
      this.lastTopCoinsUpdate = now;
      return result;
    } catch (error) {
      console.error('CoinMarketCap API error:', error);
      
      // Return cached data if available
      return this.topCoinsCache.slice(0, limit);
    }
  }

  private generateSparkline(currentPrice: number, change24h: number): number[] {
    // Generate realistic-looking sparkline data
    const points = 24;
    const sparkline: number[] = [];
    const startPrice = currentPrice / (1 + change24h / 100);
    
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const noise = (Math.random() - 0.5) * currentPrice * 0.02;
      const trend = startPrice + (currentPrice - startPrice) * progress;
      sparkline.push(trend + noise);
    }
    
    return sparkline;
  }
}

export const cmcService = new CoinMarketCapService();
