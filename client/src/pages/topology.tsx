import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeviceTypeIcon } from "@/components/device-type-icon";
import { StatusBadge } from "@/components/status-badge";
import type { Device, Port } from "@shared/schema";
import { Link } from "wouter";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Topology() {
  const [zoom, setZoom] = useState(1);

  const { data: devices, isLoading: devicesLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const { data: ports, isLoading: portsLoading } = useQuery<Port[]>({
    queryKey: ["/api/ports"],
  });

  const isLoading = devicesLoading || portsLoading;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  const getConnectedDevices = (deviceId: string) => {
    const devicePorts = ports?.filter((p) => p.deviceId === deviceId) || [];
    const connections: string[] = [];
    
    devicePorts.forEach((port) => {
      if (port.connectedTo) {
        const connectedDevice = devices?.find((d) => 
          d.name.toLowerCase() === port.connectedTo?.toLowerCase() ||
          d.ipAddress === port.connectedTo
        );
        if (connectedDevice) {
          connections.push(connectedDevice.id);
        }
      }
    });
    
    return connections;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="p-6">
          <div className="flex items-center justify-center h-96">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold mb-2" data-testid="text-topology-title">
            Network Topology
          </h1>
          <p className="text-sm text-muted-foreground">
            Visual representation of your network infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            data-testid="button-zoom-out"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleResetZoom}
            data-testid="button-reset-zoom"
            aria-label="Reset zoom"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 2}
            data-testid="button-zoom-in"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-6 overflow-auto" style={{ minHeight: "600px" }}>
        {!devices || devices.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4" data-testid="text-no-devices-topology">
                No devices to display in topology
              </p>
              <Link href="/devices">
                <Button data-testid="button-add-devices-topology">
                  Add Devices
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s" }}>
            <svg width="100%" height="600" className="absolute top-0 left-0 pointer-events-none">
              {devices.map((device, i) => {
                const connections = getConnectedDevices(device.id);
                return connections.map((connectedId) => {
                  const connectedIndex = devices.findIndex((d) => d.id === connectedId);
                  if (connectedIndex === -1 || connectedIndex <= i) return null;
                  
                  const x1 = 150 + (i % 4) * 250;
                  const y1 = 100 + Math.floor(i / 4) * 200;
                  const x2 = 150 + (connectedIndex % 4) * 250;
                  const y2 = 100 + Math.floor(connectedIndex / 4) * 200;
                  
                  return (
                    <line
                      key={`${device.id}-${connectedId}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                      strokeDasharray={device.status === "active" && devices[connectedIndex].status === "active" ? "0" : "5,5"}
                    />
                  );
                });
              })}
            </svg>

            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 p-8">
              {devices.map((device) => (
                <Link key={device.id} href={`/devices/${device.id}`}>
                  <div
                    className="relative flex flex-col items-center"
                    data-testid={`node-device-${device.id}`}
                  >
                    <Card className="w-40 p-4 hover-elevate active-elevate-2 cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                          <DeviceTypeIcon type={device.type as any} className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="text-center w-full">
                          <p className="font-medium text-sm truncate">{device.name}</p>
                          <code className="text-xs font-mono text-muted-foreground">{device.ipAddress}</code>
                        </div>
                        <StatusBadge status={device.status as any} className="w-full justify-center" />
                      </div>
                    </Card>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-border" />
            <span className="text-xs text-muted-foreground">Active Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-border" />
            <span className="text-xs text-muted-foreground">Inactive Connection</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
