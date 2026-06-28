import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async () => {
    const { data: authed } = await authClient.getSession();
    if (!authed) {
      throw redirect({ to: "/" });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return <Outlet />;
}
