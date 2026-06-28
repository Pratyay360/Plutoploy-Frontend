import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/Layout/DashboardLayout";
import { Header } from "../components/Layout/Header";
import { DeploymentTable } from "../components/ui/DeploymentTable";
import api from "../lib/api";

interface Deployment {
  id: string;
  projectName: string;
  commitHash: string;
  branch: string;
  status: string;
  duration: string;
  timestamp: string;
}

function DeploymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const data = await api.deploy.list();
        setDeployments(data);
      } catch (err) {
        console.error("Failed to fetch deployments", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeployments();
  }, []);

  const filteredDeployments = deployments.filter((deployment) => {
    const matchesSearch =
      deployment.projectName.toLowerCase().includes(search.toLowerCase()) ||
      deployment.commitHash.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || deployment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <Header title="Deployments" subtitle="All deployments" />

      <div className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between animate-fade-in">
          <div className="flex flex-1 gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-content/30" />
              <input
                type="text"
                placeholder="Search deployments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-sm input-bordered pl-8 w-full sm:w-56 h-9 text-xs"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-sm select-bordered w-32 h-9 text-xs"
            >
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="building">Building</option>
              <option value="failed">Failed</option>
              <option value="queued">Queued</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-base-300/60 bg-base-200/60 p-8">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex items-center gap-4">
                  <div className="skeleton-shimmer h-4 w-28 rounded" />
                  <div className="skeleton-shimmer h-4 w-16 rounded" />
                  <div className="skeleton-shimmer h-4 w-20 rounded" />
                  <div className="skeleton-shimmer h-5 w-16 rounded-full" />
                  <div className="skeleton-shimmer h-4 w-12 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div
              className="animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <DeploymentTable deployments={filteredDeployments} />
            </div>

            {filteredDeployments.length === 0 && (
              <div className="p-16 text-center rounded-xl border border-dashed border-base-300/60 bg-base-200/30">
                <p className="text-sm font-medium mb-1">No deployments found</p>
                <p className="text-xs text-base-content/40">
                  {search
                    ? "Try a different search term"
                    : "Deployments will appear here once you create a project"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/_authed/deployments")({
  component: DeploymentsPage,
});
