import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
  const { user, loading, roles, refreshRoles, isAdmin, isAccountant, isTeacher } = useAuth();
  const location = useLocation();

  // Track whether we've attempted to fetch roles
  const [rolesFetching, setRolesFetching] = useState(false);
  const [rolesReady, setRolesReady] = useState(false);
  const fetchAttempted = useRef(false);

  const needsRole = requireAdmin || requireAccountant || requireTeacher;

  useEffect(() => {
    // If no role check needed, mark ready immediately
    if (!needsRole) {
      setRolesReady(true);
      return;
    }

    // Wait for auth loading to complete
    if (loading) return;

    // If no user, no need to fetch roles
    if (!user) {
      setRolesReady(true);
      return;
    }

    // If roles already exist, mark ready
    if (roles && roles.length > 0) {
      setRolesReady(true);
      return;
    }

    // Only attempt fetch once
    if (fetchAttempted.current) {
      setRolesReady(true);
      return;
    }

    // Fetch roles
    fetchAttempted.current = true;
    setRolesFetching(true);
    
    refreshRoles()
      .catch(() => {})
      .finally(() => {
        setRolesFetching(false);
        setRolesReady(true);
      });
  }, [loading, user, roles, refreshRoles, needsRole]);

  // Show loading spinner while checking auth or fetching roles
  if (loading || rolesFetching || (needsRole && user && !rolesReady)) {
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
