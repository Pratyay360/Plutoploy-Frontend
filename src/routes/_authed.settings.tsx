import { createFileRoute } from "@tanstack/react-router";
import { Bell, CreditCard, KeyRound, User } from "lucide-react";
import { DashboardLayout } from "../components/Layout/DashboardLayout";
import { Header } from "../components/Layout/Header";
import { authClient } from "../lib/auth-client";

function SettingsPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <DashboardLayout>
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="card bg-base-200/60 border border-base-300/60 animate-fade-in">
          <div className="card-body p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Profile</h2>
                <p className="text-xs text-base-content/40">
                  {user?.name} &middot; {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-200/60 border border-base-300/60 animate-fade-in">
          <div className="card-body p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Notifications</h2>
                <p className="text-xs text-base-content/40">
                  Configure email and deploy notifications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">API Keys</h2>
                <p className="text-xs text-base-content/40">
                  Manage API tokens for CI/CD
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Billing</h2>
                <p className="text-xs text-base-content/40">
                  Manage your subscription and usage
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-center text-base-content/30 animate-fade-in">
          More settings coming soon
        </p>
      </div>
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/_authed/settings")({
  component: SettingsPage,
});
