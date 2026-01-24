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
    <section className="py-20 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
          >
            <BookOpen className="w-4 h-4" />
            বিভাগ সমূহ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            আমাদের শিক্ষা বিভাগ
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            বিভিন্ন বিভাগে ছাত্রদের বিন্যাস ও শিক্ষা কার্যক্রম
          </motion.p>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {departmentData?.map((dept, index) => {
            const Icon = dept.config.icon;
            return (
              <motion.div
                key={dept.department}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 * index, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className={`border-2 ${dept.config.borderColor} ${dept.config.bgColor} h-full transition-all duration-300 hover:shadow-xl overflow-hidden`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-background flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-7 h-7 ${dept.config.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{dept.config.label}</h3>
                        <p className="text-sm text-muted-foreground">{dept.classes.length} টি ক্লাস</p>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-4xl font-bold text-foreground">
                          {dept.count.toLocaleString('bn-BD')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">জন ছাত্র</p>
                      </div>
                      <Badge className={`${dept.config.color} bg-white dark:bg-background border ${dept.config.borderColor}`}>
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
            className="bg-secondary/30 rounded-3xl p-8"
          >
            <h3 className="text-xl font-bold text-center mb-8 text-foreground">আমাদের কিছু ছাত্র</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6">
              {sampleStudents.map((student: any, index: number) => (
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
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full overflow-hidden bg-white dark:bg-background border-3 border-primary/30 mb-3 shadow-md group-hover:shadow-lg group-hover:border-primary/60 transition-all cursor-pointer">
                      {student.photo_url ? (
                        <img 
                          src={student.photo_url} 
                          alt={student.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xl font-bold">
                          {student.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{student.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.classes?.name || 'N/A'}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View All Students Button */}
            <div className="text-center mt-8">
              <Link to="/students">
                <Button size="lg" className="gap-2 px-8 shadow-lg hover:shadow-xl transition-all">
                  সকল ছাত্র দেখুন
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
