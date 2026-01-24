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
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Dashboard() {
  // Fetch real stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [studentsRes, teachersRes, donationsRes, feesRes] = await Promise.all([
        supabase.from("students").select("id, status, is_lillah", { count: "exact" }),
        supabase.from("teachers").select("id, status", { count: "exact" }).eq("status", "active"),
        supabase.from("donations").select("amount").eq("payment_status", "completed"),
        supabase.from("student_fees").select("amount, paid_amount, status"),
      ]);

      const totalStudents = studentsRes.data?.length || 0;
      const lillahStudents = studentsRes.data?.filter(s => s.is_lillah || s.status === "lillah").length || 0;
      const activeTeachers = teachersRes.data?.length || 0;
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
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
      };
    },
  });

  // Fetch recent students
  const { data: recentStudents = [] } = useQuery({
    queryKey: ["recent-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, status, class:classes(name)")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch upcoming exams
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["upcoming-exams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("id, name, exam_type, start_date")
        .gte("start_date", new Date().toISOString())
        .order("start_date")
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch class counts
  const { data: classCounts = [] } = useQuery({
    queryKey: ["class-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select(`
          id,
          name,
          department,
          students:students(count)
        `)
        .eq("is_active", true);
      
      if (error) throw error;
      
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">মাদ্রাসার সামগ্রিক পরিসংখ্যান ও তথ্য</p>
        </div>
        <Link to="/admin/reports">
          <Button className="gap-2">
            <TrendingUp className="w-4 h-4" />
            রিপোর্ট দেখুন
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="মোট ছাত্র সংখ্যা"
          value={stats?.totalStudents?.toString() || "০"}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          title="মোট শিক্ষক"
          value={stats?.activeTeachers?.toString() || "০"}
          icon={<GraduationCap className="w-6 h-6" />}
          variant="primary"
        />
        <StatCard
          title="এই মাসের আয়"
          value={`৳ ${(stats?.totalIncome || 0).toLocaleString('bn-BD')}`}
          icon={<CreditCard className="w-6 h-6" />}
          variant="gold"
        />
        <StatCard
          title="লিল্লাহ ছাত্র"
          value={stats?.lillahStudents?.toString() || "০"}
          icon={<Heart className="w-6 h-6" />}
          variant="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">সাম্প্রতিক ভর্তি</CardTitle>
            <Link to="/admin/students">
              <Button variant="ghost" size="sm">সব দেখুন</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                আসন্ন পরীক্ষা
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

          {/* Quick Alerts */}
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-warning">
                <AlertCircle className="w-5 h-5" />
                গুরুত্বপূর্ণ বিজ্ঞপ্তি
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {(stats?.dueCount || 0) > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
                    <span>{stats?.dueCount} জন ছাত্রের ফি বকেয়া</span>
                  </li>
                )}
                {(stats?.lillahStudents || 0) > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
                    <span>{stats?.lillahStudents} জন লিল্লাহ ছাত্র রয়েছে</span>
                  </li>
                )}
                {(stats?.dueCount === 0 && stats?.lillahStudents === 0) && (
                  <li className="text-muted-foreground">কোনো বিজ্ঞপ্তি নেই</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Class Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            বিভাগ ভিত্তিক ছাত্র সংখ্যা
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {classCounts.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-6">
                কোনো বিভাগ সেটআপ করা হয়নি। প্রথমে ক্লাস যোগ করুন।
              </p>
            ) : (
              classCounts.map((dept) => (
                <div 
                  key={dept.name} 
                  className="p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                    <span className="font-medium">{dept.name}</span>
                  </div>
                  <p className="text-3xl font-bold">{dept.count}</p>
                  <p className="text-sm text-muted-foreground">জন ছাত্র</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
