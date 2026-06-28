import { useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Search, User } from "lucide-react";
import { authClient } from "../../lib/auth-client";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const navigate = useNavigate();

  const handleSignout = async () => {
    await authClient.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-base-300/60 bg-base-100/80 backdrop-blur-sm sticky top-0 z-30">
      <div>
        <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-base-content/40 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-content/30" />
          <input
            type="text"
            placeholder="Search..."
            className="input input-sm input-ghost pl-8 w-48 h-8 text-xs bg-base-200/50 border-base-300/50 focus:bg-base-200 focus:border-primary/30 transition-colors"
          />
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-square btn-sm relative text-base-content/40 hover:text-base-content"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-base-100" />
        </button>

        <div className="dropdown dropdown-end">
          <button
            type="button"
            className="btn btn-ghost btn-square btn-sm text-base-content/40 hover:text-base-content"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-base-300 flex items-center justify-center overflow-hidden hover:border-primary/30 transition-colors">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
          </button>
          <ul className="dropdown-content menu bg-base-200 border border-base-300 rounded-xl z-50 w-56 p-2 shadow-xl shadow-black/30">
            <li className="menu-title px-3 py-2">
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{user?.name}</span>
                {user?.email && (
                  <span className="text-xs text-base-content/40 font-normal">
                    {user.email}
                  </span>
                )}
              </div>
            </li>
            <div className="divider my-1 h-px" />
            <li>
              <button type="button" className="text-sm gap-2.5">
                <User className="w-3.5 h-3.5" />
                Profile
              </button>
            </li>
            <li>
              <button type="button" className="text-sm gap-2.5">
                Billing
              </button>
            </li>
            <li>
              <button type="button" className="text-sm gap-2.5">
                Team
              </button>
            </li>
            <div className="divider my-1 h-px" />
            <li>
              <button
                type="button"
                onClick={handleSignout}
                className="text-error text-sm gap-2.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
