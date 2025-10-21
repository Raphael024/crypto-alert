import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CoinPrice } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface CalculatorModalProps {
  open: boolean;
  onClose: () => void;
  currentCoin?: CoinPrice;
}

const CONVERSION_CURRENCIES = [
  { value: "USD", label: "USD - US Dollar", symbol: "$", type: "fiat" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£", type: "fiat" },
  { value: "EUR", label: "EUR - Euro", symbol: "€", type: "fiat" },
  { value: "RUB", label: "RUB - Russian Ruble", symbol: "₽", type: "fiat" },
  { value: "AUD", label: "AUD - Australian Dollar", symbol: "A$", type: "fiat" },
  { value: "CAD", label: "CAD - Canadian Dollar", symbol: "C$", type: "fiat" },
  { value: "BTC", label: "BTC - Bitcoin", symbol: "₿", type: "crypto" },
  { value: "ETH", label: "ETH - Ethereum", symbol: "Ξ", type: "crypto" },
];

// Approximate fiat exchange rates (for demo - in production would use real rates)
const FIAT_RATES: Record<string, number> = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  RUB: 92.5,
  AUD: 1.53,
  CAD: 1.36,
};

export function CalculatorModal({ open, onClose, currentCoin }: CalculatorModalProps) {
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState("");

  // Fetch crypto prices for conversion
  const { data: prices } = useQuery<Record<string, CoinPrice>>({
    queryKey: ['/api/prices'],
    refetchInterval: 10000,
  });

  // Calculate conversion
  useEffect(() => {
    if (!amount || !currentCoin || !prices) {
      setResult("");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      setResult("");
      return;
    }

    let converted = 0;
    const fromPrice = currentCoin.price; // Price in USD

    // Find the target currency
    const targetCurrency = CONVERSION_CURRENCIES.find(c => c.value === toCurrency);
    
    if (targetCurrency?.type === "fiat") {
      // Crypto to Fiat conversion
      const usdValue = numAmount * fromPrice;
      const fiatRate = FIAT_RATES[toCurrency] || 1;
      converted = usdValue * fiatRate;
    } else {
      // Crypto to Crypto conversion
      const targetPrice = prices[toCurrency]?.price || 0;
      if (targetPrice > 0) {
        const usdValue = numAmount * fromPrice;
        converted = usdValue / targetPrice;
      }
    }

    setResult(converted.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 8 
    }));
  }, [amount, currentCoin, toCurrency, prices]);

  const handleNumberClick = (num: string) => {
    if (amount === "0") {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleDecimalClick = () => {
    if (!amount.includes(".")) {
      setAmount(amount + ".");
    }
  };

  const handleClear = () => {
    setAmount("0");
    setResult("");
  };

  const handleBackspace = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount("0");
    }
  };

  if (!open) return null;

  const fromSymbol = currentCoin?.symbol || "BTC";
  const fromName = currentCoin?.name || "Bitcoin";

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-bold">Calculator</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-close-calculator"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Currency Selectors */}
      <div className="p-4 space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* From (Locked to current coin) */}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">From</p>
              <div 
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-muted px-3 py-2 text-sm"
                data-testid="text-from-currency"
              >
                <span className="font-semibold">{fromSymbol}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{fromName}</p>
            </div>

            {/* Arrow */}
            <div className="mt-5 text-2xl text-muted-foreground">→</div>

            {/* To (User selectable) */}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">To</p>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-full" data-testid="select-to-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONVERSION_CURRENCIES.map((currency) => (
                    <SelectItem 
                      key={currency.value} 
                      value={currency.value}
                      disabled={currency.value === fromSymbol}
                    >
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Display */}
        <Card className="p-6 bg-muted/50">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{fromSymbol}</p>
              <p className="text-3xl font-bold font-mono" data-testid="text-from-amount">
                {amount}
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-1">{toCurrency}</p>
              <p className="text-3xl font-bold font-mono text-primary" data-testid="text-to-amount">
                {result || "0"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Numeric Keypad */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <Button
              key={num}
              variant="outline"
              className="h-16 text-2xl font-semibold hover-elevate"
              onClick={() => handleNumberClick(num)}
              data-testid={`button-num-${num}`}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-16 text-2xl font-semibold hover-elevate"
            onClick={handleDecimalClick}
            data-testid="button-decimal"
          >
            .
          </Button>
          <Button
            variant="outline"
            className="h-16 text-2xl font-semibold hover-elevate"
            onClick={() => handleNumberClick('0')}
            data-testid="button-num-0"
          >
            0
          </Button>
          <Button
            variant="outline"
            className="h-16 text-xl font-semibold hover-elevate"
            onClick={handleBackspace}
            data-testid="button-backspace"
          >
            ⌫
          </Button>
        </div>

        {/* Clear Button */}
        <div className="max-w-sm mx-auto mt-3">
          <Button
            variant="ghost"
            className="w-full h-12 text-lg"
            onClick={handleClear}
            data-testid="button-clear"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
