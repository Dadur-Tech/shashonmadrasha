import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone, AlertTriangle, CheckCircle, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const typeStyles = {
  info: {
    bg: "bg-blue-600",
    icon: Info,
  },
  warning: {
    bg: "bg-amber-600",
    icon: AlertTriangle,
  },
  success: {
    bg: "bg-emerald-600",
    icon: CheckCircle,
  },
  urgent: {
    bg: "bg-red-600",
    icon: Megaphone,
  },
};

export function AnnouncementBanner() {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Load dismissed IDs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("dismissedAnnouncements");
    if (stored) {
      try {
        setDismissedIds(JSON.parse(stored));
      } catch {
        setDismissedIds([]);
      }
    }
  }, []);

  const { data: announcements } = useQuery({
    queryKey: ["announcements-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`)
        .order("display_order", { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem("dismissedAnnouncements", JSON.stringify(newDismissed));
  };

  const visibleAnnouncements = announcements?.filter(
    (a) => !dismissedIds.includes(a.id)
  );

  if (!visibleAnnouncements || visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40">
      <AnimatePresence>
        {visibleAnnouncements.map((announcement, index) => {
          const style = typeStyles[announcement.type as keyof typeof typeStyles] || typeStyles.info;
          const Icon = style.icon;

          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ delay: index * 0.1 }}
              className={`${style.bg} text-white`}
            >
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold mr-2">{announcement.title}:</span>
                      <span className="opacity-90">{announcement.message}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {announcement.link_url && (
                      <a
                        href={announcement.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-sm font-medium transition-colors"
                      >
                        {announcement.link_text || "বিস্তারিত"}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={() => handleDismiss(announcement.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
