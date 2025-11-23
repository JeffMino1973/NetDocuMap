import { Server, Network, Wifi, Database, Shield } from "lucide-react";

type DeviceType = "router" | "switch" | "access-point" | "server" | "firewall";

interface DeviceTypeIconProps {
  type: DeviceType;
  className?: string;
}

const typeIcons: Record<DeviceType, React.ComponentType<{ className?: string }>> = {
  router: Network,
  switch: Server,
  "access-point": Wifi,
  server: Database,
  firewall: Shield,
};

export function DeviceTypeIcon({ type, className = "h-5 w-5" }: DeviceTypeIconProps) {
  const Icon = typeIcons[type] || Server;
  return <Icon className={className} />;
}
