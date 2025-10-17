import { createContext, useContext, ReactNode } from "react";
import { useWebSocket } from "./useWebSocket";
import { useAlertManager } from "./alertManager";

interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

interface WebSocketContextType {
  isConnected: boolean;
  prices: Map<string, PriceUpdate>;
  getPrice: (symbol: string) => number | undefined;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { triggerAlert } = useAlertManager();
  
  const websocket = useWebSocket({
    onAlertTriggered: triggerAlert,
  });

  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within WebSocketProvider");
  }
  return context;
}
