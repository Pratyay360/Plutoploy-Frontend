import { useState } from "react";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-base-100">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`flex-1 overflow-auto transition-all duration-300 ${collapsed ? "ml-14" : "ml-56"}`}>
        {children}
      </main>
    </div>
  );
}
