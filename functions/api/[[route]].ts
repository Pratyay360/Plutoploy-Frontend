import app from "../../src/server/index";
import { handle } from "hono/cloudflare-pages";

export const onRequest = handle(app);
