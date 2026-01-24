import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Plus, BookOpen, Loader2, Edit, Trash2, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleDatabaseError } from "@/lib/error-handler";

const departmentColors: Record<string, string> = {
  nazera: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  hifz: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  kitab: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  nurani: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  tajweed: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  ifta: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  takhassos: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  najera: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

export default function ClassesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeptManageOpen, setIsDeptManageOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("department")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await supabase.from("classes").delete().eq("id", classId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({ title: "সফল!", description: "ক্লাস মুছে ফেলা হয়েছে" });
    },
    onError: (error: Error) => {
      handleDatabaseError(error, "class-delete");
    },
  });

  // Create department labels from database
  const departmentLabels = departments.reduce((acc, dept) => {
    acc[dept.name] = dept.name_bengali;
    return acc;
  }, {} as Record<string, string>);

  const groupedClasses = classes.reduce((acc, cls) => {
    if (!acc[cls.department]) acc[cls.department] = [];
    acc[cls.department].push(cls);
    return acc;
  }, {} as Record<string, typeof classes>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ক্লাস ও বিভাগ</h1>
            <p className="text-muted-foreground">সকল ক্লাস ও বিভাগ পরিচালনা করুন</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDeptManageOpen} onOpenChange={setIsDeptManageOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  বিভাগ পরিচালনা
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>বিভাগ পরিচালনা</DialogTitle>
                </DialogHeader>
                <DepartmentManager onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["departments"] });
                }} />
              </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  নতুন ক্লাস যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন ক্লাস যোগ করুন</DialogTitle>
                </DialogHeader>
                <ClassForm 
                  departments={departments}
                  onSuccess={() => {
                    setIsAddOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["classes"] });
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ক্লাস সম্পাদনা করুন</DialogTitle>
            </DialogHeader>
            {editingClass && (
              <ClassForm 
                initialData={editingClass}
                departments={departments}
                onSuccess={() => {
                  setEditingClass(null);
                  queryClient.invalidateQueries({ queryKey: ["classes"] });
                }} 
              />
            )}
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedClasses).map(([department, deptClasses]) => (
              <div key={department}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={departmentColors[department] || "bg-gray-500/10 text-gray-600"}>
                    {departmentLabels[department] || department} বিভাগ
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {deptClasses.length} টি ক্লাস
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deptClasses.map((cls, index) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => setEditingClass(cls)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      এই ক্লাস মুছে ফেললে এর সাথে সম্পর্কিত ছাত্রদের ক্লাস খালি হয়ে যাবে।
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteMutation.mutate(cls.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      মুছে ফেলুন
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <h3 className="font-semibold text-foreground mb-1">{cls.name}</h3>
                          {cls.name_arabic && (
                            <p className="text-sm text-muted-foreground mb-3" dir="rtl">
                              {cls.name_arabic}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                            <div>
                              <p className="text-muted-foreground">মাসিক ফি</p>
                              <p className="font-semibold">৳{cls.monthly_fee}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground">ভর্তি ফি</p>
                              <p className="font-semibold">৳{cls.admission_fee}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(groupedClasses).length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                কোনো ক্লাস নেই। উপরের বাটনে ক্লিক করে নতুন ক্লাস যোগ করুন।
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ClassForm({ onSuccess, initialData, departments }: { onSuccess: () => void; initialData?: any; departments: any[] }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    nameArabic: initialData?.name_arabic || "",
    department: initialData?.department || "",
    monthlyFee: initialData?.monthly_fee?.toString() || "",
    admissionFee: initialData?.admission_fee?.toString() || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.department) {
      toast({ title: "নাম এবং বিভাগ নির্বাচন করুন", variant: "destructive" });
      return;
    }

    setLoading(true);

    const classData = {
      name: formData.name,
      name_arabic: formData.nameArabic || null,
      department: formData.department,
      monthly_fee: parseFloat(formData.monthlyFee) || 0,
      admission_fee: parseFloat(formData.admissionFee) || 0,
      is_active: true,
    };

    let error;
    if (initialData?.id) {
      const result = await supabase.from("classes").update(classData).eq("id", initialData.id);
      error = result.error;
    } else {
      const result = await supabase.from("classes").insert(classData);
      error = result.error;
    }

    setLoading(false);
    if (error) {
      handleDatabaseError(error, "class-save");
    } else {
      toast({ title: "সফল!", description: initialData ? "ক্লাস আপডেট হয়েছে" : "ক্লাস যোগ হয়েছে" });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>ক্লাসের নাম (বাংলা) *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="হিফজ - ১ম বর্ষ"
        />
      </div>
      <div>
        <Label>ক্লাসের নাম (আরবী)</Label>
        <Input
          value={formData.nameArabic}
          onChange={(e) => setFormData({ ...formData, nameArabic: e.target.value })}
          placeholder="الحفظ - السنة الأولى"
          dir="rtl"
        />
      </div>
      <div>
        <Label>বিভাগ *</Label>
        <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
          <SelectTrigger>
            <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.name}>
                {dept.name_bengali} {dept.name_arabic && `(${dept.name_arabic})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>মাসিক ফি</Label>
          <Input
            type="number"
            value={formData.monthlyFee}
            onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
            placeholder="৫০০"
          />
        </div>
        <div>
          <Label>ভর্তি ফি</Label>
          <Input
            type="number"
            value={formData.admissionFee}
            onChange={(e) => setFormData({ ...formData, admissionFee: e.target.value })}
            placeholder="১০০০"
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {initialData ? "আপডেট করুন" : "ক্লাস যোগ করুন"}
      </Button>
    </form>
  );
}

function DepartmentManager({ onSuccess }: { onSuccess: () => void }) {
  const [newDept, setNewDept] = useState({ name: "", nameBengali: "", nameArabic: "" });
  const queryClient = useQueryClient();

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["all-departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("display_order");
      
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!newDept.name || !newDept.nameBengali) {
        throw new Error("নাম দিন");
      }
      const { error } = await supabase.from("departments").insert({
        name: newDept.name.toLowerCase().replace(/\s+/g, "_"),
        name_bengali: newDept.nameBengali,
        name_arabic: newDept.nameArabic || null,
        display_order: departments.length + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewDept({ name: "", nameBengali: "", nameArabic: "" });
      queryClient.invalidateQueries({ queryKey: ["all-departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast({ title: "বিভাগ যোগ হয়েছে" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: "সমস্যা", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (deptId: string) => {
      const { error } = await supabase.from("departments").delete().eq("id", deptId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast({ title: "বিভাগ মুছে ফেলা হয়েছে" });
      onSuccess();
    },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="বিভাগ কোড (ইংরেজি, যেমন: ifta)"
          value={newDept.name}
          onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
        />
        <Input
          placeholder="বিভাগের নাম (বাংলা)"
          value={newDept.nameBengali}
          onChange={(e) => setNewDept({ ...newDept, nameBengali: e.target.value })}
        />
        <Input
          placeholder="বিভাগের নাম (আরবী)"
          value={newDept.nameArabic}
          onChange={(e) => setNewDept({ ...newDept, nameArabic: e.target.value })}
          dir="rtl"
        />
      </div>
      <Button 
        onClick={() => addMutation.mutate()} 
        disabled={addMutation.isPending}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        নতুন বিভাগ যোগ করুন
      </Button>

      <div className="border-t pt-4 mt-4">
        <h4 className="font-semibold mb-3">বিদ্যমান বিভাগ সমূহ</h4>
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{dept.name_bengali}</p>
                  <p className="text-xs text-muted-foreground">
                    {dept.name}
                    {dept.name_arabic && ` | ${dept.name_arabic}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-8 w-8"
                  onClick={() => {
                    if (confirm("মুছে ফেলতে চান?")) {
                      deleteMutation.mutate(dept.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
