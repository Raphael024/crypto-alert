import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AlarmSheet } from "@/components/AlarmSheet";
import { notificationService } from "./notifications";
import { useQuery } from "@tanstack/react-query";
import type { NewsItem } from "@shared/schema";

interface AlertTrigger {
  alertId: string;
  symbol: string;
  price: number;
  type: string;
}

interface AlertManagerContextType {
  triggerAlert: (data: AlertTrigger) => void;
}

const AlertManagerContext = createContext<AlertManagerContextType | undefined>(undefined);

export function AlertManagerProvider({ children }: { children: ReactNode }) {
  const [activeAlert, setActiveAlert] = useState<AlertTrigger | null>(null);

  // Fetch news for the active alert symbol
  const { data: news } = useQuery<NewsItem[]>({
    queryKey: ["/api/news", activeAlert?.symbol],
    enabled: !!activeAlert,
  });

  const triggerAlert = (data: AlertTrigger) => {
    // Show browser notification
    notificationService.showAlertNotification({
      symbol: data.symbol,
      price: data.price,
      alertType: data.type,
    });

    // Show alarm sheet
    setActiveAlert(data);
  };

  const handleSnooze = (minutes: number) => {
    // TODO: Implement snooze API call
    console.log(`Snoozed for ${minutes} minutes`);
    setActiveAlert(null);
  };

  const handleClose = () => {
    setActiveAlert(null);
  };

  return (
    <AlertManagerContext.Provider value={{ triggerAlert }}>
      {children}
      {activeAlert && (
        <AlarmSheet
          open={true}
          onClose={handleClose}
          symbol={activeAlert.symbol}
          price={activeAlert.price}
          alertType={activeAlert.type}
          news={news?.slice(0, 3) || []}
          onSnooze={handleSnooze}
        />
      )}
    </AlertManagerContext.Provider>
  );
}

export function useAlertManager() {
  const context = useContext(AlertManagerContext);
  if (!context) {
    throw new Error("useAlertManager must be used within AlertManagerProvider");
  }
  return context;
}
