import { Hono } from "hono";
import { createAuth } from "../lib/auth";
import {
  addDeployment,
  deleteDeploymentById,
  getDeploymentById,
  getDeploymentsList,
  getRepoById,
  getReposList,
  requireSession,
} from "./utils/db";
import { fetchUserRepos, getGitHubToken } from "./utils/github";

const app = new Hono().basePath("/api");

app.on(["GET", "POST", "DELETE"], "/auth/*", async (c) => {
  const auth = createAuth();
  return auth.handler(c.req.raw);
});

app.get("/repos", async (c) => {
  const session = await requireSession(c.req.raw);
  const repos = await getReposList();
  return c.json({ repos });
});

app.get("/repos/:id", async (c) => {
  const session = await requireSession(c.req.raw);
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "ID is required" }, 400);
  }
  const repo = await getRepoById(id);
  if (!repo) {
    return c.json({ error: "Repo not found" }, 404);
  }
  return c.json(repo);
});

app.get("/github/repos", async (c) => {
  const session = await requireSession(c.req.raw);
  const token = await getGitHubToken(session.user.id);
  if (!token) {
    return c.json({ error: "No GitHub account linked" }, 401);
  }
  const repos = await fetchUserRepos(token);
  return c.json({
    repos: repos.map((repo) => ({
      id: String(repo.id),
      full_name: repo.full_name,
      description: repo.description ?? "",
      html_url: repo.html_url,
      default_branch: repo.default_branch,
      private: repo.private,
      language: repo.language,
      updated_at: repo.updated_at,
    })),
  });
});

app.post("/deploy", async (c) => {
  const session = await requireSession(c.req.raw);
  const body = await c.req.json<{
    image: string;
    subdomain: string;
    repo?: string;
  }>();
  if (!body) {
    return c.json({ error: "Request body is required" }, 400);
  }
  const { image, subdomain, repo } = body;
  if (!image || !subdomain) {
    return c.json({ error: "Missing image or subdomain" }, 400);
  }

  const projectName = repo?.split("/").pop() ?? "custom-app";
  const newDeployment = await addDeployment({
    projectName,
    commitHash: "latest",
    branch: "main",
    status: "success",
    duration: "10s",
    repoFullName: repo ?? projectName,
    image,
    subdomain,
  });

  return c.json(newDeployment);
});

app.get("/deployments", async (c) => {
  const session = await requireSession(c.req.raw);
  const deployments = await getDeploymentsList();
  return c.json({ deployments });
});

app.get("/deployments/:id", async (c) => {
  const session = await requireSession(c.req.raw);
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "ID is required" }, 400);
  }
  const deployment = await getDeploymentById(id);
  if (!deployment) {
    return c.json({ error: "Deployment not found" }, 404);
  }
  return c.json({ deployment });
});

app.delete("/deployments/:id", async (c) => {
  const session = await requireSession(c.req.raw);
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "ID is required" }, 400);
  }
  const deployment = await getDeploymentById(id);
  if (!deployment) {
    return c.json({ error: "Deployment not found" }, 404);
  }
  await deleteDeploymentById(id);
  return c.json({ success: true });
});

app.post("/inject-workflow", async (c) => {
  const session = await requireSession(c.req.raw);
  const body = await c.req.json<{
    repoFullName: string;
    runtime: string;
    branch: string;
  }>();
  if (!body) {
    return c.json({ error: "Request body is required" }, 400);
  }
  const { repoFullName, runtime, branch } = body;
  if (!repoFullName || !runtime || !branch) {
    return c.json(
      { error: "Missing repoFullName, runtime, or branch" },
      400,
    );
  }

  const buildId = Math.random().toString(36).substring(2, 15);
  return c.json({ buildId });
});

export default app;
