import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Rocket } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="text-center space-y-5 relative animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center mx-auto border border-primary/10">
          <Rocket className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <p className="text-sm text-base-content/40">
            This page could not be found.
          </p>
        </div>
        <Link to="/" className="btn btn-primary btn-sm gap-1.5">
          Go home
        </Link>
      </div>
    </div>
  );
}

function RootLayout() {
  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});
