import { Link, createFileRoute } from "@tanstack/react-router";
import { FolderGit2, GitBranch, Globe, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/Layout/DashboardLayout";
import { Header } from "../components/Layout/Header";
import { ProjectCard } from "../components/ui/ProjectCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { DeploymentStatus } from "../components/ui/StatusBadge";
import api from "../lib/api";

interface Deployment {
  projectName: string;
  repoFullName: string;
  runtime: string;
  status: DeploymentStatus;
  timestamp: string;
  subdomain: string;
}

interface GitHubRepo {
  id: string;
  full_name: string;
  description: string;
  html_url: string;
  default_branch: string;
  private: boolean;
  language: string | null;
  updated_at: string;
}

function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"projects" | "repos">("projects");
  const [repoError, setRepoError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deployData = await api.deploy.list();
        setDeployments(deployData);
      } catch (err) {
        console.error("Failed to fetch deployments", err);
      }

      try {
        const repoData = await api.getRepos.github();
        setRepos(repoData);
      } catch (err) {
        console.error("Failed to fetch GitHub repos", err);
        setRepoError(
          err instanceof Error ? err.message : "Failed to load repos",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const projects = Array.from(
    new Set(deployments.map((d) => d.projectName)),
  ).map((name, index) => {
    const projectDeployments = deployments.filter(
      (d) => d.projectName === name,
    );
    const latestDeployment = projectDeployments[0];

    return {
      id: String(index + 1),
      name: name,
      repo: latestDeployment.repoFullName,
      type:
        latestDeployment.runtime === "python"
          ? ("backend" as const)
          : ("frontend" as const),
      status: latestDeployment.status,
      lastDeployed: latestDeployment.timestamp,
    };
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.repo.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || project.type === filter;
    return matchesSearch && matchesFilter;
  });

  const filteredRepos = repos.filter((repo) => {
    const matchesSearch =
      repo.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (repo.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const isDeployed = deployments.some(
      (d) => d.repoFullName === repo.full_name,
    );
    const matchesFilter =
      filter === "all" ||
      (filter === "deployed" && isDeployed) ||
      (filter === "unused" && !isDeployed);
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <Header title="Projects" subtitle={`${projects.length} projects`} />

      <div className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between animate-fade-in">
          <div className="flex flex-1 gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-content/30" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-sm input-bordered pl-8 w-full sm:w-56 h-9 text-xs"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select select-sm select-bordered w-32 h-9 text-xs"
            >
              <option value="all">All</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="deployed">Deployed</option>
              <option value="unused">Not Deployed</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="join">
              <button
                type="button"
                onClick={() => {
                  setView("projects");
                  setFilter("all");
                }}
                className={`btn btn-sm join-item ${view === "projects" ? "btn-primary" : "btn-outline"}`}
              >
                Projects
              </button>
              <button
                type="button"
                onClick={() => {
                  setView("repos");
                  setFilter("all");
                }}
                className={`btn btn-sm join-item ${view === "repos" ? "btn-primary" : "btn-outline"}`}
              >
                Repos ({repos.length})
              </button>
            </div>
            <Link to="/projects/new" className="btn btn-primary btn-sm gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New Project
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="card bg-base-200/60 border border-base-300/60 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="skeleton-shimmer w-9 h-9 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton-shimmer h-4 w-32 rounded" />
                    <div className="skeleton-shimmer h-3 w-24 rounded" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-base-300/30 flex justify-between">
                  <div className="skeleton-shimmer h-3 w-20 rounded" />
                  <div className="skeleton-shimmer h-5 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : view === "projects" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project, i) => (
                <div
                  key={project.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <ProjectCard {...project} />
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="p-16 text-center rounded-xl border border-dashed border-base-300/60 bg-base-200/30">
                <div className="w-12 h-12 rounded-xl bg-base-300/50 flex items-center justify-center mx-auto mb-4">
                  <FolderGit2 className="w-5 h-5 text-base-content/30" />
                </div>
                <p className="text-sm font-medium mb-1">No projects found</p>
                <p className="text-xs text-base-content/40 mb-4">
                  {search
                    ? "Try a different search term"
                    : "Create your first project to get started"}
                </p>
                <Link to="/projects/new" className="btn btn-primary btn-sm">
                  <Plus className="w-3.5 h-3.5" />
                  Create Project
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRepos.map((repo, i) => {
                const isDeployed = deployments.some(
                  (d) => d.repoFullName === repo.full_name,
                );
                return (
                  <div
                    key={repo.id}
                    className="card bg-base-200/80 border border-base-300/60 hover:border-primary/30 transition-all duration-200 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 group animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-base-300/50 flex items-center justify-center shrink-0">
                          <GitBranch className="w-4 h-4 text-base-content/40" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                            {repo.full_name}
                          </h3>
                          {repo.description && (
                            <p className="text-xs text-base-content/40 mt-0.5 line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {repo.language && (
                              <span className="badge badge-xs badge-soft badge-neutral">
                                {repo.language}
                              </span>
                            )}
                            {repo.private ? (
                              <span className="badge badge-xs badge-soft badge-warning">
                                Private
                              </span>
                            ) : (
                              <span className="badge badge-xs badge-soft badge-success">
                                Public
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300/50">
                        <div className="flex items-center gap-1.5 text-xs text-base-content/40">
                          <Globe className="w-3 h-3" />
                          <span className="truncate max-w-32">
                            {repo.full_name.split("/")[0]}
                          </span>
                        </div>
                        {isDeployed ? (
                          <StatusBadge status="success" />
                        ) : (
                          <span className="text-[10px] text-base-content/30">
                            Not deployed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredRepos.length === 0 && (
              <div className="p-16 text-center rounded-xl border border-dashed border-base-300/60 bg-base-200/30">
                <div className="w-12 h-12 rounded-xl bg-base-300/50 flex items-center justify-center mx-auto mb-4">
                  <FolderGit2 className="w-5 h-5 text-base-content/30" />
                </div>
                <p className="text-sm font-medium mb-1">
                  {repoError ? "Failed to load repositories" : "No repositories found"}
                </p>
                <p className="text-xs text-base-content/40 mb-4">
                  {repoError
                    ? repoError
                    : search
                      ? "Try a different search term"
                      : "No GitHub repos linked yet"}
                </p>
                {repoError && (
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="btn btn-outline btn-sm"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/_authed/projects")({
  component: ProjectsPage,
});
