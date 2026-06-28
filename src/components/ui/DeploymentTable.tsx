import { Link } from "@tanstack/react-router";
import { Clock, ExternalLink, GitBranch } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { DeploymentStatus } from "./StatusBadge.tsx";

interface Deployment {
  id: string;
  projectName: string;
  commitHash: string;
  branch: string;
  status: DeploymentStatus;
  duration: string;
  timestamp: string;
}

interface DeploymentTableProps {
  deployments: Deployment[];
  showProject?: boolean;
}

export function DeploymentTable({
  deployments = [],
  showProject = true,
}: DeploymentTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-base-300/60 bg-base-200/60">
      <table className="table table-sm">
        <thead>
          <tr className="border-b border-base-300/60">
            {showProject && (
              <th className="text-base-content/35 text-xs uppercase tracking-wider font-medium bg-base-200/80">
                Project
              </th>
            )}
            <th className="text-base-content/35 text-xs uppercase tracking-wider font-medium bg-base-200/80">
              Commit
            </th>
            <th className="text-base-content/35 text-xs uppercase tracking-wider font-medium bg-base-200/80">
              Branch
            </th>
            <th className="text-base-content/35 text-xs uppercase tracking-wider font-medium bg-base-200/80">
              Status
            </th>
            <th className="text-base-content/35 text-xs uppercase tracking-wider font-medium bg-base-200/80">
              Duration
            </th>
            <th className="text-base-content/35 text-xs uppercase tracking-wider font-medium bg-base-200/80">
              Deployed
            </th>
            <th className="w-10 bg-base-200/80"></th>
          </tr>
        </thead>
        <tbody>
          {(deployments ?? []).map((deployment, i) => (
            <tr
              key={deployment.id}
              className="hover:bg-base-300/30 cursor-pointer transition-colors border-b border-base-300/30 last:border-b-0"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {showProject && (
                <td className="font-medium text-sm">
                  {deployment.projectName}
                </td>
              )}
              <td>
                <code className="text-xs bg-base-300/60 text-base-content/70 px-2 py-0.5 rounded-md font-mono">
                  {deployment.commitHash}
                </code>
              </td>
              <td>
                <div className="flex items-center gap-1.5 text-base-content/40">
                  <GitBranch className="w-3 h-3" />
                  <span className="text-xs font-mono">{deployment.branch}</span>
                </div>
              </td>
              <td>
                <StatusBadge status={deployment.status} />
              </td>
              <td>
                <div className="flex items-center gap-1.5 text-base-content/40 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{deployment.duration}</span>
                </div>
              </td>
              <td className="text-base-content/40 text-xs">
                {deployment.timestamp}
              </td>
              <td>
                <Link
                  to="/deployments/$id"
                  params={{ id: deployment.id }}
                  className="btn btn-ghost btn-square btn-xs text-base-content/30 hover:text-primary"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
