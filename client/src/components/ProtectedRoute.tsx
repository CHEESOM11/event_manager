import { Navigate, Outlet, useLocation } from "react-router-dom";
import { FullPageSpinner } from "./ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { homePathForRole } from "../utils/navigation";
import type { Role } from "../types";

interface ProtectedRouteProps {
  roles?: Role[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <FullPageSpinner />;
  }

  if (status === "unauthenticated") {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { status, user } = useAuth();

  if (status === "loading") {
    return <FullPageSpinner />;
  }

  if (status === "authenticated" && user) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
