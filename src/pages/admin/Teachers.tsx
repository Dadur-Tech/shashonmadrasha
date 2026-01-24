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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  GraduationCap,
  Phone,
  Loader2,
  Users,
  Banknote,
  Settings,
  User,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { StatCard } from "@/components/ui/stat-card";
import { PhotoUpload } from "@/components/shared/PhotoUpload";

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
  const [isTitleManageOpen, setIsTitleManageOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select(`
          *,
          title:teacher_titles(id, name, name_arabic)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: titles = [] } = useQuery({
    queryKey: ["teacher-titles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_titles")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const { error } = await supabase.from("teachers").delete().eq("id", teacherId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast({ title: "সফল!", description: "শিক্ষক মুছে ফেলা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
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
          <div className="flex gap-2">
            <Dialog open={isTitleManageOpen} onOpenChange={setIsTitleManageOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  বিশেষত্ব/টাইটেল
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>শিক্ষক বিশেষত্ব পরিচালনা</DialogTitle>
                </DialogHeader>
                <TitleManager onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["teacher-titles"] });
                }} />
              </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  নতুন শিক্ষক যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>নতুন শিক্ষক যোগ করুন</DialogTitle>
                </DialogHeader>
                <TeacherForm 
                  titles={titles}
                  onSuccess={() => {
                    setIsAddOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["teachers"] });
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingTeacher} onOpenChange={(open) => !open && setEditingTeacher(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>শিক্ষক সম্পাদনা করুন</DialogTitle>
            </DialogHeader>
            {editingTeacher && (
              <TeacherForm 
                initialData={editingTeacher}
                titles={titles}
                onSuccess={() => {
                  setEditingTeacher(null);
                  queryClient.invalidateQueries({ queryKey: ["teachers"] });
                }} 
              />
            )}
          </DialogContent>
        </Dialog>

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
                    <TableHead>ছবি</TableHead>
                    <TableHead>আইডি</TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead>বিশেষত্ব</TableHead>
                    <TableHead>ফোন</TableHead>
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
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={teacher.photo_url || undefined} />
                          <AvatarFallback>
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{teacher.teacher_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{teacher.full_name}</p>
                          {teacher.qualification && (
                            <p className="text-xs text-muted-foreground">{teacher.qualification}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {teacher.title ? (
                          <Badge variant="secondary" className="font-semibold">
                            {teacher.title.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {teacher.phone}
                        </div>
                      </TableCell>
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
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => setEditingTeacher(teacher)}
                            >
                              <Edit className="w-4 h-4" /> এডিট করুন
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => {
                                if (confirm("আপনি কি এই শিক্ষক মুছে ফেলতে চান?")) {
                                  deleteMutation.mutate(teacher.id);
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
                  {filteredTeachers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
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

function TeacherForm({ onSuccess, initialData, titles }: { onSuccess: () => void; initialData?: any; titles: any[] }) {
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialData?.photo_url || null);
  const [formData, setFormData] = useState({
    fullName: initialData?.full_name || "",
    phone: initialData?.phone || "",
    qualification: initialData?.qualification || "",
    specialization: initialData?.specialization || "",
    titleId: initialData?.title_id || "",
    monthlySalary: initialData?.monthly_salary?.toString() || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      toast({ title: "নাম এবং ফোন নম্বর দিন", variant: "destructive" });
      return;
    }

    setLoading(true);

    const teacherData = {
      full_name: formData.fullName,
      phone: formData.phone,
      qualification: formData.qualification || null,
      specialization: formData.specialization || null,
      title_id: formData.titleId || null,
      monthly_salary: parseFloat(formData.monthlySalary) || 0,
      photo_url: photoUrl,
    };

    let error;
    if (initialData?.id) {
      const result = await supabase.from("teachers").update(teacherData).eq("id", initialData.id);
      error = result.error;
    } else {
      const teacherId = `TCH-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const result = await supabase.from("teachers").insert({
        ...teacherData,
        teacher_id: teacherId,
        status: "active",
      });
      error = result.error;
    }

    setLoading(false);
    if (error) {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: initialData ? "শিক্ষক আপডেট হয়েছে" : "শিক্ষক যোগ হয়েছে" });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload */}
      <div className="flex justify-center pb-4 border-b">
        <PhotoUpload
          currentPhotoUrl={photoUrl}
          onPhotoChange={setPhotoUrl}
          folder="teachers"
          entityId={initialData?.id}
          size="lg"
        />
      </div>

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
          <Label>বিশেষত্ব/হাইলাইট</Label>
          <Select 
            value={formData.titleId || "none"} 
            onValueChange={(v) => setFormData({ ...formData, titleId: v === "none" ? "" : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">কোনোটি নয়</SelectItem>
              {titles.map((title) => (
                <SelectItem key={title.id} value={title.id}>
                  {title.name} {title.name_arabic && `(${title.name_arabic})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>বিষয়/এক্সপার্টিজ</Label>
          <Input
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            placeholder="কুরআন, হাদীস, ফিকহ..."
          />
        </div>
        <div>
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
        {initialData ? "আপডেট করুন" : "শিক্ষক যোগ করুন"}
      </Button>
    </form>
  );
}

function TitleManager({ onSuccess }: { onSuccess: () => void }) {
  const [newTitle, setNewTitle] = useState({ name: "", nameArabic: "" });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: titles = [], isLoading } = useQuery({
    queryKey: ["all-teacher-titles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_titles")
        .select("*")
        .order("display_order");
      
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!newTitle.name) {
        throw new Error("টাইটেল নাম দিন");
      }
      const { error } = await supabase.from("teacher_titles").insert({
        name: newTitle.name,
        name_arabic: newTitle.nameArabic || null,
        display_order: titles.length + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewTitle({ name: "", nameArabic: "" });
      queryClient.invalidateQueries({ queryKey: ["all-teacher-titles"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-titles"] });
      toast({ title: "টাইটেল যোগ হয়েছে" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: "সমস্যা", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (titleId: string) => {
      const { error } = await supabase.from("teacher_titles").delete().eq("id", titleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-teacher-titles"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-titles"] });
      toast({ title: "টাইটেল মুছে ফেলা হয়েছে" });
      onSuccess();
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="টাইটেল (বাংলা)"
          value={newTitle.name}
          onChange={(e) => setNewTitle({ ...newTitle, name: e.target.value })}
        />
        <Input
          placeholder="টাইটেল (আরবী)"
          value={newTitle.nameArabic}
          onChange={(e) => setNewTitle({ ...newTitle, nameArabic: e.target.value })}
          dir="rtl"
        />
      </div>
      <Button 
        onClick={() => addMutation.mutate()} 
        disabled={addMutation.isPending}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        নতুন টাইটেল যোগ করুন
      </Button>

      <div className="border-t pt-4 mt-4">
        <h4 className="font-semibold mb-3">বিদ্যমান টাইটেল সমূহ</h4>
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        ) : (
          <div className="space-y-2">
            {titles.map((title) => (
              <div key={title.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{title.name}</p>
                  {title.name_arabic && (
                    <p className="text-sm text-muted-foreground" dir="rtl">{title.name_arabic}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-8 w-8"
                  onClick={() => {
                    if (confirm("মুছে ফেলতে চান?")) {
                      deleteMutation.mutate(title.id);
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
