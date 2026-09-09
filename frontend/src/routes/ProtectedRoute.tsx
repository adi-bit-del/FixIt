import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";
import type { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    user,
  } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f4]">
        <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 shadow-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#ff6b35]" />
          <span className="text-sm font-medium text-neutral-600">
            Loading FixIt...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.some((role) =>
      user.roles.includes(role),
    )
  ) {
    const primaryRole = user.roles[0];

    if (primaryRole === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (primaryRole === "PROFESSIONAL") {
      return (
        <Navigate
          to="/professional"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/customer"
        replace
      />
    );
  }

  return <Outlet />;
}