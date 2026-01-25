import { motion } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  Heart,
  TrendingUp,
  Calendar,
  BookOpen,
  AlertCircle,
  Loader2,
  PlayCircle,
  FileText,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { DepartmentPieChart, MonthlyIncomeChart, AttendanceBarChart } from "@/components/dashboard/DashboardCharts";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";

export default function Dashboard() {
  // Fetch real stats from database
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        const [studentsRes, teachersRes, donationsRes, feesRes, classesRes, examsRes] = await Promise.all([
          supabase.from("students").select("id, status, is_lillah", { count: "exact" }),
          supabase.from("teachers").select("id, status", { count: "exact" }).eq("status", "active"),
          supabase.from("donations").select("amount").eq("payment_status", "completed"),
          supabase.from("student_fees").select("amount, paid_amount, status"),
          supabase.from("online_classes").select("id", { count: "exact" }),
          supabase.from("exams").select("id", { count: "exact" }).eq("is_published", true),
        ]);

        const totalStudents = studentsRes.data?.length || 0;
        const lillahStudents = studentsRes.data?.filter(s => s.is_lillah || s.status === "lillah").length || 0;
        const activeTeachers = teachersRes.data?.length || 0;
        const totalClasses = classesRes.data?.length || 0;
        const publishedExams = examsRes.data?.length || 0;
        
        const totalDonations = donationsRes.data?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0;
        const totalFees = feesRes.data?.reduce((sum, f) => sum + Number(f.amount || 0), 0) || 0;
        const paidFees = feesRes.data?.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0) || 0;
        const paidCount = feesRes.data?.filter(f => f.status === "paid").length || 0;
        const dueCount = feesRes.data?.filter(f => f.status === "pending" || f.status === "overdue").length || 0;
        const feePercentage = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;

        return {
          totalStudents,
          lillahStudents,
          activeTeachers,
          totalDonations,
          totalIncome: totalDonations + paidFees,
          paidCount,
          dueCount,
          feePercentage,
          totalClasses,
          publishedExams,
        };
      } catch (error) {
        console.error("Dashboard stats error:", error);
        return {
          totalStudents: 0,
          lillahStudents: 0,
          activeTeachers: 0,
          totalDonations: 0,
          totalIncome: 0,
          paidCount: 0,
          dueCount: 0,
          feePercentage: 0,
          totalClasses: 0,
          publishedExams: 0,
        };
      }
    },
  });

  // Fetch recent students
  const { data: recentStudents = [] } = useQuery({
    queryKey: ["recent-students"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("id, full_name, status, class:classes(name)")
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (error) {
          console.error("Recent students error:", error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error("Recent students error:", error);
        return [];
      }
    },
  });

  // Fetch upcoming exams
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["upcoming-exams"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("exams")
          .select("id, name, exam_type, start_date")
          .gte("start_date", new Date().toISOString())
          .order("start_date")
          .limit(3);
        
        if (error) {
          console.error("Upcoming exams error:", error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error("Upcoming exams error:", error);
        return [];
      }
    },
  });

  // Fetch class counts for pie chart
  const { data: classCounts = [] } = useQuery({
    queryKey: ["class-counts"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("classes")
          .select(`
            id,
            name,
            department,
            students:students(count)
          `)
          .eq("is_active", true);
        
        if (error) {
          console.error("Class counts error:", error);
          return [];
        }
        
        // Group by department
        const departments: Record<string, { name: string; count: number; color: string }> = {};
        const colors: Record<string, string> = {
          hifz: "bg-primary",
          kitab: "bg-accent",
          nazera: "bg-success",
          takhassos: "bg-info",
        };
        const labels: Record<string, string> = {
          hifz: "হিফজ বিভাগ",
          kitab: "কিতাব বিভাগ",
          nazera: "নাযেরা বিভাগ",
          takhassos: "তাখাসসুস",
        };

        data?.forEach(cls => {
          const dept = cls.department || "other";
          if (!departments[dept]) {
            departments[dept] = {
              name: labels[dept] || dept,
              count: 0,
              color: colors[dept] || "bg-muted",
            };
          }
          departments[dept].count += (cls.students as any)?.[0]?.count || 0;
        });

        return Object.values(departments);
      } catch (error) {
        console.error("Class counts error:", error);
        return [];
      }
    },
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">ড্যাশবোর্ড</h1>
          <p className="text-sm text-muted-foreground">মাদ্রাসার সামগ্রিক পরিসংখ্যান ও তথ্য</p>
        </div>
        <Link to="/admin/reports">
          <Button className="gap-2 w-full sm:w-auto">
            <TrendingUp className="w-4 h-4" />
            রিপোর্ট দেখুন
          </Button>
        </Link>
      </div>

      {/* Quick Stats Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="মোট ছাত্র"
          value={stats?.totalStudents?.toString() || "০"}
          icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="শিক্ষক"
          value={stats?.activeTeachers?.toString() || "০"}
          icon={<GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />}
          variant="primary"
        />
        <StatCard
          title="মাসিক আয়"
          value={`৳${((stats?.totalIncome || 0) / 1000).toFixed(0)}k`}
          icon={<CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />}
          variant="gold"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="লিল্লাহ ছাত্র"
          value={stats?.lillahStudents?.toString() || "০"}
          icon={<Heart className="w-4 h-4 sm:w-5 sm:h-5" />}
          variant="success"
        />
        <StatCard
          title="অনলাইন ক্লাস"
          value={stats?.totalClasses?.toString() || "০"}
          icon={<PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
          variant="info"
        />
        <StatCard
          title="পরীক্ষা"
          value={stats?.publishedExams?.toString() || "০"}
          icon={<FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
        />
      </div>

      {/* Charts Row - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <MonthlyIncomeChart data={[]} />
        <DepartmentPieChart data={classCounts} />
        <AttendanceBarChart />
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Students */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base sm:text-lg">সাম্প্রতিক ভর্তি</CardTitle>
            <Link to="/admin/students">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">সব দেখুন</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStudents.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  এখনো কোনো ছাত্র ভর্তি হয়নি
                </p>
              ) : (
                recentStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {student.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(student.class as any)?.name || "ক্লাস নির্ধারিত হয়নি"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={student.status === "active" ? "default" : "secondary"}>
                      {student.status === "active" ? "সক্রিয়" : 
                       student.status === "lillah" ? "লিল্লাহ" : "অপেক্ষমান"}
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications Panel */}
        <NotificationsPanel />
      </div>

      {/* Activity & More Info Row - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-4 sm:space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                আসন্ন পরীক্ষা
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-sm">
                  কোনো আসন্ন পরীক্ষা নেই
                </p>
              ) : (
                upcomingEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex flex-col items-center justify-center">
                      <span className="text-xs text-accent font-medium">
                        {event.start_date ? new Date(event.start_date).getDate() : "-"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {event.start_date ? new Date(event.start_date).toLocaleString('bn-BD', { month: 'short' }) : ""}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.exam_type === "monthly" && "মাসিক"}
                        {event.exam_type === "quarterly" && "ত্রৈমাসিক"}
                        {event.exam_type === "half_yearly" && "অর্ধবার্ষিক"}
                        {event.exam_type === "annual" && "বার্ষিক"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Fee Collection Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-success" />
                ফি আদায় অগ্রগতি
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>এই মাসে আদায়</span>
                  <span className="font-medium">{stats?.feePercentage || 0}%</span>
                </div>
                <Progress value={stats?.feePercentage || 0} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 rounded-lg bg-success/10">
                  <p className="text-2xl font-bold text-success">{stats?.paidCount || 0}</p>
                  <p className="text-xs text-muted-foreground">পরিশোধিত</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-destructive/10">
                  <p className="text-2xl font-bold text-destructive">{stats?.dueCount || 0}</p>
                  <p className="text-xs text-muted-foreground">বকেয়া</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
