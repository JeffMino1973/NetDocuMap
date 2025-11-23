import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Wrench } from "lucide-react";

type Status = "active" | "inactive" | "error" | "maintenance";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: {
    label: "Active",
    icon: <CheckCircle2 className="h-3 w-3" />,
    variant: "default",
  },
  inactive: {
    label: "Inactive",
    icon: <XCircle className="h-3 w-3" />,
    variant: "secondary",
  },
  error: {
    label: "Error",
    icon: <AlertCircle className="h-3 w-3" />,
    variant: "destructive",
  },
  maintenance: {
    label: "Maintenance",
    icon: <Wrench className="h-3 w-3" />,
    variant: "outline",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={`gap-1 ${className || ""}`} data-testid={`badge-status-${status}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
