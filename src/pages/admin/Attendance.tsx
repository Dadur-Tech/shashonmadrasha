import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  CalendarIcon, 
  Users, 
  CheckCircle2, 
  XCircle,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>("");

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, department")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students-by-class", selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      const { data, error } = await supabase
        .from("students")
        .select("id, student_id, full_name")
        .eq("class_id", selectedClass)
        .eq("status", "active")
        .order("full_name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClass,
  });

  const dateStr = selectedDate.toISOString().split('T')[0];
  
  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance", selectedClass, dateStr],
    queryFn: async () => {
      if (!selectedClass) return [];
      const { data, error } = await supabase
        .from("student_attendance")
        .select("*")
        .eq("class_id", selectedClass)
        .eq("date", dateStr);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClass,
  });

  const attendanceMap = new Map(attendance.map(a => [a.student_id, a.status]));
  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">উপস্থিতি ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">ছাত্রদের দৈনিক উপস্থিতি নিন</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Calendar & Selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  তারিখ নির্বাচন
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ক্লাস নির্বাচন</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="ক্লাস নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedClass && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{students.length}</p>
                      <p className="text-xs text-muted-foreground">মোট</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
                      <p className="text-xs text-muted-foreground">উপস্থিত</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-destructive">{absentCount}</p>
                      <p className="text-xs text-muted-foreground">অনুপস্থিত</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right - Student List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    ছাত্র তালিকা
                  </span>
                  <Badge variant="outline">
                    {selectedDate.toLocaleDateString('bn-BD')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedClass ? (
                  <div className="text-center py-10 text-muted-foreground">
                    প্রথমে ক্লাস নির্বাচন করুন
                  </div>
                ) : studentsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    এই ক্লাসে কোনো ছাত্র নেই
                  </div>
                ) : (
                  <div className="space-y-2">
                    {students.map((student, index) => {
                      const status = attendanceMap.get(student.id) || "pending";
                      return (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-xs text-muted-foreground">{student.student_id}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={status === "present" ? "default" : "outline"}
                              className="gap-1"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              উপস্থিত
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "absent" ? "destructive" : "outline"}
                              className="gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              অনুপস্থিত
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
