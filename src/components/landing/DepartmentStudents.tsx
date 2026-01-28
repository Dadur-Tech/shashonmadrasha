import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, Scroll, Mic, Sparkles, ArrowRight } from "lucide-react";

const departmentConfig: Record<string, { label: string; icon: any; color: string; bgColor: string; borderColor: string }> = {
  hifz: { 
    label: "হিফজ বিভাগ", 
    icon: BookOpen, 
    color: "text-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/40",
    borderColor: "border-emerald-200 dark:border-emerald-800"
  },
  kitab: { 
    label: "কিতাব বিভাগ", 
    icon: Scroll, 
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40",
    borderColor: "border-blue-200 dark:border-blue-800"
  },
  nurani: { 
    label: "নূরানী বিভাগ", 
    icon: Sparkles, 
    color: "text-amber-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/40",
    borderColor: "border-amber-200 dark:border-amber-800"
  },
  tajweed: { 
    label: "তাজবীদ বিভাগ", 
    icon: Mic, 
    color: "text-purple-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40",
    borderColor: "border-purple-200 dark:border-purple-800"
  },
};

export function DepartmentStudents() {
  const { data: departmentData } = useQuery({
    queryKey: ["public-department-stats"],
    queryFn: async () => {
      const { data: classes } = await supabase
        .from("classes")
        .select("id, department, name")
        .eq("is_active", true);

      if (!classes) return [];

      const { data: students } = await supabase
        .from("students")
        .select("class_id")
        .eq("status", "active");

      const deptCounts: Record<string, { count: number; classes: string[] }> = {};
      
      classes.forEach(cls => {
        if (!deptCounts[cls.department]) {
          deptCounts[cls.department] = { count: 0, classes: [] };
        }
        deptCounts[cls.department].classes.push(cls.name);
        
        const studentCount = students?.filter(s => s.class_id === cls.id).length || 0;
        deptCounts[cls.department].count += studentCount;
      });

      return Object.entries(deptCounts).map(([dept, data]) => ({
        department: dept,
        ...data,
        config: departmentConfig[dept] || {
          label: dept,
          icon: Users,
          color: "text-gray-600",
          bgColor: "bg-gray-50 dark:bg-gray-900/40",
          borderColor: "border-gray-200 dark:border-gray-800"
        }
      }));
    },
  });

  const { data: sampleStudents } = useQuery({
    queryKey: ["sample-students"],
    queryFn: async () => {
      const { data } = await supabase
        .from("students")
        .select("id, student_id, full_name, photo_url, class_id, classes(name, department)")
        .eq("status", "active")
        .limit(8);
      return data || [];
    },
  });

  return (
    <section className="py-12 md:py-20 bg-background relative">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-8 md:mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-semibold mb-3 md:mb-4"
          >
            <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
            বিভাগ সমূহ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 md:mb-4"
          >
            আমাদের শিক্ষা বিভাগ
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-lg"
          >
            বিভিন্ন বিভাগে ছাত্রদের বিন্যাস ও শিক্ষা কার্যক্রম
          </motion.p>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-16">
          {departmentData?.map((dept, index) => {
            const Icon = dept.config.icon;
            return (
              <motion.div
                key={dept.department}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.05 * index, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className={`border-2 ${dept.config.borderColor} ${dept.config.bgColor} h-full transition-all duration-300 hover:shadow-xl overflow-hidden`}>
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 md:mb-6">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white dark:bg-background flex items-center justify-center shadow-sm shrink-0`}>
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${dept.config.color}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground truncate">{dept.config.label}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">{dept.classes.length} টি ক্লাস</p>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                          {dept.count.toLocaleString('bn-BD')}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">জন ছাত্র</p>
                      </div>
                      <Badge className={`${dept.config.color} bg-white dark:bg-background border ${dept.config.borderColor} text-xs`}>
                        সক্রিয়
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Sample Students Grid */}
        {sampleStudents && sampleStudents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-secondary/30 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8"
          >
            <h3 className="text-lg md:text-xl font-bold text-center mb-4 md:mb-8 text-foreground">আমাদের কিছু ছাত্র</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4 md:gap-6">
              {sampleStudents.map((student: any, index: number) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.03 * index }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center group"
                >
                  <Link to={`/student/${student.student_id}`}>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto rounded-full overflow-hidden bg-white dark:bg-background border-2 border-primary/30 mb-1.5 md:mb-3 shadow-md group-hover:shadow-lg group-hover:border-primary/60 transition-all cursor-pointer">
                      {student.photo_url ? (
                        <img 
                          src={student.photo_url} 
                          alt={student.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-sm sm:text-lg md:text-xl font-bold">
                          {student.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{student.full_name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {student.classes?.name || 'N/A'}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View All Students Button */}
            <div className="text-center mt-4 md:mt-8">
              <Link to="/students">
                <Button size="default" className="gap-2 px-4 md:px-8 shadow-lg hover:shadow-xl transition-all text-sm md:text-base">
                  সকল ছাত্র দেখুন
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
