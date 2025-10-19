import { useState } from "react";
import { Plus, TrendingUp, AlertCircle, Info, ArrowUp, Activity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import type { Alert } from "@shared/schema";

interface RecommendedAlert {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  description: string;
  alertType: "trending_news" | "breaking_news" | "important_updates" | "price_spike" | "volume_spike" | "trading_spike";
}

const recommendedAlerts: RecommendedAlert[] = [
  {
    id: "trending_news",
    icon: TrendingUp,
    iconColor: "text-blue-500",
    title: "Trending News",
    description: "New trending news about your Cryptos",
    alertType: "trending_news",
  },
  {
    id: "breaking_news",
    icon: AlertCircle,
    iconColor: "text-red-500",
    title: "Breaking News",
    description: "Breaking news about your Cryptos",
    alertType: "breaking_news",
  },
  {
    id: "important_updates",
    icon: Info,
    iconColor: "text-yellow-500",
    title: "Important Updates",
    description: "Don't miss out on important updates",
    alertType: "breaking_news", // Using breaking_news type for now
  },
  {
    id: "price_spike",
    icon: ArrowUp,
    iconColor: "text-green-500",
    title: "Price Spikes",
    description: "A coin you're watching just spiked",
    alertType: "price_spike",
  },
  {
    id: "volume_spike",
    icon: Activity,
    iconColor: "text-purple-500",
    title: "Volume Spikes",
    description: "A coin you're watching just spiked in trading volume",
    alertType: "volume_spike",
  },
  {
    id: "trading_spike",
    icon: Zap,
    iconColor: "text-orange-500",
    title: "Trading Spikes",
    description: "A coin you're watching just spiked in activity",
    alertType: "trading_spike",
  },
];

export default function Alerts() {
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const toggleAlertMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      return await apiRequest(`/api/alerts/${id}`, "PATCH", { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const createRecommendedAlertMutation = useMutation({
    mutationFn: async (alertType: string) => {
      return await apiRequest("/api/alerts", "POST", {
        symbol: "ALL", // For recommended alerts, apply to all coins
        type: alertType,
        params: {},
        active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/alerts/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  // Group alerts by type
  const customAlerts = alerts.filter(a => a.type === "price" || a.type === "pct_move" || a.type === "day_levels" || a.type === "vwap");
  const recommendedAlertStates = recommendedAlerts.map(rec => {
    const existing = alerts.find(a => a.type === rec.alertType);
    return {
      ...rec,
      alert: existing,
      isEnabled: existing?.active || false,
    };
  });

  const handleRecommendedToggle = async (rec: RecommendedAlert, currentState: boolean) => {
    const existing = alerts.find(a => a.type === rec.alertType);
    
    if (existing) {
      // Toggle existing alert
      await toggleAlertMutation.mutateAsync({ id: existing.id, active: !currentState });
    } else {
      // Create new recommended alert
      await createRecommendedAlertMutation.mutateAsync(rec.alertType);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold">Alerts</h1>
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-primary"
            data-testid="button-new-custom-alert"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Recommended Alerts Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
            Recommended Alerts
          </h2>
          <div className="space-y-2">
            {recommendedAlertStates.map((rec) => {
              const Icon = rec.icon;
              return (
                <div
                  key={rec.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover-elevate"
                  data-testid={`alert-toggle-${rec.id}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ${rec.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-0.5">{rec.title}</h3>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>

                  <Switch
                    checked={rec.isEnabled}
                    onCheckedChange={() => handleRecommendedToggle(rec, rec.isEnabled)}
                    disabled={toggleAlertMutation.isPending || createRecommendedAlertMutation.isPending}
                    data-testid={`switch-${rec.id}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Alerts Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
            Custom Alerts
          </h2>
          
          {customAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Custom Alerts</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Create custom price alerts for specific coins
              </p>
              <Button size="sm" className="gap-2" data-testid="button-create-custom-alert">
                <Plus className="h-4 w-4" />
                Create Custom Alert
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {customAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                  data-testid={`custom-alert-${alert.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{alert.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {JSON.stringify(alert.params)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={alert.active}
                      onCheckedChange={() => 
                        toggleAlertMutation.mutate({ id: alert.id, active: !alert.active })
                      }
                      disabled={toggleAlertMutation.isPending}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteAlertMutation.mutate(alert.id)}
                      disabled={deleteAlertMutation.isPending}
                      className="h-8 w-8"
                    >
                      <span className="text-destructive">×</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
