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
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const recentStudents = [
  { id: 1, name: "আহমদ হাসান", class: "হিফজ বিভাগ", status: "active" },
  { id: 2, name: "মুহাম্মদ আলী", class: "কিতাব বিভাগ", status: "active" },
  { id: 3, name: "আব্দুর রহমান", class: "মক্তব", status: "pending" },
  { id: 4, name: "ইব্রাহিম খান", class: "হিফজ বিভাগ", status: "active" },
  { id: 5, name: "ইউসুফ আহমেদ", class: "কিতাব বিভাগ", status: "active" },
];

const upcomingEvents = [
  { id: 1, title: "প্রথম সাময়িক পরীক্ষা", date: "১৫ রজব", type: "exam" },
  { id: 2, title: "অভিভাবক সভা", date: "২০ রজব", type: "meeting" },
  { id: 3, title: "বার্ষিক মাহফিল", date: "১ শাবান", type: "event" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">মাদ্রাসার সামগ্রিক পরিসংখ্যান ও তথ্য</p>
        </div>
        <Button className="gap-2">
          <TrendingUp className="w-4 h-4" />
          রিপোর্ট দেখুন
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="মোট ছাত্র সংখ্যা"
          value="৪৫৬"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="মোট শিক্ষক"
          value="২৮"
          icon={GraduationCap}
          variant="primary"
        />
        <StatCard
          title="এই মাসের আয়"
          value="৳ ২,৪৫,০০০"
          icon={CreditCard}
          trend={{ value: 8, isPositive: true }}
          variant="gold"
        />
        <StatCard
          title="লিল্লাহ ছাত্র"
          value="৪২"
          icon={Heart}
          variant="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">সাম্প্রতিক ভর্তি</CardTitle>
            <Button variant="ghost" size="sm">সব দেখুন</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.map((student, index) => (
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
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.class}</p>
                    </div>
                  </div>
                  <Badge variant={student.status === "active" ? "default" : "secondary"}>
                    {student.status === "active" ? "সক্রিয়" : "অপেক্ষমান"}
                  </Badge>
                </motion.div>
              ))}
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
                আসন্ন ইভেন্ট
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex flex-col items-center justify-center">
                    <span className="text-xs text-accent font-medium">
                      {event.date.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {event.date.split(' ')[1]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.type === "exam" && "পরীক্ষা"}
                      {event.type === "meeting" && "সভা"}
                      {event.type === "event" && "অনুষ্ঠান"}
                    </p>
                  </div>
                </div>
              ))}
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
                  <span className="font-medium">৭৮%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 rounded-lg bg-success/10">
                  <p className="text-2xl font-bold text-success">৩৫৬</p>
                  <p className="text-xs text-muted-foreground">পরিশোধিত</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-destructive/10">
                  <p className="text-2xl font-bold text-destructive">১০০</p>
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
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
                  <span>১৫ জন ছাত্রের ফি ২ মাসের বেশি বকেয়া</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
                  <span>৫টি নতুন ভর্তি আবেদন অপেক্ষমান</span>
                </li>
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
            {[
              { name: "হিফজ বিভাগ", count: 120, color: "bg-primary" },
              { name: "কিতাব বিভাগ", count: 180, color: "bg-accent" },
              { name: "মক্তব বিভাগ", count: 96, color: "bg-success" },
              { name: "তাখাসসুস", count: 60, color: "bg-info" },
            ].map((dept) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
