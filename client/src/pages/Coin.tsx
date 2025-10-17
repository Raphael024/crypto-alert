import { useState } from "react";
import { useRoute } from "wouter";
import { ArrowLeft, Bell, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { CoinPrice, NewsItem } from "@shared/schema";

export default function Coin() {
  const [, params] = useRoute("/coin/:symbol");
  const symbol = params?.symbol?.toUpperCase() || "";
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch coin price
  const { data: price } = useQuery<CoinPrice>({
    queryKey: ["/api/coins", symbol],
    refetchInterval: 5000,
  });

  // Fetch coin news
  const { data: news } = useQuery<NewsItem[]>({
    queryKey: ["/api/news", symbol],
  });

  const isPositive = (price?.change24h || 0) >= 0;

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = (y / rect.height) * 100;
    const priceRange = (price?.high24h || 0) - (price?.low24h || 0);
    const targetPrice = (price?.high24h || 0) - (percentage / 100) * priceRange;
    setDragPosition(targetPrice);
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (y / rect.height) * 100));
    const priceRange = (price?.high24h || 0) - (price?.low24h || 0);
    const targetPrice = (price?.high24h || 0) - (percentage / 100) * priceRange;
    setDragPosition(targetPrice);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragPosition) {
      // Create alert with dragPosition as target price
      console.log("Create alert at price:", dragPosition);
    }
  };

  const presetAlerts = [
    { label: "+1%", value: (price?.price || 0) * 1.01 },
    { label: "-5%", value: (price?.price || 0) * 0.95 },
    { label: "Day High", value: price?.high24h || 0 },
    { label: "Day Low", value: price?.low24h || 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{symbol}</h1>
              <p className="text-sm text-muted-foreground">{price?.name || ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Price Display */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  Current Price
                </p>
                <p className="text-5xl font-mono font-bold" data-testid="text-coin-price">
                  ${price?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-2 text-lg px-3 py-1.5",
                  isPositive
                    ? "bg-crypto-bullish/10 text-crypto-bullish border-crypto-bullish/20"
                    : "bg-crypto-bearish/10 text-crypto-bearish border-crypto-bearish/20"
                )}
                data-testid="badge-coin-change"
              >
                {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                {Math.abs(price?.change24h || 0).toFixed(2)}%
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">24h High</p>
                <p className="text-lg font-mono font-semibold" data-testid="text-high">${price?.high24h.toLocaleString() || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">24h Low</p>
                <p className="text-lg font-mono font-semibold" data-testid="text-low">${price?.low24h.toLocaleString() || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Volume</p>
                <p className="text-lg font-mono font-semibold" data-testid="text-volume">${(price?.volume24h / 1e9).toFixed(2) || "0"}B</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Interactive Chart with Drag Bell */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Set Price Alert</h2>
              <p className="text-sm text-muted-foreground">Drag bell to target price</p>
            </div>
            
            <div
              className="relative h-72 bg-muted/30 rounded-lg cursor-crosshair overflow-hidden"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              data-testid="chart-interactive"
            >
              {/* Simple Chart Visualization */}
              <div className="absolute inset-0 flex items-end gap-1 p-4">
                {price?.sparkline?.map((value, i) => {
                  const height = ((value - (price.low24h || 0)) / ((price.high24h || 0) - (price.low24h || 0))) * 100;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 rounded-t-sm transition-all",
                        isPositive ? "bg-crypto-bullish/40" : "bg-crypto-bearish/40"
                      )}
                      style={{ height: `${Math.max(5, height)}%` }}
                    />
                  );
                })}
              </div>

              {/* Drag Bell Indicator */}
              {dragPosition && (
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-primary pointer-events-none"
                  style={{
                    top: `${((price?.high24h || 0) - dragPosition) / ((price?.high24h || 0) - (price?.low24h || 0)) * 100}%`,
                  }}
                >
                  <div className="absolute right-4 -top-6 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-mono">
                    <Bell className="h-4 w-4" />
                    ${dragPosition.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Preset Alert Buttons */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Quick Alerts
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {presetAlerts.map((preset, i) => (
              <Button
                key={i}
                variant="outline"
                className="flex-shrink-0 gap-2"
                data-testid={`button-preset-${i}`}
              >
                <Plus className="h-4 w-4" />
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* News Section */}
        {news && news.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Related News</h3>
            <div className="space-y-3">
              {news.slice(0, 5).map((item) => (
                <Card
                  key={item.id}
                  className="p-4 hover-elevate cursor-pointer"
                  onClick={() => window.open(item.url, "_blank")}
                  data-testid={`news-card-${item.id}`}
                >
                  <p className="font-medium line-clamp-2">{item.title}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">{item.source}</Badge>
                    <span>•</span>
                    <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
