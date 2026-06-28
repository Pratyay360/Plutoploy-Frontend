import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-base-100">
      <Sidebar />
      <main className="flex-1 overflow-auto ml-56">{children}</main>
    </div>
  );
}
