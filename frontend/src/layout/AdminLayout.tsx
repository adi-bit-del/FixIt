import {
  CalendarClock,
  ClipboardList,
  CreditCard,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  UserRound,
  Users,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";
import FixItLogo from "../components/FixItLogo";

const navigationGroups = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        to: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    label: "Marketplace",
    items: [
      {
        label: "Professionals",
        to: "/admin/professionals",
        icon: Users,
      },
      {
        label: "Customers",
        to: "/admin/customers",
        icon: UsersRound,
      },
      {
        label: "Requests",
        to: "/admin/requests",
        icon: ClipboardList,
      },
      {
        label: "Quotes",
        to: "/admin/quotes",
        icon: FileText,
      },
      {
        label: "Bookings",
        to: "/admin/bookings",
        icon: CalendarClock,
      },
    ],
  },

  {
    label: "Catalog",
    items: [
      {
        label: "Categories",
        to: "/admin/categories",
        icon: FolderTree,
      },
      {
        label: "Services",
        to: "/admin/services",
        icon: Wrench,
      },
    ],
  },

  {
    label: "Trust & Moderation",
    items: [
      {
        label: "Payments",
        to: "/admin/payments",
        icon: CreditCard,
      },
      {
        label: "Reviews",
        to: "/admin/reviews",
        icon: MessageSquareText,
      },
    ],
  },

  {
    label: "Account",
    items: [
      {
        label: "Profile",
        to: "/admin/profile",
        icon: UserRound,
      },
      {
        label: "Settings",
        to: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

function linkClass({
  isActive,
}: {
  isActive: boolean;
}) {
  return [
    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
    isActive
      ? "bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]"
      : "text-[var(--fixit-text-muted)] hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]",
  ].join(" ");
}

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[var(--fixit-background)] text-[var(--fixit-text)]">
      {/* ================================================================
          MOBILE BACKDROP
          ================================================================ */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================================================================
          SIDEBAR
          ================================================================ */}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--fixit-border)] bg-[var(--fixit-surface)]",
          "transition-transform duration-200",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* BRAND HEADER */}

        <div className="flex h-16 items-center justify-between border-b border-[var(--fixit-border)] px-5">
          <NavLink
            to="/admin"
            aria-label="FixIt admin home"
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
            className="rounded-lg p-2 text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================================================================
            NAVIGATION
            ================================================================ */}

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-6">
            {navigationGroups.map((group) => (
              <section key={group.label}>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fixit-text-muted)]">
                  {group.label}
                </p>

                <div className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/admin"}
                        className={linkClass}
                        onClick={() =>
                          setSidebarOpen(false)
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span
                                aria-hidden="true"
                                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--fixit-secondary)]"
                              />
                            )}

                            <Icon
                              className={[
                                "h-5 w-5 shrink-0 transition",
                                isActive
                                  ? "text-[var(--fixit-primary)]"
                                  : "text-[var(--fixit-text-muted)] group-hover:text-[var(--fixit-primary)]",
                              ].join(" ")}
                            />

                            <span>{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>

        {/* ================================================================
            LOGOUT
            ================================================================ */}

        <div className="border-t border-[var(--fixit-border)] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--fixit-text-muted)] transition hover:bg-red-50 hover:text-[var(--fixit-danger)]"
          >
            <LogOut className="h-5 w-5 shrink-0" />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================================================================
          MAIN CONTENT
          ================================================================ */}

      <div className="lg:pl-72">
        {/* TOP HEADER */}

        <header className="sticky top-0 z-30 border-b border-[var(--fixit-border)] bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Open navigation"
              className="rounded-lg p-2 text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)] lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-[var(--fixit-text)]">
                  Admin
                </p>

                <p className="text-xs text-[var(--fixit-text-muted)]">
                  FixIt platform management
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fixit-primary-active)] text-sm font-semibold text-white ring-1 ring-[var(--fixit-primary-ring)]">
                A
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;