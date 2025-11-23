import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Cable, MapPin, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { DeviceTypeIcon } from "@/components/device-type-icon";
import type { Device, Port } from "@shared/schema";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: devices, isLoading: devicesLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const { data: ports, isLoading: portsLoading } = useQuery<Port[]>({
    queryKey: ["/api/ports"],
  });

  const isLoading = devicesLoading || portsLoading;

  const stats = {
    totalDevices: devices?.length || 0,
    activePorts: ports?.filter((p) => p.status === "active").length || 0,
    locations: new Set(devices?.map((d) => d.location)).size || 0,
    criticalAlerts: devices?.filter((d) => d.status === "error").length || 0,
  };

  const recentDevices = devices?.slice(0, 5) || [];

  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) setGreeting("Good morning!");
    else if (hour < 18) setGreeting("Good afternoon!");
    else setGreeting("Good evening!");
  }, [currentTime]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "long", 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  };

  const activeDevices = devices?.filter((d) => d.status === "active").length || 0;
  const maintenanceDevices = devices?.filter((d) => d.status === "maintenance").length || 0;
  const inactivePorts = ports?.filter((p) => p.status === "inactive").length || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
              {greeting}
            </h1>
            <p className="opacity-90">
              Welcome to your comprehensive network infrastructure management hub
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{formatTime(currentTime)}</div>
            <div className="opacity-90">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Server className="text-blue-900 text-xl h-5 w-5" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900" data-testid="text-total-devices">
                  {stats.totalDevices}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-emerald-100">
              <Cable className="text-emerald-600 text-xl h-5 w-5" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Ports</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900" data-testid="text-active-ports">
                  {stats.activePorts}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <AlertCircle className="text-orange-600 text-xl h-5 w-5" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900" data-testid="text-critical-alerts">
                  {stats.criticalAlerts}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Network Briefing */}
      <div className="bg-white rounded-lg p-6 border-l-4 border-blue-900">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Network Briefing</h3>
        <div className="space-y-2 text-sm text-gray-700">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-5/6" />
            </>
          ) : (
            <>
              <p>
                <CheckCircle className="inline mr-2 h-4 w-4 text-emerald-600" />
                {activeDevices} devices are currently active and online
              </p>
              {maintenanceDevices > 0 && (
                <p>
                  <AlertTriangle className="inline mr-2 h-4 w-4 text-orange-600" />
                  {maintenanceDevices} {maintenanceDevices === 1 ? "device is" : "devices are"} under maintenance
                </p>
              )}
              {stats.criticalAlerts > 0 && (
                <p>
                  <AlertCircle className="inline mr-2 h-4 w-4 text-red-600" />
                  {stats.criticalAlerts} critical {stats.criticalAlerts === 1 ? "alert" : "alerts"} requiring attention
                </p>
              )}
              <p>
                <MapPin className="inline mr-2 h-4 w-4 text-blue-900" />
                Network spans across {stats.locations} {stats.locations === 1 ? "location" : "locations"}
              </p>
              {inactivePorts > 0 && (
                <p>
                  <Cable className="inline mr-2 h-4 w-4 text-gray-500" />
                  {inactivePorts} inactive {inactivePorts === 1 ? "port" : "ports"} available for configuration
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Recent Devices */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Devices</h2>
            <Link href="/devices">
              <Button variant="outline" size="sm" data-testid="button-view-all-devices">
                View All
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : recentDevices.length === 0 ? (
            <div className="text-center py-12">
              <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4" data-testid="text-no-devices">
                No devices added yet
              </p>
              <Link href="/devices">
                <Button data-testid="button-add-first-device">
                  Add Your First Device
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDevices.map((device) => (
                <Link key={device.id} href={`/devices/${device.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer border border-transparent hover:border-gray-200 transition-all" data-testid={`card-device-${device.id}`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                      <DeviceTypeIcon type={device.type as any} className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{device.name}</p>
                      <p className="text-xs text-gray-500 font-mono">
                        {device.ipAddress} • {device.location}
                      </p>
                    </div>
                    <StatusBadge status={device.status as any} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
