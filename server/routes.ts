import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cmcService } from "./services/coinmarketcap";
import { cryptoPanicService } from "./services/cryptopanic";
import { initPriceStream } from "./services/websocket";
import { alertEngine } from "./services/alert-engine";
import { insertWatchSchema, insertAlertSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize WebSocket price streaming
  const priceStream = initPriceStream(httpServer);

  // Start alert engine
  alertEngine.start();

  // Initialize news ingestion
  const newsInterval = setInterval(async () => {
    try {
      const newsItems = await cryptoPanicService.getLatestNews();
      for (const item of newsItems) {
        await storage.upsertNews(item);
      }
    } catch (error) {
      console.error('News ingestion error:', error);
    }
  }, 120000); // Every 2 minutes

  // Watchlist routes
  app.get("/api/watchlist", async (req, res) => {
    try {
      // For now, use a default user ID (in production, get from auth session)
      const userId = "demo-user";
      
      // Ensure user exists
      let user = await storage.getUserByEmail("demo@cryptobuzz.app");
      if (!user) {
        user = await storage.createUser({ email: "demo@cryptobuzz.app" });
      }

      const watchlist = await storage.getWatches(user.id);
      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const user = await storage.getUserByEmail("demo@cryptobuzz.app");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const validated = insertWatchSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const watch = await storage.createWatch(validated);
      
      // Add to WebSocket stream
      priceStream.addWatchedSymbol(validated.symbol);
      
      res.json(watch);
    } catch (error) {
      res.status(400).json({ error: "Invalid watch data" });
    }
  });

  app.delete("/api/watchlist/:id", async (req, res) => {
    try {
      await storage.deleteWatch(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete watch" });
    }
  });

  // Alerts routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const user = await storage.getUserByEmail("demo@cryptobuzz.app");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const alerts = await storage.getAlerts(user.id);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const user = await storage.getUserByEmail("demo@cryptobuzz.app");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const validated = insertAlertSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const alert = await storage.createAlert(validated);
      res.json(alert);
    } catch (error) {
      res.status(400).json({ error: "Invalid alert data" });
    }
  });

  app.patch("/api/alerts/:id", async (req, res) => {
    try {
      const alert = await storage.updateAlert(req.params.id, req.body);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to update alert" });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      await storage.deleteAlert(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });

  app.get("/api/alerts/history", async (req, res) => {
    try {
      const user = await storage.getUserByEmail("demo@cryptobuzz.app");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const history = await storage.getAlertFires(user.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alert history" });
    }
  });

  // Price routes
  app.get("/api/prices", async (req, res) => {
    try {
      const symbols = req.query.symbols as string | undefined;
      const symbolArray = symbols ? symbols.split(',') : undefined;
      
      const prices = await cmcService.getLatestPrices(symbolArray);
      res.json(prices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prices" });
    }
  });

  app.get("/api/coins/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const price = await cmcService.getCoinPrice(symbol);
      
      if (!price) {
        return res.status(404).json({ error: "Coin not found" });
      }
      
      res.json(price);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch coin" });
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const currency = req.query.currency as string | undefined;
      
      let news;
      if (currency && currency !== 'all') {
        news = await storage.getNewsByCurrency(currency);
      } else {
        news = await storage.getNews(50);
      }
      
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      services: {
        websocket: !!priceStream,
        alertEngine: true,
        database: true,
      }
    });
  });

  // Seed initial data for demo
  app.post("/api/seed", async (req, res) => {
    try {
      let user = await storage.getUserByEmail("demo@cryptobuzz.app");
      if (!user) {
        user = await storage.createUser({ email: "demo@cryptobuzz.app" });
      }

      // Add popular coins to watchlist
      const popularCoins = [
        { symbol: 'BTC', cmcId: '1', name: 'Bitcoin' },
        { symbol: 'ETH', cmcId: '1027', name: 'Ethereum' },
        { symbol: 'SOL', cmcId: '5426', name: 'Solana' },
      ];

      for (const coin of popularCoins) {
        try {
          await storage.createWatch({
            userId: user.id,
            ...coin,
          });
        } catch (error) {
          // Ignore duplicates
        }
      }

      // Fetch and store initial news
      const newsItems = await cryptoPanicService.getLatestNews();
      for (const item of newsItems.slice(0, 10)) {
        await storage.upsertNews(item);
      }

      res.json({ success: true, message: "Demo data seeded" });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed data" });
    }
  });

  return httpServer;
}
