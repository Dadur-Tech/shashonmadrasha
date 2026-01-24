import { motion } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const mockStats = [
  { 
    title: "মোট ছাত্র", 
    value: "৩৪৫", 
    change: "+১২%", 
    trend: "up",
    icon: Users,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
  },
  { 
    title: "মোট শিক্ষক", 
    value: "২৮", 
    change: "+৩", 
    trend: "up",
    icon: GraduationCap,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30"
  },
  { 
    title: "এই মাসের আয়", 
    value: "৳৪,৫০,০০০", 
    change: "+৮%", 
    trend: "up",
    icon: TrendingUp,
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"
  },
  { 
    title: "বকেয়া ফি", 
    value: "৳১,২০,০০০", 
    change: "-১৫%", 
    trend: "down",
    icon: CreditCard,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30"
  },
];

const mockActivity = [
  { action: "নতুন ছাত্র ভর্তি", name: "আব্দুল্লাহ আল মামুন", time: "৫ মিনিট আগে" },
  { action: "ফি জমা দিয়েছেন", name: "মোহাম্মদ হাসান", time: "১০ মিনিট আগে" },
  { action: "উপস্থিতি মার্ক করা হয়েছে", name: "হেফজ বিভাগ", time: "৩০ মিনিট আগে" },
  { action: "নতুন দান গৃহীত", name: "বেনামী দাতা", time: "১ ঘণ্টা আগে" },
];

export function DemoPreview() {
  return (
    <section id="demo" className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            লাইভ ডেমো
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            দেখুন কিভাবে কাজ করে
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            এই ড্যাশবোর্ডের মাধ্যমে আপনি আপনার মাদ্রাসার সব তথ্য এক নজরে দেখতে পারবেন
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          {/* Mock Dashboard */}
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Top Bar */}
            <div className="bg-secondary/50 border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">ج</span>
                </div>
                <span className="font-semibold text-foreground">Admin Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {mockStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      viewport={{ once: true }}
                    >
                      <Card className="border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs flex items-center gap-0.5 ${
                              stat.trend === 'up' ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                              {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {stat.change}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-foreground mt-3">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.title}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Activity Feed */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">সাম্প্রতিক কার্যকলাপ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.name}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-8">
            <Link to="/admin">
              <Button size="lg" className="gap-2">
                সম্পূর্ণ ড্যাশবোর্ড দেখুন
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
