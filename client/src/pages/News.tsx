import { useState } from "react";
import { Newspaper, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsCard } from "@/components/NewsCard";
import { useQuery } from "@tanstack/react-query";
import type { NewsItem } from "@shared/schema";

export default function News() {
  const [filter, setFilter] = useState<string>("all");

  // Fetch news
  const { data: news, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/news", filter],
  });

  const filteredNews = filter === "all" 
    ? news 
    : news?.filter((item) => item.currencies?.includes(filter));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Crypto News</h1>
              <p className="text-sm text-muted-foreground">
                Trusted news with sentiment analysis
              </p>
            </div>
            <Button variant="outline" size="icon" data-testid="button-filter">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-[73px] z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4">
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap gap-2 bg-transparent border-0 p-0">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                data-testid="tab-all"
              >
                All News
              </TabsTrigger>
              <TabsTrigger 
                value="BTC" 
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                data-testid="tab-btc"
              >
                Bitcoin
              </TabsTrigger>
              <TabsTrigger 
                value="ETH" 
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                data-testid="tab-eth"
              >
                Ethereum
              </TabsTrigger>
              <TabsTrigger 
                value="SOL" 
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                data-testid="tab-sol"
              >
                Solana
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredNews && filteredNews.length > 0 ? (
          <div className="space-y-4">
            {filteredNews.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Newspaper className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No News Available</h3>
            <p className="text-muted-foreground max-w-sm">
              Check back later for the latest crypto news and market updates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
