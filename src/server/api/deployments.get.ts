import { defineEventHandler } from "h3";
import { getDeploymentsList, requireSession } from "../utils/db";

export default defineEventHandler(async (event) => {
  await requireSession(event);
  const deployments = await getDeploymentsList();
  return { deployments };
});
