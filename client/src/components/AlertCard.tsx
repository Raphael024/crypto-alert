import { Bell, BellOff, Trash2, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Alert, AlertType } from "@shared/schema";

interface AlertCardProps {
  alert: Alert;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (alert: Alert) => void;
  className?: string;
}

const alertTypeLabels: Record<AlertType, string> = {
  price: "Price Alert",
  pct_move: "% Move",
  day_levels: "Daily Levels",
  vwap: "VWAP",
};

export function AlertCard({ alert, onToggle, onDelete, onEdit, className }: AlertCardProps) {
  const params = alert.params as any;
  
  const getAlertDescription = () => {
    switch (alert.type) {
      case "price":
        return `${params.direction === "above" ? "Above" : "Below"} $${params.level?.toLocaleString()}`;
      case "pct_move":
        return `${params.direction === "above" ? "+" : ""}${params.pct}% in ${params.windowMins}m`;
      case "day_levels":
        return `${params.level} reached`;
      case "vwap":
        return `Cross VWAP`;
      default:
        return "";
    }
  };

  return (
    <Card
      className={cn(
        "group relative border-l-4 transition-all",
        alert.active ? "border-l-primary" : "border-l-muted",
        className
      )}
      data-testid={`card-alert-${alert.id}`}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              alert.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {alert.active ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold" data-testid={`text-alert-symbol-${alert.id}`}>
                  {alert.symbol}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {alertTypeLabels[alert.type]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1" data-testid={`text-alert-description-${alert.id}`}>
                {getAlertDescription()}
              </p>
            </div>
          </div>

          {/* Active Toggle */}
          <Switch
            checked={alert.active}
            onCheckedChange={(checked) => onToggle(alert.id, checked)}
            data-testid={`switch-alert-${alert.id}`}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(alert)}
              className="gap-2"
              data-testid={`button-edit-alert-${alert.id}`}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(alert.id)}
            className="gap-2 text-destructive hover:text-destructive"
            data-testid={`button-delete-alert-${alert.id}`}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>

        {/* Snooze indicator */}
        {alert.snoozeUntil && new Date(alert.snoozeUntil) > new Date() && (
          <div className="pt-2 border-t border-border/50">
            <Badge variant="outline" className="text-xs">
              Snoozed until {new Date(alert.snoozeUntil).toLocaleTimeString()}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
