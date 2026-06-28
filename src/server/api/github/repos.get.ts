import { createError, defineEventHandler } from "h3";
import { createAuth } from "../../../lib/auth";
import { fetchUserRepos, getGitHubToken } from "../../utils/github";

export default defineEventHandler(async (event) => {
  const auth = createAuth();
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const token = await getGitHubToken(session.user.id);

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "No GitHub account linked",
    });
  }

  const repos = await fetchUserRepos(token);

  return {
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
  };
});
