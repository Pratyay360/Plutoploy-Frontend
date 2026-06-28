import { createAuthClient } from "better-auth/react";
// import { env } from mjs";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!,
  fetchOptions: {
    credentials: "include",
  },
});
