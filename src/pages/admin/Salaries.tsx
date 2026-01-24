import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Banknote,
  Loader2,
  Users,
  CheckCircle2,
  Clock,
  Download,
  MoreVertical,
  Trash2,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { StatCard } from "@/components/ui/stat-card";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  partial: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  hold: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "বকেয়া",
  partial: "আংশিক",
  paid: "পরিশোধিত",
  hold: "স্থগিত",
};

const monthNames = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export default function SalariesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (salaryId: string) => {
      const { error } = await supabase.from("teacher_salaries").delete().eq("id", salaryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-salaries"] });
      toast({ title: "সফল!", description: "বেতন রেকর্ড মুছে ফেলা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    },
  });

  const payMutation = useMutation({
    mutationFn: async (salaryId: string) => {
      const salary = salaries.find(s => s.id === salaryId);
      if (!salary) throw new Error("Salary not found");
      
      const { error } = await supabase.from("teacher_salaries").update({
        status: "paid",
        paid_amount: salary.net_salary,
        payment_date: new Date().toISOString().split('T')[0],
      }).eq("id", salaryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-salaries"] });
      toast({ title: "সফল!", description: "বেতন পরিশোধিত হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    },
  });

  const { data: salaries = [], isLoading } = useQuery({
    queryKey: ["teacher-salaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_salaries")
        .select(`
          *,
          teacher:teachers(full_name, teacher_id)
        `)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, full_name, teacher_id, monthly_salary")
        .eq("status", "active");
      
      if (error) throw error;
      return data;
    },
  });

  const totalSalary = salaries.reduce((sum, s) => sum + Number(s.net_salary || 0), 0);
  const paidAmount = salaries.reduce((sum, s) => sum + Number(s.paid_amount || 0), 0);
  const paidCount = salaries.filter(s => s.status === "paid").length;

  const filteredSalaries = salaries.filter(salary =>
    salary.teacher?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salary.salary_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">বেতন ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground">শিক্ষকদের বেতন পরিশোধ ও ট্র্যাকিং</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              রিপোর্ট
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  বেতন এন্ট্রি
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>বেতন এন্ট্রি করুন</DialogTitle>
                </DialogHeader>
                <AddSalaryForm 
                  teachers={teachers}
                  onSuccess={() => {
                    setIsAddOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["teacher-salaries"] });
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="মোট বেতন"
            value={`৳${totalSalary.toLocaleString('bn-BD')}`}
            icon={<Banknote className="w-5 h-5" />}
          />
          <StatCard
            title="পরিশোধিত"
            value={`৳${paidAmount.toLocaleString('bn-BD')}`}
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
          <StatCard
            title="পরিশোধিত সংখ্যা"
            value={paidCount.toString()}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="বকেয়া"
            value={`৳${(totalSalary - paidAmount).toLocaleString('bn-BD')}`}
            icon={<Clock className="w-5 h-5" />}
          />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="শিক্ষকের নাম বা আইডি দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>আইডি</TableHead>
                    <TableHead>শিক্ষক</TableHead>
                    <TableHead>মাস/বছর</TableHead>
                    <TableHead className="text-right">মূল বেতন</TableHead>
                    <TableHead className="text-right">বোনাস</TableHead>
                    <TableHead className="text-right">কর্তন</TableHead>
                    <TableHead className="text-right">নেট বেতন</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalaries.map((salary, index) => (
                    <motion.tr
                      key={salary.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <TableCell className="font-mono text-xs">{salary.salary_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{salary.teacher?.full_name || "-"}</p>
                          <p className="text-xs text-muted-foreground">{salary.teacher?.teacher_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {monthNames[salary.month - 1]} {salary.year}
                      </TableCell>
                      <TableCell className="text-right">
                        ৳{Number(salary.base_salary).toLocaleString('bn-BD')}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600">
                        +৳{Number(salary.bonus || 0).toLocaleString('bn-BD')}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        -৳{Number(salary.deduction || 0).toLocaleString('bn-BD')}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ৳{Number(salary.net_salary).toLocaleString('bn-BD')}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[salary.status]}>
                          {statusLabels[salary.status] || salary.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {salary.status !== "paid" && (
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => payMutation.mutate(salary.id)}
                              >
                                <CreditCard className="w-4 h-4" /> পরিশোধ করুন
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => {
                                if (confirm("আপনি কি এই বেতন রেকর্ড মুছে ফেলতে চান?")) {
                                  deleteMutation.mutate(salary.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" /> মুছে ফেলুন
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {filteredSalaries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                        কোনো বেতন রেকর্ড পাওয়া যায়নি
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function AddSalaryForm({ teachers, onSuccess }: { teachers: any[]; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    teacherId: "",
    month: (currentDate.getMonth() + 1).toString(),
    year: currentDate.getFullYear().toString(),
    baseSalary: "",
    bonus: "0",
    deduction: "0",
  });

  const selectedTeacher = teachers.find(t => t.id === formData.teacherId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacherId || !formData.baseSalary) {
      toast({ title: "শিক্ষক এবং বেতন নির্বাচন করুন", variant: "destructive" });
      return;
    }

    setLoading(true);
    const salaryId = `SAL-${formData.year}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const { error } = await supabase.from("teacher_salaries").insert({
      salary_id: salaryId,
      teacher_id: formData.teacherId,
      month: parseInt(formData.month),
      year: parseInt(formData.year),
      base_salary: parseFloat(formData.baseSalary),
      bonus: parseFloat(formData.bonus) || 0,
      deduction: parseFloat(formData.deduction) || 0,
      status: "pending",
    });

    setLoading(false);
    if (error) {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: "বেতন এন্ট্রি হয়েছে" });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>শিক্ষক নির্বাচন *</Label>
        <Select 
          value={formData.teacherId} 
          onValueChange={(v) => {
            const teacher = teachers.find(t => t.id === v);
            setFormData({ 
              ...formData, 
              teacherId: v,
              baseSalary: teacher?.monthly_salary?.toString() || formData.baseSalary
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="শিক্ষক নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.full_name} ({teacher.teacher_id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>মাস</Label>
          <Select value={formData.month} onValueChange={(v) => setFormData({ ...formData, month: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((name, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>বছর</Label>
          <Input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>মূল বেতন *</Label>
        <Input
          type="number"
          value={formData.baseSalary}
          onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
          placeholder="১০০০০"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>বোনাস</Label>
          <Input
            type="number"
            value={formData.bonus}
            onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
            placeholder="০"
          />
        </div>
        <div>
          <Label>কর্তন</Label>
          <Input
            type="number"
            value={formData.deduction}
            onChange={(e) => setFormData({ ...formData, deduction: e.target.value })}
            placeholder="০"
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        বেতন এন্ট্রি করুন
      </Button>
    </form>
  );
}
