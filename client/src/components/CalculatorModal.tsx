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

interface CalculatorModalProps {
  open: boolean;
  onClose: () => void;
  currentCoin?: CoinPrice;
}

const FIAT_CURRENCIES = [
  { value: "USD", label: "USD", symbol: "$" },
  { value: "EUR", label: "EUR", symbol: "€" },
  { value: "GBP", label: "GBP", symbol: "£" },
  { value: "JPY", label: "JPY", symbol: "¥" },
];

export function CalculatorModal({ open, onClose, currentCoin }: CalculatorModalProps) {
  const [fromCurrency, setFromCurrency] = useState(currentCoin?.symbol || "BTC");
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState("");

  // Mock conversion rate (in real app, would use actual exchange rates)
  const conversionRate = currentCoin?.price || 50000;

  useEffect(() => {
    if (amount) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount)) {
        const converted = numAmount * conversionRate;
        setResult(converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }
    } else {
      setResult("");
    }
  }, [amount, conversionRate]);

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

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    if (result) {
      setAmount(result.replace(/,/g, ""));
    }
  };

  if (!open) return null;

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
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">From</p>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="w-full" data-testid="select-from-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                  {currentCoin && currentCoin.symbol !== "BTC" && currentCoin.symbol !== "ETH" && currentCoin.symbol !== "SOL" && (
                    <SelectItem value={currentCoin.symbol}>{currentCoin.symbol}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwap}
              className="mt-5"
              data-testid="button-swap-currencies"
            >
              ⇄
            </Button>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">To</p>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-full" data-testid="select-to-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIAT_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
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
              <p className="text-sm text-muted-foreground mb-1">{fromCurrency}</p>
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
