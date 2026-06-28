import { createError, defineEventHandler, readBody } from "h3";
import { addDeployment, requireSession } from "../utils/db";

export default defineEventHandler(async (event) => {
  await requireSession(event);
  const body = await readBody<{
    image: string;
    subdomain: string;
    repo?: string;
  }>(event);
  if (!body) {
    throw createError({ statusCode: 400, message: "Request body is required" });
  }
  const { image, subdomain, repo } = body;

  if (!image || !subdomain) {
    throw createError({
      statusCode: 400,
      message: "Missing image or subdomain",
    });
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

  return newDeployment;
});
