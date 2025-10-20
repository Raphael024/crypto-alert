import { useState } from "react";
import { Search, X, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NewsFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const NEWS_FILTERS = [
  { id: "all", label: "All Cryptos", icon: "🌐" },
  { id: "saved", label: "Saved", icon: "🔖" },
  { id: "favorites", label: "Favorites", icon: "⭐" },
  { id: "portfolio", label: "Portfolio", icon: "💼" },
];

const SENTIMENT_FILTERS = [
  { id: "all_sentiment", label: "All News" },
  { id: "positive", label: "Positive", color: "text-green-500" },
  { id: "negative", label: "Negative", color: "text-red-500" },
  { id: "neutral", label: "Neutral", color: "text-muted-foreground" },
];

export function NewsFilterSheet({
  open,
  onOpenChange,
  selectedFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: NewsFilterSheetProps) {
  const [selectedSentiment, setSelectedSentiment] = useState("all_sentiment");

  const handleFilterSelect = (filterId: string) => {
    onFilterChange(filterId);
    // Don't auto-close so users can adjust multiple filters
  };

  const handleSentimentSelect = (sentimentId: string) => {
    setSelectedSentiment(sentimentId);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">Filter News</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-filter"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Search */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase mb-2 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search news..."
                className="pl-10"
                data-testid="input-news-search"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => onSearchChange("")}
                  data-testid="button-clear-search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Source Filter */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase mb-3 block">
              Source
            </label>
            <div className="grid grid-cols-2 gap-3">
              {NEWS_FILTERS.map((filter) => (
                <Button
                  key={filter.id}
                  variant="outline"
                  className={cn(
                    "h-auto py-4 flex-col gap-2 hover-elevate",
                    selectedFilter === filter.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => handleFilterSelect(filter.id)}
                  data-testid={`filter-${filter.id}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{filter.icon}</span>
                      <span className="font-semibold">{filter.label}</span>
                    </div>
                    {selectedFilter === filter.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Sentiment Filter */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase mb-3 block">
              Sentiment
            </label>
            <div className="space-y-2">
              {SENTIMENT_FILTERS.map((sentiment) => (
                <Button
                  key={sentiment.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-between hover-elevate",
                    selectedSentiment === sentiment.id && "bg-muted"
                  )}
                  onClick={() => handleSentimentSelect(sentiment.id)}
                  data-testid={`sentiment-${sentiment.id}`}
                >
                  <span className={sentiment.color || ""}>{sentiment.label}</span>
                  {selectedSentiment === sentiment.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Popular Coins Quick Filter */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase mb-3 block">
              Quick Filter
            </label>
            <div className="flex flex-wrap gap-2">
              {["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "MATIC"].map((symbol) => (
                <Badge
                  key={symbol}
                  variant="outline"
                  className="cursor-pointer hover-elevate px-3 py-1.5"
                  onClick={() => onSearchChange(symbol)}
                  data-testid={`quick-filter-${symbol}`}
                >
                  {symbol}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="sticky bottom-0 bg-card pt-4 pb-6 border-t border-border">
          <Button
            className="w-full"
            onClick={() => onOpenChange(false)}
            data-testid="button-apply-filters"
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
