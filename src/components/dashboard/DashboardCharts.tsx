import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
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

interface ChartProps {
  departmentData: DepartmentData[];
  monthlyData?: MonthlyData[];
}

const chartConfig = {
  income: {
    label: "আয়",
    color: "hsl(var(--primary))",
  },
  expense: {
    label: "ব্যয়",
    color: "hsl(var(--destructive))",
  },
  count: {
    label: "সংখ্যা",
    color: "hsl(var(--primary))",
  },
  present: {
    label: "উপস্থিত",
    color: "hsl(142.1 76.2% 36.3%)",
  },
  absent: {
    label: "অনুপস্থিত",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(142.1 76.2% 36.3%)', 'hsl(221.2 83.2% 53.3%)'];

export function DepartmentPieChart({ data }: { data: DepartmentData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
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
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">বিভাগ ভিত্তিক ছাত্র</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ChartContainer config={chartConfig} className="h-[200px] w-[200px] flex-shrink-0">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-2 flex-1">
              {data.map((item, index) => {
                const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                return (
                  <div key={item.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div 
                      className="w-4 h-4 rounded-md shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-foreground flex-1">{item.name}</span>
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
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">মাসিক আয়-ব্যয়</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0 84.2% 60.2%)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(0 84.2% 60.2%)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `৳${(value/1000).toFixed(0)}k`} 
                width={50}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(142.1 76.2% 36.3%)" 
                fill="url(#incomeGradient)" 
                strokeWidth={2.5}
                name="আয়"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="hsl(0 84.2% 60.2%)" 
                fill="url(#expenseGradient)" 
                strokeWidth={2.5}
                name="ব্যয়"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            </AreaChart>
          </ChartContainer>
          <div className="flex justify-center gap-6 mt-4">
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
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">সাপ্তাহিক উপস্থিতি</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <BarChart data={data} barGap={2} barCategoryGap="20%">
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`} 
                width={45}
                domain={[0, 100]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="present" 
                fill="hsl(142.1 76.2% 36.3%)" 
                radius={[4, 4, 0, 0]} 
                name="উপস্থিত"
                maxBarSize={40}
              />
              <Bar 
                dataKey="absent" 
                fill="hsl(0 84.2% 60.2%)" 
                radius={[4, 4, 0, 0]} 
                name="অনুপস্থিত"
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
          <div className="flex justify-center gap-6 mt-4">
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
