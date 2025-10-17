import { storage } from "../storage";
import { cmcService } from "./coinmarketcap";
import { getPriceStream } from "./websocket";
import type { Alert, AlertType } from "@shared/schema";

export class AlertEngine {
  private checkInterval: NodeJS.Timeout | null = null;
  private lastPrices: Map<string, number> = new Map();

  start() {
    // Check alerts every 15 seconds
    this.checkInterval = setInterval(() => {
      this.checkAlerts();
    }, 15000);

    console.log('Alert engine started');
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkAlerts() {
    try {
      const activeAlerts = await storage.getActiveAlerts();
      
      if (activeAlerts.length === 0) return;

      // Get unique symbols from alerts
      const symbols = [...new Set(activeAlerts.map(a => a.symbol))];
      const prices = await cmcService.getLatestPrices(symbols);

      for (const alert of activeAlerts) {
        const currentPrice = prices[alert.symbol]?.price;
        if (!currentPrice) continue;

        // Skip if snoozed
        if (alert.snoozeUntil && new Date(alert.snoozeUntil) > new Date()) {
          continue;
        }

        const shouldTrigger = this.evaluateAlert(alert, currentPrice);
        
        if (shouldTrigger) {
          await this.triggerAlert(alert, currentPrice);
        }

        this.lastPrices.set(alert.symbol, currentPrice);
      }
    } catch (error) {
      console.error('Alert check error:', error);
    }
  }

  private evaluateAlert(alert: Alert, currentPrice: number): boolean {
    const params = alert.params as any;

    switch (alert.type) {
      case 'price': {
        const targetPrice = params.level;
        const direction = params.direction;
        
        if (direction === 'above' && currentPrice >= targetPrice) {
          return true;
        }
        if (direction === 'below' && currentPrice <= targetPrice) {
          return true;
        }
        return false;
      }

      case 'pct_move': {
        const lastPrice = this.lastPrices.get(alert.symbol);
        if (!lastPrice) return false;

        const pctChange = ((currentPrice - lastPrice) / lastPrice) * 100;
        const targetPct = params.pct || 0;

        if (params.direction === 'above' && pctChange >= targetPct) {
          return true;
        }
        if (params.direction === 'below' && pctChange <= -targetPct) {
          return true;
        }
        return false;
      }

      case 'day_levels': {
        // Simplified: trigger if we hit day high or low
        return false; // Would need 24h data
      }

      case 'vwap': {
        // Simplified: would need volume data
        return false;
      }

      default:
        return false;
    }
  }

  private async triggerAlert(alert: Alert, price: number) {
    try {
      console.log(`🔔 Alert triggered: ${alert.symbol} at $${price}`);

      // Record alert fire
      await storage.createAlertFire({
        alertId: alert.id,
        symbol: alert.symbol,
        price: price.toString(),
      });

      // Disable alert (one-time trigger)
      await storage.updateAlert(alert.id, { active: false });

      // Broadcast to WebSocket clients
      const priceStream = getPriceStream();
      if (priceStream) {
        priceStream.broadcast({
          type: 'alert_triggered',
          data: {
            alertId: alert.id,
            symbol: alert.symbol,
            price,
            type: alert.type,
          },
        });
      }
    } catch (error) {
      console.error('Failed to trigger alert:', error);
    }
  }
}

export const alertEngine = new AlertEngine();
