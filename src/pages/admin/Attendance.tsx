 import { AdminLayout } from "@/components/layout/AdminLayout";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ClipboardCheck, History, BarChart3 } from "lucide-react";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { TakeAttendance } from "@/components/attendance/TakeAttendance";
 import { AttendanceHistory } from "@/components/attendance/AttendanceHistory";
 import { AttendanceReports } from "@/components/attendance/AttendanceReports";
 
 export default function AttendancePage() {
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
 
   return (
     <AdminLayout>
       <div className="space-y-6">
         {/* Header */}
         <div>
           <h1 className="text-2xl font-bold text-foreground">উপস্থিতি ব্যবস্থাপনা</h1>
           <p className="text-muted-foreground">ছাত্রদের দৈনিক উপস্থিতি নিন, ইতিহাস দেখুন এবং রিপোর্ট তৈরি করুন</p>
         </div>
 
         <Tabs defaultValue="take" className="space-y-6">
           <TabsList className="grid w-full max-w-md grid-cols-3">
             <TabsTrigger value="take" className="gap-2">
               <ClipboardCheck className="w-4 h-4" />
               উপস্থিতি নিন
             </TabsTrigger>
             <TabsTrigger value="history" className="gap-2">
               <History className="w-4 h-4" />
               ইতিহাস
             </TabsTrigger>
             <TabsTrigger value="reports" className="gap-2">
               <BarChart3 className="w-4 h-4" />
               রিপোর্ট
             </TabsTrigger>
           </TabsList>
 
           <TabsContent value="take">
             <TakeAttendance classes={classes} />
           </TabsContent>
 
           <TabsContent value="history">
             <AttendanceHistory classes={classes} />
           </TabsContent>
 
           <TabsContent value="reports">
             <AttendanceReports classes={classes} />
           </TabsContent>
         </Tabs>
       </div>
     </AdminLayout>
   );
 }
