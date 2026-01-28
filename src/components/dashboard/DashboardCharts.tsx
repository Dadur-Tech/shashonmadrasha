import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface DepartmentData {
  name: string;
  count: number;
  color: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(142.1 76.2% 36.3%)', 'hsl(221.2 83.2% 53.3%)'];

export function DepartmentPieChart({ data }: { data: DepartmentData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">বিভাগ ভিত্তিক ছাত্র</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
          কোনো ডাটা নেই
        </CardContent>
      </Card>
    );
  }

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">বিভাগ ভিত্তিক ছাত্র</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {/* Pie Chart - Fixed size container */}
            <div className="w-[180px] h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                    strokeWidth={0}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend - Below chart */}
            <div className="w-full space-y-2">
              {data.map((item, index) => {
                const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                return (
                  <div key={item.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-foreground flex-1 truncate">{item.name}</span>
                    <span className="text-sm font-semibold text-foreground">{item.count}</span>
                    <span className="text-xs text-muted-foreground">({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MonthlyIncomeChart({ data }: { data: MonthlyData[] }) {
  const defaultData: MonthlyData[] = [
    { month: "জানু", income: 45000, expense: 32000 },
    { month: "ফেব্রু", income: 52000, expense: 35000 },
    { month: "মার্চ", income: 48000, expense: 38000 },
    { month: "এপ্রিল", income: 61000, expense: 42000 },
    { month: "মে", income: 55000, expense: 40000 },
    { month: "জুন", income: 67000, expense: 45000 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">মাসিক আয়-ব্যয়</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0 84.2% 60.2%)" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="hsl(0 84.2% 60.2%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={(value) => `৳${(value/1000).toFixed(0)}k`} 
                  width={45}
                />
                <Tooltip formatter={(value: number, name: string) => [`৳${value.toLocaleString()}`, name]} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="hsl(142.1 76.2% 36.3%)" 
                  fill="url(#incomeGradient)" 
                  strokeWidth={2}
                  name="আয়"
                  dot={false}
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="hsl(0 84.2% 60.2%)" 
                  fill="url(#expenseGradient)" 
                  strokeWidth={2}
                  name="ব্যয়"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(142.1 76.2% 36.3%)' }} />
              <span className="text-muted-foreground">আয়</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(0 84.2% 60.2%)' }} />
              <span className="text-muted-foreground">ব্যয়</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AttendanceBarChart() {
  const data = [
    { day: "শনি", present: 85, absent: 15 },
    { day: "রবি", present: 92, absent: 8 },
    { day: "সোম", present: 88, absent: 12 },
    { day: "মঙ্গল", present: 90, absent: 10 },
    { day: "বুধ", present: 87, absent: 13 },
    { day: "বৃহ:", present: 91, absent: 9 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">সাপ্তাহিক উপস্থিতি</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={4} barCategoryGap="25%" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={(value) => `${value}%`} 
                  width={40}
                  domain={[0, 100]}
                />
                <Tooltip formatter={(value: number, name: string) => [`${value}%`, name]} />
                <Bar 
                  dataKey="present" 
                  fill="hsl(142.1 76.2% 36.3%)" 
                  radius={[4, 4, 0, 0]} 
                  name="উপস্থিত"
                  maxBarSize={35}
                />
                <Bar 
                  dataKey="absent" 
                  fill="hsl(0 84.2% 60.2%)" 
                  radius={[4, 4, 0, 0]} 
                  name="অনুপস্থিত"
                  maxBarSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(142.1 76.2% 36.3%)' }} />
              <span className="text-muted-foreground">উপস্থিত</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(0 84.2% 60.2%)' }} />
              <span className="text-muted-foreground">অনুপস্থিত</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
