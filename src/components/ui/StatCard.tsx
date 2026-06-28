import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "card bg-base-200 border border-base-300 transition-all duration-200 hover:border-base-content/10 hover:shadow-lg hover:shadow-black/20",
        className,
      )}
    >
      <div className="stat py-4 px-5">
        <div className="stat-figure">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="stat-title text-base-content/40 text-xs uppercase tracking-wider">
          {title}
        </div>
        <div className="stat-value text-2xl font-bold tracking-tight">
          {value}
        </div>
        {trend && (
          <div
            className={cn(
              "stat-desc text-xs font-medium",
              trend.isPositive ? "text-success" : "text-error",
            )}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </div>
        )}
      </div>
    </div>
  );
}
