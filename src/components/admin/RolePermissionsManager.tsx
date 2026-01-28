import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Shield, ShieldCheck, ShieldAlert, Save, Users, Calculator, GraduationCap, Briefcase } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { usePermissions, categoryLabels, Permission } from "@/hooks/use-permissions";

type AppRole = "super_admin" | "admin" | "accountant" | "teacher" | "staff";

const roleLabels: Record<AppRole, string> = {
  super_admin: "সুপার অ্যাডমিন",
  admin: "অ্যাডমিন",
  accountant: "হিসাবরক্ষক",
  teacher: "শিক্ষক",
  staff: "স্টাফ",
};

const roleDescriptions: Record<AppRole, string> = {
  super_admin: "সকল অ্যাক্সেস এবং সিস্টেম কনফিগারেশন",
  admin: "সকল মডিউল পরিচালনা",
  accountant: "আর্থিক মডিউল পরিচালনা",
  teacher: "শিক্ষা সম্পর্কিত মডিউল",
  staff: "সীমিত অ্যাক্সেস",
};

const roleIcons: Record<AppRole, React.ReactNode> = {
  super_admin: <ShieldAlert className="w-5 h-5 text-red-500" />,
  admin: <ShieldCheck className="w-5 h-5 text-purple-500" />,
  accountant: <Calculator className="w-5 h-5 text-blue-500" />,
  teacher: <GraduationCap className="w-5 h-5 text-green-500" />,
  staff: <Briefcase className="w-5 h-5 text-amber-500" />,
};

const categoryIcons: Record<string, string> = {
  students: "👨‍🎓",
  teachers: "👨‍🏫",
  fees: "💰",
  salaries: "💵",
  expenses: "📝",
  donations: "🤲",
  attendance: "📋",
  exams: "📚",
  reports: "📊",
  settings: "⚙️",
  users: "👥",
  general: "📌",
};

export function RolePermissionsManager() {
  const queryClient = useQueryClient();
  const { allPermissions, rolePermissions, permissionsByCategory, isLoading } = usePermissions();
  const [selectedRole, setSelectedRole] = useState<AppRole>("accountant");
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());

  // Get current permissions for selected role
  const currentRolePermissionIds = rolePermissions
    .filter((rp) => rp.role === selectedRole)
    .map((rp) => rp.permission_id);

  // Check if a permission is enabled (considering pending changes)
  const isPermissionEnabled = (permissionId: string): boolean => {
    if (pendingChanges.has(permissionId)) {
      return pendingChanges.get(permissionId)!;
    }
    return currentRolePermissionIds.includes(permissionId);
  };

  // Toggle permission in pending changes
  const togglePermission = (permissionId: string) => {
    const currentState = isPermissionEnabled(permissionId);
    const newChanges = new Map(pendingChanges);
    
    // If the new state matches the original, remove from pending
    const originalState = currentRolePermissionIds.includes(permissionId);
    if (!currentState === originalState) {
      newChanges.delete(permissionId);
    } else {
      newChanges.set(permissionId, !currentState);
    }
    
    setPendingChanges(newChanges);
  };

  // Save mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      const additions: string[] = [];
      const removals: string[] = [];

      pendingChanges.forEach((shouldEnable, permissionId) => {
        if (shouldEnable) {
          additions.push(permissionId);
        } else {
          removals.push(permissionId);
        }
      });

      // Remove permissions
      if (removals.length > 0) {
        const { error: removeError } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role", selectedRole)
          .in("permission_id", removals);
        
        if (removeError) throw removeError;
      }

      // Add permissions
      if (additions.length > 0) {
        const { error: addError } = await supabase
          .from("role_permissions")
          .insert(
            additions.map((permissionId) => ({
              role: selectedRole,
              permission_id: permissionId,
            }))
          );
        
        if (addError) throw addError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
      setPendingChanges(new Map());
      toast({ title: "সফল!", description: "পারমিশন সংরক্ষিত হয়েছে" });
    },
    onError: (error: any) => {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Select/deselect all in a category
  const toggleCategory = (category: string, enable: boolean) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    const newChanges = new Map(pendingChanges);
    
    categoryPermissions.forEach((permission) => {
      const originalState = currentRolePermissionIds.includes(permission.id);
      if (enable !== originalState) {
        newChanges.set(permission.id, enable);
      } else {
        newChanges.delete(permission.id);
      }
    });
    
    setPendingChanges(newChanges);
  };

  // Check if all permissions in category are enabled
  const isCategoryFullyEnabled = (category: string): boolean => {
    const categoryPermissions = permissionsByCategory[category] || [];
    return categoryPermissions.every((p) => isPermissionEnabled(p.id));
  };

  // Check if some permissions in category are enabled
  const isCategoryPartiallyEnabled = (category: string): boolean => {
    const categoryPermissions = permissionsByCategory[category] || [];
    const enabledCount = categoryPermissions.filter((p) => isPermissionEnabled(p.id)).length;
    return enabledCount > 0 && enabledCount < categoryPermissions.length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const isAdminRole = selectedRole === "super_admin" || selectedRole === "admin";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              রোল পারমিশন ম্যানেজমেন্ট
            </CardTitle>
            <CardDescription>
              প্রতিটি রোলের জন্য পারমিশন কাস্টমাইজ করুন
            </CardDescription>
          </div>
          {pendingChanges.size > 0 && (
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              সংরক্ষণ করুন ({pendingChanges.size})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedRole} onValueChange={(v) => {
          setSelectedRole(v as AppRole);
          setPendingChanges(new Map());
        }}>
          <TabsList className="grid grid-cols-5 mb-6">
            {(["super_admin", "admin", "accountant", "teacher", "staff"] as AppRole[]).map((role) => (
              <TabsTrigger key={role} value={role} className="flex items-center gap-1 text-xs sm:text-sm">
                {roleIcons[role]}
                <span className="hidden sm:inline">{roleLabels[role]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {(["super_admin", "admin", "accountant", "teacher", "staff"] as AppRole[]).map((role) => (
            <TabsContent key={role} value={role}>
              <div className="mb-4 p-4 rounded-lg bg-secondary/50 border">
                <div className="flex items-center gap-3">
                  {roleIcons[role]}
                  <div>
                    <h3 className="font-semibold">{roleLabels[role]}</h3>
                    <p className="text-sm text-muted-foreground">{roleDescriptions[role]}</p>
                  </div>
                </div>
              </div>

              {isAdminRole ? (
                <div className="p-6 text-center rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                  <ShieldCheck className="w-12 h-12 mx-auto text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-2">সম্পূর্ণ অ্যাক্সেস</h3>
                  <p className="text-muted-foreground">
                    {roleLabels[role]} এর সকল পারমিশন স্বয়ংক্রিয়ভাবে সক্রিয়। এই রোলের পারমিশন পরিবর্তন করা যায় না।
                  </p>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                    <AccordionItem key={category} value={category} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-xl">{categoryIcons[category] || "📌"}</span>
                          <span className="font-medium">{categoryLabels[category] || category}</span>
                          <div className="flex-1" />
                          <Badge 
                            variant="outline" 
                            className={
                              isCategoryFullyEnabled(category)
                                ? "bg-green-500/10 text-green-600 border-green-500/30"
                                : isCategoryPartiallyEnabled(category)
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : "bg-secondary"
                            }
                          >
                            {permissions.filter((p) => isPermissionEnabled(p.id)).length}/{permissions.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="flex justify-end gap-2 mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCategory(category, true)}
                          >
                            সব নির্বাচন
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCategory(category, false)}
                          >
                            সব বাদ
                          </Button>
                        </div>
                        <div className="grid gap-2">
                          {permissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                            >
                              <Checkbox
                                checked={isPermissionEnabled(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{permission.name_bengali}</p>
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              </div>
                              {pendingChanges.has(permission.id) && (
                                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600">
                                  পরিবর্তিত
                                </Badge>
                              )}
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
