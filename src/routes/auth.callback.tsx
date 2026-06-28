import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate({ to: "/dashboard" });
    }, 1000);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="text-center space-y-4 relative animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <div>
          <h2 className="text-sm font-semibold">Signing in...</h2>
          <p className="text-xs text-base-content/40 mt-1">Please wait</p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});
