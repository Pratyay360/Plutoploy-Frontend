import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/Layout/DashboardLayout";
import { Header } from "../components/Layout/Header";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import {
  type DeploymentStatus,
  StatusBadge,
} from "../components/ui/StatusBadge";
import { TerminalLogViewer } from "../components/ui/TerminalLogViewer";
import api from "../lib/api";

interface LogLine {
  timestamp: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

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
}

function DeploymentDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [logs] = useState<LogLine[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await api.deploy.get(id);
        setDeployment(data);
      } catch (err) {
        console.error("Failed to fetch deployment details", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deploy.delete(id);
      setShowDeleteDialog(false);
      navigate({ to: "/deployments" });
    } catch (err) {
      console.error("Failed to delete deployment", err);
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header title="Deployment Details" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-xs text-base-content/40">
              Loading deployment...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!deployment) {
    return (
      <DashboardLayout>
        <Header title="Deployment Details" />
        <div className="p-6">
          <div className="p-16 text-center max-w-md mx-auto space-y-4 rounded-xl border border-base-300/60 bg-base-200/60">
            <h2 className="text-lg font-semibold">Not Found</h2>
            <p className="text-sm text-base-content/40">
              Deployment{" "}
              <code className="font-mono bg-base-300/60 px-2 py-0.5 rounded-md text-xs">
                {id}
              </code>{" "}
              could not be found.
            </p>
            <Link to="/deployments" className="btn btn-primary btn-sm">
              Back to Deployments
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Deployment Details" subtitle={deployment.projectName} />

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <Link
          to="/deployments"
          className="inline-flex items-center text-xs text-base-content/40 hover:text-base-content transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Deployments
        </Link>

        <div className="card bg-base-200/60 border border-base-300/60 animate-fade-in">
          <div className="card-body p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-base-content/30 uppercase tracking-widest font-medium block mb-1.5">
                    Project
                  </span>
                  <span className="text-sm font-semibold">
                    {deployment.projectName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-base-content/30 uppercase tracking-widest font-medium block mb-1.5">
                    Repository
                  </span>
                  <span className="text-xs font-mono text-base-content/50 bg-base-300/30 px-2 py-0.5 rounded">
                    {deployment.repoFullName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-base-content/30 uppercase tracking-widest font-medium block mb-1.5">
                    Branch
                  </span>
                  <span className="text-xs font-mono text-base-content/50 bg-base-300/30 px-2 py-0.5 rounded">
                    {deployment.branch}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-base-content/30 uppercase tracking-widest font-medium block mb-1.5">
                    Status
                  </span>
                  <StatusBadge status={deployment.status} />
                </div>
                <div>
                  <span className="text-[10px] text-base-content/30 uppercase tracking-widest font-medium block mb-1.5">
                    Commit
                  </span>
                  <span className="text-xs font-mono text-base-content/50 bg-base-300/30 px-2 py-0.5 rounded">
                    {deployment.commitHash}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-base-content/30 uppercase tracking-widest font-medium block mb-1.5">
                    Duration
                  </span>
                  <span className="text-xs text-base-content/50 inline-flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {deployment.duration}
                  </span>
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-base-content/30 uppercase tracking-widest font-medium block mb-1.5">
                    Deployed
                  </span>
                  <span className="text-xs text-base-content/50 inline-flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {deployment.timestamp}
                  </span>
                </div>

                {deployment.subdomain && (
                  <div>
                    <span className="text-[10px] text-base-content/30 uppercase tracking-widest font-medium block mb-1.5">
                      URL
                    </span>
                    <a
                      href={`https://${deployment.subdomain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      {deployment.subdomain}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeleting}
                    className="btn btn-error btn-outline btn-sm w-full gap-1.5"
                  >
                    <Loader2
                      className={`w-3.5 h-3.5 ${isDeleting ? "animate-spin" : ""}`}
                    />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="space-y-3 animate-fade-in"
          style={{ animationDelay: "150ms" }}
        >
          <h3 className="text-sm font-semibold">Logs</h3>
          <TerminalLogViewer
            logs={logs}
            isStreaming={deployment.status === "building"}
            status={
              deployment.status === "building" ? undefined : deployment.status
            }
          />
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Deployment"
        message={`Are you sure you want to delete deployment ${deployment.projectName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/_authed/deployments/$id")({
  component: DeploymentDetailsPage,
});
