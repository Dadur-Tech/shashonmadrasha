import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseCard } from "@/components/elearning/CourseCard";
import { 
  Search, 
  GraduationCap, 
  BookOpen, 
  Filter,
  ArrowLeft,
  Sparkles,
  Video,
  Users,
  Award,
} from "lucide-react";

const departmentLabels: Record<string, string> = {
  all: "সকল বিভাগ",
  hifz: "হিফজ বিভাগ",
  kitab: "কিতাব বিভাগ",
  nurani: "নূরানী বিভাগ",
  tajweed: "তাজবীদ বিভাগ",
};

const difficultyLabels: Record<string, string> = {
  all: "সকল লেভেল",
  beginner: "প্রাথমিক",
  intermediate: "মধ্যম",
  advanced: "উচ্চতর",
};

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  // Fetch courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          instructor:teachers(full_name, photo_url)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch standalone lessons (not part of any course)
  const { data: standaloneLessons = [] } = useQuery({
    queryKey: ["public-standalone-lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("online_classes")
        .select(`
          *,
          teacher:teachers(full_name, photo_url),
          class:classes(name, department)
        `)
        .is("course_id", null)
        .eq("status", "completed")
        .not("recording_url", "is", null)
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Stats
  const { data: stats } = useQuery({
    queryKey: ["elearning-stats"],
    queryFn: async () => {
      const { count: coursesCount } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true);

      const { count: lessonsCount } = await supabase
        .from("online_classes")
        .select("*", { count: "exact", head: true });

      const { count: enrollmentsCount } = await supabase
        .from("course_enrollments")
        .select("*", { count: "exact", head: true });

      return {
        courses: coursesCount || 0,
        lessons: lessonsCount || 0,
        enrollments: enrollmentsCount || 0,
      };
    },
  });

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || course.department === selectedDepartment;
    const matchesDifficulty = selectedDifficulty === "all" || course.difficulty_level === selectedDifficulty;
    const matchesPrice = priceFilter === "all" || 
      (priceFilter === "free" && course.is_free) || 
      (priceFilter === "paid" && !course.is_free);

    return matchesSearch && matchesDepartment && matchesDifficulty && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span>হোমে ফিরুন</span>
            </Link>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              <span className="font-bold">ই-লার্নিং প্ল্যাটফর্ম</span>
            </div>
            <Link to="/login">
              <Button variant="secondary" size="sm">
                লগইন
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            প্রফেশনাল ই-লার্নিং
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            অনলাইন কোর্স ও ক্লাস
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            বিশ্বমানের ইসলামী শিক্ষা এখন আপনার হাতের মুঠোয়। 
            আমাদের কোর্স ও ক্লাসে এনরোল করুন এবং শিখুন যেকোনো সময়, যেকোনো জায়গা থেকে।
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12"
        >
          {[
            { label: "কোর্স", value: stats?.courses || 0, icon: BookOpen, color: "text-blue-600" },
            { label: "লেসন", value: stats?.lessons || 0, icon: Video, color: "text-purple-600" },
            { label: "শিক্ষার্থী", value: stats?.enrollments || 0, icon: Users, color: "text-green-600" },
          ].map((stat, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Filters */}
        <Card className="mb-8 border-border/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="কোর্স খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Department */}
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="বিভাগ" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(departmentLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty */}
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="লেভেল" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(difficultyLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price */}
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="মূল্য" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল</SelectItem>
                  <SelectItem value="free">ফ্রি</SelectItem>
                  <SelectItem value="paid">পেইড</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Tabs defaultValue="courses" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              কোর্স ({filteredCourses.length})
            </TabsTrigger>
            <TabsTrigger value="lessons" className="gap-2">
              <Video className="w-4 h-4" />
              ক্লাস ({standaloneLessons.length})
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-secondary" />
                    <CardContent className="p-4 space-y-3">
                      <div className="h-4 bg-secondary rounded w-3/4" />
                      <div className="h-3 bg-secondary rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <CourseCard course={course} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="py-16 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    কোনো কোর্স পাওয়া যায়নি
                  </h3>
                  <p className="text-muted-foreground">
                    শীঘ্রই নতুন কোর্স যোগ করা হবে।
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Standalone Lessons Tab */}
          <TabsContent value="lessons">
            {standaloneLessons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standaloneLessons.map((lesson: any) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Link to={`/lesson/${lesson.id}`}>
                      <Card className="h-full overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
                          {lesson.thumbnail_url ? (
                            <img 
                              src={lesson.thumbnail_url}
                              alt={lesson.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-12 h-12 text-primary/40" />
                            </div>
                          )}
                          
                          {lesson.is_free && (
                            <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                              ফ্রি
                            </Badge>
                          )}

                          {lesson.duration_minutes && (
                            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                              {lesson.duration_minutes} মি.
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {lesson.title}
                          </h3>
                          
                          {lesson.teacher && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {lesson.teacher.full_name}
                            </p>
                          )}

                          {lesson.class?.department && (
                            <Badge variant="secondary">
                              {departmentLabels[lesson.class.department] || lesson.class.department}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="py-16 text-center">
                  <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    কোনো ক্লাস পাওয়া যায়নি
                  </h3>
                  <p className="text-muted-foreground">
                    শীঘ্রই নতুন ক্লাস যোগ করা হবে।
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা
        </div>
      </footer>
    </div>
  );
}
