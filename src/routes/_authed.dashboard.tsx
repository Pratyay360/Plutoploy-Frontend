import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, FolderGit2, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/Layout/DashboardLayout";
import { Header } from "../components/Layout/Header";
import { DeploymentTable } from "../components/ui/DeploymentTable";
import { StatCard } from "../components/ui/StatCard";
import api from "../lib/api";

interface Deployment {
  id: string;
  projectName: string;
  status: string;
  timestamp: string;
}

function DashboardPage() {
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

  const totalProjects = new Set(deployments.map((d) => d.projectName)).size;
  const activeDeployments = deployments.filter(
    (d) => d.status === "building" || d.status === "queued",
  ).length;
  const failedBuilds = deployments.filter((d) => d.status === "failed").length;
  const successCount = deployments.filter((d) => d.status === "success").length;
  const totalCount = deployments.length;
  const successRate =
    totalCount > 0 ? `${Math.round((successCount / totalCount) * 100)}%` : "0%";

  const stats = [
    {
      title: "Projects",
      value: totalProjects,
      icon: FolderGit2,
    },
    {
      title: "Active",
      value: activeDeployments,
      icon: Rocket,
    },
    { title: "Success Rate", value: successRate, icon: CheckCircle2 },
    {
      title: "Failed",
      value: failedBuilds,
      icon: AlertCircle,
    },
  ];

  const recentDeployments = deployments.slice(0, 5);

  return (
    <DashboardLayout>
      <Header title="Dashboard" subtitle="Overview of your deployments." />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.title}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent Deployments</h2>
            <Link
              to="/deployments"
              className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary"
            >
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="rounded-xl border border-base-300/60 bg-base-200/60 p-8">
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-4">
                    <div className="skeleton-shimmer h-4 w-24 rounded" />
                    <div className="skeleton-shimmer h-4 w-16 rounded" />
                    <div className="skeleton-shimmer h-4 w-20 rounded" />
                    <div className="skeleton-shimmer h-5 w-16 rounded-full" />
                    <div className="skeleton-shimmer h-4 w-12 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <DeploymentTable deployments={recentDeployments} />
          )}
        </div>

        <div
          className="card bg-base-200/60 border border-base-300/60 animate-fade-in"
          style={{ animationDelay: "350ms" }}
        >
          <div className="card-body p-5">
            <h2 className="card-title text-sm">Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/projects/new"
                className="btn btn-primary btn-sm gap-1.5"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                New Project
              </Link>
              <button type="button" className="btn btn-outline btn-sm gap-1.5">
                <Rocket className="w-3.5 h-3.5" />
                Deploy from Git
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardPage,
});
