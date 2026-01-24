import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Medal, Award, Search, GraduationCap, ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";

const departmentLabels: Record<string, string> = {
  hifz: "হিফজ বিভাগ",
  kitab: "কিতাব বিভাগ",
  nurani: "নূরানী বিভাগ",
  tajweed: "তাজবীদ বিভাগ",
};

export default function ResultsPage() {
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all published exams
  const { data: exams } = useQuery({
    queryKey: ["public-exams"],
    queryFn: async () => {
      const { data } = await supabase
        .from("exams")
        .select("*")
        .eq("is_published", true)
        .order("end_date", { ascending: false });
      return data || [];
    },
  });

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ["public-classes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("classes")
        .select("*")
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
  });

  // Fetch results for selected exam
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ["public-results", selectedExam, selectedClass],
    queryFn: async () => {
      if (!selectedExam) return [];

      // Step 1: Fetch exam results
      const { data: resultsData, error: resultsError } = await supabase
        .from("exam_results")
        .select("*")
        .eq("exam_id", selectedExam);

      if (resultsError) throw resultsError;
      if (!resultsData || resultsData.length === 0) return [];

      // Step 2: Get unique student IDs
      const studentIds = [...new Set(resultsData.map(r => r.student_id))];

      // Step 3: Fetch students using public view
      const { data: studentsData, error: studentsError } = await supabase
        .from("students_public")
        .select("id, student_id, full_name, photo_url, class_id")
        .in("id", studentIds);

      if (studentsError) throw studentsError;

      // Step 4: Fetch class info
      const classIds = [...new Set((studentsData || []).map(s => s.class_id).filter(Boolean))];
      let classMap = new Map<string, any>();
      
      if (classIds.length > 0) {
        const { data: classData } = await supabase
          .from("classes")
          .select("id, name, department")
          .in("id", classIds);
        
        classMap = new Map((classData || []).map(c => [c.id, c]));
      }

      // Step 5: Build student map with class info
      const studentMap = new Map((studentsData || []).map(s => [
        s.id, 
        { ...s, classes: classMap.get(s.class_id) || null }
      ]));

      // Step 6: Group by student
      const studentResults: Record<string, {
        student: any;
        subjects: { name: string; obtained: number; full: number; grade: string }[];
        totalObtained: number;
        totalFull: number;
      }> = {};

      resultsData.forEach(result => {
        const student = studentMap.get(result.student_id);
        if (!student) return;
        
        const studentId = student.id;
        
        if (!studentResults[studentId]) {
          studentResults[studentId] = {
            student: student,
            subjects: [],
            totalObtained: 0,
            totalFull: 0,
          };
        }
        
        studentResults[studentId].subjects.push({
          name: result.subject,
          obtained: result.obtained_marks,
          full: result.full_marks,
          grade: result.grade || '',
        });
        studentResults[studentId].totalObtained += result.obtained_marks;
        studentResults[studentId].totalFull += result.full_marks;
      });

      // Convert to array and sort by percentage
      let resultsArray = Object.values(studentResults)
        .sort((a, b) => (b.totalObtained / b.totalFull) - (a.totalObtained / a.totalFull));

      // Filter by class if selected
      if (selectedClass) {
        resultsArray = resultsArray.filter(r => r.student.class_id === selectedClass);
      }

      // Filter by search
      if (searchQuery) {
        resultsArray = resultsArray.filter(r => 
          r.student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.student.student_id.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return resultsArray;
    },
    enabled: !!selectedExam,
  });

  // Get top 3 performers
  const topPerformers = results?.slice(0, 3) || [];
  const rankIcons = [Trophy, Medal, Award];
  const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];
  const rankBgColors = ["bg-yellow-100 dark:bg-yellow-900/30", "bg-gray-100 dark:bg-gray-800", "bg-amber-100 dark:bg-amber-900/30"];

  const getGrade = (percentage: number): string => {
    if (percentage >= 80) return "A+";
    if (percentage >= 70) return "A";
    if (percentage >= 60) return "A-";
    if (percentage >= 50) return "B";
    if (percentage >= 40) return "C";
    if (percentage >= 33) return "D";
    return "F";
  };

  const selectedExamData = exams?.find(e => e.id === selectedExam);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span>হোমে ফিরুন</span>
            </Link>
            <h1 className="text-xl font-bold">পরীক্ষার ফলাফল</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা
          </h1>
          <p className="text-muted-foreground">পরীক্ষার ফলাফল দেখুন</p>
        </motion.div>

        {/* Filters */}
        <Card className="mb-8 border-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {exams?.map(exam => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name} ({exam.exam_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedClass} onValueChange={(val) => setSelectedClass(val === "all" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="সকল ক্লাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল ক্লাস</SelectItem>
                  {classes?.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({departmentLabels[cls.department] || cls.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ছাত্রের নাম বা আইডি দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedExam ? (
          <Card className="border-border">
            <CardContent className="py-16 text-center">
              <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                একটি পরীক্ষা নির্বাচন করুন
              </h3>
              <p className="text-muted-foreground">
                উপরের ড্রপডাউন থেকে পরীক্ষা নির্বাচন করে ফলাফল দেখুন
              </p>
            </CardContent>
          </Card>
        ) : resultsLoading ? (
          <Card className="border-border">
            <CardContent className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">ফলাফল লোড হচ্ছে...</p>
            </CardContent>
          </Card>
        ) : results && results.length > 0 ? (
          <>
            {/* Exam Info */}
            {selectedExamData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {selectedExamData.name}
                </h2>
                <div className="flex items-center justify-center gap-4 text-muted-foreground">
                  <Badge variant="secondary">{selectedExamData.exam_type}</Badge>
                  <span>|</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    মোট পরীক্ষার্থী: {results.length}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Top 3 Performers */}
            {topPerformers.length > 0 && !selectedClass && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <h3 className="text-xl font-semibold text-center mb-6 text-foreground">
                  🏆 মেধাতালিকা - শীর্ষ ৩
                </h3>
                <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8">
                  {[1, 0, 2].map((rank, displayIndex) => {
                    const performer = topPerformers[rank];
                    if (!performer) return null;
                    
                    const Icon = rankIcons[rank];
                    const percentage = Math.round((performer.totalObtained / performer.totalFull) * 100);
                    const isFirst = rank === 0;

                    return (
                      <motion.div
                        key={rank}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * displayIndex }}
                        className={`relative ${isFirst ? 'md:-mt-8' : ''}`}
                      >
                        <Card className={`text-center border-2 ${isFirst ? 'border-yellow-400 shadow-xl' : 'border-border'} ${rankBgColors[rank]} w-56 md:w-64`}>
                          <CardContent className="pt-8 pb-4">
                            <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center ${rankBgColors[rank]} border-2 ${isFirst ? 'border-yellow-400' : 'border-border'}`}>
                              <Icon className={`w-6 h-6 ${rankColors[rank]}`} />
                            </div>
                            
                            <div className={`w-24 h-24 mx-auto rounded-full overflow-hidden border-4 ${isFirst ? 'border-yellow-400' : 'border-primary/20'} mb-3 ${isFirst ? 'ring-4 ring-yellow-200 dark:ring-yellow-800' : ''}`}>
                              {performer.student.photo_url ? (
                                <img 
                                  src={performer.student.photo_url}
                                  alt={performer.student.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-3xl font-bold">
                                  {performer.student.full_name.charAt(0)}
                                </div>
                              )}
                            </div>

                            <Badge className="mb-2">{rank + 1} নম্বর</Badge>
                            <p className="font-semibold text-foreground text-lg mb-1">
                              {performer.student.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground mb-3">
                              {performer.student.classes?.name}
                            </p>
                            
                            <div className={`inline-block px-4 py-2 rounded-full ${isFirst ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' : 'bg-secondary text-secondary-foreground'}`}>
                              <span className="text-2xl font-bold">{percentage}%</span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-2">
                              {performer.totalObtained}/{performer.totalFull} নম্বর
                            </p>
                            <Badge variant="outline" className="mt-2">
                              গ্রেড: {getGrade(percentage)}
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Full Results Table */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  সম্পূর্ণ ফলাফল তালিকা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">ক্রম</TableHead>
                        <TableHead>ছাত্রের নাম</TableHead>
                        <TableHead>আইডি</TableHead>
                        <TableHead>ক্লাস</TableHead>
                        <TableHead>বিভাগ</TableHead>
                        <TableHead className="text-center">প্রাপ্ত নম্বর</TableHead>
                        <TableHead className="text-center">পূর্ণ নম্বর</TableHead>
                        <TableHead className="text-center">শতাংশ</TableHead>
                        <TableHead className="text-center">গ্রেড</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result, index) => {
                        const percentage = Math.round((result.totalObtained / result.totalFull) * 100);
                        const grade = getGrade(percentage);
                        const isTop3 = index < 3;

                        return (
                          <TableRow key={result.student.id} className={isTop3 ? 'bg-primary/5' : ''}>
                            <TableCell className="font-medium">
                              {isTop3 ? (
                                <div className="flex items-center gap-1">
                                  {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                                  {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                                  {index === 2 && <Award className="w-4 h-4 text-amber-600" />}
                                  {(index + 1).toLocaleString('bn-BD')}
                                </div>
                              ) : (
                                (index + 1).toLocaleString('bn-BD')
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary shrink-0">
                                  {result.student.photo_url ? (
                                    <img 
                                      src={result.student.photo_url}
                                      alt={result.student.full_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                                      {result.student.full_name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <span className="font-medium">{result.student.full_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{result.student.student_id}</TableCell>
                            <TableCell>{result.student.classes?.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {departmentLabels[result.student.classes?.department] || result.student.classes?.department}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {result.totalObtained.toLocaleString('bn-BD')}
                            </TableCell>
                            <TableCell className="text-center">
                              {result.totalFull.toLocaleString('bn-BD')}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={percentage >= 60 ? "default" : percentage >= 33 ? "secondary" : "destructive"}>
                                {percentage}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={grade === 'A+' ? "default" : "outline"}>
                                {grade}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-border">
            <CardContent className="py-16 text-center">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                কোনো ফলাফল পাওয়া যায়নি
              </h3>
              <p className="text-muted-foreground">
                এই পরীক্ষার জন্য এখনো কোনো ফলাফল প্রকাশ করা হয়নি
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-secondary/50 border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
}
