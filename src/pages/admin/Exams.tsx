import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Plus, 
  FileText, 
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  ClipboardList,
  Eye,
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const examTypeLabels: Record<string, string> = {
  monthly: "মাসিক",
  quarterly: "ত্রৈমাসিক",
  half_yearly: "অর্ধবার্ষিক",
  annual: "বার্ষিক",
};

export default function ExamsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Publish exam mutation
  const publishMutation = useMutation({
    mutationFn: async (examId: string) => {
      const { error } = await supabase
        .from("exams")
        .update({ is_published: true })
        .eq("id", examId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast({ title: "সফল!", description: "ফলাফল প্রকাশিত হয়েছে" });
    },
    onError: (error: any) => {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    },
  });

  const upcomingExams = exams.filter(e => !e.is_published && new Date(e.start_date || "") >= new Date());
  const publishedExams = exams.filter(e => e.is_published);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">পরীক্ষা ও ফলাফল</h1>
            <p className="text-muted-foreground">পরীক্ষার সময়সূচী ও ফলাফল ব্যবস্থাপনা</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                নতুন পরীক্ষা যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন পরীক্ষা যোগ করুন</DialogTitle>
              </DialogHeader>
              <AddExamForm onSuccess={() => {
                setIsAddOpen(false);
                queryClient.invalidateQueries({ queryKey: ["exams"] });
              }} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{exams.length}</p>
                  <p className="text-sm text-muted-foreground">মোট পরীক্ষা</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingExams.length}</p>
                  <p className="text-sm text-muted-foreground">আসন্ন পরীক্ষা</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{publishedExams.length}</p>
                  <p className="text-sm text-muted-foreground">প্রকাশিত ফলাফল</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exams List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{exam.name}</CardTitle>
                      <Badge variant={exam.is_published ? "default" : "outline"}>
                        {exam.is_published ? "প্রকাশিত" : "অপ্রকাশিত"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {examTypeLabels[exam.exam_type] || exam.exam_type}
                      </Badge>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {exam.start_date ? new Date(exam.start_date).toLocaleDateString('bn-BD') : "তারিখ নির্ধারিত হয়নি"}
                        {exam.end_date && ` - ${new Date(exam.end_date).toLocaleDateString('bn-BD')}`}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-1"
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsResultOpen(true);
                          }}
                        >
                          <ClipboardList className="w-4 h-4" />
                          ফলাফল দিন
                        </Button>
                        {!exam.is_published && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => publishMutation.mutate(exam.id)}
                            disabled={publishMutation.isPending}
                          >
                            {publishMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "প্রকাশ"
                            )}
                          </Button>
                        )}
                        {exam.is_published && (
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="w-4 h-4" />
                            দেখুন
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {exams.length === 0 && (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                কোনো পরীক্ষা যোগ করা হয়নি
              </div>
            )}
          </div>
        )}

        {/* Result Entry Dialog */}
        <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                ফলাফল এন্ট্রি - {selectedExam?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedExam && (
              <ResultEntryForm 
                examId={selectedExam.id} 
                onSuccess={() => {
                  setIsResultOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["exams"] });
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function AddExamForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    examType: "monthly",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: "পরীক্ষার নাম দিন", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("exams").insert({
      name: formData.name,
      exam_type: formData.examType,
      start_date: formData.startDate || null,
      end_date: formData.endDate || null,
      is_published: false,
    });

    setLoading(false);
    if (error) {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: "পরীক্ষা যোগ হয়েছে" });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>পরীক্ষার নাম *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="প্রথম সাময়িক পরীক্ষা ২০২৫"
        />
      </div>
      <div>
        <Label>পরীক্ষার ধরন</Label>
        <Select value={formData.examType} onValueChange={(v) => setFormData({ ...formData, examType: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">মাসিক</SelectItem>
            <SelectItem value="quarterly">ত্রৈমাসিক</SelectItem>
            <SelectItem value="half_yearly">অর্ধবার্ষিক</SelectItem>
            <SelectItem value="annual">বার্ষিক</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>শুরুর তারিখ</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div>
          <Label>শেষের তারিখ</Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        পরীক্ষা যোগ করুন
      </Button>
    </form>
  );
}

function ResultEntryForm({ examId, onSuccess }: { examId: string; onSuccess: () => void }) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [results, setResults] = useState<Record<string, { obtained: string; full: string }>>({});
  const [loading, setLoading] = useState(false);

  const subjects = [
    "কুরআন মাজীদ",
    "তাজবীদ",
    "হিফজ",
    "আরবি",
    "বাংলা",
    "ইংরেজি",
    "গণিত",
    "ফিকহ",
    "হাদীস",
    "আকাইদ",
  ];

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ["classes-for-results"],
    queryFn: async () => {
      const { data } = await supabase
        .from("classes")
        .select("id, name, department")
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
  });

  // Fetch students for selected class
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students-for-results", selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      const { data } = await supabase
        .from("students")
        .select("id, student_id, full_name")
        .eq("class_id", selectedClass)
        .eq("status", "active")
        .order("full_name");
      return data || [];
    },
    enabled: !!selectedClass,
  });

  const handleSaveResults = async () => {
    if (!selectedSubject) {
      toast({ title: "বিষয় নির্বাচন করুন", variant: "destructive" });
      return;
    }

    const entries = Object.entries(results).filter(([_, v]) => v.obtained && v.full);
    if (entries.length === 0) {
      toast({ title: "অন্তত একজন ছাত্রের ফলাফল দিন", variant: "destructive" });
      return;
    }

    setLoading(true);

    const insertData = entries.map(([studentId, marks]) => ({
      exam_id: examId,
      student_id: studentId,
      subject: selectedSubject,
      obtained_marks: parseInt(marks.obtained),
      full_marks: parseInt(marks.full),
    }));

    const { error } = await supabase.from("exam_results").insert(insertData);

    setLoading(false);
    if (error) {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: `${entries.length} জন ছাত্রের ফলাফল সংরক্ষিত হয়েছে` });
      setResults({});
      setSelectedSubject("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>ক্লাস নির্বাচন করুন</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="ক্লাস বাছুন" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>বিষয় নির্বাচন করুন</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="বিষয় বাছুন" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(sub => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedClass && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">ছাত্রদের নম্বর এন্ট্রি করুন</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                এই ক্লাসে কোনো ছাত্র নেই
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>আইডি</TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead className="w-32">প্রাপ্ত নম্বর</TableHead>
                    <TableHead className="w-32">পূর্ণ নম্বর</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          placeholder="০"
                          value={results[student.id]?.obtained || ""}
                          onChange={(e) => setResults({
                            ...results,
                            [student.id]: {
                              ...results[student.id],
                              obtained: e.target.value,
                              full: results[student.id]?.full || "100",
                            },
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          placeholder="১০০"
                          value={results[student.id]?.full || ""}
                          onChange={(e) => setResults({
                            ...results,
                            [student.id]: {
                              ...results[student.id],
                              full: e.target.value,
                            },
                          })}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onSuccess}>
          বন্ধ করুন
        </Button>
        <Button onClick={handleSaveResults} disabled={loading || !selectedClass || !selectedSubject}>
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          ফলাফল সংরক্ষণ করুন
        </Button>
      </div>
    </div>
  );
}
