import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Plus, BookOpen, Users, Loader2, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const departmentColors: Record<string, string> = {
  nazera: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  hifz: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  kitab: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const departmentLabels: Record<string, string> = {
  nazera: "নাযেরা",
  hifz: "হিফজ",
  kitab: "কিতাব",
};

export default function ClassesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
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
              <AddClassForm onSuccess={() => {
                setIsAddOpen(false);
                queryClient.invalidateQueries({ queryKey: ["classes"] });
              }} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedClasses).map(([department, deptClasses]) => (
              <div key={department}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={departmentColors[department]}>
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
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function AddClassForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nameArabic: "",
    department: "kitab",
    monthlyFee: "",
    admissionFee: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.department) {
      toast({ title: "নাম এবং বিভাগ নির্বাচন করুন", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("classes").insert({
      name: formData.name,
      name_arabic: formData.nameArabic || null,
      department: formData.department,
      monthly_fee: parseFloat(formData.monthlyFee) || 0,
      admission_fee: parseFloat(formData.admissionFee) || 0,
      is_active: true,
    });

    setLoading(false);
    if (error) {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: "ক্লাস যোগ হয়েছে" });
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
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nazera">নাযেরা</SelectItem>
            <SelectItem value="hifz">হিফজ</SelectItem>
            <SelectItem value="kitab">কিতাব</SelectItem>
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
        ক্লাস যোগ করুন
      </Button>
    </form>
  );
}
