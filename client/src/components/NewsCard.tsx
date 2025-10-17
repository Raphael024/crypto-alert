import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@shared/schema";

interface NewsCardProps {
  news: NewsItem;
  className?: string;
}

const sentimentConfig = {
  positive: {
    icon: TrendingUp,
    color: "text-crypto-bullish",
    bg: "bg-crypto-bullish/10",
    border: "border-crypto-bullish/20",
  },
  negative: {
    icon: TrendingDown,
    color: "text-crypto-bearish",
    bg: "bg-crypto-bearish/10",
    border: "border-crypto-bearish/20",
  },
  neutral: {
    icon: Minus,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-muted",
  },
};

export function NewsCard({ news, className }: NewsCardProps) {
  const sentiment = news.sentiment || "neutral";
  const config = sentimentConfig[sentiment];
  const SentimentIcon = config.icon;

  const handleClick = () => {
    window.open(news.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      className={cn(
        "hover-elevate active-elevate-2 cursor-pointer transition-all border-l-4",
        config.border,
        className
      )}
      onClick={handleClick}
      data-testid={`card-news-${news.id}`}
    >
      <div className="p-4 space-y-3">
        {/* Source + Sentiment */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Badge variant="secondary" className="text-xs font-medium">
            {news.source}
          </Badge>
          
          <Badge
            variant="outline"
            className={cn("flex items-center gap-1 text-xs", config.bg, config.color, config.border)}
          >
            <SentimentIcon className="h-3 w-3" />
            {sentiment}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base leading-snug line-clamp-2" data-testid={`text-news-title-${news.id}`}>
          {news.title}
        </h3>

        {/* Currencies + Timestamp */}
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            {news.currencies && news.currencies.length > 0 && (
              <div className="flex items-center gap-1">
                {news.currencies.slice(0, 3).map((currency) => (
                  <Badge key={currency} variant="outline" className="text-xs px-1.5 py-0">
                    {currency}
                  </Badge>
                ))}
                {news.currencies.length > 3 && (
                  <span className="text-xs">+{news.currencies.length - 3}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs">
              {new Date(news.publishedAt).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>

        {/* Reliability Score */}
        {news.score && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Reliability:</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Number(news.score)}%` }}
                />
              </div>
              <span className="text-xs font-medium">{Number(news.score).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
