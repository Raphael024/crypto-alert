import { useState } from "react";
import { X, Bell, Clock, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@shared/schema";

interface AlarmSheetProps {
  open: boolean;
  onClose: () => void;
  symbol: string;
  price: number;
  alertType: string;
  news?: NewsItem[];
  onSnooze?: (minutes: number) => void;
  onSetFollowUp?: () => void;
}

export function AlarmSheet({
  open,
  onClose,
  symbol,
  price,
  alertType,
  news = [],
  onSnooze,
  onSetFollowUp,
}: AlarmSheetProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleStop = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleSnooze = (minutes: number) => {
    onSnooze?.(minutes);
    handleStop();
  };

  return (
    <Dialog open={open} onOpenChange={handleStop}>
      <DialogContent
        className={cn(
          "max-w-md p-0 gap-0 border-none overflow-hidden",
          isClosing && "animate-out slide-out-to-bottom-10 duration-300"
        )}
        data-testid="dialog-alarm-sheet"
      >
        {/* Critical Alert Header */}
        <div className="bg-crypto-critical p-6 text-white animate-pulse">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">
                    Price Alert Triggered!
                  </DialogTitle>
                  <p className="text-white/80 text-sm mt-1">{symbol} Alert</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStop}
                className="text-white hover:bg-white/20"
                data-testid="button-close-alarm"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Alert Details */}
        <div className="p-6 space-y-6 bg-card">
          {/* Price Display */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Current Price</p>
            <p className="text-5xl font-mono font-bold" data-testid="text-alarm-price">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <Badge variant="outline" className="mt-2">
              {alertType}
            </Badge>
          </div>

          {/* Mini Chart Placeholder */}
          <div className="h-20 bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="flex items-end gap-1 h-12">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-crypto-bullish/40 rounded-t-sm transition-all"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Why is it moving? - Top Headlines */}
          {news.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Why is it moving?</h4>
              </div>
              <div className="space-y-2">
                {news.slice(0, 3).map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                    onClick={() => window.open(item.url, "_blank")}
                    data-testid={`news-item-${i}`}
                  >
                    <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Button
              size="lg"
              variant="destructive"
              className="w-full font-semibold"
              onClick={handleStop}
              data-testid="button-stop-alarm"
            >
              Stop Alert
            </Button>

            <div className="flex gap-2">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => handleSnooze(5)}
                data-testid="button-snooze-5"
              >
                <Clock className="h-4 w-4" />
                5min
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => handleSnooze(10)}
                data-testid="button-snooze-10"
              >
                <Clock className="h-4 w-4" />
                10min
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => handleSnooze(30)}
                data-testid="button-snooze-30"
              >
                <Clock className="h-4 w-4" />
                30min
              </Button>
            </div>

            {onSetFollowUp && (
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  onSetFollowUp();
                  handleStop();
                }}
                data-testid="button-follow-up"
              >
                Set Follow-up Alert (±1%)
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
