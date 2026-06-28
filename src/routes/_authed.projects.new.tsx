import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, GitBranch, Loader2, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/Layout/DashboardLayout";
import { Header } from "../components/Layout/Header";
import api from "../lib/api";

interface Repo {
  id: string;
  full_name: string;
  description: string;
  default_branch: string;
}

function NewProjectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [projectType, setProjectType] = useState("react");
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [isCreating, setIsCreating] = useState(false);

  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const data = await api.getRepos.github();
        setRepos(data);
      } catch (err) {
        console.error("Failed to fetch repos", err);
      } finally {
        setIsLoadingRepos(false);
      }
    };
    fetchRepos();
  }, []);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const repo = repos.find((r) => r.id === selectedRepo);
      if (!repo) return;

      const runtime = projectType === "python" ? "python" : "node";

      const res = await api.deploy.injectWorkflow({
        repoFullName: repo.full_name,
        runtime: runtime,
        branch: repo.default_branch,
      });

      if (res?.buildId) {
        navigate({
          to: "/deployments/$id",
          params: { id: res.buildId },
          state: { repoFullName: repo.full_name },
        });
      } else {
        navigate({ to: "/projects" });
      }
    } catch (err) {
      console.error("Deployment failed:", err);
      alert("Failed to deploy. Check console for details.");
    } finally {
      setIsCreating(false);
    }
  };

  const selectedRepoData = repos.find((r) => r.id === selectedRepo);

  return (
    <DashboardLayout>
      <Header title="New Project" />

      <div className="p-6 max-w-xl mx-auto">
        <Link
          to="/projects"
          className="inline-flex items-center text-xs text-base-content/40 hover:text-base-content mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Projects
        </Link>

        <ul className="steps steps-horizontal w-full mb-8">
          <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Select</li>
          <li className={`step ${step >= 2 ? "step-primary" : ""}`}>
            Configure
          </li>
          <li className={`step ${step >= 3 ? "step-primary" : ""}`}>Deploy</li>
        </ul>

        {step === 1 && (
          <div className="card bg-base-200/60 border border-base-300/60 animate-fade-in">
            <div className="card-body p-5">
              <h2 className="card-title text-sm">Select a Repository</h2>
              {isLoadingRepos ? (
                <div className="space-y-2 py-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="flex items-center gap-3 p-3 rounded-lg bg-base-100/60"
                    >
                      <div className="skeleton-shimmer w-5 h-5 rounded" />
                      <div className="flex-1 space-y-1.5">
                        <div className="skeleton-shimmer h-3.5 w-40 rounded" />
                        <div className="skeleton-shimmer h-3 w-28 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : repos.length === 0 ? (
                <p className="text-sm text-base-content/40 text-center py-10">
                  No repositories found. Make sure you've installed the GitHub
                  app.
                </p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {repos.map((repo) => (
                    <button
                      type="button"
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all duration-150 ${
                        selectedRepo === repo.id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                          : "border-base-300/50 bg-base-100/60 hover:border-base-content/15 hover:bg-base-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <GitBranch className="w-4 h-4 text-base-content/30 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {repo.full_name}
                          </p>
                          {repo.description && (
                            <p className="text-xs text-base-content/40 truncate mt-0.5">
                              {repo.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="btn btn-primary w-full mt-2"
                disabled={!selectedRepo}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card bg-base-200/60 border border-base-300/60 animate-fade-in">
            <div className="card-body p-5">
              <h2 className="card-title text-sm">Configure</h2>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label" htmlFor="project-type-select">
                    <span className="label-text text-xs font-medium">
                      Project Type
                    </span>
                  </label>
                  <select
                    id="project-type-select"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="select select-bordered w-full h-10 text-sm"
                  >
                    <option value="react">React</option>
                    <option value="node">Node.js</option>
                    <option value="express">Express</option>
                    <option value="python">Python</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="build-command-input">
                    <span className="label-text text-xs font-medium">
                      Build Command
                    </span>
                  </label>
                  <input
                    id="build-command-input"
                    type="text"
                    value={buildCommand}
                    onChange={(e) => setBuildCommand(e.target.value)}
                    placeholder={
                      projectType === "python"
                        ? "python main.py"
                        : "npm run build"
                    }
                    className="input input-bordered font-mono text-sm h-10"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary flex-1"
                  onClick={() => setStep(3)}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card bg-base-200/60 border border-base-300/60 animate-fade-in">
            <div className="card-body p-5">
              <h2 className="card-title text-sm">Review & Deploy</h2>

              <div className="bg-base-100/80 border border-base-300/30 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/40">Repository</span>
                  <span className="font-mono font-medium">
                    {selectedRepoData?.full_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/40">Branch</span>
                  <span className="font-mono font-medium">
                    {selectedRepoData?.default_branch}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/40">Type</span>
                  <span className="capitalize font-medium">{projectType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/40">Command</span>
                  <span className="font-mono font-medium">{buildCommand}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline flex-1"
                  onClick={() => setStep(2)}
                  disabled={isCreating}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary flex-1 gap-1.5"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Deploy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/_authed/projects/new")({
  component: NewProjectPage,
});
