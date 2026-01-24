import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, Scroll, Mic } from "lucide-react";

const departmentConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  hifz: { 
    label: "হিফজ বিভাগ", 
    icon: BookOpen, 
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30"
  },
  kitab: { 
    label: "কিতাব বিভাগ", 
    icon: Scroll, 
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  },
  nurani: { 
    label: "নূরানী বিভাগ", 
    icon: Users, 
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30"
  },
  tajweed: { 
    label: "তাজবীদ বিভাগ", 
    icon: Mic, 
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30"
  },
};

export function DepartmentStudents() {
  const { data: departmentData } = useQuery({
    queryKey: ["public-department-stats"],
    queryFn: async () => {
      // Get classes with their departments
      const { data: classes } = await supabase
        .from("classes")
        .select("id, department, name")
        .eq("is_active", true);

      if (!classes) return [];

      // Get student counts per class
      const { data: students } = await supabase
        .from("students")
        .select("class_id")
        .eq("status", "active");

      // Group by department
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
          bgColor: "bg-gray-100"
        }
      }));
    },
  });

  // Fetch some sample students for display
  const { data: sampleStudents } = useQuery({
    queryKey: ["sample-students"],
    queryFn: async () => {
      const { data } = await supabase
        .from("students")
        .select("id, full_name, photo_url, class_id, classes(name, department)")
        .eq("status", "active")
        .limit(8);
      return data || [];
    },
  });

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
            বিভাগ সমূহ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            আমাদের শিক্ষা বিভাগ
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            বিভিন্ন বিভাগে ছাত্রদের বিন্যাস ও শিক্ষা কার্যক্রম
          </motion.p>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {departmentData?.map((dept, index) => {
            const Icon = dept.config.icon;
            return (
              <motion.div
                key={dept.department}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                viewport={{ once: true }}
              >
                <Card className="border-border hover:shadow-lg transition-all duration-300 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${dept.config.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${dept.config.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{dept.config.label}</CardTitle>
                        <p className="text-sm text-muted-foreground">{dept.classes.length} টি ক্লাস</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-foreground">
                          {dept.count.toLocaleString('bn-BD')}
                        </p>
                        <p className="text-sm text-muted-foreground">জন ছাত্র</p>
                      </div>
                      <Badge variant="secondary" className={dept.config.color}>
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
          >
            <h3 className="text-xl font-semibold text-center mb-6 text-foreground">আমাদের কিছু ছাত্র</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
              {sampleStudents.map((student: any, index: number) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full overflow-hidden bg-secondary border-2 border-primary/20 mb-2">
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
                  <p className="text-xs font-medium text-foreground truncate">{student.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {student.classes?.name || 'N/A'}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
