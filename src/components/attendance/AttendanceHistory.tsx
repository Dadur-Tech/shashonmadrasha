 import { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Calendar } from "@/components/ui/calendar";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { CalendarIcon, Loader2 } from "lucide-react";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 
 const statusLabels: Record<string, { label: string; color: string }> = {
   present: { label: "উপস্থিত", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
   absent: { label: "অনুপস্থিত", color: "bg-destructive/10 text-destructive border-destructive/20" },
   late: { label: "বিলম্বে", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
   leave: { label: "ছুটিতে", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
 };
 
 interface Props {
   classes: Array<{ id: string; name: string; department: string }>;
 }
 
 export function AttendanceHistory({ classes }: Props) {
   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
   const [selectedClass, setSelectedClass] = useState<string>("");
 
   const dateStr = selectedDate.toISOString().split('T')[0];
 
   const { data: attendance = [], isLoading } = useQuery({
     queryKey: ["attendance-history", selectedClass, dateStr],
     queryFn: async () => {
       if (!selectedClass) return [];
       const { data, error } = await supabase
         .from("student_attendance")
         .select(`
           *,
           student:students(id, student_id, full_name)
         `)
         .eq("class_id", selectedClass)
         .eq("date", dateStr);
       
       if (error) throw error;
       return data;
     },
     enabled: !!selectedClass,
   });
 
   const presentCount = attendance.filter(a => a.status === "present").length;
   const absentCount = attendance.filter(a => a.status === "absent").length;
   const lateCount = attendance.filter(a => a.status === "late").length;
 
   return (
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                     {cls.name} ({cls.department})
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </CardContent>
         </Card>
 
         {selectedClass && attendance.length > 0 && (
           <Card>
             <CardContent className="p-4">
               <div className="grid grid-cols-3 gap-2 text-center">
                 <div>
                   <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
                   <p className="text-xs text-muted-foreground">উপস্থিত</p>
                 </div>
                 <div>
                   <p className="text-2xl font-bold text-destructive">{absentCount}</p>
                   <p className="text-xs text-muted-foreground">অনুপস্থিত</p>
                 </div>
                 <div>
                   <p className="text-2xl font-bold text-amber-600">{lateCount}</p>
                   <p className="text-xs text-muted-foreground">বিলম্বে</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}
       </div>
 
       <div className="lg:col-span-2">
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center justify-between">
               <span>উপস্থিতি রেকর্ড</span>
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
             ) : isLoading ? (
               <div className="flex items-center justify-center py-10">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
               </div>
             ) : attendance.length === 0 ? (
               <div className="text-center py-10 text-muted-foreground">
                 এই তারিখে কোনো উপস্থিতি রেকর্ড নেই
               </div>
             ) : (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>আইডি</TableHead>
                     <TableHead>নাম</TableHead>
                     <TableHead>স্ট্যাটাস</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {attendance.map((record) => (
                     <TableRow key={record.id}>
                       <TableCell className="font-mono text-xs">
                         {record.student?.student_id}
                       </TableCell>
                       <TableCell>{record.student?.full_name}</TableCell>
                       <TableCell>
                         <Badge className={statusLabels[record.status]?.color || ""}>
                           {statusLabels[record.status]?.label || record.status}
                         </Badge>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             )}
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }