import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  UserPlus, 
  DollarSign, 
  GraduationCap, 
  FileText, 
  CreditCard,
  Bell,
  BookOpen,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

interface Activity {
  id: string;
  type: "student" | "donation" | "fee" | "exam" | "class" | "teacher";
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

const activityIcons = {
  student: <UserPlus className="w-4 h-4" />,
  donation: <DollarSign className="w-4 h-4" />,
  fee: <CreditCard className="w-4 h-4" />,
  exam: <FileText className="w-4 h-4" />,
  class: <BookOpen className="w-4 h-4" />,
  teacher: <GraduationCap className="w-4 h-4" />,
};

const activityColors = {
  student: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  donation: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  fee: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  exam: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  class: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  teacher: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
};

export function RecentActivities() {
  const { data: activities = [] } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const results: Activity[] = [];
      
      // Recent students
      const { data: students } = await supabase
        .from("students")
        .select("id, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      
      students?.forEach(s => {
        results.push({
          id: `student-${s.id}`,
          type: "student",
          title: "নতুন ছাত্র ভর্তি",
          description: s.full_name,
          time: s.created_at,
          icon: activityIcons.student,
          color: activityColors.student,
        });
      });

      // Recent donations
      const { data: donations } = await supabase
        .from("donations")
        .select("id, donor_name, amount, created_at")
        .eq("payment_status", "completed")
        .order("created_at", { ascending: false })
        .limit(3);
      
      donations?.forEach(d => {
        results.push({
          id: `donation-${d.id}`,
          type: "donation",
          title: "নতুন দান গৃহীত",
          description: `${d.donor_name} - ৳${Number(d.amount).toLocaleString('bn-BD')}`,
          time: d.created_at,
          icon: activityIcons.donation,
          color: activityColors.donation,
        });
      });

      // Recent fees
      const { data: fees } = await supabase
        .from("student_fees")
        .select("id, amount, status, created_at, student:students(full_name)")
        .eq("status", "paid")
        .order("updated_at", { ascending: false })
        .limit(3);
      
      fees?.forEach(f => {
        results.push({
          id: `fee-${f.id}`,
          type: "fee",
          title: "ফি পরিশোধিত",
          description: `${(f.student as any)?.full_name || 'ছাত্র'} - ৳${Number(f.amount).toLocaleString('bn-BD')}`,
          time: f.created_at,
          icon: activityIcons.fee,
          color: activityColors.fee,
        });
      });

      // Sort by time and take top 8
      return results
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 8);
    },
  });

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: bn });
    } catch {
      return "কিছুক্ষণ আগে";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            সাম্প্রতিক কার্যকলাপ
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            সব দেখুন
          </Badge>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              কোনো সাম্প্রতিক কার্যকলাপ নেই
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTime(activity.time)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
