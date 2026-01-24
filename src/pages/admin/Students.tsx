import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Loader2,
  Phone,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { StatCard } from "@/components/ui/stat-card";
import { Users, Heart, AlertCircle, GraduationCap } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  lillah: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  inactive: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  graduated: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  transferred: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const statusLabels: Record<string, string> = {
  active: "সক্রিয়",
  lillah: "লিল্লাহ",
  inactive: "নিষ্ক্রিয়",
  graduated: "পাস",
  transferred: "বদলি",
};

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          class:classes(name, department)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["classes-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, department")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", studentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({ title: "সফল!", description: "ছাত্র মুছে ফেলা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    },
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.guardian_phone.includes(searchTerm);
    
    const matchesDepartment = selectedDepartment === "all" || 
      student.class?.department === selectedDepartment;
    
    const matchesStatus = selectedStatus === "all" || student.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === "active").length;
  const lillahStudents = students.filter(s => s.is_lillah || s.status === "lillah").length;
  const pendingFees = students.filter(s => s.status === "active" && !s.is_lillah).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ছাত্র ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground">সকল ছাত্রের তথ্য দেখুন ও পরিচালনা করুন</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                নতুন ছাত্র যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>নতুন ছাত্র ভর্তি করুন</DialogTitle>
              </DialogHeader>
              <AddStudentForm 
                classes={classes}
                onSuccess={() => {
                  setIsAddOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["students"] });
                }} 
              />
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>ছাত্র সম্পাদনা করুন</DialogTitle>
              </DialogHeader>
              {editingStudent && (
                <EditStudentForm 
                  student={editingStudent}
                  classes={classes}
                  onSuccess={() => {
                    setEditingStudent(null);
                    queryClient.invalidateQueries({ queryKey: ["students"] });
                  }} 
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="মোট ছাত্র"
            value={totalStudents.toString()}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="সক্রিয় ছাত্র"
            value={activeStudents.toString()}
            icon={<GraduationCap className="w-5 h-5" />}
          />
          <StatCard
            title="লিল্লাহ ছাত্র"
            value={lillahStudents.toString()}
            icon={<Heart className="w-5 h-5" />}
          />
          <StatCard
            title="ফি প্রযোজ্য"
            value={pendingFees.toString()}
            icon={<AlertCircle className="w-5 h-5" />}
          />
        </div>

        {/* Filters & Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="ছাত্রের নাম, আইডি বা ফোন নম্বর দিয়ে খুঁজুন..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="বিভাগ নির্বাচন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল বিভাগ</SelectItem>
                  <SelectItem value="hifz">হিফজ বিভাগ</SelectItem>
                  <SelectItem value="kitab">কিতাব বিভাগ</SelectItem>
                  <SelectItem value="nazera">নাযেরা বিভাগ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="স্ট্যাটাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল স্ট্যাটাস</SelectItem>
                  <SelectItem value="active">সক্রিয়</SelectItem>
                  <SelectItem value="lillah">লিল্লাহ</SelectItem>
                  <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                এক্সপোর্ট
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
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
                    <TableHead>ছাত্রের নাম</TableHead>
                    <TableHead>অভিভাবক</TableHead>
                    <TableHead>ক্লাস/বিভাগ</TableHead>
                    <TableHead>ফোন</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <TableCell className="font-mono text-xs">{student.student_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary text-sm font-medium">
                              {student.full_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            {student.full_name_arabic && (
                              <p className="text-xs text-muted-foreground" dir="rtl">
                                {student.full_name_arabic}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{student.father_name}</p>
                          <p className="text-xs text-muted-foreground">{student.guardian_name || "পিতা"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{student.class?.name || "-"}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {student.class?.department || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {student.guardian_phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[student.status] || statusColors.active}>
                          {statusLabels[student.status] || student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => setEditingStudent(student)}
                            >
                              <Edit className="w-4 h-4" /> সম্পাদনা
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => {
                                if (confirm("আপনি কি এই ছাত্র মুছে ফেলতে চান?")) {
                                  deleteMutation.mutate(student.id);
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
                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        কোনো ছাত্র পাওয়া যায়নি
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

function AddStudentForm({ classes, onSuccess }: { classes: any[]; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    fullNameArabic: "",
    fatherName: "",
    motherName: "",
    guardianPhone: "",
    classId: "",
    dateOfBirth: "",
    village: "",
    postOffice: "",
    upazila: "",
    district: "",
    isLillah: false,
    lillahReason: "",
    previousInstitution: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.fatherName || !formData.guardianPhone) {
      toast({ title: "প্রয়োজনীয় তথ্য দিন", description: "নাম, পিতার নাম এবং ফোন নম্বর আবশ্যক", variant: "destructive" });
      return;
    }

    setLoading(true);
    const studentId = `STD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const { error } = await supabase.from("students").insert({
      student_id: studentId,
      full_name: formData.fullName,
      full_name_arabic: formData.fullNameArabic || null,
      father_name: formData.fatherName,
      mother_name: formData.motherName || null,
      guardian_phone: formData.guardianPhone,
      class_id: formData.classId || null,
      date_of_birth: formData.dateOfBirth || null,
      village: formData.village || null,
      post_office: formData.postOffice || null,
      upazila: formData.upazila || null,
      district: formData.district || null,
      is_lillah: formData.isLillah,
      lillah_reason: formData.lillahReason || null,
      previous_institution: formData.previousInstitution || null,
      notes: formData.notes || null,
      status: formData.isLillah ? "lillah" : "active",
    });

    setLoading(false);
    if (error) {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: "ছাত্র ভর্তি হয়েছে" });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>ছাত্রের নাম (বাংলা) *</Label>
          <Input
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="মুহাম্মদ আহমদ"
          />
        </div>
        <div>
          <Label>ছাত্রের নাম (আরবী)</Label>
          <Input
            value={formData.fullNameArabic}
            onChange={(e) => setFormData({ ...formData, fullNameArabic: e.target.value })}
            placeholder="محمد أحمد"
            dir="rtl"
          />
        </div>
        <div>
          <Label>পিতার নাম *</Label>
          <Input
            value={formData.fatherName}
            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
            placeholder="মো. করিম উদ্দিন"
          />
        </div>
        <div>
          <Label>মাতার নাম</Label>
          <Input
            value={formData.motherName}
            onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
            placeholder="ফাতেমা খাতুন"
          />
        </div>
        <div>
          <Label>অভিভাবকের ফোন *</Label>
          <Input
            value={formData.guardianPhone}
            onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
            placeholder="01XXXXXXXXX"
          />
        </div>
        <div>
          <Label>জন্ম তারিখ</Label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
        </div>
        <div>
          <Label>ক্লাস নির্বাচন</Label>
          <Select value={formData.classId} onValueChange={(v) => setFormData({ ...formData, classId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="ক্লাস নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} ({cls.department})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>পূর্ববর্তী প্রতিষ্ঠান</Label>
          <Input
            value={formData.previousInstitution}
            onChange={(e) => setFormData({ ...formData, previousInstitution: e.target.value })}
            placeholder="মক্তব/মাদরাসার নাম"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label>গ্রাম</Label>
          <Input
            value={formData.village}
            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
            placeholder="গ্রামের নাম"
          />
        </div>
        <div>
          <Label>ডাকঘর</Label>
          <Input
            value={formData.postOffice}
            onChange={(e) => setFormData({ ...formData, postOffice: e.target.value })}
            placeholder="ডাকঘর"
          />
        </div>
        <div>
          <Label>উপজেলা</Label>
          <Input
            value={formData.upazila}
            onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
            placeholder="উপজেলা"
          />
        </div>
        <div>
          <Label>জেলা</Label>
          <Input
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            placeholder="জেলা"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
        <input
          type="checkbox"
          id="isLillah"
          checked={formData.isLillah}
          onChange={(e) => setFormData({ ...formData, isLillah: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="isLillah" className="cursor-pointer">
          লিল্লাহ ছাত্র (ফি মওকুফ)
        </Label>
      </div>

      {formData.isLillah && (
        <div>
          <Label>লিল্লাহর কারণ</Label>
          <Textarea
            value={formData.lillahReason}
            onChange={(e) => setFormData({ ...formData, lillahReason: e.target.value })}
            placeholder="এতিম / গরীব / অন্যান্য কারণ..."
            rows={2}
          />
        </div>
      )}

      <div>
        <Label>বিশেষ নোট</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="অতিরিক্ত তথ্য..."
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        ছাত্র ভর্তি করুন
      </Button>
    </form>
  );
}

function EditStudentForm({ student, classes, onSuccess }: { student: any; classes: any[]; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: student.full_name || "",
    fullNameArabic: student.full_name_arabic || "",
    fatherName: student.father_name || "",
    motherName: student.mother_name || "",
    guardianPhone: student.guardian_phone || "",
    classId: student.class_id || "",
    dateOfBirth: student.date_of_birth || "",
    village: student.village || "",
    postOffice: student.post_office || "",
    upazila: student.upazila || "",
    district: student.district || "",
    isLillah: student.is_lillah || false,
    lillahReason: student.lillah_reason || "",
    notes: student.notes || "",
    status: student.status || "active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.fatherName || !formData.guardianPhone) {
      toast({ title: "প্রয়োজনীয় তথ্য দিন", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("students").update({
      full_name: formData.fullName,
      full_name_arabic: formData.fullNameArabic || null,
      father_name: formData.fatherName,
      mother_name: formData.motherName || null,
      guardian_phone: formData.guardianPhone,
      class_id: formData.classId || null,
      date_of_birth: formData.dateOfBirth || null,
      village: formData.village || null,
      post_office: formData.postOffice || null,
      upazila: formData.upazila || null,
      district: formData.district || null,
      is_lillah: formData.isLillah,
      lillah_reason: formData.lillahReason || null,
      notes: formData.notes || null,
      status: formData.isLillah ? "lillah" : formData.status,
    }).eq("id", student.id);

    setLoading(false);
    if (error) {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: "ছাত্রের তথ্য আপডেট হয়েছে" });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>ছাত্রের নাম (বাংলা) *</Label>
          <Input
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>
        <div>
          <Label>পিতার নাম *</Label>
          <Input
            value={formData.fatherName}
            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
          />
        </div>
        <div>
          <Label>ফোন নম্বর *</Label>
          <Input
            value={formData.guardianPhone}
            onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
          />
        </div>
        <div>
          <Label>ক্লাস</Label>
          <Select value={formData.classId} onValueChange={(v) => setFormData({ ...formData, classId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="ক্লাস নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>স্ট্যাটাস</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">সক্রিয়</SelectItem>
              <SelectItem value="lillah">লিল্লাহ</SelectItem>
              <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
              <SelectItem value="graduated">পাস</SelectItem>
              <SelectItem value="transferred">বদলি</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>জন্ম তারিখ</Label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
        <input
          type="checkbox"
          id="editIsLillah"
          checked={formData.isLillah}
          onChange={(e) => setFormData({ ...formData, isLillah: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="editIsLillah" className="cursor-pointer">
          লিল্লাহ ছাত্র (ফি মওকুফ)
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        আপডেট করুন
      </Button>
    </form>
  );
}
