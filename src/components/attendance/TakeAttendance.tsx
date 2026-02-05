 import { useState } from "react";
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
   Save,
   Clock,
 } from "lucide-react";
 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "@/hooks/use-toast";
 
 type AttendanceStatus = "present" | "absent" | "late" | "leave";
 
 interface Props {
   classes: Array<{ id: string; name: string; department: string }>;
 }
 
 export function TakeAttendance({ classes }: Props) {
   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
   const [selectedClass, setSelectedClass] = useState<string>("");
   const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceStatus>>({});
   const queryClient = useQueryClient();
 
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
   
   const { isLoading: attendanceLoading } = useQuery({
     queryKey: ["attendance", selectedClass, dateStr],
     queryFn: async () => {
       if (!selectedClass) return [];
       const { data, error } = await supabase
         .from("student_attendance")
         .select("*")
         .eq("class_id", selectedClass)
         .eq("date", dateStr);
       
       if (error) throw error;
       
       const attendanceMap: Record<string, AttendanceStatus> = {};
       data.forEach(a => {
         attendanceMap[a.student_id] = a.status as AttendanceStatus;
       });
       setLocalAttendance(attendanceMap);
       
       return data;
     },
     enabled: !!selectedClass,
   });
 
   const saveMutation = useMutation({
     mutationFn: async () => {
       await supabase
         .from("student_attendance")
         .delete()
         .eq("class_id", selectedClass)
         .eq("date", dateStr);
 
       const records = Object.entries(localAttendance).map(([studentId, status]) => ({
         student_id: studentId,
         class_id: selectedClass,
         date: dateStr,
         status: status,
       }));
 
       if (records.length > 0) {
         const { error } = await supabase
           .from("student_attendance")
           .insert(records);
         
         if (error) throw error;
       }
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["attendance"] });
       toast({ title: "সফল!", description: "উপস্থিতি সংরক্ষণ হয়েছে" });
     },
     onError: (error: Error) => {
       toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
     },
   });
 
   const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
     setLocalAttendance(prev => ({
       ...prev,
       [studentId]: status,
     }));
   };
 
   const presentCount = Object.values(localAttendance).filter(s => s === "present").length;
   const absentCount = Object.values(localAttendance).filter(s => s === "absent").length;
   const lateCount = Object.values(localAttendance).filter(s => s === "late").length;
 
   const markAllPresent = () => {
     const newAttendance: Record<string, AttendanceStatus> = {};
     students.forEach(s => {
       newAttendance[s.id] = "present";
     });
     setLocalAttendance(newAttendance);
   };
 
   return (
     <div className="space-y-6">
       <div className="flex justify-end">
         <Button 
           className="gap-2" 
           onClick={() => saveMutation.mutate()}
           disabled={saveMutation.isPending || !selectedClass || students.length === 0}
         >
           {saveMutation.isPending ? (
             <Loader2 className="w-4 h-4 animate-spin" />
           ) : (
             <Save className="w-4 h-4" />
           )}
           সংরক্ষণ করুন
         </Button>
       </div>
 
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
 
           {selectedClass && (
             <Card>
               <CardContent className="p-4">
                 <div className="grid grid-cols-4 gap-2 text-center">
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
                   <div>
                     <p className="text-2xl font-bold text-amber-600">{lateCount}</p>
                     <p className="text-xs text-muted-foreground">বিলম্বে</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           )}
 
           {selectedClass && students.length > 0 && (
             <Button variant="outline" className="w-full" onClick={markAllPresent}>
               সবাইকে উপস্থিত করুন
             </Button>
           )}
         </div>
 
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
               ) : studentsLoading || attendanceLoading ? (
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
                     const status = localAttendance[student.id] || "pending";
                     return (
                       <motion.div
                         key={student.id}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: index * 0.03 }}
                         className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                       >
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                             <span className="text-primary text-sm font-medium">
                               {student.full_name.charAt(0)}
                             </span>
                           </div>
                           <div>
                             <p className="font-medium">{student.full_name}</p>
                             <p className="text-xs text-muted-foreground">{student.student_id}</p>
                           </div>
                         </div>
                         <div className="flex gap-1">
                           <Button
                             size="sm"
                             variant={status === "present" ? "default" : "outline"}
                             className="gap-1 h-8"
                             onClick={() => handleStatusChange(student.id, "present")}
                           >
                             <CheckCircle2 className="w-3 h-3" />
                             উপস্থিত
                           </Button>
                           <Button
                             size="sm"
                             variant={status === "late" ? "default" : "outline"}
                             className="gap-1 h-8"
                             onClick={() => handleStatusChange(student.id, "late")}
                           >
                             <Clock className="w-3 h-3" />
                             বিলম্বে
                           </Button>
                           <Button
                             size="sm"
                             variant={status === "absent" ? "destructive" : "outline"}
                             className="gap-1 h-8"
                             onClick={() => handleStatusChange(student.id, "absent")}
                           >
                             <XCircle className="w-3 h-3" />
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
   );
 }