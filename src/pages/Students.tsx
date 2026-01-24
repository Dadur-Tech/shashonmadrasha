import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  ArrowLeft, 
  Users, 
  GraduationCap,
  BookOpen,
  Phone,
  QrCode
} from "lucide-react";

const departmentLabels: Record<string, string> = {
  hifz: "হিফজ বিভাগ",
  kitab: "কিতাব বিভাগ",
  nurani: "নূরানী বিভাগ",
  tajweed: "তাজবীদ বিভাগ",
  nazera: "নাযেরা বিভাগ",
};

const statusLabels: Record<string, string> = {
  active: "সক্রিয়",
  lillah: "লিল্লাহ",
  inactive: "নিষ্ক্রিয়",
  graduated: "পাস",
  transferred: "বদলি",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  lillah: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  inactive: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  graduated: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  transferred: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");

  // Fetch students
  const { data: students, isLoading } = useQuery({
    queryKey: ["public-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          student_id,
          full_name,
          photo_url,
          status,
          is_lillah,
          guardian_phone,
          class_id,
          classes(id, name, department)
        `)
        .eq("status", "active")
        .order("full_name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch classes for filter
  const { data: classes } = useQuery({
    queryKey: ["public-classes-filter"],
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

  // Filter students
  const filteredStudents = students?.filter(student => {
    const matchesSearch = 
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartment === "all" || 
      student.classes?.department === selectedDepartment;
    
    const matchesClass = selectedClass === "all" || 
      student.class_id === selectedClass;
    
    return matchesSearch && matchesDepartment && matchesClass;
  }) || [];

  // Get unique departments
  const departments = [...new Set(classes?.map(c => c.department) || [])];

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
            <h1 className="text-xl font-bold">ছাত্র তালিকা</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            আমাদের ছাত্র সমূহ
          </h1>
          <p className="text-muted-foreground">
            ছাত্রের নামে ক্লিক করলে সম্পূর্ণ প্রোফাইল ও QR কোড দেখতে পাবেন
          </p>
        </motion.div>

        {/* Filters */}
        <Card className="mb-8 border-border">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ছাত্রের নাম বা আইডি দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="বিভাগ নির্বাচন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল বিভাগ</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {departmentLabels[dept] || dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="ক্লাস নির্বাচন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল ক্লাস</SelectItem>
                  {classes?.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {filteredStudents.length.toLocaleString('bn-BD')}
              </p>
              <p className="text-sm text-muted-foreground">মোট ছাত্র</p>
            </CardContent>
          </Card>
          {departments.slice(0, 3).map(dept => {
            const count = filteredStudents.filter(s => s.classes?.department === dept).length;
            return (
              <Card key={dept} className="border-border">
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {count.toLocaleString('bn-BD')}
                  </p>
                  <p className="text-sm text-muted-foreground">{departmentLabels[dept] || dept}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Students Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index * 0.02, 0.5) }}
              >
                <Link to={`/student/${student.student_id}`}>
                  <Card className="border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                    <CardContent className="p-4 text-center">
                      {/* Photo */}
                      <div className="relative mx-auto w-20 h-20 md:w-24 md:h-24 mb-3">
                        <div className="w-full h-full rounded-full overflow-hidden border-3 border-primary/20 group-hover:border-primary/50 transition-colors shadow-md">
                          {student.photo_url ? (
                            <img 
                              src={student.photo_url}
                              alt={student.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                              {student.full_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        {student.is_lillah && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-md">
                            <span className="text-white text-xs">❤</span>
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="font-semibold text-foreground text-sm md:text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {student.full_name}
                      </h3>

                      {/* Student ID */}
                      <p className="text-xs text-muted-foreground mb-2 font-mono">
                        {student.student_id}
                      </p>

                      {/* Class & Department */}
                      {student.classes && (
                        <div className="space-y-1">
                          <Badge variant="secondary" className="text-xs">
                            {student.classes.name}
                          </Badge>
                        </div>
                      )}

                      {/* View Profile Indicator */}
                      <div className="mt-3 flex items-center justify-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <QrCode className="w-3 h-3" />
                        <span>প্রোফাইল দেখুন</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                কোনো ছাত্র পাওয়া যায়নি
              </h3>
              <p className="text-muted-foreground">
                অন্য ফিল্টার দিয়ে চেষ্টা করুন
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </footer>
    </div>
  );
}
