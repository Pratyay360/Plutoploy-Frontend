import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/Layout/DashboardLayout";
import { Header } from "../components/Layout/Header";
import { EnvVariablesEditor } from "../components/ui/EnvVariablesEditor";

interface EnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
}

function EnvironmentPage() {
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnvVars = async () => {
      try {
        const res = await fetch("/api/env");
        if (res.ok) {
          const data = await res.json();
          setVariables(data.variables ?? []);
        }
      } catch {
        // API not available yet
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnvVars();
  }, []);

  const handleSave = async (updated: EnvVariable[]) => {
    try {
      await fetch("/api/env", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables: updated }),
      });
    } catch (err) {
      console.error("Failed to save env variables", err);
    }
  };

  return (
    <DashboardLayout>
      <Header title="Environment" subtitle="Global environment variables" />

      <div className="p-6 space-y-5">
        <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <EnvVariablesEditor variables={variables} onSave={handleSave} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/_authed/environment")({
  component: EnvironmentPage,
});
