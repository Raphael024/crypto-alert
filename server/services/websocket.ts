import { WebSocket, WebSocketServer } from "ws";
import type { Server } from "http";
import { cmcService } from "./coinmarketcap";
import type { PriceUpdate } from "@shared/schema";

export class PriceStreamService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private priceInterval: NodeJS.Timeout | null = null;
  private watchedSymbols: Set<string> = new Set(['BTC', 'ETH', 'SOL', 'BNB', 'XRP']);

  constructor(server: Server) {
    // Referenced from javascript_websocket blueprint
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('WebSocket client connected');
      this.clients.add(ws);

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'subscribe' && data.symbols) {
            data.symbols.forEach((symbol: string) => this.watchedSymbols.add(symbol));
          }
          
          if (data.type === 'unsubscribe' && data.symbols) {
            data.symbols.forEach((symbol: string) => this.watchedSymbols.delete(symbol));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      // Send initial prices
      this.sendPrices();
    });
  }

  start() {
    // Stream prices every 10 seconds
    this.priceInterval = setInterval(() => {
      this.sendPrices();
    }, 10000);

    console.log('Price stream service started');
  }

  stop() {
    if (this.priceInterval) {
      clearInterval(this.priceInterval);
      this.priceInterval = null;
    }
  }

  private async sendPrices() {
    try {
      const prices = await cmcService.getLatestPrices(Array.from(this.watchedSymbols));
      const updates: PriceUpdate[] = Object.entries(prices).map(([symbol, data]) => ({
        symbol,
        price: data.price,
        timestamp: Date.now(),
      }));

      this.broadcast({
        type: 'price_update',
        data: updates,
      });
    } catch (error) {
      console.error('Failed to send prices:', error);
    }
  }

  broadcast(message: any) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      // Referenced from javascript_websocket blueprint - check readyState against WebSocket.OPEN
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  addWatchedSymbol(symbol: string) {
    this.watchedSymbols.add(symbol);
  }
}

let priceStreamService: PriceStreamService | null = null;

export function initPriceStream(server: Server): PriceStreamService {
  priceStreamService = new PriceStreamService(server);
  priceStreamService.start();
  return priceStreamService;
}

export function getPriceStream(): PriceStreamService | null {
  return priceStreamService;
}
