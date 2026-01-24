import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Users, Baby, Home, ArrowRight, Sparkles } from "lucide-react";

export function LillahBoardingSection() {
  // Fetch lillah students
  const { data: lillahStudents = [], isLoading } = useQuery({
    queryKey: ["public-lillah-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          student_id,
          full_name,
          photo_url,
          is_orphan,
          lillah_reason,
          classes(name, department)
        `)
        .eq("is_lillah", true)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(7);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["lillah-stats-public"],
    queryFn: async () => {
      const { data: allLillah } = await supabase
        .from("students")
        .select("id, is_orphan, sponsor_id")
        .eq("is_lillah", true)
        .eq("status", "active");
      
      const total = allLillah?.length || 0;
      const orphans = allLillah?.filter(s => s.is_orphan)?.length || 0;
      const sponsored = allLillah?.filter(s => s.sponsor_id)?.length || 0;
      
      return { total, orphans, sponsored, needsSponsorship: total - sponsored };
    },
  });

  if (isLoading) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-rose-50/50 dark:to-rose-950/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-rose-500/10 to-purple-500/10 text-rose-600 dark:text-rose-400 text-sm font-semibold mb-4 border border-rose-500/20"
          >
            <Heart className="w-4 h-4" />
            লিল্লাহ বোর্ডিং
            <Sparkles className="w-4 h-4" />
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            এতিম ও লিল্লাহ বোর্ডিং
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            গরীব ও এতিম ছাত্রদের বিনামূল্যে শিক্ষা ও থাকা-খাওয়ার ব্যবস্থা। 
            আপনার দানে এই ছাত্রদের জীবন আলোকিত হোক।
          </motion.p>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
        >
          {[
            { label: "মোট লিল্লাহ ছাত্র", value: stats?.total || 0, icon: Home, color: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-950/40", borderColor: "border-rose-200 dark:border-rose-800" },
            { label: "এতিম ছাত্র", value: stats?.orphans || 0, icon: Baby, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/40", borderColor: "border-purple-200 dark:border-purple-800" },
            { label: "স্পন্সরড", value: stats?.sponsored || 0, icon: Heart, color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/40", borderColor: "border-emerald-200 dark:border-emerald-800" },
            { label: "স্পন্সরশীপ প্রয়োজন", value: stats?.needsSponsorship || 0, icon: Users, color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/40", borderColor: "border-amber-200 dark:border-amber-800" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className={`text-center border-2 ${stat.borderColor} ${stat.bgColor} hover:shadow-lg transition-all h-full`}>
                <CardContent className="p-4 md:p-6">
                  <div className={`w-12 h-12 rounded-xl bg-white dark:bg-background flex items-center justify-center mx-auto mb-3 shadow-sm`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value.toLocaleString('bn-BD')}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Students Grid */}
        {lillahStudents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg border border-border"
          >
            <h3 className="text-xl font-bold text-center mb-8 text-foreground flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              আমাদের লিল্লাহ বোর্ডিং ছাত্রগণ
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6">
              {lillahStudents.map((student: any, index: number) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center group"
                >
                  <Link to={`/student/${student.student_id}`}>
                    <div className="relative">
                      <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-rose-100 to-purple-100 dark:from-rose-900/30 dark:to-purple-900/30 border-3 border-rose-300 dark:border-rose-700 mb-3 shadow-md group-hover:shadow-lg group-hover:border-rose-500 transition-all cursor-pointer">
                        {student.photo_url ? (
                          <img 
                            src={student.photo_url} 
                            alt={student.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-rose-600 dark:text-rose-400 text-xl font-bold">
                            {student.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      {/* Orphan badge */}
                      {student.is_orphan && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-sm" title="এতিম">
                          <Baby className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-rose-600 transition-colors">
                      {student.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.classes?.name || 'N/A'}
                    </p>
                    {student.is_orphan && (
                      <span className="inline-block text-[10px] px-2 py-0.5 mt-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                        এতিম
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View All and Donate buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link to="/lillah-students">
                <Button variant="outline" size="lg" className="gap-2 px-8 border-rose-300 hover:bg-rose-50 dark:border-rose-700 dark:hover:bg-rose-950/40">
                  <Users className="w-4 h-4" />
                  সকল লিল্লাহ ছাত্র দেখুন
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#donate">
                <Button size="lg" className="gap-2 px-8 bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 shadow-lg">
                  <Heart className="w-4 h-4" />
                  এতিম স্পন্সর করুন
                </Button>
              </a>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {lillahStudents.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-rose-500" />
            </div>
            <p className="text-muted-foreground">
              বর্তমানে লিল্লাহ বোর্ডিংয়ে কোন ছাত্র নেই
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
