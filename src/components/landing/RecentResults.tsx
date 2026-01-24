import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, ArrowRight, GraduationCap, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function RecentResults() {
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

  const { data: topPerformers } = useQuery({
    queryKey: ["public-top-performers"],
    queryFn: async () => {
      const { data: examsData } = await supabase
        .from("exams")
        .select("id, name")
        .eq("is_published", true)
        .order("end_date", { ascending: false })
        .limit(1);

      const latestExam = examsData?.[0];
      if (!latestExam) return { exam: null, performers: [] };

      const { data: results } = await supabase
        .from("exam_results")
        .select(`
          *,
          students(id, full_name, photo_url, class_id, classes(name, department))
        `)
        .eq("exam_id", latestExam.id)
        .order("obtained_marks", { ascending: false })
        .limit(10);

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

      const sorted = Object.values(studentTotals)
        .sort((a, b) => (b.totalObtained / b.totalFull) - (a.totalObtained / a.totalFull))
        .slice(0, 3);

      return { exam: latestExam, performers: sorted };
    },
  });

  const rankIcons = [Trophy, Medal, Award];
  const rankColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];
  const rankBgColors = [
    "bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950/40 dark:to-amber-900/40 border-yellow-300 dark:border-yellow-700",
    "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-800/40 border-slate-300 dark:border-slate-700",
    "bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/40 dark:to-amber-900/40 border-orange-300 dark:border-orange-700"
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
          >
            <GraduationCap className="w-4 h-4" />
            পরীক্ষার ফলাফল
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            সাম্প্রতিক ফলাফল
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
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
            className="mb-16"
          >
            <h3 className="text-xl font-bold text-center mb-8 text-foreground flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {topPerformers.exam?.name} - মেধাতালিকা
            </h3>
            <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-8">
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
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className={`relative ${isFirst ? 'md:-mt-8 order-first md:order-none' : ''}`}
                  >
                    <Card className={`text-center border-2 ${rankBgColors[rank]} ${isFirst ? 'shadow-2xl w-56 md:w-64' : 'shadow-lg w-48 md:w-56'}`}>
                      <CardContent className="pt-8 pb-6 px-4">
                        <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-background shadow-md border-2 ${isFirst ? 'border-yellow-400' : 'border-border'}`}>
                          <Icon className={`w-5 h-5 ${rankColors[rank]}`} />
                        </div>
                        
                        <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden border-4 ${isFirst ? 'border-yellow-400 ring-4 ring-yellow-200/50 dark:ring-yellow-800/50' : 'border-primary/20'} mb-4 shadow-md`}>
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

                        <p className="font-bold text-foreground mb-1 text-lg">
                          {performer.student.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {performer.student.classes?.name}
                        </p>
                        
                        <div className={`inline-block px-4 py-2 rounded-full ${isFirst ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' : 'bg-secondary text-secondary-foreground'}`}>
                          <span className="font-bold text-lg">{percentage}%</span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-3">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {recentExams.map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  viewport={{ once: true }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <Card className="border-2 border-border hover:border-primary/30 hover:shadow-lg transition-all h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground mb-2">{exam.name}</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">{exam.exam_type}</Badge>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(exam.end_date || '').toLocaleDateString('bn-BD')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Link to="/results">
            <Button size="lg" className="gap-2 px-8 shadow-lg hover:shadow-xl transition-all">
              সকল ফলাফল দেখুন
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
