import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Database, FileArchive, CheckCircle2, AlertCircle, Clock, HardDrive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { format } from "date-fns";

// All tables to backup
const BACKUP_TABLES = [
  "academic_calendar",
  "academic_years",
  "announcements",
  "book_categories",
  "book_issues",
  "books",
  "certificate_templates",
  "class_schedule",
  "class_subjects",
  "classes",
  "course_enrollments",
  "courses",
  "departments",
  "donations",
  "events",
  "exam_results",
  "exams",
  "expense_categories",
  "expenses",
  "fee_types",
  "hostel_buildings",
  "hostel_rooms",
  "institution_settings",
  "issued_certificates",
  "jamiyat_categories",
  "jamiyat_settings",
  "leave_applications",
  "leave_types",
  "lesson_progress",
  "notable_alumni",
  "notifications",
  "online_classes",
  "payment_gateways",
  "payment_transactions",
  "permissions",
  "role_permissions",
  "sponsors",
  "student_attendance",
  "student_fee_payments",
  "students",
  "subjects",
  "teacher_attendance",
  "teacher_salaries",
  "teachers",
  "user_roles",
  "weekly_jamiyat",
  "weekly_meal_schedule",
] as const;

type TableName = typeof BACKUP_TABLES[number];

interface BackupStats {
  tableName: string;
  rowCount: number;
  status: "pending" | "downloading" | "completed" | "error";
}

export default function Backup() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tableStats, setTableStats] = useState<BackupStats[]>([]);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(
    localStorage.getItem("lastBackupDate")
  );

  const fetchTableData = async (tableName: string) => {
    try {
      // Use any to bypass strict type checking for dynamic table access
      const { data, error } = await (supabase
        .from(tableName as any)
        .select("*")
        .limit(10000) as any);

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (e) {
      console.error(`Exception fetching ${tableName}:`, e);
      return { data: [], error: String(e) };
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    setProgress(0);
    setTableStats([]);

    const zip = new JSZip();
    const dataFolder = zip.folder("data");
    const totalTables = BACKUP_TABLES.length;
    let completedTables = 0;
    const stats: BackupStats[] = [];

    // Initialize stats
    BACKUP_TABLES.forEach((table) => {
      stats.push({ tableName: table, rowCount: 0, status: "pending" });
    });
    setTableStats([...stats]);

    try {
      for (let i = 0; i < BACKUP_TABLES.length; i++) {
        const tableName = BACKUP_TABLES[i];
        
        // Update status to downloading
        stats[i].status = "downloading";
        setTableStats([...stats]);

        const { data, error } = await fetchTableData(tableName);

        if (error) {
          stats[i].status = "error";
          console.warn(`Skipping ${tableName} due to error: ${error}`);
        } else {
          stats[i].rowCount = data.length;
          stats[i].status = "completed";
          
          // Add to zip
          if (dataFolder) {
            dataFolder.file(
              `${tableName}.json`,
              JSON.stringify(data, null, 2)
            );
          }
        }

        completedTables++;
        setProgress(Math.round((completedTables / totalTables) * 100));
        setTableStats([...stats]);
      }

      // Add metadata
      const metadata = {
        backupDate: new Date().toISOString(),
        totalTables: BACKUP_TABLES.length,
        tablesBackedUp: stats.filter((s) => s.status === "completed").length,
        totalRows: stats.reduce((acc, s) => acc + s.rowCount, 0),
      };
      zip.file("backup_metadata.json", JSON.stringify(metadata, null, 2));

      // Generate zip and download
      const content = await zip.generateAsync({ type: "blob" });
      const fileName = `madrasa_backup_${format(new Date(), "yyyy-MM-dd_HH-mm")}.zip`;
      saveAs(content, fileName);

      // Save last backup date
      const now = new Date().toISOString();
      localStorage.setItem("lastBackupDate", now);
      setLastBackupDate(now);

      toast.success("ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!", {
        description: `${metadata.tablesBackedUp} টেবিল থেকে ${metadata.totalRows} রো ব্যাকআপ করা হয়েছে`,
      });
    } catch (error) {
      console.error("Backup error:", error);
      toast.error("ব্যাকআপ করতে সমস্যা হয়েছে");
    } finally {
      setIsBackingUp(false);
    }
  };

  const completedCount = tableStats.filter((s) => s.status === "completed").length;
  const errorCount = tableStats.filter((s) => s.status === "error").length;
  const totalRows = tableStats.reduce((acc, s) => acc + s.rowCount, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            ব্যাকআপ ডাউনলোড
          </h1>
          <p className="text-muted-foreground mt-1">
            সম্পূর্ণ ডাটাবেস ব্যাকআপ করুন এবং নিরাপদে সংরক্ষণ করুন
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Backup Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileArchive className="h-5 w-5 text-primary" />
                ডাটাবেস ব্যাকআপ
              </CardTitle>
              <CardDescription>
                এক ক্লিকে সম্পূর্ণ ডাটাবেস ZIP ফাইল আকারে ডাউনলোড করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Database className="h-4 w-4" />
                    টেবিল সংখ্যা
                  </div>
                  <p className="text-2xl font-bold">{BACKUP_TABLES.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <HardDrive className="h-4 w-4" />
                    ব্যাকআপ ফরম্যাট
                  </div>
                  <p className="text-2xl font-bold">ZIP</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    শেষ ব্যাকআপ
                  </div>
                  <p className="text-sm font-medium">
                    {lastBackupDate
                      ? format(new Date(lastBackupDate), "dd/MM/yyyy hh:mm a")
                      : "কখনো করা হয়নি"}
                  </p>
                </div>
              </div>

              {/* Progress Section */}
              {isBackingUp && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>ব্যাকআপ প্রগ্রেস</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      {completedCount} সম্পন্ন
                    </span>
                    {errorCount > 0 && (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        {errorCount} ত্রুটি
                      </span>
                    )}
                    <span>{totalRows.toLocaleString()} রো</span>
                  </div>
                </div>
              )}

              {/* Download Button */}
              <Button
                onClick={handleBackup}
                disabled={isBackingUp}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isBackingUp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                    ব্যাকআপ হচ্ছে...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    ব্যাকআপ ডাউনলোড করুন
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ব্যাকআপ সম্পর্কে</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                এই ব্যাকআপ সিস্টেম আপনার সমস্ত ডাটা নিরাপদে সংরক্ষণ করতে সাহায্য করে।
              </p>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">যা অন্তর্ভুক্ত:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>ছাত্র তথ্য</li>
                  <li>শিক্ষক তথ্য</li>
                  <li>ফি ও পেমেন্ট</li>
                  <li>পরীক্ষার ফলাফল</li>
                  <li>হাজিরা রেকর্ড</li>
                  <li>দান ও খরচ</li>
                  <li>কোর্স ও ক্লাস</li>
                  <li>সেটিংস</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                <p className="font-medium">💡 পরামর্শ</p>
                <p className="mt-1">
                  প্রতি সপ্তাহে অন্তত একবার ব্যাকআপ নেওয়া উচিত।
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Status (when backing up) */}
        {tableStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">টেবিল স্ট্যাটাস</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tableStats.map((stat) => (
                  <div
                    key={stat.tableName}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-sm truncate flex-1">
                      {stat.tableName}
                    </span>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-muted-foreground">
                        {stat.rowCount}
                      </span>
                      {stat.status === "pending" && (
                        <div className="h-3 w-3 rounded-full bg-muted" />
                      )}
                      {stat.status === "downloading" && (
                        <div className="h-3 w-3 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                      )}
                      {stat.status === "completed" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                      {stat.status === "error" && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
