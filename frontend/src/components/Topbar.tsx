import {
  Bell,
  ChevronDown,
  Menu,
  Settings,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({
  onMenuClick,
}: TopbarProps) {
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const email = user?.email ?? "Customer";
  const initial = email
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-[var(--fixit-border)] bg-[var(--fixit-surface)]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* ============================================================
          MOBILE MENU
      ============================================================ */}

      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="flex h-10 w-10 items-center justify-center rounded-[var(--fixit-radius-md)] text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-background)] hover:text-[var(--fixit-text)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--fixit-primary-ring)] lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* ============================================================
          DESKTOP CONTEXT
      ============================================================ */}

      <div className="ml-3 hidden lg:block">
        <p className="text-sm font-semibold text-[var(--fixit-text)]">
          Customer workspace
        </p>

        <p className="mt-0.5 text-[11px] text-[var(--fixit-text-muted)]">
          Manage your FixIt services
        </p>
      </div>

      {/* ============================================================
          RIGHT ACTIONS
      ============================================================ */}

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <Link
          to="/customer/notifications"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-[var(--fixit-radius-md)] text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--fixit-primary-ring)]"
        >
          <Bell
            size={19}
            strokeWidth={1.9}
          />

          <span className="absolute right-[9px] top-[8px] h-1.5 w-1.5 rounded-full bg-[var(--fixit-secondary)]" />
        </Link>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setProfileOpen(
                (value) => !value
              )
            }
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="flex min-h-[44px] items-center gap-2 rounded-[var(--fixit-radius-md)] p-1.5 transition hover:bg-[var(--fixit-background)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--fixit-primary-ring)]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fixit-primary)] text-sm font-bold text-white shadow-[var(--fixit-shadow-sm)]">
              {initial}
            </div>

            <div className="hidden max-w-[190px] text-left sm:block">
              <p className="truncate text-xs font-semibold text-[var(--fixit-text)]">
                {email}
              </p>

              <p className="mt-0.5 text-[11px] text-[var(--fixit-text-muted)]">
                Customer
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden text-[var(--fixit-text-muted)] transition-transform sm:block ${
                profileOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {profileOpen && (
            <>
              {/* Click-away backdrop on mobile */}
              <button
                type="button"
                aria-label="Close profile menu"
                onClick={() =>
                  setProfileOpen(false)
                }
                className="fixed inset-0 z-40 cursor-default bg-transparent"
              />

              <div
                role="menu"
                className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-2 shadow-[var(--fixit-shadow-lg)]"
              >
                {/* Profile header */}
                <div className="border-b border-[var(--fixit-border)] px-3 py-3">
                  <p className="truncate text-sm font-semibold text-[var(--fixit-text)]">
                    {email}
                  </p>

                  <p className="mt-0.5 text-xs text-[var(--fixit-text-muted)]">
                    Customer account
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to="/customer/profile"
                    role="menuitem"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="flex items-center gap-3 rounded-[var(--fixit-radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]"
                  >
                    <UserRound size={17} />
                    Profile
                  </Link>

                  <Link
                    to="/customer/settings"
                    role="menuitem"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="flex items-center gap-3 rounded-[var(--fixit-radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]"
                  >
                    <Settings size={17} />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-[var(--fixit-border)] pt-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 rounded-[var(--fixit-radius-md)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--fixit-danger)] transition hover:bg-[var(--fixit-error-soft)]"
                  >
                    <UserRound size={17} />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}