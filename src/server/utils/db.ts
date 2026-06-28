import { HTTPException } from "hono/http-exception";
import { createAuth } from "../../lib/auth";
import { getPool } from "../../lib/db";

export async function requireSession(req: Request) {
  const auth = createAuth();
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  return session;
}

export interface Repo {
  id: string;
  projectName: string;
  description: string;
  commitHash: string;
  branch: string;
  status: string;
  duration: string;
  timestamp: string;
  full_name: string;
  html_url: string;
}

export interface Deployment {
  id: string;
  projectName: string;
  commitHash: string;
  branch: string;
  status: "success" | "building" | "failed";
  duration: string;
  timestamp: string;
  repoFullName: string;
  runtime?: string;
  image?: string;
  subdomain?: string;
}

let initialized = false;
let envUrl = "";

async function initDB(connectionString: string) {
  if (initialized && envUrl === connectionString) return;
  const pool = getPool(connectionString);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS repos (
      id TEXT PRIMARY KEY,
      projectName TEXT,
      description TEXT,
      commitHash TEXT,
      branch TEXT,
      status TEXT,
      duration TEXT,
      timestamp TEXT,
      full_name TEXT,
      html_url TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      projectName TEXT,
      commitHash TEXT,
      branch TEXT,
      status TEXT,
      duration TEXT,
      timestamp TEXT,
      repoFullName TEXT,
      runtime TEXT,
      image TEXT,
      subdomain TEXT
    )
  `);

  initialized = true;
  envUrl = connectionString;
}

function getConnectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new HTTPException(500, { message: "Missing DATABASE_URL" });
  return url;
}

export async function getReposList() {
  const url = getConnectionString();
  await initDB(url);
  const res = await getPool(url).query("SELECT * FROM repos");
  return res.rows as unknown as Repo[];
}

export async function getRepoById(id: string) {
  const url = getConnectionString();
  await initDB(url);
  const res = await getPool(url).query("SELECT * FROM repos WHERE id = $1", [
    id,
  ]);
  return res.rows[0] as unknown as Repo | undefined;
}

export async function getDeploymentsList() {
  const url = getConnectionString();
  await initDB(url);
  const res = await getPool(url).query(
    "SELECT * FROM deployments ORDER BY id DESC",
  );
  return res.rows as unknown as Deployment[];
}

export async function getDeploymentById(id: string) {
  const url = getConnectionString();
  await initDB(url);
  const res = await getPool(url).query(
    "SELECT * FROM deployments WHERE id = $1",
    [id],
  );
  return res.rows[0] as unknown as Deployment | undefined;
}

export async function addDeployment(
  deployment: Omit<Deployment, "id" | "timestamp">,
) {
  const url = getConnectionString();
  await initDB(url);
  const id = Math.random().toString(36).substring(2, 9);
  const timestamp = "Just now";

  await getPool(url).query(
    `INSERT INTO deployments (id, projectName, commitHash, branch, status, duration, timestamp, repoFullName, runtime, image, subdomain) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      id,
      deployment.projectName,
      deployment.commitHash,
      deployment.branch,
      deployment.status,
      deployment.duration,
      timestamp,
      deployment.repoFullName,
      deployment.runtime,
      deployment.image,
      deployment.subdomain,
    ],
  );

  return {
    ...deployment,
    id,
    timestamp,
  };
}

export async function deleteDeploymentById(id: string) {
  const url = getConnectionString();
  await initDB(url);
  await getPool(url).query("DELETE FROM deployments WHERE id = $1", [id]);
}
