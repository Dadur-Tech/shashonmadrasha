import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/elearning/VideoPlayer";
import { PublicHeader } from "@/components/shared/PublicHeader";
import {
  Clock,
  Calendar,
  BookOpen,
} from "lucide-react";

const departmentLabels: Record<string, string> = {
  hifz: "হিফজ বিভাগ",
  kitab: "কিতাব বিভাগ",
  nurani: "নূরানী বিভাগ",
  tajweed: "তাজবীদ বিভাগ",
};

export default function LessonDetailPage() {
  const { lessonId } = useParams();

  // Fetch lesson
  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("online_classes")
        .select(`
          *,
          teacher:teachers(full_name, photo_url, qualification),
          class:classes(name, department),
          course:courses(id, title)
        `)
        .eq("id", lessonId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });

  // Fetch related lessons
  const { data: relatedLessons = [] } = useQuery({
    queryKey: ["related-lessons", lesson?.class_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("online_classes")
        .select(`
          id, title, thumbnail_url, duration_minutes,
          teacher:teachers(full_name)
        `)
        .eq("class_id", lesson?.class_id)
        .neq("id", lessonId)
        .eq("status", "completed")
        .limit(4);

      if (error) throw error;
      return data;
    },
    enabled: !!lesson?.class_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">ক্লাস পাওয়া যায়নি</h2>
          <Link to="/courses">
            <Button>কোর্স তালিকায় ফিরুন</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <VideoPlayer
                youtubeUrl={lesson.youtube_url}
                videoUrl={lesson.recording_url}
                title={lesson.title}
                thumbnail={lesson.thumbnail_url}
              />
            </motion.div>

            {/* Lesson Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {lesson.is_free && (
                  <Badge className="bg-green-500 text-white">ফ্রি</Badge>
                )}
                {lesson.class?.department && (
                  <Badge variant="secondary">
                    {departmentLabels[lesson.class.department]}
                  </Badge>
                )}
                {lesson.class?.name && (
                  <Badge variant="outline">{lesson.class.name}</Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {lesson.title}
              </h1>

              {lesson.description && (
                <p className="text-muted-foreground mb-6">{lesson.description}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {lesson.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {lesson.duration_minutes} মিনিট
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(lesson.scheduled_at).toLocaleDateString('bn-BD', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Instructor */}
              {lesson.teacher && (
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary">
                        {lesson.teacher.photo_url ? (
                          <img 
                            src={lesson.teacher.photo_url}
                            alt={lesson.teacher.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                            {lesson.teacher.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">শিক্ষক</p>
                        <p className="font-bold text-foreground">
                          {lesson.teacher.full_name}
                        </p>
                        {lesson.teacher.qualification && (
                          <p className="text-sm text-muted-foreground">
                            {lesson.teacher.qualification}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Part of Course */}
              {lesson.course && (
                <Card className="mt-4 border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">এই ক্লাসটি যে কোর্সের অংশ:</p>
                    <Link 
                      to={`/course/${lesson.course.id}`}
                      className="font-bold text-primary hover:underline"
                    >
                      {lesson.course.title}
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - Related Lessons */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  সম্পর্কিত ক্লাস
                </h3>

                {relatedLessons.length > 0 ? (
                  <div className="space-y-3">
                    {relatedLessons.map((related: any) => (
                      <Link 
                        key={related.id} 
                        to={`/lesson/${related.id}`}
                        className="block"
                      >
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="flex gap-3">
                            <div className="w-24 h-16 bg-secondary shrink-0">
                              {related.thumbnail_url ? (
                                <img 
                                  src={related.thumbnail_url}
                                  alt={related.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="py-2 pr-2 flex-1 min-w-0">
                              <h4 className="text-sm font-semibold line-clamp-2">
                                {related.title}
                              </h4>
                              {related.duration_minutes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {related.duration_minutes} মিনিট
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    কোনো সম্পর্কিত ক্লাস নেই
                  </p>
                )}

                <Link to="/courses" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    সকল কোর্স দেখুন
                  </Button>
                </Link>
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
