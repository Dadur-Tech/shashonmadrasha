import { motion } from "framer-motion";
import { Users, GraduationCap, BookOpen, Heart, Award, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function MadrasaStats() {
  const { data: stats } = useQuery({
    queryKey: ["public-madrasa-stats"],
    queryFn: async () => {
      // Fetch total students
      const { count: totalStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch lillah students
      const { count: lillahStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("is_lillah", true)
        .eq("status", "active");

      // Fetch teachers
      const { count: totalTeachers } = await supabase
        .from("teachers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch classes
      const { count: totalClasses } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch department counts
      const { data: classData } = await supabase
        .from("classes")
        .select("department, id")
        .eq("is_active", true);

      const departments = new Set(classData?.map(c => c.department) || []);

      return {
        totalStudents: totalStudents || 0,
        lillahStudents: lillahStudents || 0,
        totalTeachers: totalTeachers || 0,
        totalClasses: totalClasses || 0,
        totalDepartments: departments.size || 4,
      };
    },
  });

  const statItems = [
    {
      icon: Users,
      value: stats?.totalStudents || 0,
      label: "মোট ছাত্র",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: GraduationCap,
      value: stats?.totalTeachers || 0,
      label: "অভিজ্ঞ শিক্ষক",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: BookOpen,
      value: stats?.totalClasses || 0,
      label: "সক্রিয় ক্লাস",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      icon: Heart,
      value: stats?.lillahStudents || 0,
      label: "লিল্লাহ বোর্ডিং",
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-100 dark:bg-rose-900/30",
    },
    {
      icon: Building,
      value: stats?.totalDepartments || 4,
      label: "বিভাগ সমূহ",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      icon: Award,
      value: "৩০+",
      label: "বছরের অভিজ্ঞতা",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-100 dark:bg-teal-900/30",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            পরিসংখ্যান
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            মাদ্রাসার সার্বিক চিত্র
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            আমাদের প্রতিষ্ঠানের বর্তমান অবস্থা এক নজরে দেখুন
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                viewport={{ once: true }}
              >
                <Card className="text-center border-border hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-xl ${item.bgColor} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-7 h-7 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`} style={{ color: item.color.includes('blue') ? '#3b82f6' : item.color.includes('purple') ? '#a855f7' : item.color.includes('emerald') ? '#10b981' : item.color.includes('rose') ? '#f43f5e' : item.color.includes('amber') ? '#f59e0b' : '#14b8a6' }} />
                    </div>
                    <p className="text-3xl font-bold text-foreground mb-1">
                      {typeof item.value === 'number' ? item.value.toLocaleString('bn-BD') : item.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
