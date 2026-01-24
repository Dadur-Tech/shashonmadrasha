import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Coffee, Moon } from "lucide-react";

const mealSchedule = [
  {
    day: "শনিবার",
    breakfast: "রুটি, ডাল, সবজি",
    lunch: "ভাত, মাছ, ডাল, সবজি",
    dinner: "ভাত, মুরগি, সালাদ",
  },
  {
    day: "রবিবার",
    breakfast: "পরোটা, ডিম, চা",
    lunch: "ভাত, গরুর মাংস, ডাল",
    dinner: "খিচুড়ি, সালাদ",
  },
  {
    day: "সোমবার",
    breakfast: "রুটি, সবজি, চা",
    lunch: "ভাত, মাছ, আলু ভর্তা",
    dinner: "ভাত, ডাল, সবজি",
  },
  {
    day: "মঙ্গলবার",
    breakfast: "পরোটা, হালুয়া",
    lunch: "ভাত, খাসির মাংস",
    dinner: "ভাত, ডিম, সালাদ",
  },
  {
    day: "বুধবার",
    breakfast: "রুটি, সবজি, চা",
    lunch: "ভাত, মুরগি, ডাল",
    dinner: "খিচুড়ি, পায়েস",
  },
  {
    day: "বৃহস্পতিবার",
    breakfast: "পরোটা, ডাল, চা",
    lunch: "বিরিয়ানি",
    dinner: "ভাত, মাছ ভাজি",
  },
  {
    day: "শুক্রবার",
    breakfast: "রুটি, সবজি, চা",
    lunch: "পোলাও, মুরগি, সালাদ",
    dinner: "ভাত, ডাল, সবজি",
  },
];

export function WeeklyMealSchedule() {
  const today = new Date().getDay();
  // Convert to Bengali calendar day (Saturday = 0 in our array, but JS Sunday = 0)
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Utensils className="w-4 h-4 inline-block mr-2" />
            খাদ্য তালিকা
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            সাপ্তাহিক খাদ্য তালিকা
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            আমাদের ছাত্রদের জন্য পুষ্টিকর ও সুষম খাদ্যের ব্যবস্থা
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {mealSchedule.map((meal, index) => (
            <motion.div
              key={meal.day}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              viewport={{ once: true }}
            >
              <Card className={`h-full border-border transition-all duration-300 ${
                index === todayIndex 
                  ? 'ring-2 ring-primary shadow-lg bg-primary/5' 
                  : 'hover:shadow-md'
              }`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-center flex items-center justify-center gap-2">
                    {meal.day}
                    {index === todayIndex && (
                      <Badge variant="default" className="text-xs">আজ</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Coffee className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">সকাল</span>
                    </div>
                    <p className="text-sm text-foreground">{meal.breakfast}</p>
                  </div>
                  
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Utensils className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">দুপুর</span>
                    </div>
                    <p className="text-sm text-foreground">{meal.lunch}</p>
                  </div>
                  
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Moon className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400">রাত</span>
                    </div>
                    <p className="text-sm text-foreground">{meal.dinner}</p>
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
