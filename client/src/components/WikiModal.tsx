import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CoinPrice } from "@shared/schema";

interface WikiModalProps {
  open: boolean;
  onClose: () => void;
  coin?: CoinPrice;
}

// Mock wiki data - in real app would fetch from API
const WIKI_DATA: Record<string, any> = {
  BTC: {
    description: "Bitcoin is a decentralized digital currency that can be transferred on the peer-to-peer bitcoin network. Bitcoin transactions are verified by network nodes through cryptography and recorded in a public distributed ledger called a blockchain.",
    established: "2009-01-03",
    creator: "Satoshi Nakamoto",
    blockTime: "10 minutes",
    hashAlgorithm: "SHA-256",
    website: "bitcoin.org",
    whitepaper: "bitcoin.org/bitcoin.pdf",
  },
  ETH: {
    description: "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform.",
    established: "2015-07-30",
    creator: "Vitalik Buterin",
    blockTime: "12 seconds",
    hashAlgorithm: "Ethash (transitioning to PoS)",
    website: "ethereum.org",
    whitepaper: "ethereum.org/en/whitepaper",
  },
  SOL: {
    description: "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale. Solana is known for its fast transaction speeds and low costs.",
    established: "2020-03-16",
    creator: "Anatoly Yakovenko",
    blockTime: "0.4 seconds",
    hashAlgorithm: "Proof of History + PoS",
    website: "solana.com",
    whitepaper: "solana.com/solana-whitepaper.pdf",
  },
};

export function WikiModal({ open, onClose, coin }: WikiModalProps) {
  if (!open || !coin) return null;

  const wikiData = WIKI_DATA[coin.symbol] || {
    description: `${coin.name} is a cryptocurrency.`,
    established: "N/A",
    creator: "N/A",
    blockTime: "N/A",
    hashAlgorithm: "N/A",
    website: "N/A",
    whitepaper: "N/A",
  };

  return (
    <div 
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <Card 
        className="w-full sm:max-w-2xl sm:mx-4 rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            {coin.logoUrl && (
              <img 
                src={coin.logoUrl} 
                alt={coin.symbol}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-bold">{coin.name}</h2>
              <p className="text-sm text-muted-foreground">{coin.symbol}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-wiki"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
              About
            </h3>
            <p className="text-sm leading-relaxed">{wikiData.description}</p>
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">
              Details
            </h3>
            
            <div className="grid gap-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Established</span>
                <span className="text-sm font-semibold">{wikiData.established}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Creator</span>
                <span className="text-sm font-semibold">{wikiData.creator}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Block Time</span>
                <span className="text-sm font-semibold">{wikiData.blockTime}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Hash Algorithm</span>
                <span className="text-sm font-semibold">{wikiData.hashAlgorithm}</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">
              Resources
            </h3>
            
            <div className="space-y-2">
              {wikiData.website !== "N/A" && (
                <a
                  href={`https://${wikiData.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate"
                  data-testid="link-website"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm">🌐</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Official Website</p>
                      <p className="text-xs text-muted-foreground">{wikiData.website}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              )}

              {wikiData.whitepaper !== "N/A" && (
                <a
                  href={`https://${wikiData.whitepaper}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate"
                  data-testid="link-whitepaper"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm">📄</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Whitepaper</p>
                      <p className="text-xs text-muted-foreground">{wikiData.whitepaper}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
            </div>
          </div>

          {/* Market Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">
              Market Data
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Rank</p>
                <p className="text-2xl font-bold">#{coin.rank || 'N/A'}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
                <p className="text-lg font-bold">
                  ${(coin.marketCap / 1e9).toFixed(2)}B
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
