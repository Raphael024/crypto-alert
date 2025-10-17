import { useEffect, useRef, useState } from "react";

interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

interface AlertTrigger {
  alertId: string;
  symbol: string;
  price: number;
  type: string;
}

interface WebSocketMessage {
  type: "price_update" | "alert_triggered";
  data: PriceUpdate[] | AlertTrigger;
}

interface UseWebSocketOptions {
  onAlertTriggered?: (alert: AlertTrigger) => void;
}

export function useWebSocket(options?: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState<Map<string, PriceUpdate>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        
        // Subscribe to all watchlist symbols
        // This could be improved to only subscribe to current user's watchlist
        ws.send(JSON.stringify({
          type: "subscribe",
          symbols: ["BTC", "ETH", "SOL", "ADA", "DOT", "MATIC", "LINK", "UNI"]
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.type === "price_update") {
            const updates = message.data as PriceUpdate[];
            setPrices((prev) => {
              const newPrices = new Map(prev);
              updates.forEach((update) => {
                newPrices.set(update.symbol, update);
              });
              return newPrices;
            });
          } else if (message.type === "alert_triggered") {
            const alert = message.data as AlertTrigger;
            options?.onAlertTriggered?.(alert);
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        wsRef.current = null;
        
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [options]);

  const getPrice = (symbol: string): number | undefined => {
    return prices.get(symbol)?.price;
  };

  return {
    isConnected,
    prices,
    getPrice,
  };
}
