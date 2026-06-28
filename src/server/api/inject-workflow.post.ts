import { createError, defineEventHandler, readBody } from "h3";
import { requireSession } from "../utils/db";

export default defineEventHandler(async (event) => {
  await requireSession(event);
  const body = await readBody<{
    repoFullName: string;
    runtime: string;
    branch: string;
  }>(event);
  if (!body) {
    throw createError({ statusCode: 400, message: "Request body is required" });
  }
  const { repoFullName, runtime, branch } = body;

  if (!repoFullName || !runtime || !branch) {
    throw createError({
      statusCode: 400,
      message: "Missing repoFullName, runtime, or branch",
    });
  }

  // TODO: trigger the actual workflow injection
  // This would push a GitHub Actions workflow file to the repo
  const buildId = Math.random().toString(36).substring(2, 15);

  return { buildId };
});
