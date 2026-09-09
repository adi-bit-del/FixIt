import { Outlet, NavLink } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  MessageSquareQuote,
  Settings,
  Star,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../features/auth/AuthContext";
import FixItLogo from "../components/FixItLogo";

const navigation = [
  {
    label: "Dashboard",
    to: "/professional",
    icon: LayoutDashboard,
  },
  {
    label: "Requests",
    to: "/professional/requests",
    icon: ClipboardList,
  },
  {
    label: "Quotes",
    to: "/professional/quotes",
    icon: MessageSquareQuote,
  },
  {
    label: "Bookings",
    to: "/professional/bookings",
    icon: CalendarDays,
  },
  {
    label: "My Services",
    to: "/professional/services",
    icon: Wrench,
  },
  {
    label: "Service Areas",
    to: "/professional/service-areas",
    icon: MapPinned,
  },
  {
    label: "Reviews",
    to: "/professional/reviews",
    icon: Star,
  },
  {
    label: "Profile",
    to: "/professional/profile",
    icon: Settings,
  },
];

function ProfessionalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[var(--fixit-background)] text-[var(--fixit-text)]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--fixit-border)] bg-white transition-transform duration-200",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--fixit-border)] px-5">
          <NavLink
            to="/professional"
            aria-label="FixIt professional home"
            onClick={() => setSidebarOpen(false)}
            className="min-w-0"
          >
            <FixItLogo
              variant="horizontal"
              size="sm"
              alt="FixIt"
              className="max-w-[160px]"
            />
          </NavLink>

          <button
            type="button"
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-background)] hover:text-[var(--fixit-text)] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/professional"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)] shadow-sm"
                      : "text-[var(--fixit-text)] hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={[
                        "h-5 w-5 shrink-0",
                        isActive
                          ? "text-[var(--fixit-primary)]"
                          : "text-[var(--fixit-text-muted)]",
                      ].join(" ")}
                    />

                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-[var(--fixit-border)] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--fixit-text)] transition hover:bg-[var(--fixit-error-soft)] hover:text-[var(--fixit-error)]"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-[var(--fixit-border)] bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Open navigation"
              className="rounded-lg p-2 text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-background)] hover:text-[var(--fixit-text)] lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-[var(--fixit-text)]">
                  Professional
                </p>

                <p className="text-xs text-[var(--fixit-text-muted)]">
                  Manage your FixIt business
                </p>
              </div>

              <NavLink
                to="/professional/profile"
                aria-label="Open professional profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fixit-primary-active)] text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fixit-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              >
                P
              </NavLink>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ProfessionalLayout;