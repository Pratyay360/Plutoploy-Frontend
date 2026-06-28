import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import { account } from "../../../auth-schema";
import { getPool } from "../../lib/db";

interface GitHubRepo {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  private: boolean;
  fork: boolean;
  language: string | null;
  updated_at: string;
}

export async function getGitHubToken(
  userId: string,
): Promise<string | null> {
  const pool = getPool(process.env.DATABASE_URL!);
  const db = drizzle(pool);
  const result = await db
    .select({ accessToken: account.accessToken })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "github")))
    .limit(1);
  return result[0]?.accessToken ?? null;
}

export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&type=all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Plutoploy",
        },
      },
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as GitHubRepo[];
    repos.push(...data);
    hasMore = data.length === 100;
    page++;
  }

  return repos;
}
