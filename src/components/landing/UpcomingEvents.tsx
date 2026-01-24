import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Mic, ExternalLink, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isFuture, isPast, isToday, differenceInDays } from "date-fns";
import { bn } from "date-fns/locale";

const eventTypeLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  mahfil: { label: "ওয়াজ মাহফিল", color: "text-emerald-700 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-950/40" },
  program: { label: "অনুষ্ঠান", color: "text-blue-700 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-950/40" },
  meeting: { label: "সভা", color: "text-amber-700 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-950/40" },
  other: { label: "অন্যান্য", color: "text-purple-700 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-950/40" },
};

export function UpcomingEvents() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Get featured event (first one with is_featured = true, or first upcoming)
  const featuredEvent = events?.find(e => e.is_featured) || events?.[0];
  const otherEvents = events?.filter(e => e.id !== featuredEvent?.id).slice(0, 3);

  if (isLoading || !events || events.length === 0) {
    return null;
  }

  const getCountdown = (date: string) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) return "আজ!";
    const days = differenceInDays(eventDate, new Date());
    if (days === 1) return "আগামীকাল";
    return `${days} দিন বাকি`;
  };

  return (
    <section className="py-20 bg-gradient-to-b from-emerald-50/50 to-background dark:from-emerald-950/20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-4"
          >
            <Mic className="w-4 h-4" />
            আসন্ন অনুষ্ঠান
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            বার্ষিক ওয়াজ মাহফিল ও অনুষ্ঠান
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            মাদরাসার আসন্ন গুরুত্বপূর্ণ অনুষ্ঠানসমূহ
          </motion.p>
        </div>

        {/* Featured Event */}
        {featuredEvent && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <Card className="overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-background shadow-xl">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Side */}
                <div className="relative h-64 md:h-auto min-h-[300px] bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                  {featuredEvent.banner_image_url ? (
                    <img 
                      src={featuredEvent.banner_image_url} 
                      alt={featuredEvent.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-white p-8">
                      <Mic className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <h3 className="text-2xl font-bold mb-2">{featuredEvent.title}</h3>
                      {featuredEvent.title_arabic && (
                        <p className="text-xl opacity-90 font-arabic">{featuredEvent.title_arabic}</p>
                      )}
                    </div>
                  )}
                  {/* Countdown Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white text-emerald-700 text-lg px-4 py-2 shadow-lg">
                      <Star className="w-4 h-4 mr-2" />
                      {getCountdown(featuredEvent.event_date)}
                    </Badge>
                  </div>
                </div>

                {/* Content Side */}
                <CardContent className="p-8 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div>
                      {eventTypeLabels[featuredEvent.event_type] && (
                        <Badge className={`${eventTypeLabels[featuredEvent.event_type].bgColor} ${eventTypeLabels[featuredEvent.event_type].color} mb-3`}>
                          {eventTypeLabels[featuredEvent.event_type].label}
                        </Badge>
                      )}
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        {featuredEvent.title}
                      </h3>
                      {featuredEvent.description && (
                        <p className="text-muted-foreground">{featuredEvent.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">তারিখ</p>
                          <p className="font-semibold">
                            {format(new Date(featuredEvent.event_date), "d MMMM, yyyy", { locale: bn })}
                          </p>
                        </div>
                      </div>

                      {featuredEvent.event_time && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">সময়</p>
                            <p className="font-semibold">{featuredEvent.event_time}</p>
                          </div>
                        </div>
                      )}

                      {featuredEvent.location && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/40">
                            <MapPin className="w-5 h-5 text-rose-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">স্থান</p>
                            <p className="font-semibold">{featuredEvent.location}</p>
                          </div>
                        </div>
                      )}

                      {featuredEvent.chief_guest && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                            <Users className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">প্রধান অতিথি</p>
                            <p className="font-semibold">{featuredEvent.chief_guest}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {featuredEvent.registration_link && (
                      <div className="pt-4">
                        <a href={featuredEvent.registration_link} target="_blank" rel="noopener noreferrer">
                          <Button size="lg" className="gap-2 w-full sm:w-auto">
                            রেজিস্ট্রেশন করুন
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Other Events */}
        {otherEvents && otherEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {eventTypeLabels[event.event_type] && (
                        <Badge className={`${eventTypeLabels[event.event_type].bgColor} ${eventTypeLabels[event.event_type].color}`}>
                          {eventTypeLabels[event.event_type].label}
                        </Badge>
                      )}
                      
                      <h4 className="text-lg font-bold text-foreground">{event.title}</h4>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(event.event_date), "d MMMM, yyyy", { locale: bn })}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <Badge variant="outline" className="text-primary">
                          {getCountdown(event.event_date)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
