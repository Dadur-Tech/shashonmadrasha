import { motion } from "framer-motion";
import { Award, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function TeacherHighlights() {
  const { data: titleCounts = [] } = useQuery({
    queryKey: ["public-teacher-title-counts"],
    queryFn: async () => {
      // Get all active titles
      const { data: titles } = await supabase
        .from("teacher_titles")
        .select("id, name, name_arabic, display_order")
        .eq("is_active", true)
        .order("display_order");

      if (!titles) return [];

      // Get teacher counts per title
      const { data: teachers } = await supabase
        .from("teachers")
        .select("title_id")
        .eq("status", "active")
        .not("title_id", "is", null);

      const countMap = teachers?.reduce((acc, t) => {
        acc[t.title_id] = (acc[t.title_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return titles
        .map(title => ({
          ...title,
          count: countMap[title.id] || 0,
        }))
        .filter(t => t.count > 0);
    },
  });

  const titleColors = [
    "from-emerald-500 to-teal-600",
    "from-purple-500 to-indigo-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-blue-500 to-cyan-600",
    "from-green-500 to-emerald-600",
  ];

  if (titleCounts.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Award className="w-4 h-4" />
            বিশেষজ্ঞ শিক্ষকমণ্ডলী
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            আমাদের সম্মানিত শিক্ষকবৃন্দ
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            অভিজ্ঞ ও যোগ্য শিক্ষকদের তত্ত্বাবধানে পরিচালিত হয় আমাদের মাদ্রাসা
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {titleCounts.map((title, index) => (
            <motion.div
              key={title.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className={`bg-gradient-to-br ${titleColors[index % titleColors.length]} rounded-2xl p-5 text-white text-center shadow-lg`}>
                <div className="absolute top-2 right-2 opacity-20">
                  <Star className="w-8 h-8 fill-current" />
                </div>
                <p className="text-4xl md:text-5xl font-bold mb-1">
                  {title.count.toLocaleString("bn-BD")}
                </p>
                <p className="font-semibold text-white/90">{title.name}</p>
                {title.name_arabic && (
                  <p className="text-sm text-white/70 mt-1" dir="rtl">
                    {title.name_arabic}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
