import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Server } from "lucide-react";
import type { Device } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DeviceTypeIcon } from "@/components/device-type-icon";
import { StatusBadge } from "@/components/status-badge";

export default function Locations() {
  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const locationGroups = devices?.reduce((acc, device) => {
    const location = device.location;
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(device);
    return acc;
  }, {} as Record<string, Device[]>) || {};

  const locations = Object.entries(locationGroups).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2" data-testid="text-locations-title">
          Network Locations
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse devices organized by physical location
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2].map((j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : locations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4" data-testid="text-no-locations">
              No locations available yet
            </p>
            <Link href="/devices">
              <Button data-testid="button-add-devices-locations">
                Add Devices
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map(([location, locationDevices]) => (
            <Card key={location} data-testid={`card-location-${location}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  {location}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {locationDevices.length} {locationDevices.length === 1 ? "device" : "devices"}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {locationDevices.map((device) => (
                  <Link key={device.id} href={`/devices/${device.id}`}>
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer"
                      data-testid={`card-device-${device.id}`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                        <DeviceTypeIcon type={device.type as any} className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{device.name}</p>
                        <code className="text-xs font-mono text-muted-foreground">{device.ipAddress}</code>
                      </div>
                      <StatusBadge status={device.status as any} />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
