import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  GraduationCap,
  Phone,
  Loader2,
  Users,
  Banknote,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { StatCard } from "@/components/ui/stat-card";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  inactive: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  on_leave: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  resigned: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  active: "সক্রিয়",
  inactive: "নিষ্ক্রিয়",
  on_leave: "ছুটিতে",
  resigned: "পদত্যাগ",
};

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.teacher_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.phone.includes(searchTerm)
  );

  const activeTeachers = teachers.filter(t => t.status === "active").length;
  const totalSalary = teachers.reduce((sum, t) => sum + Number(t.monthly_salary || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">শিক্ষক ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground">সকল শিক্ষকের তথ্য দেখুন ও পরিচালনা করুন</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                নতুন শিক্ষক যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>নতুন শিক্ষক যোগ করুন</DialogTitle>
              </DialogHeader>
              <AddTeacherForm onSuccess={() => {
                setIsAddOpen(false);
                queryClient.invalidateQueries({ queryKey: ["teachers"] });
              }} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="মোট শিক্ষক"
            value={teachers.length.toString()}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="সক্রিয় শিক্ষক"
            value={activeTeachers.toString()}
            icon={<GraduationCap className="w-5 h-5" />}
          />
          <StatCard
            title="মোট মাসিক বেতন"
            value={`৳${totalSalary.toLocaleString('bn-BD')}`}
            icon={<Banknote className="w-5 h-5" />}
          />
          <StatCard
            title="গড় বেতন"
            value={`৳${teachers.length ? Math.round(totalSalary / teachers.length).toLocaleString('bn-BD') : 0}`}
            icon={<Banknote className="w-5 h-5" />}
          />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="নাম, আইডি বা ফোন নম্বর দিয়ে খুঁজুন..."
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
                    <TableHead>নাম</TableHead>
                    <TableHead>ফোন</TableHead>
                    <TableHead>যোগ্যতা</TableHead>
                    <TableHead>মাসিক বেতন</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher, index) => (
                    <motion.tr
                      key={teacher.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <TableCell className="font-mono text-xs">{teacher.teacher_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{teacher.full_name}</p>
                          {teacher.specialization && (
                            <p className="text-xs text-muted-foreground">{teacher.specialization}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {teacher.phone}
                        </div>
                      </TableCell>
                      <TableCell>{teacher.qualification || "-"}</TableCell>
                      <TableCell className="font-medium">
                        ৳{Number(teacher.monthly_salary).toLocaleString('bn-BD')}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[teacher.status] || statusColors.active}>
                          {statusLabels[teacher.status] || teacher.status}
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
                            <DropdownMenuItem className="gap-2">
                              <Eye className="w-4 h-4" /> বিস্তারিত দেখুন
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="w-4 h-4" /> এডিট করুন
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash2 className="w-4 h-4" /> মুছে ফেলুন
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        কোনো শিক্ষক পাওয়া যায়নি
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

function AddTeacherForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    qualification: "",
    specialization: "",
    monthlySalary: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      toast({ title: "নাম এবং ফোন নম্বর দিন", variant: "destructive" });
      return;
    }

    setLoading(true);
    const teacherId = `TCH-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const { error } = await supabase.from("teachers").insert({
      teacher_id: teacherId,
      full_name: formData.fullName,
      phone: formData.phone,
      qualification: formData.qualification || null,
      specialization: formData.specialization || null,
      monthly_salary: parseFloat(formData.monthlySalary) || 0,
      status: "active",
    });

    setLoading(false);
    if (error) {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: "শিক্ষক যোগ হয়েছে" });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>পুরো নাম *</Label>
          <Input
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="শিক্ষকের নাম"
          />
        </div>
        <div>
          <Label>ফোন নম্বর *</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="01XXXXXXXXX"
          />
        </div>
        <div>
          <Label>শিক্ষাগত যোগ্যতা</Label>
          <Input
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            placeholder="দাওরায়ে হাদীস, কামিল..."
          />
        </div>
        <div>
          <Label>বিশেষত্ব</Label>
          <Input
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            placeholder="কুরআন, হাদীস, ফিকহ..."
          />
        </div>
        <div className="col-span-2">
          <Label>মাসিক বেতন</Label>
          <Input
            type="number"
            value={formData.monthlySalary}
            onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
            placeholder="০"
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        শিক্ষক যোগ করুন
      </Button>
    </form>
  );
}
