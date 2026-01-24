import { motion } from "framer-motion";
import { Calendar, Mic2, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfWeek, addDays, isAfter, subDays } from "date-fns";
import { bn } from "date-fns/locale";

interface JamiyatEntry {
  id: string;
  category: {
    id: string;
    name: string;
    name_arabic: string | null;
    icon: string | null;
  };
  student: {
    id: string;
    full_name: string;
    full_name_arabic: string | null;
    photo_url: string | null;
    student_id: string;
  };
  notes: string | null;
}

interface JamiyatSettings {
  is_enabled: boolean;
  last_updated_at: string;
  auto_disable_days: number;
}

export function WeeklyJamiyat() {
  // Get current week's Thursday
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 6 }); // Saturday
  const thisThursday = addDays(currentWeekStart, 5); // Thursday

  const { data: settings } = useQuery({
    queryKey: ["jamiyat-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jamiyat_settings")
        .select("*")
        .single();
      
      if (error) throw error;
      return data as JamiyatSettings;
    },
  });

  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ["weekly-jamiyat", currentWeekStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_jamiyat")
        .select(`
          id,
          notes,
          category:jamiyat_categories(id, name, name_arabic, icon),
          student:students(id, full_name, full_name_arabic, photo_url, student_id)
        `)
        .eq("week_start_date", currentWeekStart.toISOString().split('T')[0])
        .eq("is_active", true);
      
      if (error) throw error;
      return data as unknown as JamiyatEntry[];
    },
    enabled: settings?.is_enabled !== false,
  });

  // Check if auto-disabled
  const isAutoDisabled = settings && settings.last_updated_at && settings.auto_disable_days > 0
    ? isAfter(today, addDays(new Date(settings.last_updated_at), settings.auto_disable_days))
    : false;

  // Don't show if disabled or auto-disabled
  if (settings?.is_enabled === false || isAutoDisabled || (!isLoading && schedule.length === 0)) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  // Group by category
  const groupedSchedule = schedule.reduce((acc, entry) => {
    const categoryId = entry.category.id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: entry.category,
        students: [],
      };
    }
    acc[categoryId].students.push(entry);
    return acc;
  }, {} as Record<string, { category: JamiyatEntry["category"]; students: JamiyatEntry[] }>);

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Mic2 className="w-4 h-4" />
              সাপ্তাহিক জমিয়াত
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              এই সপ্তাহের জমিয়াত তালিকা
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              প্রতি বৃহস্পতিবার জোহরের নামাজের পর ছাত্রদের গজল, কিরাত, ওয়াজ ও বয়ানের আয়োজন
            </p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border-primary/20">
              <CardHeader className="bg-primary/5 border-b">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>বৃহস্পতিবার, {format(thisThursday, "d MMMM yyyy", { locale: bn })}</span>
                  </CardTitle>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    জোহরের পর
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6">
                  {Object.values(groupedSchedule).map((group, index) => (
                    <motion.div
                      key={group.category.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{group.category.icon || "🎯"}</span>
                        <div>
                          <h3 className="font-bold text-foreground">{group.category.name}</h3>
                          {group.category.name_arabic && (
                            <p className="text-sm text-muted-foreground font-arabic">
                              {group.category.name_arabic}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
                        {group.students.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-background/50"
                          >
                            <Avatar className="w-10 h-10 border">
                              <AvatarImage src={entry.student.photo_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {entry.student.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {entry.student.full_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                আইডি: {entry.student.student_id}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  {Object.keys(groupedSchedule).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>এই সপ্তাহের জমিয়াত তালিকা এখনও আপডেট হয়নি</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
