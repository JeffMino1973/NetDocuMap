import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Bell, Clock } from "lucide-react";
import type { Alert } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Helper to ensure timestamps are Date objects
const parseAlert = (alert: any): Alert => ({
  ...alert,
  timestamp: typeof alert.timestamp === 'string' ? new Date(alert.timestamp) : alert.timestamp,
  acknowledgedAt: alert.acknowledgedAt 
    ? (typeof alert.acknowledgedAt === 'string' ? new Date(alert.acknowledgedAt) : alert.acknowledgedAt)
    : null,
});

export default function Alerts() {
  const { toast } = useToast();
  const { data: alertsRaw, isLoading } = useQuery<any[]>({
    queryKey: ["/api/alerts"],
  });

  const alerts = alertsRaw?.map(parseAlert);

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest("PATCH", `/api/alerts/${alertId}/acknowledge`, {
        acknowledgedBy: "Admin User",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert acknowledged",
        description: "The alert has been marked as acknowledged.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "warning":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <Bell className="h-4 w-4 text-orange-600" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const unacknowledgedAlerts = alerts?.filter((a) => !a.acknowledged) || [];
  const acknowledgedAlerts = alerts?.filter((a) => a.acknowledged) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2" data-testid="text-alerts-title">
          Network Alerts
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor and manage network alerts and notifications
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="card-unacknowledged-alerts">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertCircle className="text-red-600 dark:text-red-400 text-xl h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Unacknowledged</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold" data-testid="text-unacknowledged-count">
                    {unacknowledgedAlerts.length}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-acknowledged-alerts">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                <CheckCircle className="text-emerald-600 dark:text-emerald-400 text-xl h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Acknowledged</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold" data-testid="text-acknowledged-count">
                    {acknowledgedAlerts.length}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-alerts">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Bell className="text-blue-900 dark:text-blue-400 text-xl h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold" data-testid="text-total-alerts">
                    {alerts?.length || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unacknowledged Alerts */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Unacknowledged Alerts</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : unacknowledgedAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <p className="text-sm text-gray-600" data-testid="text-no-unack-alerts">
                No unacknowledged alerts
              </p>
              <p className="text-xs text-gray-500 mt-2">All alerts have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unacknowledgedAlerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`} data-testid={`alert-${alert.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary">{alert.type}</Badge>
                        </div>
                        <p className="font-medium text-gray-900 mb-1">{alert.message}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(alert.timestamp), "PPpp")}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                        disabled={acknowledgeMutation.isPending}
                        data-testid={`button-ack-${alert.id}`}
                      >
                        {acknowledgeMutation.isPending ? "Acknowledging..." : "Acknowledge"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Acknowledged Alerts</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {acknowledgedAlerts.map((alert) => (
                <Card key={alert.id} className="opacity-60" data-testid={`alert-ack-${alert.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary">{alert.type}</Badge>
                        </div>
                        <p className="font-medium text-gray-700 mb-1">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(alert.timestamp), "PPpp")}
                          </div>
                          {alert.acknowledgedBy && (
                            <span>
                              Acknowledged by {alert.acknowledgedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
