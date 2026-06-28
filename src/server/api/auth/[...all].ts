import { defineEventHandler } from "h3";
import { createAuth } from "../../../lib/auth";

export default defineEventHandler((event) => {
  const auth = createAuth();
  return auth.handler(event.req);
});
