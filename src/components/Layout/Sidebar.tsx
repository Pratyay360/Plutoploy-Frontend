import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  FolderGit2,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Rocket,
  Settings,
} from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { cn } from "../../lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderGit2, label: "Projects", path: "/projects" },
  { icon: Rocket, label: "Deployments", path: "/deployments" },
  { icon: KeyRound, label: "Environment", path: "/environment" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignout = async () => {
    await authClient.signOut();
    navigate({ to: "/" });
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 flex flex-col h-screen border-r border-base-300/60 bg-base-200/80 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-14" : "w-56",
      )}
    >
      <div className="flex items-center justify-between h-14 px-3 border-b border-base-300/60">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <Rocket className="w-3.5 h-3.5 text-primary-content" />
            </div>
            <span className="text-sm font-bold tracking-tight">Plutoploy</span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-base-content"
        >
          {collapsed ? (
            <Menu className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <ul className="menu p-2 flex-1 gap-0.5">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/dashboard" &&
              location.pathname.startsWith(item.path));

          return (
            <li
              key={item.path}
              className={cn(isActive && "animate-slide-in-left")}
            >
              <Link
                to={item.path}
                className={cn(
                  "gap-2.5 px-2.5 py-2 text-sm font-medium rounded-lg transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-base-content/50 hover:text-base-content hover:bg-base-300/50 border border-transparent",
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="p-2 border-t border-base-300/60">
        <button
          type="button"
          onClick={handleSignout}
          className="btn btn-ghost btn-sm w-full justify-start gap-2.5 text-base-content/40 hover:text-error hover:bg-error/5 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
