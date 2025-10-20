import { useState } from "react";
import { useRoute } from "wouter";
import { ArrowLeft, Calculator, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { CoinPrice, NewsItem } from "@shared/schema";
import { CustomAlertModal } from "@/components/CustomAlertModal";

type TimePeriod = '1H' | '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
type ChartMode = 'Price' | 'Volume';

export default function Coin() {
  const [, params] = useRoute("/coin/:symbol");
  const symbol = params?.symbol?.toUpperCase() || "";
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1D');
  const [chartMode, setChartMode] = useState<ChartMode>('Price');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showWiki, setShowWiki] = useState(false);
  const { toast } = useToast();

  // Create alert mutation
  const createCustomAlertMutation = useMutation({
    mutationFn: async (alert: any) => {
      const payload = {
        ...alert,
        active: true,
      };
      return await apiRequest("POST", "/api/alerts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Created",
        description: "You'll be notified when the price target is reached.",
      });
      setShowAlertModal(false);
    },
    onError: () => {
      toast({
        title: "Failed to create alert",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const formatNumber = (num: number | undefined) => {
    if (!num) return "0";
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const timePeriods: TimePeriod[] = ['1H', '1D', '1W', '1M', '3M', '1Y', 'ALL'];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-primary">Crypto Pro</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <span className="text-xl">⋯</span>
              </Button>
              <Button variant="ghost" size="icon">
                <span className="text-xl">☆</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Coin Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3 mb-2">
          {price?.logoUrl && (
            <img 
              src={price.logoUrl} 
              alt={symbol}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{symbol}</h2>
              <span className="text-sm text-muted-foreground">▼</span>
            </div>
            <p className="text-sm text-muted-foreground">
              ${price?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold font-mono">
            USD {formatNumber(price?.price)}
          </div>
          <div className={cn(
            "text-lg font-semibold",
            isPositive ? "text-green-500" : "text-red-500"
          )}>
            {isPositive ? "+" : ""}{formatNumber((price?.price || 0) * (price?.change24h || 0) / 100)} ({(price?.change24h || 0).toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 py-4 border-b border-border/50">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Mkt</span>
            <span className="text-sm font-semibold">{formatNumber(price?.marketCap)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">High ›</span>
            <span className="text-sm font-semibold">{formatNumber(price?.high24h)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Supply</span>
            <span className="text-sm font-semibold">{formatNumber(price?.circulatingSupply)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Low ›</span>
            <span className="text-sm font-semibold">{formatNumber(price?.low24h)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Max</span>
            <span className="text-sm font-semibold">{formatNumber(price?.maxSupply)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Wiki</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-primary"
              onClick={() => setShowWiki(true)}
            >
              ›
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Vol</span>
            <span className="text-sm font-semibold">{formatNumber(price?.volume24h)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Calculator</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-primary"
              onClick={() => setShowCalculator(true)}
            >
              ›
            </Button>
          </div>
        </div>

        {/* Rank and Portfolio */}
        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Rank</span>
            <span className="text-2xl font-bold">{price?.rank || 1}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Portfolio ›</span>
            <span className="text-sm">—</span>
          </div>
        </div>
      </div>

      {/* Time Period Filters */}
      <div className="px-4 py-3 border-b border-border/50">
        <div className="flex gap-2 overflow-x-auto">
          {timePeriods.map((period) => (
            <Button
              key={period}
              variant={timePeriod === period ? "default" : "ghost"}
              size="sm"
              className={cn(
                "flex-shrink-0 min-w-[3rem] h-8",
                timePeriod === period && "bg-muted text-foreground"
              )}
              onClick={() => setTimePeriod(period)}
              data-testid={`button-period-${period}`}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 py-4">
        <div className="relative h-64 bg-muted/30 rounded-lg overflow-hidden">
          {/* Simple Chart Visualization */}
          <div className="absolute inset-0 flex items-end gap-1 p-4">
            {price?.sparkline?.map((value, i) => {
              const height = ((value - (price.low24h || 0)) / ((price.high24h || 0) - (price.low24h || 0))) * 100;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t-sm transition-all",
                    isPositive ? "bg-primary/60" : "bg-red-500/60"
                  )}
                  style={{ height: `${Math.max(5, height)}%` }}
                />
              );
            })}
          </div>

          {/* Price labels on right */}
          <div className="absolute right-2 top-2 text-xs text-muted-foreground">
            {formatNumber(price?.high24h)}
          </div>
          <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
            {formatNumber(price?.low24h)}
          </div>
        </div>

        {/* Chart Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-muted/50"
            >
              <span className="text-sm">📈</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-muted/50"
            >
              <span className="text-sm">📊</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-muted/50"
            >
              <span className="text-sm">✏️</span>
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={chartMode === 'Volume' ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartMode('Volume')}
              className={cn(
                "h-9",
                chartMode === 'Volume' && "bg-muted text-foreground"
              )}
            >
              Volume
            </Button>
            <Button
              variant={chartMode === 'Price' ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartMode('Price')}
              className={cn(
                "h-9",
                chartMode === 'Price' && "bg-muted text-foreground"
              )}
            >
              Price
            </Button>
          </div>
        </div>
      </div>

      {/* Bitcoin News Section */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-bold mb-3">{symbol} News</h3>
        <div className="space-y-3">
          {news && news.length > 0 ? (
            news.slice(0, 5).map((item) => (
              <Card
                key={item.id}
                className="p-4 hover-elevate cursor-pointer"
                onClick={() => window.open(item.url, "_blank")}
                data-testid={`news-card-${item.id}`}
              >
                <div className="flex gap-3">
                  {/* Placeholder for news thumbnail */}
                  <div className="flex-1">
                    <p className="text-xs text-primary font-semibold uppercase mb-1">
                      {item.source}
                    </p>
                    <p className="font-medium line-clamp-2 mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No news available for {symbol}
            </p>
          )}
        </div>
      </div>

      {/* Floating Add Alert Button */}
      <div className="fixed bottom-20 right-4 z-20">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          onClick={() => setShowAlertModal(true)}
          data-testid="button-add-alert"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Alert Modal */}
      <CustomAlertModal
        open={showAlertModal}
        onOpenChange={setShowAlertModal}
        onSubmit={(alert) => createCustomAlertMutation.mutate(alert)}
      />

      {/* Calculator Placeholder */}
      {showCalculator && (
        <div 
          className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center"
          onClick={() => setShowCalculator(false)}
        >
          <Card className="p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Calculator</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCalculator(false)}>
                ✕
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Calculator feature coming soon...
            </p>
          </Card>
        </div>
      )}

      {/* Wiki Placeholder */}
      {showWiki && (
        <div 
          className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center"
          onClick={() => setShowWiki(false)}
        >
          <Card className="p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Wiki</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowWiki(false)}>
                ✕
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Wiki information for {symbol} coming soon...
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
