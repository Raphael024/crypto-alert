import { useState } from "react";
import { Plus, Search, TrendingUp, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceCard } from "@/components/PriceCard";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useWebSocketContext } from "@/lib/WebSocketProvider";
import type { Watch, CoinPrice } from "@shared/schema";

export default function Watchlist() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch watchlist
  const { data: watchlist, isLoading } = useQuery<Watch[]>({
    queryKey: ["/api/watchlist"],
  });

  // Fetch prices for watched coins (fallback)
  const { data: prices } = useQuery<Record<string, CoinPrice>>({
    queryKey: ["/api/prices"],
    refetchInterval: 10000, // Fallback refresh every 10 seconds
  });

  // WebSocket for real-time prices
  const { isConnected, getPrice } = useWebSocketContext();

  const filteredWatchlist = watchlist?.filter((watch) =>
    watch.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    watch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Crypto Buzz</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Real-time Price Alerts</p>
                <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
                  {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isConnected ? "Live" : "Offline"}
                </Badge>
              </div>
            </div>
            <Button size="icon" variant="outline" data-testid="button-add-coin">
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredWatchlist && filteredWatchlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWatchlist.map((watch) => {
              const price = prices?.[watch.symbol];
              const wsPrice = getPrice(watch.symbol);
              
              return (
                <PriceCard
                  key={watch.id}
                  symbol={watch.symbol}
                  name={watch.name}
                  price={wsPrice || price?.price || 0}
                  change24h={price?.change24h || 0}
                  sparkline={price?.sparkline}
                  onClick={() => window.location.href = `/coin/${watch.symbol}`}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Coins in Watchlist</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Add coins to your watchlist to track prices and set alerts
            </p>
            <Button data-testid="button-add-first-coin">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Coin
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
