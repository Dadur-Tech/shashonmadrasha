 import { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Progress } from "@/components/ui/progress";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { Loader2, Printer, BarChart3, Users } from "lucide-react";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { openPrintWindow, generateReportHeader, generateReportFooter } from "@/lib/pdf-utils";
 
 const monthNames = [
   "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
   "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
 ];
 
 interface Props {
   classes: Array<{ id: string; name: string; department: string }>;
 }
 
 export function AttendanceReports({ classes }: Props) {
   const currentDate = new Date();
   const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
   const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
   const [selectedClass, setSelectedClass] = useState<string>("");
 
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
 
   // Get students in selected class
   const { data: students = [] } = useQuery({
     queryKey: ["class-students", selectedClass],
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
 
   // Get monthly attendance
   const { data: attendance = [], isLoading } = useQuery({
     queryKey: ["monthly-attendance", selectedClass, selectedMonth, selectedYear],
     queryFn: async () => {
       if (!selectedClass) return [];
       
       const startDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`;
       const lastDay = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
       const endDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${lastDay}`;
 
       const { data, error } = await supabase
         .from("student_attendance")
         .select("*")
         .eq("class_id", selectedClass)
         .gte("date", startDate)
         .lte("date", endDate);
       
       if (error) throw error;
       return data;
     },
     enabled: !!selectedClass,
   });
 
   // Calculate stats per student
   const studentStats = students.map(student => {
     const studentAttendance = attendance.filter(a => a.student_id === student.id);
     const present = studentAttendance.filter(a => a.status === "present").length;
     const absent = studentAttendance.filter(a => a.status === "absent").length;
     const late = studentAttendance.filter(a => a.status === "late").length;
     const total = present + absent + late;
     const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
 
     return {
       ...student,
       present,
       absent,
       late,
       total,
       percentage,
     };
   });
 
   // Overall stats
   const totalPresent = studentStats.reduce((sum, s) => sum + s.present, 0);
   const totalAbsent = studentStats.reduce((sum, s) => sum + s.absent, 0);
   const totalLate = studentStats.reduce((sum, s) => sum + s.late, 0);
   const overallPercentage = studentStats.length > 0 
     ? Math.round(studentStats.reduce((sum, s) => sum + s.percentage, 0) / studentStats.length) 
     : 0;
 
   const handlePrintReport = () => {
     if (!institution || !selectedClass) return;
     
     const selectedClassName = classes.find(c => c.id === selectedClass)?.name || "";
     
     const content = `
       ${generateReportHeader({
         title: "মাসিক উপস্থিতি রিপোর্ট",
         subtitle: `${selectedClassName} - ${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`,
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
             <div class="value">${students.length}</div>
           </div>
           <div class="summary-item">
             <div class="label">মোট উপস্থিত</div>
             <div class="value" style="color: #16a34a;">${totalPresent}</div>
           </div>
           <div class="summary-item">
             <div class="label">মোট অনুপস্থিত</div>
             <div class="value" style="color: #dc2626;">${totalAbsent}</div>
           </div>
           <div class="summary-item">
             <div class="label">গড় হার</div>
             <div class="value">${overallPercentage}%</div>
           </div>
         </div>
       </div>
 
       <table class="report-table">
         <thead>
           <tr>
             <th>ক্রম</th>
             <th>আইডি</th>
             <th>নাম</th>
             <th>উপস্থিত</th>
             <th>অনুপস্থিত</th>
             <th>বিলম্বে</th>
             <th>হার</th>
           </tr>
         </thead>
         <tbody>
           ${studentStats.map((s, i) => `
             <tr>
               <td>${i + 1}</td>
               <td>${s.student_id}</td>
               <td>${s.full_name}</td>
               <td style="color: #16a34a;">${s.present}</td>
               <td style="color: #dc2626;">${s.absent}</td>
               <td style="color: #d97706;">${s.late}</td>
               <td><strong>${s.percentage}%</strong></td>
             </tr>
           `).join("")}
         </tbody>
       </table>
 
       <div class="signature-area avoid-break">
         <div class="signature-box">
           <div class="signature-line">শ্রেণী শিক্ষক</div>
         </div>
         <div class="signature-box">
           <div class="signature-line">প্রধান শিক্ষক</div>
         </div>
       </div>
 
       ${generateReportFooter({
         title: "মাসিক উপস্থিতি রিপোর্ট",
         institution: {
           name: institution.name,
           nameEnglish: institution.name_english || "",
           address: institution.address || "",
           phone: institution.phone,
         },
       })}
     `;
 
     openPrintWindow(content, `উপস্থিতি রিপোর্ট - ${selectedClassName} - ${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`);
   };
 
   return (
     <div className="space-y-6">
       {/* Filters */}
       <Card>
         <CardContent className="p-4">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <Select value={selectedClass} onValueChange={setSelectedClass}>
               <SelectTrigger>
                 <SelectValue placeholder="ক্লাস নির্বাচন করুন" />
               </SelectTrigger>
               <SelectContent>
                 {classes.map((cls) => (
                   <SelectItem key={cls.id} value={cls.id}>
                     {cls.name} ({cls.department})
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
 
             <Select value={selectedMonth} onValueChange={setSelectedMonth}>
               <SelectTrigger>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {monthNames.map((month, i) => (
                   <SelectItem key={i} value={(i + 1).toString()}>
                     {month}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
 
             <Select value={selectedYear} onValueChange={setSelectedYear}>
               <SelectTrigger>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {[2024, 2025, 2026].map((year) => (
                   <SelectItem key={year} value={year.toString()}>
                     {year}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
 
             <Button 
               onClick={handlePrintReport} 
               disabled={!selectedClass || studentStats.length === 0}
               className="gap-2"
             >
               <Printer className="w-4 h-4" />
               প্রিন্ট করুন
             </Button>
           </div>
         </CardContent>
       </Card>
 
       {/* Stats */}
       {selectedClass && (
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                   <Users className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{students.length}</p>
                   <p className="text-xs text-muted-foreground">মোট ছাত্র</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                   <BarChart3 className="w-5 h-5 text-emerald-600" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold text-emerald-600">{totalPresent}</p>
                   <p className="text-xs text-muted-foreground">মোট উপস্থিত</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                   <BarChart3 className="w-5 h-5 text-destructive" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold text-destructive">{totalAbsent}</p>
                   <p className="text-xs text-muted-foreground">মোট অনুপস্থিত</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                   <BarChart3 className="w-5 h-5 text-amber-600" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold text-amber-600">{overallPercentage}%</p>
                   <p className="text-xs text-muted-foreground">গড় উপস্থিতি</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
       )}
 
       {/* Student Stats Table */}
       <Card>
         <CardHeader>
           <CardTitle>ছাত্রভিত্তিক উপস্থিতি</CardTitle>
         </CardHeader>
         <CardContent>
           {!selectedClass ? (
             <div className="text-center py-10 text-muted-foreground">
               প্রথমে ক্লাস নির্বাচন করুন
             </div>
           ) : isLoading ? (
             <div className="flex items-center justify-center py-10">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : studentStats.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
               এই ক্লাসে কোনো ছাত্র নেই
             </div>
           ) : (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>আইডি</TableHead>
                   <TableHead>নাম</TableHead>
                   <TableHead className="text-center">উপস্থিত</TableHead>
                   <TableHead className="text-center">অনুপস্থিত</TableHead>
                   <TableHead className="text-center">বিলম্বে</TableHead>
                   <TableHead>উপস্থিতি হার</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {studentStats.map((student) => (
                   <TableRow key={student.id}>
                     <TableCell className="font-mono text-xs">{student.student_id}</TableCell>
                     <TableCell className="font-medium">{student.full_name}</TableCell>
                     <TableCell className="text-center text-emerald-600 font-medium">
                       {student.present}
                     </TableCell>
                     <TableCell className="text-center text-destructive font-medium">
                       {student.absent}
                     </TableCell>
                     <TableCell className="text-center text-amber-600 font-medium">
                       {student.late}
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center gap-2">
                         <Progress 
                           value={student.percentage} 
                           className="h-2 w-20"
                         />
                         <Badge 
                           variant={student.percentage >= 75 ? "default" : "destructive"}
                           className="min-w-[50px] justify-center"
                         >
                           {student.percentage}%
                         </Badge>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }