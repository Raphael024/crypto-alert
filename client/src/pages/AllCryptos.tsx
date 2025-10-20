import { useState } from "react";
import { ChevronDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import type { CoinPrice } from "@shared/schema";

// Mini sparkline component
function Sparkline({ data, change }: { data?: number[], change: number }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const width = 60;
  const height = 30;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const color = change >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';

  return (
    <svg width={width} height={height} className="opacity-80">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AllCryptos() {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const { data: coins, isLoading } = useQuery<CoinPrice[]>({
    queryKey: ["/api/top-coins"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate market stats
  const totalMarketCap = coins?.reduce((sum, coin) => sum + (coin.marketCap || 0), 0) || 0;
  const totalVolume = coins?.reduce((sum, coin) => sum + (coin.volume24h || 0), 0) || 0;
  const btcDominance = coins && coins.length > 0 
    ? ((coins[0].marketCap / totalMarketCap) * 100) 
    : 0;

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    return num.toFixed(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              <ChevronDown className="h-4 w-4" />
              <span className="text-sm">Lists</span>
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                <span className="text-sm">Mkt</span>
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary">
                <span className="text-sm">{selectedCurrency}</span>
              </Button>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-1">All Cryptos</h1>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Mkt {formatLargeNumber(totalMarketCap)}</span>
            <span>Vol {formatLargeNumber(totalVolume)}</span>
            <span>Dom {btcDominance.toFixed(1)}%</span>
            <span>Gas 0</span>
          </div>
        </div>
      </div>

      {/* Coin List */}
      <div className="px-4 py-2">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                <div className="w-6 h-4 bg-muted rounded" />
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-20 bg-muted rounded mb-1" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
                <div className="w-16 h-8 bg-muted rounded" />
                <div className="w-20 h-4 bg-muted rounded" />
                <div className="w-16 h-6 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {coins?.map((coin, index) => (
              <div
                key={coin.symbol}
                className="flex items-center gap-3 py-3 border-b border-border/50 hover-elevate active-elevate-2 cursor-pointer"
                onClick={() => window.location.href = `/coin/${coin.symbol}`}
                data-testid={`coin-row-${coin.symbol}`}
              >
                {/* Rank */}
                <span className="text-xs text-muted-foreground w-6 text-right font-mono">
                  {index + 1}
                </span>

                {/* Coin Logo */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {coin.logoUrl ? (
                    <img 
                      src={coin.logoUrl} 
                      alt={coin.symbol}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initial if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><span class="text-xs font-bold text-primary">${coin.symbol.charAt(0)}</span></div>`;
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {coin.symbol.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Symbol and Name */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{coin.symbol}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {index + 1} {coin.name}
                  </div>
                </div>

                {/* Sparkline */}
                <div className="flex-shrink-0">
                  <Sparkline data={coin.sparkline} change={coin.change24h} />
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0 w-24">
                  <div className="text-sm font-mono font-semibold">
                    {coin.price >= 1 
                      ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : coin.price.toFixed(6)}
                  </div>
                </div>

                {/* Change Badge */}
                <Badge
                  variant={coin.change24h >= 0 ? "default" : "destructive"}
                  className={`font-mono text-xs flex-shrink-0 min-w-[4rem] justify-center ${
                    coin.change24h >= 0 
                      ? "bg-green-500/20 text-green-500 border-green-500/30" 
                      : "bg-red-500/20 text-red-500 border-red-500/30"
                  }`}
                  data-testid={`change-${coin.symbol}`}
                >
                  {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
