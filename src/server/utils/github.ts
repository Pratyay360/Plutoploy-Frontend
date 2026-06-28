import { Octokit } from "octokit";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import { account } from "../../../auth-schema";
import { getPool } from "../../lib/db";

export async function getGitHubToken(userId: string): Promise<string | null> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[github] DATABASE_URL not set");
    return null;
  }
  const pool = getPool(url);
  const db = drizzle(pool);
  const result = await db
    .select({ accessToken: account.accessToken })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "github")))
    .limit(1);
  const token = result[0]?.accessToken ?? null;
  if (!token) {
    console.error(`[github] No GitHub token found for user ${userId}`);
  }
  return token;
}

export function createOctokit(token: string) {
  return new Octokit({ auth: token });
}

export async function fetchUserRepos(token: string) {
  const octokit = createOctokit(token);

  const repos = await octokit.paginate(
    octokit.rest.repos.listForAuthenticatedUser,
    {
      per_page: 100,
      sort: "updated",
      type: "all",
    },
  );

  return repos;
}
