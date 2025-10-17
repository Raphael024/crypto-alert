import { useState } from "react";
import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCard } from "@/components/AlertCard";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Alert, AlertFire } from "@shared/schema";

export default function Alerts() {
  const { toast } = useToast();

  // Fetch alerts
  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  // Fetch alert history
  const { data: history } = useQuery<AlertFire[]>({
    queryKey: ["/api/alerts/history"],
  });

  // Toggle alert mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      return apiRequest("PATCH", `/api/alerts/${id}`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({ title: "Alert updated successfully" });
    },
  });

  // Delete alert mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({ title: "Alert deleted successfully" });
    },
  });

  const activeAlerts = alerts?.filter((a) => a.active) || [];
  const inactiveAlerts = alerts?.filter((a) => !a.active) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Price Alerts</h1>
              <p className="text-sm text-muted-foreground">
                {activeAlerts.length} active alert{activeAlerts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button data-testid="button-create-alert">
              <Plus className="h-4 w-4 mr-2" />
              New Alert
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="active" data-testid="tab-active">
              Active ({activeAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="inactive" data-testid="tab-inactive">
              Inactive ({inactiveAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              History ({history?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
                ))}
              </div>
            ) : activeAlerts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onToggle={(id, active) => toggleMutation.mutate({ id, active })}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Create price alerts to get notified when your crypto hits target prices
                </p>
                <Button data-testid="button-create-first-alert">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Alert
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            {inactiveAlerts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inactiveAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onToggle={(id, active) => toggleMutation.mutate({ id, active })}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                No inactive alerts
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((fire) => (
                  <div
                    key={fire.id}
                    className="p-4 bg-card rounded-lg border border-border flex items-center justify-between gap-4"
                    data-testid={`history-item-${fire.id}`}
                  >
                    <div>
                      <p className="font-semibold">{fire.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        ${Number(fire.price).toLocaleString(undefined, { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(fire.firedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                No alert history yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
