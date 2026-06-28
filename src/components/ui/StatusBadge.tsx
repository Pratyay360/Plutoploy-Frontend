import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export type DeploymentStatus = "success" | "building" | "failed" | "queued";

interface StatusBadgeProps {
  status: DeploymentStatus;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  DeploymentStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    badgeClass: string;
    iconClass?: string;
  }
> = {
  success: {
    label: "Success",
    icon: CheckCircle2,
    badgeClass: "badge-success badge-soft",
  },
  building: {
    label: "Building",
    icon: Loader2,
    badgeClass: "badge-warning badge-soft",
    iconClass: "animate-spin",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    badgeClass: "badge-error badge-soft",
  },
  queued: {
    label: "Queued",
    icon: Clock,
    badgeClass: "badge-info badge-soft",
  },
};

export function StatusBadge({
  status,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "badge badge-sm gap-1 font-medium",
        config.badgeClass,
        className,
      )}
    >
      {showIcon && <Icon className={cn("w-3 h-3", config.iconClass)} />}
      {config.label}
    </span>
  );
}
