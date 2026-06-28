import { Link } from "@tanstack/react-router";
import { Clock, ExternalLink, GitBranch, Globe, Server } from "lucide-react";
import { cn } from "../../lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { DeploymentStatus } from "./StatusBadge.tsx";

interface ProjectCardProps {
  id: string;
  name: string;
  repo: string;
  type: "frontend" | "backend";
  status: DeploymentStatus;
  lastDeployed: string;
  url?: string;
}

export function ProjectCard({
  id,
  name,
  repo,
  type,
  status,
  lastDeployed,
  url,
}: ProjectCardProps) {
  return (
    <Link
      to="/projects/$id"
      params={{ id }}
      className="card bg-base-200/80 border border-base-300/60 hover:border-primary/30 transition-all duration-200 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 group"
    >
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                type === "frontend"
                  ? "bg-primary/10 text-primary group-hover:bg-primary/15"
                  : "bg-secondary/10 text-secondary group-hover:bg-secondary/15",
              )}
            >
              {type === "frontend" ? (
                <Globe className="w-4 h-4" />
              ) : (
                <Server className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                {name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-base-content/40">
                <GitBranch className="w-3 h-3" />
                <span className="truncate">{repo}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300/50">
          <div className="flex items-center gap-1.5 text-xs text-base-content/40">
            <Clock className="w-3 h-3" />
            <span>{lastDeployed}</span>
          </div>
          {url && (
            <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
              <span className="font-mono">{url}</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
