import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface Permission {
  id: string;
  name: string;
  name_bengali: string;
  description: string | null;
  category: string;
}

export interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
}

type AppRole = "super_admin" | "admin" | "accountant" | "teacher" | "staff";

export function usePermissions() {
  const { roles, isAdmin } = useAuth();

  // Fetch all available permissions
  const { data: allPermissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("category, name");
      
      if (error) throw error;
      return data as Permission[];
    },
  });

  // Fetch role-permission mappings
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading } = useQuery({
    queryKey: ["role-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*");
      
      if (error) throw error;
      return data as RolePermission[];
    },
  });

  // Get permissions for the current user based on their roles
  const userPermissions = rolePermissions
    .filter((rp) => roles.includes(rp.role as AppRole))
    .map((rp) => {
      const permission = allPermissions.find((p) => p.id === rp.permission_id);
      return permission?.name;
    })
    .filter(Boolean) as string[];

  // Check if user has a specific permission
  const hasPermission = (permissionName: string): boolean => {
    // Super admins and admins have all permissions
    if (isAdmin) return true;
    return userPermissions.includes(permissionName);
  };

  // Check if user has any of the given permissions
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    if (isAdmin) return true;
    return permissionNames.some((name) => userPermissions.includes(name));
  };

  // Check if user has all of the given permissions
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    if (isAdmin) return true;
    return permissionNames.every((name) => userPermissions.includes(name));
  };

  // Get permissions for a specific role
  const getPermissionsForRole = (role: AppRole): Permission[] => {
    const permissionIds = rolePermissions
      .filter((rp) => rp.role === role)
      .map((rp) => rp.permission_id);
    
    return allPermissions.filter((p) => permissionIds.includes(p.id));
  };

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return {
    allPermissions,
    rolePermissions,
    userPermissions,
    permissionsByCategory,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissionsForRole,
    isLoading: permissionsLoading || rolePermissionsLoading,
  };
}

// Category labels in Bengali
export const categoryLabels: Record<string, string> = {
  students: "শিক্ষার্থী",
  teachers: "শিক্ষক",
  fees: "ফি",
  salaries: "বেতন",
  expenses: "খরচ",
  donations: "দান",
  attendance: "হাজিরা",
  exams: "পরীক্ষা",
  reports: "রিপোর্ট",
  settings: "সেটিংস",
  users: "ইউজার",
  general: "সাধারণ",
};
