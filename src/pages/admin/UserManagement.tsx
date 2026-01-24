import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { 
  Users, 
  Plus, 
  Search, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  Trash2,
  UserPlus,
  Mail,
  Lock,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type AppRole = "super_admin" | "admin" | "accountant" | "teacher" | "staff";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  roles: AppRole[];
}

const roleLabels: Record<AppRole, string> = {
  super_admin: "সুপার অ্যাডমিন",
  admin: "অ্যাডমিন",
  accountant: "হিসাবরক্ষক",
  teacher: "শিক্ষক",
  staff: "স্টাফ",
};

const roleColors: Record<AppRole, string> = {
  super_admin: "bg-red-500/10 text-red-600 border-red-500/30",
  admin: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  accountant: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  teacher: "bg-green-500/10 text-green-600 border-green-500/30",
  staff: "bg-amber-500/10 text-amber-600 border-amber-500/30",
};

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<AppRole>("staff");

  // Fetch all users with their roles
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profileError) throw profileError;

      // Get all user roles
      const { data: allRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
        const userRoles = allRoles
          .filter((r) => r.user_id === profile.user_id)
          .map((r) => r.role as AppRole);

        return {
          id: profile.user_id,
          email: profile.email || profile.phone || "N/A",
          full_name: profile.full_name,
          created_at: profile.created_at,
          roles: userRoles,
        };
      });

      return usersWithRoles;
    },
    enabled: isAdmin,
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "সফল!", description: "রোল যোগ হয়েছে" });
    },
    onError: (error: any) => {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "সফল!", description: "রোল মুছে ফেলা হয়েছে" });
    },
    onError: (error: any) => {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create new user mutation
  const createUserMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: newUserEmail,
          password: newUserPassword,
          full_name: newUserName,
          role: newUserRole,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "সফল!", description: "নতুন ইউজার তৈরি হয়েছে" });
      setIsAddDialogOpen(false);
      setNewUserEmail("");
      setNewUserName("");
      setNewUserPassword("");
      setNewUserRole("staff");
    },
    onError: (error: any) => {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (roles: AppRole[]) => {
    if (roles.includes("super_admin")) return <ShieldAlert className="w-4 h-4" />;
    if (roles.includes("admin")) return <ShieldCheck className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">শুধুমাত্র অ্যাডমিনরা এই পেজ দেখতে পারবেন</p>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              ইউজার ম্যানেজমেন্ট
            </h1>
            <p className="text-muted-foreground">
              সিস্টেমের সকল ইউজার এবং তাদের রোল পরিচালনা করুন
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                নতুন ইউজার
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন ইউজার তৈরি করুন</DialogTitle>
                <DialogDescription>
                  নতুন ইউজারের তথ্য দিন এবং রোল নির্বাচন করুন
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">পুরো নাম</Label>
                  <Input
                    id="name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="মো. আব্দুল্লাহ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ইমেইল</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">পাসওয়ার্ড</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>রোল</Label>
                  <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">সুপার অ্যাডমিন</SelectItem>
                      <SelectItem value="admin">অ্যাডমিন</SelectItem>
                      <SelectItem value="accountant">হিসাবরক্ষক</SelectItem>
                      <SelectItem value="teacher">শিক্ষক</SelectItem>
                      <SelectItem value="staff">স্টাফ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button
                  onClick={() => createUserMutation.mutate()}
                  disabled={!newUserEmail || !newUserPassword || !newUserName || createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  তৈরি করুন
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(["super_admin", "admin", "accountant", "teacher", "staff"] as AppRole[]).map((role) => {
            const count = users.filter((u) => u.roles.includes(role)).length;
            return (
              <Card key={role} className="border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{roleLabels[role]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>সকল ইউজার ({filteredUsers.length})</CardTitle>
            <CardDescription>ইউজারদের রোল পরিবর্তন করতে রোল ব্যাজে ক্লিক করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead>রোল</TableHead>
                  <TableHead>যোগদান</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {getRoleIcon(user.roles)}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            কোনো রোল নেই
                          </Badge>
                        ) : (
                          user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className={`${roleColors[role]} cursor-pointer`}
                              onClick={() => {
                                if (user.id !== currentUser?.id) {
                                  removeRoleMutation.mutate({ userId: user.id, role });
                                }
                              }}
                            >
                              {roleLabels[role]}
                              {user.id !== currentUser?.id && (
                                <Trash2 className="w-3 h-3 ml-1 opacity-50" />
                              )}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("bn-BD")}
                    </TableCell>
                    <TableCell>
                      {user.id !== currentUser?.id && (
                        <Select
                          onValueChange={(role) =>
                            addRoleMutation.mutate({ userId: user.id, role: role as AppRole })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="রোল দিন" />
                          </SelectTrigger>
                          <SelectContent>
                            {(["super_admin", "admin", "accountant", "teacher", "staff"] as AppRole[])
                              .filter((r) => !user.roles.includes(r))
                              .map((role) => (
                                <SelectItem key={role} value={role}>
                                  {roleLabels[role]}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
