import { motion } from "framer-motion";
import { Users, GraduationCap, BookOpen, Heart, Award, Building } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function MadrasaStats() {
  const { data: stats } = useQuery({
    queryKey: ["public-madrasa-stats"],
    queryFn: async () => {
      const { count: totalStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: lillahStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("is_lillah", true)
        .eq("status", "active");

      const { count: totalTeachers } = await supabase
        .from("teachers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: totalClasses } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

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
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      icon: GraduationCap,
      value: stats?.totalTeachers || 0,
      label: "অভিজ্ঞ শিক্ষক",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      icon: BookOpen,
      value: stats?.totalClasses || 0,
      label: "সক্রিয় ক্লাস",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      icon: Heart,
      value: stats?.lillahStudents || 0,
      label: "লিল্লাহ বোর্ডিং",
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      borderColor: "border-rose-200 dark:border-rose-800",
    },
    {
      icon: Building,
      value: stats?.totalDepartments || 4,
      label: "বিভাগ সমূহ",
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-200 dark:border-amber-800",
    },
    {
      icon: Award,
      value: "৩০+",
      label: "বছরের অভিজ্ঞতা",
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-950/40",
      borderColor: "border-teal-200 dark:border-teal-800",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-secondary/50 to-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
          >
            <Award className="w-4 h-4" />
            পরিসংখ্যান
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            মাদ্রাসার সার্বিক চিত্র
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
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
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.08 * index, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className={`text-center rounded-2xl border ${item.borderColor} ${item.bgColor} p-6 h-full transition-all duration-300 hover:shadow-lg`}>
                  <div className={`w-14 h-14 rounded-xl bg-white dark:bg-background flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                    <Icon className={`w-7 h-7 ${item.iconColor}`} />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {typeof item.value === 'number' ? item.value.toLocaleString('bn-BD') : item.value}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
