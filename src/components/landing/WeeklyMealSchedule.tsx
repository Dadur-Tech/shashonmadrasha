import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Coffee, Moon, Sun } from "lucide-react";

const mealSchedule = [
  {
    day: "শনিবার",
    dayIndex: 6, // Saturday = 6
    breakfast: "রুটি, ডাল, সবজি",
    lunch: "ভাত, মাছ, ডাল, সবজি",
    dinner: "ভাত, মুরগি, সালাদ",
  },
  {
    day: "রবিবার",
    dayIndex: 0, // Sunday = 0
    breakfast: "পরোটা, ডিম, চা",
    lunch: "ভাত, গরুর মাংস, ডাল",
    dinner: "খিচুড়ি, সালাদ",
  },
  {
    day: "সোমবার",
    dayIndex: 1, // Monday = 1
    breakfast: "রুটি, সবজি, চা",
    lunch: "ভাত, মাছ, আলু ভর্তা",
    dinner: "ভাত, ডাল, সবজি",
  },
  {
    day: "মঙ্গলবার",
    dayIndex: 2, // Tuesday = 2
    breakfast: "পরোটা, হালুয়া",
    lunch: "ভাত, খাসির মাংস",
    dinner: "ভাত, ডিম, সালাদ",
  },
  {
    day: "বুধবার",
    dayIndex: 3, // Wednesday = 3
    breakfast: "রুটি, সবজি, চা",
    lunch: "ভাত, মুরগি, ডাল",
    dinner: "খিচুড়ি, পায়েস",
  },
  {
    day: "বৃহস্পতিবার",
    dayIndex: 4, // Thursday = 4
    breakfast: "পরোটা, ডাল, চা",
    lunch: "বিরিয়ানি",
    dinner: "ভাত, মাছ ভাজি",
  },
  {
    day: "শুক্রবার",
    dayIndex: 5, // Friday = 5
    breakfast: "রুটি, সবজি, চা",
    lunch: "পোলাও, মুরগি, সালাদ",
    dinner: "ভাত, ডাল, সবজি",
  },
];

export function WeeklyMealSchedule() {
  // Get current day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const today = new Date().getDay();
  
  // Find the index in our meal schedule array that matches today
  const todayMealIndex = mealSchedule.findIndex(meal => meal.dayIndex === today);

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
              key={meal.day}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className={`h-full border-2 transition-all duration-300 ${
                index === todayMealIndex 
                  ? 'border-primary shadow-xl bg-primary/5 ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/30 hover:shadow-lg'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b border-border">
                    <h4 className="font-bold text-foreground">{meal.day}</h4>
                    {index === todayMealIndex && (
                      <Badge className="bg-primary text-primary-foreground text-xs">আজ</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Coffee className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">সকাল</span>
                      </div>
                      <p className="text-sm text-foreground font-medium">{meal.breakfast}</p>
                    </div>
                    
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sun className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">দুপুর</span>
                      </div>
                      <p className="text-sm text-foreground font-medium">{meal.lunch}</p>
                    </div>
                    
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Moon className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">রাত</span>
                      </div>
                      <p className="text-sm text-foreground font-medium">{meal.dinner}</p>
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
