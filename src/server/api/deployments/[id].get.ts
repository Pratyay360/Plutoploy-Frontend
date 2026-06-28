import { createError, defineEventHandler, getRouterParams } from "h3";
import { getDeploymentById, requireSession } from "../../utils/db";

export default defineEventHandler(async (event) => {
  await requireSession(event);
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "ID is required" });
  }
  const deployment = await getDeploymentById(id);
  if (!deployment) {
    throw createError({ statusCode: 404, message: "Deployment not found" });
  }
  return { deployment };
});
