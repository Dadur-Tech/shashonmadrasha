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

  // If roles haven't loaded yet (or got cleared by a timeout), re-fetch once before denying access.
  const [roleCheckLoading, setRoleCheckLoading] = useState(false);
  const roleCheckDone = useRef(false);

  useEffect(() => {
    const needsRole = requireAdmin || requireAccountant || requireTeacher;
    if (!needsRole) return;
    if (loading) return;
    if (!user) return;
    if (roleCheckDone.current) return;

    if ((roles?.length || 0) === 0) {
      roleCheckDone.current = true;
      setRoleCheckLoading(true);
      refreshRoles()
        .catch(() => {})
        .finally(() => setRoleCheckLoading(false));
    } else {
      roleCheckDone.current = true;
    }
  }, [loading, user, roles, refreshRoles, requireAdmin, requireAccountant, requireTeacher]);

  if (loading || roleCheckLoading) {
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

  // Check role-based authorization
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
