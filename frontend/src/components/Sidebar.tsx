import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LifeBuoy,
  Settings,
  Star,
  Store,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import {
  NavLink,
  type NavLinkRenderProps,
} from "react-router-dom";

import FixItLogo from "./FixItLogo";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const workspaceNavigation = [
  {
    label: "Home",
    path: "/customer",
    icon: Home,
  },
  {
    label: "Services",
    path: "/customer/services",
    icon: Wrench,
  },
  {
    label: "Professionals",
    path: "/customer/professionals",
    icon: Store,
  },
  {
    label: "Requests",
    path: "/customer/requests",
    icon: ClipboardList,
  },
  {
    label: "Quotes",
    path: "/customer/quotes",
    icon: FileText,
  },
  {
    label: "Bookings",
    path: "/customer/bookings",
    icon: CalendarDays,
  },
  {
    label: "Payments",
    path: "/customer/payments",
    icon: CreditCard,
  },
  {
    label: "Reviews",
    path: "/customer/reviews",
    icon: Star,
  },
];

const accountNavigation = [
  {
    label: "Profile",
    path: "/customer/profile",
    icon: UserRound,
  },
  {
    label: "Settings",
    path: "/customer/settings",
    icon: Settings,
  },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* ======================================================================
          MOBILE BACKDROP
          ====================================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[var(--fixit-text)]/25 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* ======================================================================
          SIDEBAR
          ====================================================================== */}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col",
          "border-r border-[var(--fixit-border)] bg-[var(--fixit-surface)]",
          "transition-transform duration-300",
          "lg:static lg:z-auto lg:translate-x-0",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        {/* ==================================================================
            BRAND
            ================================================================== */}

        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--fixit-border)] px-5">
          <NavLink
            to="/customer"
            onClick={onClose}
            aria-label="FixIt customer home"
            className="flex min-w-0 items-center"
          >
            <FixItLogo
              variant="horizontal"
              size="sm"
              alt="FixIt"
              className="max-w-[150px]"
            />
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-background)] hover:text-[var(--fixit-text)] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* ==================================================================
            NAVIGATION
            ================================================================== */}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <SidebarSectionLabel>
            Workspace
          </SidebarSectionLabel>

          <nav
            aria-label="Customer workspace navigation"
            className="space-y-1"
          >
            {workspaceNavigation.map((item) => (
              <SidebarLink
                key={item.path}
                {...item}
                onClose={onClose}
              />
            ))}
          </nav>

          <div className="my-7 h-px bg-[var(--fixit-border)]" />

          <SidebarSectionLabel>
            Account
          </SidebarSectionLabel>

          <nav
            aria-label="Customer account navigation"
            className="space-y-1"
          >
            {accountNavigation.map((item) => (
              <SidebarLink
                key={item.path}
                {...item}
                onClose={onClose}
              />
            ))}
          </nav>
        </div>

        {/* ==================================================================
            SUPPORT
            ================================================================== */}

        <div className="shrink-0 border-t border-[var(--fixit-border)] p-4">
          <div className="overflow-hidden rounded-[var(--fixit-radius-lg)] border border-[var(--fixit-primary)]/10 bg-[var(--fixit-primary-soft)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-surface)] text-[var(--fixit-primary)] shadow-[var(--fixit-shadow-sm)]">
                <LifeBuoy size={17} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--fixit-text)]">
                  Need help?
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[var(--fixit-text-muted)]">
                  Get assistance with your FixIt service.
                </p>

                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--fixit-primary)] transition hover:text-[var(--fixit-primary-hover)]"
                >
                  Contact support
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-3 px-1 text-[10px] text-[var(--fixit-text-muted)]">
            FixIt • Home services made simpler
          </p>
        </div>
      </aside>
    </>
  );
}

/* ==========================================================================
   SECTION LABEL
   ========================================================================== */

function SidebarSectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
      {children}
    </p>
  );
}

/* ==========================================================================
   SIDEBAR LINK
   ========================================================================== */

function SidebarLink({
  label,
  path,
  icon: Icon,
  onClose,
}: {
  label: string;
  path: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
  onClose: () => void;
}) {
  const getClassName = ({
    isActive,
  }: NavLinkRenderProps): string => {
    return [
      "group flex min-h-[44px] w-full items-center gap-3",
      "rounded-[var(--fixit-radius-md)] px-3 py-2.5",
      "text-sm font-medium",
      "transition-all duration-150",
      "focus-visible:outline-none",
      "focus-visible:ring-4",
      "focus-visible:ring-[var(--fixit-primary-ring)]",
      isActive
        ? [
            "bg-[var(--fixit-primary-soft)]",
            "text-[var(--fixit-primary)]",
          ].join(" ")
        : [
            "bg-transparent",
            "text-[var(--fixit-text)]",
            "hover:bg-[var(--fixit-background)]",
            "hover:text-[var(--fixit-primary)]",
          ].join(" "),
    ].join(" ");
  };

  return (
    <NavLink
      to={path}
      end={path === "/customer"}
      onClick={onClose}
      className={getClassName}
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              "transition-all duration-150",
              isActive
                ? [
                    "bg-[var(--fixit-primary)]",
                    "text-white",
                    "shadow-[var(--fixit-shadow-sm)]",
                  ].join(" ")
                : [
                    "bg-transparent",
                    "text-[var(--fixit-text)]",
                    "group-hover:text-[var(--fixit-primary)]",
                  ].join(" "),
            ].join(" ")}
          >
            <Icon
              size={17}
              strokeWidth={1.9}
            />
          </span>

          <span className="min-w-0 flex-1 truncate">
            {label}
          </span>

          {isActive && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--fixit-secondary)]" />
          )}
        </>
      )}
    </NavLink>
  );
}