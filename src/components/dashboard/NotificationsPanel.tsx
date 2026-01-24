import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  X,
  Calendar,
  CreditCard,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: "warning" | "info" | "success" | "alert";
  title: string;
  message: string;
  icon: React.ReactNode;
}

const notificationStyles = {
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-500",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-500",
  },
  success: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-500",
  },
  alert: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-500",
  },
};

export function NotificationsPanel() {
  const { data: notificationData } = useQuery({
    queryKey: ["dashboard-notifications"],
    queryFn: async () => {
      const notifications: Notification[] = [];

      // Check for overdue fees
      const { data: dueFees } = await supabase
        .from("student_fees")
        .select("id", { count: "exact" })
        .in("status", ["pending", "overdue"]);

      if (dueFees && dueFees.length > 0) {
        notifications.push({
          id: "due-fees",
          type: "warning",
          title: "ফি বকেয়া",
          message: `${dueFees.length} জন ছাত্রের ফি বকেয়া আছে`,
          icon: <CreditCard className="w-4 h-4" />,
        });
      }

      // Check for upcoming exams
      const { data: upcomingExams } = await supabase
        .from("exams")
        .select("id, name, start_date")
        .gte("start_date", new Date().toISOString())
        .order("start_date")
        .limit(1);

      if (upcomingExams && upcomingExams.length > 0) {
        const exam = upcomingExams[0];
        const daysUntil = Math.ceil((new Date(exam.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        notifications.push({
          id: "upcoming-exam",
          type: "info",
          title: "আসন্ন পরীক্ষা",
          message: `${exam.name} - ${daysUntil} দিন বাকি`,
          icon: <Calendar className="w-4 h-4" />,
        });
      }

      // Check lillah students
      const { count: lillahCount } = await supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("is_lillah", true)
        .eq("status", "active");

      if (lillahCount && lillahCount > 0) {
        notifications.push({
          id: "lillah-students",
          type: "info",
          title: "লিল্লাহ ছাত্র",
          message: `${lillahCount} জন লিল্লাহ ছাত্র রয়েছে`,
          icon: <Users className="w-4 h-4" />,
        });
      }

      // Add a success notification if everything is fine
      if (notifications.length === 0) {
        notifications.push({
          id: "all-good",
          type: "success",
          title: "সব ঠিক আছে",
          message: "কোনো জরুরি বিজ্ঞপ্তি নেই",
          icon: <CheckCircle2 className="w-4 h-4" />,
        });
      }

      return notifications;
    },
  });

  const notifications = notificationData || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            বিজ্ঞপ্তি
          </CardTitle>
          {notifications.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {notifications.length}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((notification, index) => {
            const styles = notificationStyles[notification.type];
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg border ${styles.bg} ${styles.border}`}
              >
                <div className="flex items-start gap-3">
                  <div className={styles.icon}>
                    {notification.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
