import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Loader2,
  Plus,
  Rocket,
  Server,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/Layout/DashboardLayout";
import { Header } from "../components/Layout/Header";
import { DeploymentTable } from "../components/ui/DeploymentTable";
import { EnvVariablesEditor } from "../components/ui/EnvVariablesEditor";
import type { DeploymentStatus } from "../components/ui/StatusBadge";
import api from "../lib/api";

interface Deployment {
  id: string;
  projectName: string;
  repoFullName: string;
  commitHash: string;
  branch: string;
  status: DeploymentStatus;
  duration: string;
  timestamp: string;
  subdomain: string;
  runtime: string;
}

function ProjectDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.deploy.list();
        const projectDeployments = data.filter(
          (d: Deployment) => d.projectName === id,
        );
        setDeployments(projectDeployments);
      } catch (err) {
        console.error("Failed to fetch deployments", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const project = deployments[0]
    ? {
        name: deployments[0].projectName,
        repo: deployments[0].repoFullName,
        type:
          deployments[0].runtime === "python"
            ? ("backend" as const)
            : ("frontend" as const),
        subdomain: deployments[0].subdomain,
      }
    : null;

  const handleDelete = async () => {
    navigate({ to: "/projects" });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header title="Project" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-xs text-base-content/40">Loading project...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <Header title="Project" />
        <div className="p-6">
          <div className="p-16 text-center max-w-md mx-auto space-y-4 rounded-xl border border-base-300/60 bg-base-200/60">
            <h2 className="text-lg font-semibold">Not Found</h2>
            <p className="text-sm text-base-content/40">
              Project could not be found.
            </p>
            <Link to="/projects" className="btn btn-primary btn-sm">
              Back to Projects
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title={project.name} subtitle={project.repo} />

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <Link
          to="/projects"
          className="inline-flex items-center text-xs text-base-content/40 hover:text-base-content transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Projects
        </Link>

        <div className="card bg-base-200/60 border border-base-300/60 animate-fade-in">
          <div className="card-body p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/10 flex items-center justify-center">
                  {project.type === "frontend" ? (
                    <Globe className="w-5 h-5 text-primary" />
                  ) : (
                    <Server className="w-5 h-5 text-secondary" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    {project.name}
                  </h2>
                  <p className="text-xs text-base-content/40 font-mono">
                    {project.repo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {project.subdomain && (
                  <a
                    href={`https://${project.subdomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Visit
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn btn-ghost btn-square btn-sm text-base-content/30 hover:text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                to="/projects/new"
                className="btn btn-primary btn-sm gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Deployment
              </Link>
              <button type="button" className="btn btn-outline btn-sm gap-1.5">
                <Rocket className="w-3.5 h-3.5" />
                Redeploy
              </button>
            </div>
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">
              Deployments ({deployments.length})
            </h3>
          </div>
          {deployments.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-base-300/60 bg-base-200/30">
              <p className="text-sm text-base-content/40">
                No deployments yet for this project.
              </p>
            </div>
          ) : (
            <DeploymentTable deployments={deployments} />
          )}
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h3 className="text-sm font-semibold mb-3">Environment Variables</h3>
          <EnvVariablesEditor variables={[]} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/_authed/projects/$id")({
  component: ProjectDetailsPage,
});
