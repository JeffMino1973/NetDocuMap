import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ChevronRight, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { DeviceTypeIcon } from "@/components/device-type-icon";
import { DeviceDialog } from "@/components/device-dialog";
import { PortDialog } from "@/components/port-dialog";
import type { Device, Port } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeviceDetail() {
  const [, params] = useRoute("/devices/:id");
  const deviceId = params?.id;
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPortDialogOpen, setIsPortDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: device, isLoading: deviceLoading } = useQuery<Device>({
    queryKey: ["/api/devices", deviceId],
    enabled: !!deviceId,
  });

  const { data: allPorts, isLoading: portsLoading } = useQuery<Port[]>({
    queryKey: ["/api/ports"],
  });

  const devicePorts = allPorts?.filter((port) => port.deviceId === deviceId) || [];

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/devices/${deviceId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Device deleted",
        description: "The device has been successfully deleted.",
      });
      window.location.href = "/devices";
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (deviceLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Device not found</p>
        <Link href="/devices">
          <Button className="mt-4">Back to Devices</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/devices" className="hover:text-foreground">
          Devices
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{device.name}</span>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
            <DeviceTypeIcon type={device.type as any} className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-1" data-testid="text-device-name">
              {device.name}
            </h1>
            <p className="text-sm text-muted-foreground capitalize">
              {device.type.replace("-", " ")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditDialogOpen(true)}
            data-testid="button-edit-device"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            data-testid="button-delete-device"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Model</p>
              <p className="text-sm" data-testid="text-device-model">{device.model}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">IP Address</p>
              <code className="text-sm font-mono" data-testid="text-device-ip">{device.ipAddress}</code>
            </div>
            {device.macAddress && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">MAC Address</p>
                <code className="text-sm font-mono" data-testid="text-device-mac">{device.macAddress}</code>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
              <p className="text-sm" data-testid="text-device-location">{device.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
              <StatusBadge status={device.status as any} />
            </div>
            {device.description && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-muted-foreground" data-testid="text-device-description">
                  {device.description}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle>Ports ({devicePorts.length})</CardTitle>
          <Button
            onClick={() => setIsPortDialogOpen(true)}
            size="sm"
            data-testid="button-add-port"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Port
          </Button>
        </CardHeader>
        <CardContent>
          {portsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : devicePorts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4" data-testid="text-no-ports">
                No ports configured for this device
              </p>
              <Button onClick={() => setIsPortDialogOpen(true)} data-testid="button-add-first-port">
                <Plus className="h-4 w-4 mr-2" />
                Add First Port
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Port Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Connected To</TableHead>
                    <TableHead>Speed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devicePorts.map((port) => (
                    <TableRow key={port.id} data-testid={`row-port-${port.id}`}>
                      <TableCell>
                        <code className="text-sm font-mono">{port.portNumber}</code>
                      </TableCell>
                      <TableCell className="capitalize text-sm">
                        {port.portType}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={port.status as any} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {port.connectedTo || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {port.speed || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DeviceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        device={device}
      />

      <PortDialog
        open={isPortDialogOpen}
        onOpenChange={setIsPortDialogOpen}
        defaultDeviceId={deviceId}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {device.name} and all associated ports. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete Device
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
