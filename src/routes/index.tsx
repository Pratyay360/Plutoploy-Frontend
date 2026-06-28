import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2, Rocket } from "lucide-react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { authClient } from "../lib/auth-client";

function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to sign in with GitHub";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-sm space-y-6 relative animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <Rocket className="w-5 h-5 text-primary-content" />
          </div>
          <span className="text-xl font-bold tracking-tight">Plutoploy</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="text-xs text-base-content/40">
            Sign in with GitHub to access your projects and deployments.
          </p>
        </div>

        <div className="bg-base-200/50 border border-base-300/60 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          {error && (
            <div className="p-3 text-xs bg-error/10 border border-error/20 text-error rounded-lg animate-shake">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="btn btn-outline border-base-300 w-full h-10 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-base-300/40 transition-all duration-150"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FaGithub className="w-4 h-4" />
            )}
            {isLoading ? "Signing in..." : "Continue with GitHub"}
          </button>
        </div>

        <p className="text-[10px] text-center text-base-content/30">
          By continuing, you agree to our{" "}
          <a
            href="/terms"
            className="text-base-content/40 hover:text-base-content transition-colors underline"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-base-content/40 hover:text-base-content transition-colors underline"
          >
            Privacy
          </a>
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data: authed } = await authClient.getSession();
    if (authed) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AuthPage,
});
