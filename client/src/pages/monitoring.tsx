import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Activity, AlertTriangle, CheckCircle, Clock, Settings } from "lucide-react";
import type { Device, DeviceHealth } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    deviceOffline?: boolean;
    consecutiveFailures?: number;
    responseTimeThreshold?: number;
  };
  severity: "critical" | "warning" | "info";
  notificationChannels: string[];
}

export default function Monitoring() {
  const { toast } = useToast();

  const { data: devices, isLoading: devicesLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const { data: healthData, isLoading: healthLoading } = useQuery<DeviceHealth[]>({
    queryKey: ["/api/device-health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: alertRules, isLoading: rulesLoading } = useQuery<AlertRule[]>({
    queryKey: ["/api/alert-rules"],
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return apiRequest("PATCH", `/api/alert-rules/${id}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alert-rules"] });
      toast({
        title: "Alert rule updated",
        description: "The alert rule has been updated successfully.",
      });
    },
  });

  const getDeviceHealth = (deviceId: string) => {
    return healthData?.find(h => h.deviceId === deviceId);
  };

  const onlineDevices = healthData?.filter(h => h.isOnline).length || 0;
  const totalDevices = devices?.length || 0;
  const offlineDevices = totalDevices - onlineDevices;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2" data-testid="text-monitoring-title">
          Network Monitoring
        </h1>
        <p className="text-sm text-muted-foreground">
          Real-time device health monitoring and alert management
        </p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card data-testid="card-total-devices">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Activity className="text-blue-900 dark:text-blue-400 h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                {devicesLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold" data-testid="text-total-devices">
                    {totalDevices}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-online-devices">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                <CheckCircle className="text-emerald-600 dark:text-emerald-400 h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Online</p>
                {healthLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-emerald-600" data-testid="text-online-count">
                    {onlineDevices}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-offline-devices">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="text-red-600 dark:text-red-400 h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Offline</p>
                {healthLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-red-600" data-testid="text-offline-count">
                    {offlineDevices}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-uptime">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Clock className="text-blue-900 dark:text-blue-400 h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Uptime</p>
                {healthLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold" data-testid="text-avg-uptime">
                    {totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Device Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          {devicesLoading || healthLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : devices && devices.length > 0 ? (
            <div className="space-y-3">
              {devices.map((device) => {
                const health = getDeviceHealth(device.id);
                return (
                  <div
                    key={device.id}
                    className="p-4 rounded-lg border flex items-center justify-between hover-elevate"
                    data-testid={`device-health-${device.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{device.name}</h3>
                        <Badge
                          variant={health?.isOnline ? "default" : "destructive"}
                          data-testid={`status-${device.id}`}
                        >
                          {health?.isOnline ? "Online" : "Offline"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{device.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {health?.responseTime && (
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            <span>{health.responseTime}ms</span>
                          </div>
                        )}
                        {health?.lastChecked && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Last checked: {format(new Date(health.lastChecked), "p")}
                            </span>
                          </div>
                        )}
                        {health && health.consecutiveFailures > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{health.consecutiveFailures} consecutive failures</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No devices to monitor</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alert Rules</CardTitle>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {rulesLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : alertRules && alertRules.length > 0 ? (
            <div className="space-y-4">
              {alertRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-lg border flex items-center justify-between"
                  data-testid={`alert-rule-${rule.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <Badge variant="secondary">{rule.severity}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {rule.conditions.deviceOffline && (
                        <span>Triggers when device is offline</span>
                      )}
                      {rule.conditions.consecutiveFailures && (
                        <span> after {rule.conditions.consecutiveFailures} consecutive failures</span>
                      )}
                      {rule.conditions.responseTimeThreshold && (
                        <span>Triggers when response time exceeds {rule.conditions.responseTimeThreshold}ms</span>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(enabled) =>
                      toggleRuleMutation.mutate({ id: rule.id, enabled })
                    }
                    data-testid={`toggle-rule-${rule.id}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No alert rules configured</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
