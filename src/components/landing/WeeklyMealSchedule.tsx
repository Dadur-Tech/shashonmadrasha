import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Coffee, Moon, Sun, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MealScheduleItem {
  id: string;
  day_index: number;
  day_name: string;
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  is_active: boolean;
}

export function WeeklyMealSchedule() {
  const { data: mealSchedule, isLoading } = useQuery({
    queryKey: ["public-meal-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_schedule")
        .select("*")
        .order("day_index");
      
      if (error) throw error;
      return data as MealScheduleItem[];
    },
  });

  // Get current day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const today = new Date().getDay();

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-secondary/40">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!mealSchedule || mealSchedule.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/40 relative overflow-hidden">
      {/* Decorative Element */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-sm font-semibold mb-4"
          >
            <Utensils className="w-4 h-4" />
            খাদ্য তালিকা
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            সাপ্তাহিক খাদ্য তালিকা
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            আমাদের ছাত্রদের জন্য পুষ্টিকর ও সুষম খাদ্যের ব্যবস্থা
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {mealSchedule.map((meal, index) => (
            <motion.div
              key={meal.day_index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className={`h-full border-2 transition-all duration-300 ${
                meal.day_index === today 
                  ? 'border-primary shadow-xl bg-primary/5 ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/30 hover:shadow-lg'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b border-border">
                    <h4 className="font-bold text-foreground">{meal.day_name}</h4>
                    {meal.day_index === today && (
                      <Badge className="bg-primary text-primary-foreground text-xs">আজ</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Coffee className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">সকাল</span>
                      </div>
                      <p className="text-sm text-foreground font-medium">{meal.breakfast || "-"}</p>
                    </div>
                    
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sun className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">দুপুর</span>
                      </div>
                      <p className="text-sm text-foreground font-medium">{meal.lunch || "-"}</p>
                    </div>
                    
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Moon className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">রাত</span>
                      </div>
                      <p className="text-sm text-foreground font-medium">{meal.dinner || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
