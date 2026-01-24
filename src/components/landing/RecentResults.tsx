import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, ArrowRight, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export function RecentResults() {
  // Fetch recent published exams
  const { data: recentExams } = useQuery({
    queryKey: ["public-recent-exams"],
    queryFn: async () => {
      const { data } = await supabase
        .from("exams")
        .select("*")
        .eq("is_published", true)
        .order("end_date", { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  // Fetch top performers from latest exam
  const { data: topPerformers } = useQuery({
    queryKey: ["public-top-performers"],
    queryFn: async () => {
      // Get the latest published exam
      const { data: latestExam } = await supabase
        .from("exams")
        .select("id, name")
        .eq("is_published", true)
        .order("end_date", { ascending: false })
        .limit(1)
        .single();

      if (!latestExam) return { exam: null, performers: [] };

      // Get results for this exam with student info
      const { data: results } = await supabase
        .from("exam_results")
        .select(`
          *,
          students(id, full_name, photo_url, class_id, classes(name, department))
        `)
        .eq("exam_id", latestExam.id)
        .order("obtained_marks", { ascending: false })
        .limit(10);

      // Group by student and calculate total
      const studentTotals: Record<string, { 
        student: any; 
        totalObtained: number; 
        totalFull: number;
        subjects: number;
      }> = {};

      results?.forEach(result => {
        if (!result.students) return;
        const studentId = result.students.id;
        if (!studentTotals[studentId]) {
          studentTotals[studentId] = {
            student: result.students,
            totalObtained: 0,
            totalFull: 0,
            subjects: 0,
          };
        }
        studentTotals[studentId].totalObtained += result.obtained_marks;
        studentTotals[studentId].totalFull += result.full_marks;
        studentTotals[studentId].subjects += 1;
      });

      // Sort by percentage and get top 3
      const sorted = Object.values(studentTotals)
        .sort((a, b) => (b.totalObtained / b.totalFull) - (a.totalObtained / a.totalFull))
        .slice(0, 3);

      return { exam: latestExam, performers: sorted };
    },
  });

  const rankIcons = [Trophy, Medal, Award];
  const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];
  const rankBgColors = ["bg-yellow-100 dark:bg-yellow-900/30", "bg-gray-100 dark:bg-gray-800", "bg-amber-100 dark:bg-amber-900/30"];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <GraduationCap className="w-4 h-4 inline-block mr-2" />
            পরীক্ষার ফলাফল
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            সাম্প্রতিক ফলাফল
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            আমাদের ছাত্রদের সাম্প্রতিক পরীক্ষার ফলাফল ও মেধাতালিকা
          </motion.p>
        </div>

        {/* Top Performers Section */}
        {topPerformers?.performers && topPerformers.performers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="text-xl font-semibold text-center mb-6 text-foreground">
              {topPerformers.exam?.name} - মেধাতালিকা
            </h3>
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8">
              {/* Rearrange to show 2nd, 1st, 3rd */}
              {[1, 0, 2].map((rank, displayIndex) => {
                const performer = topPerformers.performers[rank];
                if (!performer) return null;
                
                const Icon = rankIcons[rank];
                const percentage = Math.round((performer.totalObtained / performer.totalFull) * 100);
                const isFirst = rank === 0;

                return (
                  <motion.div
                    key={rank}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * displayIndex }}
                    viewport={{ once: true }}
                    className={`relative ${isFirst ? 'md:-mt-8' : ''}`}
                  >
                    <Card className={`text-center border-2 ${isFirst ? 'border-yellow-400 shadow-xl' : 'border-border'} ${rankBgColors[rank]} w-48 md:w-56`}>
                      <CardContent className="pt-6 pb-4">
                        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center ${rankBgColors[rank]} border-2 ${isFirst ? 'border-yellow-400' : 'border-border'}`}>
                          <Icon className={`w-5 h-5 ${rankColors[rank]}`} />
                        </div>
                        
                        <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden border-4 ${isFirst ? 'border-yellow-400' : 'border-primary/20'} mb-3 ${isFirst ? 'ring-4 ring-yellow-200 dark:ring-yellow-800' : ''}`}>
                          {performer.student.photo_url ? (
                            <img 
                              src={performer.student.photo_url}
                              alt={performer.student.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                              {performer.student.full_name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <p className="font-semibold text-foreground mb-1">
                          {performer.student.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {performer.student.classes?.name}
                        </p>
                        
                        <div className={`inline-block px-3 py-1 rounded-full ${isFirst ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' : 'bg-secondary text-secondary-foreground'}`}>
                          <span className="font-bold">{percentage}%</span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {performer.totalObtained}/{performer.totalFull} নম্বর
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Recent Exams List */}
        {recentExams && recentExams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {recentExams.map((exam, index) => (
                <Card key={exam.id} className="border-border hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      {exam.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{exam.exam_type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(exam.end_date || '').toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Link to="/results">
            <Button size="lg" className="gap-2">
              সকল ফলাফল দেখুন
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
