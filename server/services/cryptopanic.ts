import type { NewsItem, InsertNewsItem } from "@shared/schema";

const CP_TOKEN = process.env.CRYPTOPANIC_TOKEN;
const CP_BASE_URL = "https://cryptopanic.com/api/v1";

interface CPPost {
  id: number;
  title: string;
  url: string;
  source: {
    title: string;
  };
  published_at: string;
  currencies?: Array<{ code: string }>;
  kind: string;
  votes?: {
    positive: number;
    negative: number;
    important: number;
  };
}

export class CryptoPanicService {
  private newsCache: NewsItem[] = [];
  private lastUpdate: number = 0;

  async getLatestNews(currencies?: string[]): Promise<NewsItem[]> {
    const now = Date.now();

    // Cache for 2 minutes to avoid rate limits
    if (now - this.lastUpdate < 120000 && this.newsCache.length > 0) {
      if (!currencies) return this.newsCache;
      return this.newsCache.filter(news => 
        news.currencies?.some(c => currencies.includes(c))
      );
    }

    try {
      const currencyParam = currencies ? `&currencies=${currencies.join(',')}` : '';
      const response = await fetch(
        `${CP_BASE_URL}/posts/?auth_token=${CP_TOKEN}${currencyParam}&kind=news&public=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CryptoPanic API error: ${response.statusText}`);
      }

      const data = await response.json();
      this.newsCache = data.results.map((post: CPPost) => this.transformPost(post));
      this.lastUpdate = now;

      return this.newsCache;
    } catch (error) {
      console.error('CryptoPanic API error:', error);
      return this.newsCache; // Return cached data on error
    }
  }

  private transformPost(post: CPPost): NewsItem {
    const sentiment = this.calculateSentiment(post.votes);
    const score = this.calculateReliabilityScore(post.votes);

    return {
      id: post.id.toString(),
      title: post.title,
      url: post.url,
      source: post.source.title,
      sentiment,
      currencies: post.currencies?.map(c => c.code) || [],
      publishedAt: new Date(post.published_at),
      score: score.toString(),
      createdAt: new Date(),
    };
  }

  private calculateSentiment(votes?: CPPost['votes']): 'positive' | 'negative' | 'neutral' {
    if (!votes) return 'neutral';

    const positive = votes.positive || 0;
    const negative = votes.negative || 0;
    const total = positive + negative;

    if (total < 5) return 'neutral';
    
    const ratio = positive / total;
    if (ratio > 0.6) return 'positive';
    if (ratio < 0.4) return 'negative';
    return 'neutral';
  }

  private calculateReliabilityScore(votes?: CPPost['votes']): number {
    if (!votes) return 50;

    const important = votes.important || 0;
    const total = (votes.positive || 0) + (votes.negative || 0) + important;

    // Base score on engagement
    const baseScore = Math.min(total * 2, 70);
    const importanceBonus = Math.min(important * 5, 30);

    return Math.min(baseScore + importanceBonus, 100);
  }
}

export const cryptoPanicService = new CryptoPanicService();
