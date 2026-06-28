import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../auth-schema";

export function createAuth() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema }),
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    account: {
      fields: {
        accessToken: "access_token",
        refreshToken: "refresh_token",
        idToken: "id_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
      },
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        scope: ["repo", "gist", "read:user", "user:email"],
      },
    },
  });
}
