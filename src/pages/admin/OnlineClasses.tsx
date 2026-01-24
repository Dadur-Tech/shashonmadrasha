import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Plus, 
  Video, 
  Calendar,
  Loader2,
  ExternalLink,
  Clock,
  Users,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  live: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  completed: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  scheduled: "নির্ধারিত",
  live: "লাইভ",
  completed: "সম্পন্ন",
  cancelled: "বাতিল",
};

export default function OnlineClassesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: onlineClasses = [], isLoading } = useQuery({
    queryKey: ["online-classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("online_classes")
        .select(`
          *,
          class:classes(name),
          teacher:teachers(full_name)
        `)
        .order("scheduled_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["classes-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name")
        .eq("is_active", true);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, full_name")
        .eq("status", "active");
      
      if (error) throw error;
      return data;
    },
  });

  const upcomingClasses = onlineClasses.filter(c => c.status === "scheduled");
  const completedClasses = onlineClasses.filter(c => c.status === "completed");

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">অনলাইন ক্লাস</h1>
            <p className="text-muted-foreground">লাইভ ক্লাস এবং রেকর্ডিং ব্যবস্থাপনা</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                নতুন ক্লাস শিডিউল
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন অনলাইন ক্লাস</DialogTitle>
              </DialogHeader>
              <AddOnlineClassForm 
                classes={classes}
                teachers={teachers}
                onSuccess={() => {
                  setIsAddOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["online-classes"] });
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{onlineClasses.length}</p>
                  <p className="text-sm text-muted-foreground">মোট ক্লাস</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingClasses.length}</p>
                  <p className="text-sm text-muted-foreground">আসন্ন ক্লাস</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedClasses.length}</p>
                  <p className="text-sm text-muted-foreground">সম্পন্ন ক্লাস</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onlineClasses.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{cls.title}</CardTitle>
                      <Badge className={statusColors[cls.status || "scheduled"]}>
                        {statusLabels[cls.status || "scheduled"]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cls.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {cls.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{cls.class?.name || "সকল ক্লাস"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(cls.scheduled_at).toLocaleString('bn-BD')}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {cls.duration_minutes} মিনিট
                      </div>
                      
                      {cls.meeting_link && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-2"
                          onClick={() => window.open(cls.meeting_link, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                          ক্লাসে যোগ দিন
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {onlineClasses.length === 0 && (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                কোনো অনলাইন ক্লাস নেই
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function AddOnlineClassForm({ classes, teachers, onSuccess }: { 
  classes: any[]; 
  teachers: any[]; 
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    teacherId: "",
    scheduledAt: "",
    duration: "60",
    meetingLink: "",
    platform: "zoom",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.scheduledAt) {
      toast({ title: "শিরোনাম এবং সময় দিন", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("online_classes").insert({
      title: formData.title,
      description: formData.description || null,
      class_id: formData.classId || null,
      teacher_id: formData.teacherId || null,
      scheduled_at: formData.scheduledAt,
      duration_minutes: parseInt(formData.duration),
      meeting_link: formData.meetingLink || null,
      meeting_platform: formData.platform,
      status: "scheduled",
    });

    setLoading(false);
    if (error) {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: "ক্লাস শিডিউল হয়েছে" });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>ক্লাসের শিরোনাম *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="তাফসীর ক্লাস"
        />
      </div>
      <div>
        <Label>বিবরণ</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="ক্লাসের বিষয়বস্তু..."
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>ক্লাস</Label>
          <Select value={formData.classId} onValueChange={(v) => setFormData({ ...formData, classId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>শিক্ষক</Label>
          <Select value={formData.teacherId} onValueChange={(v) => setFormData({ ...formData, teacherId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>{teacher.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>তারিখ ও সময় *</Label>
          <Input
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
          />
        </div>
        <div>
          <Label>সময়কাল (মিনিট)</Label>
          <Input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>মিটিং লিংক</Label>
        <Input
          value={formData.meetingLink}
          onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
          placeholder="https://zoom.us/j/..."
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        ক্লাস শিডিউল করুন
      </Button>
    </form>
  );
}
