import { createError, defineEventHandler, getRouterParams } from "h3";
import { getRepoById, requireSession } from "../../utils/db";

export default defineEventHandler(async (event) => {
  await requireSession(event);
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "ID is required" });
  }
  const repo = await getRepoById(id);
  if (!repo) {
    throw createError({ statusCode: 404, message: "Repo not found" });
  }
  return repo;
});
