import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  FileText, 
  Download, 
  Printer,
  TrendingUp,
  TrendingDown,
  Banknote,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { openPrintWindow, generateReportHeader, generateReportFooter, formatCurrency } from "@/lib/pdf-utils";

const monthNames = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export default function ReportsPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  const { data: institution } = useQuery({
    queryKey: ["institution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institution_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["report-stats", selectedMonth, selectedYear],
    queryFn: async () => {
      // Get students count
      const { count: studentCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get teachers count
      const { count: teacherCount } = await supabase
        .from("teachers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get donations this month
      const startDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`;
      const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).toISOString().split('T')[0];
      
      const { data: donations } = await supabase
        .from("donations")
        .select("amount")
        .gte("created_at", startDate)
        .lte("created_at", endDate + "T23:59:59")
        .eq("payment_status", "completed");

      const totalDonations = donations?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0;

      // Get expenses this month
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount")
        .gte("expense_date", startDate)
        .lte("expense_date", endDate);

      const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;

      // Get fees collected
      const { data: fees } = await supabase
        .from("student_fees")
        .select("paid_amount")
        .eq("month", parseInt(selectedMonth))
        .eq("year", parseInt(selectedYear));

      const totalFees = fees?.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0) || 0;

      return {
        studentCount: studentCount || 0,
        teacherCount: teacherCount || 0,
        totalDonations,
        totalExpenses,
        totalFees,
        totalIncome: totalDonations + totalFees,
        balance: totalDonations + totalFees - totalExpenses,
      };
    },
  });

  const handlePrintReport = () => {
    if (!institution || !stats) return;

    const content = `
      ${generateReportHeader({
        title: "মাসিক আর্থিক প্রতিবেদন",
        subtitle: `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`,
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}

      <div class="summary-box">
        <h3 style="margin: 0 0 15px 0; color: #0d5c2e;">সারসংক্ষেপ</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="label">মোট ছাত্র</div>
            <div class="value">${stats.studentCount}</div>
          </div>
          <div class="summary-item">
            <div class="label">মোট শিক্ষক</div>
            <div class="value">${stats.teacherCount}</div>
          </div>
          <div class="summary-item">
            <div class="label">মোট আয়</div>
            <div class="value">${formatCurrency(stats.totalIncome)}</div>
          </div>
          <div class="summary-item">
            <div class="label">মোট ব্যয়</div>
            <div class="value" style="color: #dc2626;">${formatCurrency(stats.totalExpenses)}</div>
          </div>
        </div>
      </div>

      <h3 style="color: #0d5c2e; margin: 30px 0 15px 0;">আয়ের বিবরণ</h3>
      <table class="report-table">
        <thead>
          <tr>
            <th>খাত</th>
            <th>পরিমাণ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ছাত্রদের ফি</td>
            <td>${formatCurrency(stats.totalFees)}</td>
          </tr>
          <tr>
            <td>দান/অনুদান</td>
            <td>${formatCurrency(stats.totalDonations)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>মোট আয়</td>
            <td>${formatCurrency(stats.totalIncome)}</td>
          </tr>
        </tfoot>
      </table>

      <h3 style="color: #0d5c2e; margin: 30px 0 15px 0;">ব্যয়ের বিবরণ</h3>
      <table class="report-table">
        <thead>
          <tr>
            <th>খাত</th>
            <th>পরিমাণ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>সকল ব্যয়</td>
            <td>${formatCurrency(stats.totalExpenses)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>মোট ব্যয়</td>
            <td>${formatCurrency(stats.totalExpenses)}</td>
          </tr>
        </tfoot>
      </table>

      <div class="summary-box" style="margin-top: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0; color: #0d5c2e;">নীট ব্যালেন্স</h3>
            <p style="margin: 5px 0 0 0; color: #666;">আয় - ব্যয়</p>
          </div>
          <div style="font-size: 28px; font-weight: bold; color: ${stats.balance >= 0 ? '#16a34a' : '#dc2626'};">
            ${formatCurrency(stats.balance)}
          </div>
        </div>
      </div>

      <div class="signature-area avoid-break">
        <div class="signature-box">
          <div class="signature-line">হিসাবরক্ষক</div>
        </div>
        <div class="signature-box">
          <div class="signature-line">প্রধান শিক্ষক</div>
        </div>
        <div class="signature-box">
          <div class="signature-line">পরিচালক</div>
        </div>
      </div>

      ${generateReportFooter({
        title: "মাসিক আর্থিক প্রতিবেদন",
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
    `;

    openPrintWindow(content, `মাসিক প্রতিবেদন - ${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`);
  };

  // Fetch students for report
  const { data: students = [] } = useQuery({
    queryKey: ["students-report", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data } = await supabase
        .from("students")
        .select("*, classes(name)")
        .eq("status", "active")
        .order("full_name");
      return data || [];
    },
  });

  // Fetch fees for report
  const { data: fees = [] } = useQuery({
    queryKey: ["fees-report", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data } = await supabase
        .from("student_fees")
        .select("*, student:students(full_name, student_id)")
        .eq("month", parseInt(selectedMonth))
        .eq("year", parseInt(selectedYear))
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Fetch donations for report
  const { data: donations = [] } = useQuery({
    queryKey: ["donations-report", selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`;
      const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).toISOString().split('T')[0];
      const { data } = await supabase
        .from("donations")
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate + "T23:59:59")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Fetch expenses for report
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses-report", selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`;
      const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).toISOString().split('T')[0];
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .gte("expense_date", startDate)
        .lte("expense_date", endDate)
        .order("expense_date", { ascending: false });
      return data || [];
    },
  });

  // Fetch salaries for report
  const { data: salaries = [] } = useQuery({
    queryKey: ["salaries-report", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data } = await supabase
        .from("teacher_salaries")
        .select("*, teacher:teachers(full_name)")
        .eq("month", parseInt(selectedMonth))
        .eq("year", parseInt(selectedYear))
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handlePrintStudentsReport = () => {
    if (!institution) return;
    const content = `
      ${generateReportHeader({
        title: "ছাত্র তালিকা",
        subtitle: "সক্রিয় ছাত্রদের তালিকা",
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
      <table class="report-table">
        <thead>
          <tr>
            <th>ক্রম</th>
            <th>আইডি</th>
            <th>নাম</th>
            <th>ক্লাস</th>
            <th>অভিভাবক ফোন</th>
          </tr>
        </thead>
        <tbody>
          ${students.map((s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${s.student_id}</td>
              <td>${s.full_name}</td>
              <td>${s.classes?.name || "-"}</td>
              <td>${s.guardian_phone || "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <p style="margin-top: 20px;"><strong>মোট ছাত্র: ${students.length}</strong></p>
      ${generateReportFooter({
        title: "ছাত্র তালিকা",
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
    `;
    openPrintWindow(content, "ছাত্র তালিকা");
  };

  const handlePrintFeesReport = () => {
    if (!institution) return;
    const totalAmount = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const paidAmount = fees.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0);
    const content = `
      ${generateReportHeader({
        title: "ফি সংগ্রহ রিপোর্ট",
        subtitle: `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`,
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
      <table class="report-table">
        <thead>
          <tr>
            <th>ক্রম</th>
            <th>ছাত্র</th>
            <th>পরিমাণ</th>
            <th>পরিশোধিত</th>
            <th>বকেয়া</th>
            <th>স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody>
          ${fees.map((f, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${f.student?.full_name || "-"}</td>
              <td>${formatCurrency(f.amount)}</td>
              <td>${formatCurrency(f.paid_amount)}</td>
              <td>${formatCurrency(f.due_amount)}</td>
              <td>${f.status === "paid" ? "পরিশোধিত" : "বকেয়া"}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2"><strong>মোট</strong></td>
            <td><strong>${formatCurrency(totalAmount)}</strong></td>
            <td><strong>${formatCurrency(paidAmount)}</strong></td>
            <td><strong>${formatCurrency(totalAmount - paidAmount)}</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      ${generateReportFooter({
        title: "ফি সংগ্রহ রিপোর্ট",
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
    `;
    openPrintWindow(content, `ফি রিপোর্ট - ${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`);
  };

  const handlePrintDonationsReport = () => {
    if (!institution) return;
    const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const content = `
      ${generateReportHeader({
        title: "দান রিপোর্ট",
        subtitle: `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`,
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
      <table class="report-table">
        <thead>
          <tr>
            <th>ক্রম</th>
            <th>দাতা</th>
            <th>ক্যাটাগরি</th>
            <th>পরিমাণ</th>
            <th>স্ট্যাটাস</th>
            <th>তারিখ</th>
          </tr>
        </thead>
        <tbody>
          ${donations.map((d, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${d.is_anonymous ? "বেনামী" : d.donor_name}</td>
              <td>${d.category}</td>
              <td>${formatCurrency(d.amount)}</td>
              <td>${d.payment_status === "completed" ? "সম্পন্ন" : "পেন্ডিং"}</td>
              <td>${new Date(d.created_at).toLocaleDateString('bn-BD')}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3"><strong>মোট</strong></td>
            <td><strong>${formatCurrency(totalDonations)}</strong></td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
      ${generateReportFooter({
        title: "দান রিপোর্ট",
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
    `;
    openPrintWindow(content, `দান রিপোর্ট - ${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`);
  };

  const handlePrintExpensesReport = () => {
    if (!institution) return;
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const content = `
      ${generateReportHeader({
        title: "ব্যয় রিপোর্ট",
        subtitle: `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`,
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
      <table class="report-table">
        <thead>
          <tr>
            <th>ক্রম</th>
            <th>বিবরণ</th>
            <th>ক্যাটাগরি</th>
            <th>পরিমাণ</th>
            <th>তারিখ</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map((e, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${e.description || e.title || "-"}</td>
              <td>${"-"}</td>
              <td>${formatCurrency(e.amount)}</td>
              <td>${new Date(e.expense_date).toLocaleDateString('bn-BD')}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3"><strong>মোট ব্যয়</strong></td>
            <td><strong>${formatCurrency(totalExpenses)}</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      ${generateReportFooter({
        title: "ব্যয় রিপোর্ট",
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
    `;
    openPrintWindow(content, `ব্যয় রিপোর্ট - ${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`);
  };

  const handlePrintSalariesReport = () => {
    if (!institution) return;
    const totalSalaries = salaries.reduce((sum, s) => sum + Number(s.net_salary || 0), 0);
    const content = `
      ${generateReportHeader({
        title: "বেতন রিপোর্ট",
        subtitle: `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`,
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
      <table class="report-table">
        <thead>
          <tr>
            <th>ক্রম</th>
            <th>শিক্ষক</th>
            <th>মূল বেতন</th>
            <th>বোনাস</th>
            <th>কর্তন</th>
            <th>নীট বেতন</th>
            <th>স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody>
          ${salaries.map((s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${s.teacher?.full_name || "-"}</td>
              <td>${formatCurrency(s.base_salary)}</td>
              <td>${formatCurrency(s.bonus || 0)}</td>
              <td>${formatCurrency(s.deduction || 0)}</td>
              <td>${formatCurrency(s.net_salary)}</td>
              <td>${s.status === "paid" ? "পরিশোধিত" : "বকেয়া"}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5"><strong>মোট</strong></td>
            <td><strong>${formatCurrency(totalSalaries)}</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      ${generateReportFooter({
        title: "বেতন রিপোর্ট",
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
    `;
    openPrintWindow(content, `বেতন রিপোর্ট - ${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`);
  };

  const reportHandlers: Record<string, () => void> = {
    monthly: handlePrintReport,
    students: handlePrintStudentsReport,
    fees: handlePrintFeesReport,
    donations: handlePrintDonationsReport,
    expenses: handlePrintExpensesReport,
    salaries: handlePrintSalariesReport,
  };

  const reportTypes = [
    { id: "monthly", title: "মাসিক আর্থিক প্রতিবেদন", icon: Calendar, description: "মাসিক আয়-ব্যয়ের সারসংক্ষেপ" },
    { id: "students", title: "ছাত্র তালিকা", icon: Users, description: "সকল ছাত্রের বিস্তারিত তালিকা" },
    { id: "fees", title: "ফি সংগ্রহ রিপোর্ট", icon: Banknote, description: "ফি সংগ্রহের বিস্তারিত" },
    { id: "donations", title: "দান রিপোর্ট", icon: TrendingUp, description: "সকল দানের রেকর্ড" },
    { id: "expenses", title: "ব্যয় রিপোর্ট", icon: TrendingDown, description: "সকল ব্যয়ের বিবরণ" },
    { id: "salaries", title: "বেতন রিপোর্ট", icon: Banknote, description: "শিক্ষকদের বেতনের তালিকা" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">রিপোর্ট ও প্রতিবেদন</h1>
            <p className="text-muted-foreground">বিভিন্ন রিপোর্ট দেখুন ও প্রিন্ট করুন</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((name, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">মোট আয়</p>
                  <p className="text-xl font-bold">৳{stats.totalIncome.toLocaleString('bn-BD')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">মোট ব্যয়</p>
                  <p className="text-xl font-bold">৳{stats.totalExpenses.toLocaleString('bn-BD')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ব্যালেন্স</p>
                  <p className={`text-xl font-bold ${stats.balance >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                    ৳{stats.balance.toLocaleString('bn-BD')}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">মোট ছাত্র</p>
                  <p className="text-xl font-bold">{stats.studentCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report, index) => {
            const Icon = report.icon;
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={reportHandlers[report.id]}
                      >
                        <Printer className="w-4 h-4" />
                        প্রিন্ট
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
