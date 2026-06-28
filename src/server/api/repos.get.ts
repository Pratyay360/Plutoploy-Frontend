import { defineEventHandler } from "h3";
import { getReposList, requireSession } from "../utils/db";

export default defineEventHandler(async (event) => {
  await requireSession(event);
  const repos = await getReposList();
  return { repos };
});
