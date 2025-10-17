import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriceCardProps {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline?: number[];
  onClick?: () => void;
  className?: string;
}

export function PriceCard({
  symbol,
  name,
  price,
  change24h,
  sparkline,
  onClick,
  className,
}: PriceCardProps) {
  const isPositive = change24h >= 0;
  const changeColor = isPositive ? "text-crypto-bullish" : "text-crypto-bearish";
  const bgFlash = isPositive ? "bg-crypto-bullish/10" : "bg-crypto-bearish/10";

  return (
    <Card
      className={cn(
        "hover-elevate active-elevate-2 cursor-pointer transition-all duration-200",
        className
      )}
      onClick={onClick}
      data-testid={`card-coin-${symbol.toLowerCase()}`}
    >
      <div className="p-4 space-y-3">
        {/* Header: Symbol + Name */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg font-bold" data-testid={`text-symbol-${symbol.toLowerCase()}`}>
                {symbol[0]}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate" data-testid={`text-name-${symbol.toLowerCase()}`}>
                {symbol}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{name}</p>
            </div>
          </div>
        </div>

        {/* Price + Change */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-2xl font-mono font-semibold tracking-tight" data-testid={`text-price-${symbol.toLowerCase()}`}>
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 font-mono text-sm px-2 py-1",
              isPositive ? "bg-crypto-bullish/10 text-crypto-bullish border-crypto-bullish/20" : "bg-crypto-bearish/10 text-crypto-bearish border-crypto-bearish/20"
            )}
            data-testid={`badge-change-${symbol.toLowerCase()}`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change24h).toFixed(2)}%
          </Badge>
        </div>

        {/* Sparkline placeholder */}
        {sparkline && sparkline.length > 0 && (
          <div className="h-12 flex items-end gap-0.5">
            {sparkline.slice(-20).map((value, i) => {
              const height = ((value - Math.min(...sparkline)) / (Math.max(...sparkline) - Math.min(...sparkline))) * 100;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t-sm transition-all",
                    isPositive ? "bg-crypto-bullish/40" : "bg-crypto-bearish/40"
                  )}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
