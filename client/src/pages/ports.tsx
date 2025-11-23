import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { PortDialog } from "@/components/port-dialog";
import type { Port, Device } from "@shared/schema";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";

export default function Ports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: ports, isLoading: portsLoading } = useQuery<Port[]>({
    queryKey: ["/api/ports"],
  });

  const { data: devices, isLoading: devicesLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const isLoading = portsLoading || devicesLoading;

  const getDeviceName = (deviceId: string) => {
    return devices?.find((d) => d.id === deviceId)?.name || "Unknown Device";
  };

  const filteredPorts = ports?.filter((port) => {
    const deviceName = getDeviceName(port.deviceId);
    const matchesSearch = 
      port.portNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (port.connectedTo && port.connectedTo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === "all" || port.portType === typeFilter;
    const matchesStatus = statusFilter === "all" || port.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold mb-2" data-testid="text-ports-title">
            Network Ports
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage all port configurations across your network
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-port-main">
          <Plus className="h-4 w-4 mr-2" />
          Add Port
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ports, devices, or connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-ports"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48" data-testid="select-filter-port-type">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ethernet">Ethernet</SelectItem>
              <SelectItem value="fiber">Fiber</SelectItem>
              <SelectItem value="sfp">SFP</SelectItem>
              <SelectItem value="usb">USB</SelectItem>
              <SelectItem value="console">Console</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48" data-testid="select-filter-port-status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredPorts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground" data-testid="text-no-ports-found">
              {ports?.length === 0 ? "No ports configured yet" : "No ports match your filters"}
            </p>
            {ports?.length === 0 && (
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-port-list">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Port
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Port Number</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connected To</TableHead>
                  <TableHead>Speed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPorts.map((port) => {
                  const device = devices?.find((d) => d.id === port.deviceId);
                  return (
                    <TableRow key={port.id} data-testid={`row-port-${port.id}`}>
                      <TableCell>
                        <code className="text-sm font-mono">{port.portNumber}</code>
                      </TableCell>
                      <TableCell>
                        {device ? (
                          <Link href={`/devices/${device.id}`}>
                            <span className="text-sm hover:underline cursor-pointer">
                              {device.name}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell className="capitalize text-sm">{port.portType}</TableCell>
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <PortDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
