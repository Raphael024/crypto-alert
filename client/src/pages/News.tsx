import { useState } from "react";
import { ExternalLink, TrendingUp, TrendingDown, Minus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { NewsItem } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { NewsFilterSheet } from "@/components/NewsFilterSheet";

export default function News() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const { data: allNews, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
  });

  // Filter news based on search and filter selections
  const news = allNews?.filter((item) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.currencies?.some((c: string) => c.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Source filter (all, saved, favorites, portfolio)
    // For now, we only support "all" - other filters would need backend support
    if (activeFilter !== "all") {
      return false; // Not implemented yet
    }

    return true;
  });

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-3 w-3" />;
      case "negative":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-500 bg-green-500/10 border-green-500/30";
      case "negative":
        return "text-red-500 bg-red-500/10 border-red-500/30";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold">News</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFilterSheetOpen(true)}
            data-testid="button-open-filter"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {/* Active Filters Display */}
        {(activeFilter !== "all" || searchQuery) && (
          <div className="flex gap-2 items-center mb-2">
            <span className="text-xs text-muted-foreground">Active:</span>
            {activeFilter !== "all" && (
              <Badge variant="outline" className="text-xs">
                {activeFilter}
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="outline" className="text-xs">
                Search: {searchQuery}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* News Feed */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 bg-card rounded-lg border border-border animate-pulse">
                <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : news && news.length > 0 ? (
          <div className="space-y-3">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-card rounded-lg border border-border hover-elevate active-elevate-2 transition-all"
                data-testid={`news-item-${item.id}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-sm leading-tight flex-1">
                    {item.title}
                  </h3>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-primary">
                    {item.source}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Sentiment Badge */}
                  {item.sentiment && (
                    <Badge
                      variant="outline"
                      className={`text-xs gap-1 ${getSentimentColor(item.sentiment)}`}
                    >
                      {getSentimentIcon(item.sentiment)}
                      {item.sentiment}
                    </Badge>
                  )}

                  {/* Currency Tags */}
                  {item.currencies && item.currencies.slice(0, 3).map((currency: string) => (
                    <Badge
                      key={currency}
                      variant="outline"
                      className="text-xs"
                    >
                      {currency}
                    </Badge>
                  ))}

                  {/* Reliability Score */}
                  {item.score !== null && item.score !== undefined && (
                    <Badge variant="outline" className="text-xs ml-auto">
                      Score: {item.score}
                    </Badge>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ExternalLink className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No News Available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Check back later for the latest crypto news and market updates
            </p>
          </div>
        )}
      </div>

      {/* Filter Sheet */}
      <NewsFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        selectedFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}
