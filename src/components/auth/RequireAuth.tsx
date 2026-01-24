import { Navigate, Outlet, useLocation } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface RequireAuthProps {
  /** If true, requires the user to have admin or super_admin role */
  requireAdmin?: boolean;
  /** If true, requires the user to have accountant role (or admin) */
  requireAccountant?: boolean;
  /** If true, requires the user to have teacher role (or admin) */
  requireTeacher?: boolean;
}

export function RequireAuth({ 
  requireAdmin = false,
  requireAccountant = false,
  requireTeacher = false,
}: RequireAuthProps) {
  const { user, loading, rolesLoaded, refreshRoles, isAdmin, isAccountant, isTeacher } = useAuth();
  const location = useLocation();

  const needsRole = requireAdmin || requireAccountant || requireTeacher;
  const [refreshing, setRefreshing] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (!needsRole) return;
    if (loading) return;
    if (!user) return;
    if (rolesLoaded) return;
    if (attempted.current) return;

    attempted.current = true;
    setRefreshing(true);
    refreshRoles()
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }, [needsRole, loading, user, rolesLoaded, refreshRoles]);

  // Show loading spinner while checking auth or fetching roles
  if (loading || refreshing || (needsRole && user && !rolesLoaded)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Check role-based authorization (only after roles are ready)
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireAccountant && !isAdmin && !isAccountant) {
    return <Navigate to="/" replace />;
  }

  if (requireTeacher && !isAdmin && !isTeacher) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

/**
 * Higher-order component for RequireAuth with admin requirement
 */
export function RequireAdmin() {
  return <RequireAuth requireAdmin />;
}

// Avoid react-router ref warning in dev
export const RequireAdminWithRef = React.forwardRef<HTMLDivElement, Record<string, never>>(
  function RequireAdminWithRef(_props, _ref) {
    return <RequireAuth requireAdmin />;
  }
);
