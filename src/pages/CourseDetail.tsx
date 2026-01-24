import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VideoPlayer } from "@/components/elearning/VideoPlayer";
import { LessonCard } from "@/components/elearning/LessonCard";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle2,
  GraduationCap,
  Award,
  ShoppingCart,
} from "lucide-react";

const difficultyLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: "প্রাথমিক", color: "bg-green-100 text-green-700" },
  intermediate: { label: "মধ্যম", color: "bg-yellow-100 text-yellow-700" },
  advanced: { label: "উচ্চতর", color: "bg-red-100 text-red-700" },
};

const departmentLabels: Record<string, string> = {
  hifz: "হিফজ বিভাগ",
  kitab: "কিতাব বিভাগ",
  nurani: "নূরানী বিভাগ",
  tajweed: "তাজবীদ বিভাগ",
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // Fetch course
  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          instructor:teachers(full_name, photo_url, qualification)
        `)
        .eq("id", courseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  // Fetch lessons
  const { data: lessons = [] } = useQuery({
    queryKey: ["course-lessons", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("online_classes")
        .select("*")
        .eq("course_id", courseId)
        .order("lesson_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">কোর্স পাওয়া যায়নি</h2>
          <Link to="/courses">
            <Button>কোর্স তালিকায় ফিরুন</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const difficulty = difficultyLabels[course.difficulty_level] || difficultyLabels.beginner;
  const hours = Math.floor(course.total_duration_minutes / 60);
  const minutes = course.total_duration_minutes % 60;
  const firstFreeLesson = lessons.find(l => l.is_free);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/courses" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span>কোর্স তালিকা</span>
            </Link>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              <span className="font-bold hidden sm:inline">ই-লার্নিং প্ল্যাটফর্ম</span>
            </div>
            <Link to="/login">
              <Button variant="secondary" size="sm">লগইন</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Player */}
            {selectedLesson ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <VideoPlayer
                  youtubeUrl={selectedLesson.youtube_url}
                  videoUrl={selectedLesson.recording_url}
                  title={selectedLesson.title}
                  thumbnail={selectedLesson.thumbnail_url}
                />
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedLesson.title}
                  </h2>
                  {selectedLesson.description && (
                    <p className="text-muted-foreground mt-2">
                      {selectedLesson.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : course.thumbnail_url ? (
              <div className="aspect-video rounded-xl overflow-hidden">
                <img 
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <GraduationCap className="w-20 h-20 text-primary/40" />
              </div>
            )}

            {/* Course Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={difficulty.color}>{difficulty.label}</Badge>
                {course.department && (
                  <Badge variant="secondary">
                    {departmentLabels[course.department]}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {course.title}
              </h1>

              {course.description && (
                <p className="text-muted-foreground mb-6">{course.description}</p>
              )}

              {/* Instructor */}
              {course.instructor && (
                <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary">
                    {course.instructor.photo_url ? (
                      <img 
                        src={course.instructor.photo_url}
                        alt={course.instructor.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                        {course.instructor.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {course.instructor.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {course.instructor.qualification || "শিক্ষক"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Lessons List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  কোর্সের লেসন ({lessons.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isLocked={!lesson.is_free}
                    onPlay={() => {
                      if (lesson.is_free) {
                        setSelectedLesson(lesson);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  />
                ))}

                {lessons.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    এই কোর্সে এখনো কোনো লেসন যোগ করা হয়নি
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enroll Card */}
            <Card className="sticky top-4 border-2 border-primary/20">
              <CardContent className="p-6">
                {/* Price */}
                <div className="text-center mb-6">
                  {course.is_free ? (
                    <div>
                      <span className="text-3xl font-bold text-green-600">ফ্রি</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        সম্পূর্ণ বিনামূল্যে শিখুন
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-foreground">
                        ৳{course.price?.toLocaleString('bn-BD')}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        এককালীন পেমেন্ট
                      </p>
                    </div>
                  )}
                </div>

                {/* Enroll Button */}
                <Button className="w-full mb-4 gap-2" size="lg">
                  <ShoppingCart className="w-5 h-5" />
                  {course.is_free ? 'ফ্রিতে এনরোল করুন' : 'এনরোল করুন'}
                </Button>

                {/* Preview Button */}
                {firstFreeLesson && (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => {
                      setSelectedLesson(firstFreeLesson);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <Play className="w-4 h-4" />
                    ফ্রি প্রিভিউ দেখুন
                  </Button>
                )}

                <Separator className="my-6" />

                {/* Course Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      মোট লেসন
                    </span>
                    <span className="font-semibold">{course.total_lessons}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      মোট সময়
                    </span>
                    <span className="font-semibold">
                      {hours > 0 ? `${hours} ঘণ্টা ${minutes} মি.` : `${minutes} মিনিট`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      এনরোলমেন্ট
                    </span>
                    <span className="font-semibold">{course.enrollment_count || 0}</span>
                  </div>

                  {course.rating > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Star className="w-4 h-4" />
                        রেটিং
                      </span>
                      <span className="font-semibold text-yellow-500">
                        {course.rating.toFixed(1)} / 5
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* What you'll get */}
                <div>
                  <h4 className="font-semibold mb-3">এই কোর্সে পাবেন:</h4>
                  <ul className="space-y-2">
                    {[
                      "সম্পূর্ণ ভিডিও কোর্স",
                      "আজীবন অ্যাক্সেস",
                      "মোবাইলে দেখার সুবিধা",
                      "সার্টিফিকেট",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
