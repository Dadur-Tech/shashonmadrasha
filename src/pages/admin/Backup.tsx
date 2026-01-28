import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Database, FileArchive, CheckCircle2, AlertCircle, Clock, HardDrive, Image, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

// Storage buckets to backup
const STORAGE_BUCKETS = ["photos"] as const;

interface BackupStats {
  tableName: string;
  rowCount: number;
  status: "pending" | "downloading" | "completed" | "error";
  type: "table" | "storage";
}

export default function Backup() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tableStats, setTableStats] = useState<BackupStats[]>([]);
  const [storageFileCount, setStorageFileCount] = useState(0);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(
    localStorage.getItem("lastBackupDate")
  );

  const fetchTableData = async (tableName: string) => {
    try {
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

  const fetchStorageFiles = async (bucketName: string) => {
    try {
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list("", { limit: 1000 });

      if (error) {
        console.error(`Error listing ${bucketName}:`, error);
        return { files: [], error: error.message };
      }

      return { files: files || [], error: null };
    } catch (e) {
      console.error(`Exception listing ${bucketName}:`, e);
      return { files: [], error: String(e) };
    }
  };

  const downloadStorageFile = async (bucketName: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(fileName);

      if (error) {
        console.error(`Error downloading ${fileName}:`, error);
        return null;
      }

      return data;
    } catch (e) {
      console.error(`Exception downloading ${fileName}:`, e);
      return null;
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    setProgress(0);
    setTableStats([]);
    setStorageFileCount(0);

    const zip = new JSZip();
    const dataFolder = zip.folder("database");
    const storageFolder = zip.folder("storage");
    
    const totalItems = BACKUP_TABLES.length + STORAGE_BUCKETS.length;
    let completedItems = 0;
    const stats: BackupStats[] = [];

    // Initialize table stats
    BACKUP_TABLES.forEach((table) => {
      stats.push({ tableName: table, rowCount: 0, status: "pending", type: "table" });
    });
    
    // Initialize storage stats
    STORAGE_BUCKETS.forEach((bucket) => {
      stats.push({ tableName: `📁 ${bucket}`, rowCount: 0, status: "pending", type: "storage" });
    });
    
    setTableStats([...stats]);

    try {
      // Backup database tables
      for (let i = 0; i < BACKUP_TABLES.length; i++) {
        const tableName = BACKUP_TABLES[i];
        
        stats[i].status = "downloading";
        setTableStats([...stats]);

        const { data, error } = await fetchTableData(tableName);

        if (error) {
          stats[i].status = "error";
          console.warn(`Skipping ${tableName} due to error: ${error}`);
        } else {
          stats[i].rowCount = data.length;
          stats[i].status = "completed";
          
          if (dataFolder) {
            dataFolder.file(`${tableName}.json`, JSON.stringify(data, null, 2));
          }
        }

        completedItems++;
        setProgress(Math.round((completedItems / totalItems) * 100));
        setTableStats([...stats]);
      }

      // Backup storage buckets
      let totalFilesDownloaded = 0;
      for (let i = 0; i < STORAGE_BUCKETS.length; i++) {
        const bucketName = STORAGE_BUCKETS[i];
        const statIndex = BACKUP_TABLES.length + i;
        
        stats[statIndex].status = "downloading";
        setTableStats([...stats]);

        const { files, error } = await fetchStorageFiles(bucketName);

        if (error) {
          stats[statIndex].status = "error";
          console.warn(`Skipping bucket ${bucketName} due to error: ${error}`);
        } else {
          const bucketFolder = storageFolder?.folder(bucketName);
          
          // Download each file
          for (const file of files) {
            if (file.name && !file.name.endsWith("/")) {
              const fileData = await downloadStorageFile(bucketName, file.name);
              if (fileData && bucketFolder) {
                bucketFolder.file(file.name, fileData);
                totalFilesDownloaded++;
                setStorageFileCount(totalFilesDownloaded);
              }
            }
          }
          
          stats[statIndex].rowCount = files.filter(f => f.name && !f.name.endsWith("/")).length;
          stats[statIndex].status = "completed";
        }

        completedItems++;
        setProgress(Math.round((completedItems / totalItems) * 100));
        setTableStats([...stats]);
      }

      // Add metadata
      const metadata = {
        backupDate: new Date().toISOString(),
        backupType: "full",
        database: {
          totalTables: BACKUP_TABLES.length,
          tablesBackedUp: stats.filter((s) => s.type === "table" && s.status === "completed").length,
          totalRows: stats.filter(s => s.type === "table").reduce((acc, s) => acc + s.rowCount, 0),
        },
        storage: {
          totalBuckets: STORAGE_BUCKETS.length,
          bucketsBackedUp: stats.filter((s) => s.type === "storage" && s.status === "completed").length,
          totalFiles: totalFilesDownloaded,
        },
      };
      zip.file("backup_metadata.json", JSON.stringify(metadata, null, 2));

      // Generate zip and download
      const content = await zip.generateAsync({ type: "blob" });
      const fileName = `madrasa_full_backup_${format(new Date(), "yyyy-MM-dd_HH-mm")}.zip`;
      saveAs(content, fileName);

      // Save last backup date
      const now = new Date().toISOString();
      localStorage.setItem("lastBackupDate", now);
      setLastBackupDate(now);

      toast.success("সম্পূর্ণ ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!", {
        description: `${metadata.database.tablesBackedUp} টেবিল (${metadata.database.totalRows} রো) + ${metadata.storage.totalFiles} ফাইল`,
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
            সম্পূর্ণ ব্যাকআপ ডাউনলোড
          </h1>
          <p className="text-muted-foreground mt-1">
            ডাটাবেস + আপলোড করা ফাইলস সহ সম্পূর্ণ ব্যাকআপ করুন
          </p>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>ব্যাকআপ সম্পর্কে</AlertTitle>
          <AlertDescription>
            এই ব্যাকআপে আপনার সমস্ত ডাটাবেস ডেটা এবং আপলোড করা ফাইলস (ছবি, ডকুমেন্ট) অন্তর্ভুক্ত থাকবে। 
            সোর্স কোড ব্যাকআপ করতে হলে প্রজেক্ট সেটিংস থেকে GitHub-এ সংযুক্ত করুন।
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Backup Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileArchive className="h-5 w-5 text-primary" />
                সম্পূর্ণ ব্যাকআপ
              </CardTitle>
              <CardDescription>
                এক ক্লিকে ডাটাবেস + ফাইলস ZIP আকারে ডাউনলোড করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Database className="h-4 w-4" />
                    টেবিল
                  </div>
                  <p className="text-2xl font-bold">{BACKUP_TABLES.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Image className="h-4 w-4" />
                    স্টোরেজ বাকেট
                  </div>
                  <p className="text-2xl font-bold">{STORAGE_BUCKETS.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <HardDrive className="h-4 w-4" />
                    ফরম্যাট
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
                      : "কখনো হয়নি"}
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
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {completedCount} সম্পন্ন
                    </span>
                    {errorCount > 0 && (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        {errorCount} ত্রুটি
                      </span>
                    )}
                    <span>
                      <Database className="h-4 w-4 inline mr-1" />
                      {tableStats.filter(s => s.type === "table").reduce((acc, s) => acc + s.rowCount, 0).toLocaleString()} রো
                    </span>
                    {storageFileCount > 0 && (
                      <span>
                        <Image className="h-4 w-4 inline mr-1" />
                        {storageFileCount} ফাইল
                      </span>
                    )}
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
                    সম্পূর্ণ ব্যাকআপ ডাউনলোড
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ব্যাকআপে যা থাকবে</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Database className="h-4 w-4 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">ডাটাবেস</p>
                    <ul className="list-disc list-inside space-y-0.5 mt-1">
                      <li>ছাত্র ও শিক্ষক তথ্য</li>
                      <li>ফি ও পেমেন্ট রেকর্ড</li>
                      <li>পরীক্ষা ও ফলাফল</li>
                      <li>হাজিরা রেকর্ড</li>
                      <li>দান ও খরচ</li>
                      <li>কোর্স ও অনলাইন ক্লাস</li>
                      <li>সেটিংস ও কনফিগারেশন</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Image className="h-4 w-4 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">আপলোড করা ফাইলস</p>
                    <ul className="list-disc list-inside space-y-0.5 mt-1">
                      <li>ছাত্র/শিক্ষকের ছবি</li>
                      <li>ডকুমেন্টস</li>
                      <li>লোগো ও মিডিয়া</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <p className="font-medium">💡 পরামর্শ</p>
                <p className="mt-1">
                  প্রতি সপ্তাহে অন্তত একবার ব্যাকআপ নিন এবং নিরাপদ স্থানে সংরক্ষণ করুন।
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Item Status (when backing up) */}
        {tableStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                ব্যাকআপ স্ট্যাটাস
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tableStats.map((stat) => (
                  <div
                    key={stat.tableName}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      stat.type === "storage" ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
                    }`}
                  >
                    <span className="text-sm truncate flex-1">
                      {stat.type === "storage" && <Image className="h-3 w-3 inline mr-1" />}
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
                        <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                      )}
                      {stat.status === "completed" && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
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
