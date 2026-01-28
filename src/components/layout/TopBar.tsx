import { Bell, Search, Plus, ExternalLink, Home, CreditCard, Calendar, Users, FileText, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NotificationItem {
  id: string;
  type: "warning" | "info" | "success" | "alert";
  title: string;
  message: string;
  link?: string;
  icon: React.ReactNode;
}

export function TopBar() {
  const navigate = useNavigate();

  // Fetch real notifications from database
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["topbar-notifications"],
    queryFn: async () => {
      const notificationsList: NotificationItem[] = [];

      // Check for overdue fees
      const { data: dueFees, count: dueFeesCount } = await supabase
        .from("student_fees")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "overdue"]);

      if (dueFeesCount && dueFeesCount > 0) {
        notificationsList.push({
          id: "due-fees",
          type: "warning",
          title: "ফি বকেয়া",
          message: `${dueFeesCount} জন ছাত্রের ফি বকেয়া আছে`,
          link: "/admin/fees",
          icon: <CreditCard className="w-4 h-4 text-amber-500" />,
        });
      }

      // Check for pending donations
      const { count: pendingDonations } = await supabase
        .from("donations")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "pending");

      if (pendingDonations && pendingDonations > 0) {
        notificationsList.push({
          id: "pending-donations",
          type: "info",
          title: "পেন্ডিং দান",
          message: `${pendingDonations} টি দান অনুমোদনের অপেক্ষায়`,
          link: "/admin/donations",
          icon: <CreditCard className="w-4 h-4 text-blue-500" />,
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
        notificationsList.push({
          id: "upcoming-exam",
          type: "info",
          title: "আসন্ন পরীক্ষা",
          message: `${exam.name} - ${daysUntil} দিন বাকি`,
          link: "/admin/exams",
          icon: <Calendar className="w-4 h-4 text-blue-500" />,
        });
      }

      // Check lillah students without sponsors
      const { count: lillahWithoutSponsor } = await supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("is_lillah", true)
        .eq("status", "active")
        .is("sponsor_id", null);

      if (lillahWithoutSponsor && lillahWithoutSponsor > 0) {
        notificationsList.push({
          id: "lillah-no-sponsor",
          type: "warning",
          title: "স্পন্সর প্রয়োজন",
          message: `${lillahWithoutSponsor} জন লিল্লাহ ছাত্রের স্পন্সর নেই`,
          link: "/admin/lillah",
          icon: <Users className="w-4 h-4 text-amber-500" />,
        });
      }

      // Check for unread database notifications
      const { data: dbNotifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(5);

      if (dbNotifications) {
        dbNotifications.forEach((notif) => {
          notificationsList.push({
            id: notif.id,
            type: (notif.type as "warning" | "info" | "success" | "alert") || "info",
            title: notif.title,
            message: notif.message,
            icon: <FileText className="w-4 h-4 text-muted-foreground" />,
          });
        });
      }

      return notificationsList;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleNewAdmission = () => {
    navigate("/admin/students?action=add");
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const notificationCount = notifications.length;

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="ছাত্র, শিক্ষক বা ক্লাস খুঁজুন..." 
            className="pl-10 bg-secondary/50 border-transparent focus:bg-background focus:border-border"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* View Website Button */}
          <Link to="/" target="_blank">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">হোমপেজ দেখুন</span>
              <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>

          {/* Add New Student Button */}
          <Button 
            variant="default" 
            size="sm" 
            className="gap-2"
            onClick={handleNewAdmission}
          >
            <Plus className="w-4 h-4" />
            নতুন ছাত্র যোগ করুন
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-medium rounded-full bg-destructive text-destructive-foreground">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover max-h-96 overflow-y-auto">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>নোটিফিকেশন</span>
                {notificationCount > 0 && (
                  <span className="text-xs text-muted-foreground">{notificationCount} টি</span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  লোড হচ্ছে...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">সব ঠিক আছে!</p>
                  <p className="text-xs text-muted-foreground">কোনো জরুরি বিজ্ঞপ্তি নেই</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    className="flex items-start gap-3 py-3 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="mt-0.5">{notification.icon}</div>
                    <div className="flex-1">
                      <span className="font-medium text-sm block">{notification.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {notification.message}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-8 bg-border" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">আজ</p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('bn-BD', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}