import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Video, 
  Play, 
  Clock, 
  Users, 
  Calendar,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  live: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 animate-pulse",
  completed: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const statusLabels: Record<string, string> = {
  scheduled: "আসন্ন",
  live: "🔴 লাইভ",
  completed: "সম্পন্ন",
};

export function OnlineClassesPreview() {
  const { data: upcomingClasses = [], isLoading } = useQuery({
    queryKey: ["public-online-classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("online_classes")
        .select(`
          *,
          class:classes(name, department),
          teacher:teachers(full_name, photo_url)
        `)
        .in("status", ["scheduled", "live"])
        .order("scheduled_at", { ascending: true })
        .limit(4);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: recordedClasses = [] } = useQuery({
    queryKey: ["public-recorded-classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("online_classes")
        .select(`
          *,
          class:classes(name),
          teacher:teachers(full_name)
        `)
        .eq("status", "completed")
        .eq("is_recorded", true)
        .not("recording_url", "is", null)
        .order("scheduled_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["online-classes-stats"],
    queryFn: async () => {
      const { count: totalClasses } = await supabase
        .from("online_classes")
        .select("*", { count: "exact", head: true });

      const { count: recordedCount } = await supabase
        .from("online_classes")
        .select("*", { count: "exact", head: true })
        .eq("is_recorded", true)
        .not("recording_url", "is", null);

      return {
        total: totalClasses || 0,
        recorded: recordedCount || 0,
      };
    },
  });

  if (isLoading) {
    return null;
  }

  // Don't show section if no classes exist
  if (upcomingClasses.length === 0 && recordedClasses.length === 0) {
    return null;
  }

  return (
    <section className="py-20 relative overflow-hidden" id="online-classes">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary text-sm font-semibold mb-4 border border-primary/20"
          >
            <Video className="w-4 h-4" />
            ই-লার্নিং প্ল্যাটফর্ম
            <Sparkles className="w-4 h-4" />
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            অনলাইন ক্লাস ও রেকর্ডিং
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            লাইভ ক্লাসে অংশগ্রহণ করুন বা রেকর্ডিং দেখে শিখুন। 
            বিশ্বমানের শিক্ষা এখন আপনার হাতের মুঠোয়।
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12"
        >
          {[
            { label: "মোট ক্লাস", value: stats?.total || 0, icon: BookOpen, color: "text-blue-600" },
            { label: "রেকর্ডিং", value: stats?.recorded || 0, icon: Play, color: "text-purple-600" },
            { label: "আসন্ন ক্লাস", value: upcomingClasses.length, icon: Calendar, color: "text-emerald-600" },
            { label: "লাইভ এখন", value: upcomingClasses.filter(c => c.status === "live").length, icon: Video, color: "text-red-600" },
          ].map((stat, index) => (
            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Upcoming Classes */}
        {upcomingClasses.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              আসন্ন ও লাইভ ক্লাস
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingClasses.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm group overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={statusColors[cls.status || "scheduled"]}>
                          {statusLabels[cls.status || "scheduled"]}
                        </Badge>
                        {cls.duration_minutes && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {cls.duration_minutes} মি.
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {cls.title}
                      </h4>
                      
                      {cls.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {cls.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm">
                        {cls.class?.name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{cls.class.name}</span>
                            {cls.class.department && (
                              <Badge variant="outline" className="text-xs">
                                {cls.class.department}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {cls.teacher?.full_name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                              {cls.teacher.full_name.charAt(0)}
                            </div>
                            <span>{cls.teacher.full_name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-muted-foreground pt-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(cls.scheduled_at).toLocaleDateString('bn-BD', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-primary font-medium">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(cls.scheduled_at).toLocaleTimeString('bn-BD', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {cls.meeting_link && cls.status === "live" && (
                        <Button 
                          className="w-full mt-4 gap-2"
                          onClick={() => window.open(cls.meeting_link, "_blank")}
                        >
                          <Video className="w-4 h-4" />
                          এখনই যোগ দিন
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recorded Classes Preview */}
        {recordedClasses.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-600" />
              সাম্প্রতিক রেকর্ডিং
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recordedClasses.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm group cursor-pointer overflow-hidden"
                    onClick={() => cls.recording_url && window.open(cls.recording_url, "_blank")}
                  >
                    <div className="relative h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-purple-600 ml-1" />
                      </div>
                      {cls.duration_minutes && (
                        <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                          {cls.duration_minutes} মিনিট
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-bold text-foreground mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {cls.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {cls.teacher?.full_name && (
                          <span>{cls.teacher.full_name}</span>
                        )}
                        <span>•</span>
                        <span>{new Date(cls.scheduled_at).toLocaleDateString('bn-BD')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/classes">
            <Button size="lg" className="gap-2 px-8">
              সকল ক্লাস দেখুন
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
