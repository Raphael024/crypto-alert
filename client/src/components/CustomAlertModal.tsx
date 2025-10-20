import { useState } from "react";
import { X, Search, TrendingUp, TrendingDown, Bell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { CoinPrice } from "@shared/schema";

interface CustomAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (alert: {
    symbol: string;
    type: "price" | "pct_move";
    params: {
      level?: number;
      direction?: "above" | "below";
      pct?: number;
      oneTime?: boolean;
      sound?: string;
    };
  }) => void;
}

const ALERT_SOUNDS = [
  { value: "chime", label: "Chime" },
  { value: "bell", label: "Bell" },
  { value: "ding", label: "Ding" },
  { value: "alert", label: "Alert" },
  { value: "whistle", label: "Whistle" },
];

export function CustomAlertModal({ open, onOpenChange, onSubmit }: CustomAlertModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<CoinPrice | null>(null);
  const [alertMode, setAlertMode] = useState<"price" | "percentage">("price");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState("");
  const [targetPercentage, setTargetPercentage] = useState("");
  const [oneTime, setOneTime] = useState(false);
  const [sound, setSound] = useState("chime");
  const [enablePush, setEnablePush] = useState(true);
  const [enableEmail, setEnableEmail] = useState(false);

  const { data: coins = [] } = useQuery<CoinPrice[]>({
    queryKey: ["/api/top-coins"],
  });

  const filteredCoins = coins.filter(
    (coin) =>
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 50); // Show top 50 results

  const handleSubmit = () => {
    if (!selectedCoin) return;

    if (alertMode === "price" && !targetPrice) return;
    if (alertMode === "percentage" && !targetPercentage) return;

    onSubmit({
      symbol: selectedCoin.symbol,
      type: alertMode === "price" ? "price" : "pct_move",
      params: {
        ...(alertMode === "price" 
          ? { level: parseFloat(targetPrice), direction } 
          : { pct: parseFloat(targetPercentage), direction }),
        oneTime,
        sound,
      },
    });

    // Reset form
    setSelectedCoin(null);
    setTargetPrice("");
    setTargetPercentage("");
    setOneTime(false);
    setSearchQuery("");
    onOpenChange(false);
  };

  const currentPrice = selectedCoin?.price || 0;
  const targetValue = alertMode === "price" ? parseFloat(targetPrice) : 0;
  const percentageChange = targetValue && currentPrice 
    ? ((targetValue - currentPrice) / currentPrice) * 100 
    : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Create Price Alert</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                data-testid="button-close-alert-modal"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Coin Selection */}
            {!selectedCoin ? (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Select Cryptocurrency</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search coins (BTC, ETH, SOL...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-coin-search"
                  />
                </div>

                {/* Coin List */}
                <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                  {filteredCoins.map((coin) => (
                    <div
                      key={coin.symbol}
                      className="flex items-center gap-3 p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer"
                      onClick={() => setSelectedCoin(coin)}
                      data-testid={`coin-option-${coin.symbol}`}
                    >
                      {coin.logoUrl && (
                        <img 
                          src={coin.logoUrl} 
                          alt={coin.symbol} 
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold">{coin.symbol}</div>
                        <div className="text-sm text-muted-foreground">{coin.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">
                          ${coin.price >= 1 
                            ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : coin.price.toFixed(6)}
                        </div>
                        <Badge
                          variant={coin.change24h >= 0 ? "default" : "destructive"}
                          className={`text-xs ${
                            coin.change24h >= 0 
                              ? "bg-green-500/20 text-green-500" 
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Selected Coin Display */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                  {selectedCoin.logoUrl && (
                    <img 
                      src={selectedCoin.logoUrl} 
                      alt={selectedCoin.symbol} 
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-lg">{selectedCoin.symbol}</div>
                    <div className="text-sm text-muted-foreground">{selectedCoin.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-primary">
                      ${selectedCoin.price >= 1 
                        ? selectedCoin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : selectedCoin.price.toFixed(6)}
                    </div>
                    <div className="text-xs text-muted-foreground">Current Price</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCoin(null)}
                    data-testid="button-change-coin"
                  >
                    Change
                  </Button>
                </div>

                {/* Alert Mode Toggle */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Alert Type</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={alertMode === "price" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setAlertMode("price")}
                      data-testid="button-mode-price"
                    >
                      Target Price
                    </Button>
                    <Button
                      variant={alertMode === "percentage" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setAlertMode("percentage")}
                      data-testid="button-mode-percentage"
                    >
                      % Change
                    </Button>
                  </div>
                </div>

                {/* Direction Toggle */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Alert When Price Goes</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={direction === "above" ? "default" : "outline"}
                      className={`flex-1 gap-2 ${direction === "above" ? "bg-green-600 hover:bg-green-700 border-green-700" : ""}`}
                      onClick={() => setDirection("above")}
                      data-testid="button-direction-above"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Above
                    </Button>
                    <Button
                      variant={direction === "below" ? "default" : "outline"}
                      className={`flex-1 gap-2 ${direction === "below" ? "bg-red-600 hover:bg-red-700 border-red-700" : ""}`}
                      onClick={() => setDirection("below")}
                      data-testid="button-direction-below"
                    >
                      <TrendingDown className="h-4 w-4" />
                      Below
                    </Button>
                  </div>
                </div>

                {/* Target Input */}
                {alertMode === "price" ? (
                  <div className="space-y-3">
                    <Label htmlFor="target-price" className="text-sm font-semibold">
                      Target Price (USD)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="target-price"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        className="pl-7 text-lg font-mono"
                        data-testid="input-target-price"
                      />
                    </div>
                    {targetPrice && (
                      <div className="text-sm text-muted-foreground text-center">
                        {percentageChange > 0 ? "+" : ""}{percentageChange.toFixed(2)}% from current price
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="target-percentage" className="text-sm font-semibold">
                      Percentage Change
                    </Label>
                    <div className="relative">
                      <Input
                        id="target-percentage"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={targetPercentage}
                        onChange={(e) => setTargetPercentage(e.target.value)}
                        className="pr-8 text-lg font-mono"
                        data-testid="input-target-percentage"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>
                )}

                {/* Alert Sound */}
                <div className="space-y-3">
                  <Label htmlFor="alert-sound" className="text-sm font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Alert Sound
                  </Label>
                  <Select value={sound} onValueChange={setSound}>
                    <SelectTrigger id="alert-sound" data-testid="select-alert-sound">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALERT_SOUNDS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* One-Time Alert Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                  <div>
                    <div className="font-semibold">One-Time Alert</div>
                    <div className="text-sm text-muted-foreground">
                      Alert will be disabled after triggering once
                    </div>
                  </div>
                  <Switch
                    checked={oneTime}
                    onCheckedChange={setOneTime}
                    data-testid="switch-one-time"
                  />
                </div>

                {/* Notification Channels */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Notification Channels</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                      <div className="flex items-center gap-3">
                        <Bell className="h-4 w-4 text-primary" />
                        <span className="font-medium">Push Notifications</span>
                      </div>
                      <Switch
                        checked={enablePush}
                        onCheckedChange={setEnablePush}
                        data-testid="switch-push"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border opacity-50">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Email</span>
                      </div>
                      <Switch
                        checked={enableEmail}
                        onCheckedChange={setEnableEmail}
                        disabled
                        data-testid="switch-email"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {selectedCoin && (
            <div className="p-4 border-t border-border">
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={
                  !selectedCoin ||
                  (alertMode === "price" && !targetPrice) ||
                  (alertMode === "percentage" && !targetPercentage)
                }
                data-testid="button-create-alert"
              >
                Create Alert
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
