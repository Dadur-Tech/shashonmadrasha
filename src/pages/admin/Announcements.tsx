import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

const typeOptions = [
  { value: "info", label: "তথ্য", icon: Info, color: "bg-blue-100 text-blue-700" },
  { value: "warning", label: "সতর্কতা", icon: AlertTriangle, color: "bg-amber-100 text-amber-700" },
  { value: "success", label: "সফল", icon: CheckCircle, color: "bg-emerald-100 text-emerald-700" },
  { value: "urgent", label: "জরুরি", icon: Megaphone, color: "bg-red-100 text-red-700" },
];

interface AnnouncementForm {
  title: string;
  message: string;
  type: string;
  is_active: boolean;
  link_url: string;
  link_text: string;
  end_date: string;
}

const defaultForm: AnnouncementForm = {
  title: "",
  message: "",
  type: "info",
  is_active: true,
  link_url: "",
  link_text: "",
  end_date: "",
};

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(defaultForm);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
        is_active: form.is_active,
        link_url: form.link_url || null,
        link_text: form.link_text || null,
        end_date: form.end_date || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast({ title: editingId ? "আপডেট হয়েছে" : "যোগ করা হয়েছে" });
      setDialogOpen(false);
      setEditingId(null);
      setForm(defaultForm);
    },
    onError: (error: Error) => {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast({ title: "মুছে ফেলা হয়েছে" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("announcements")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    },
  });

  const handleEdit = (announcement: any) => {
    setEditingId(announcement.id);
    setForm({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      is_active: announcement.is_active,
      link_url: announcement.link_url || "",
      link_text: announcement.link_text || "",
      end_date: announcement.end_date ? announcement.end_date.split("T")[0] : "",
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ঘোষণা ব্যানার</h1>
            <p className="text-muted-foreground">হোমপেজে প্রদর্শিত ঘোষণা পরিচালনা করুন</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="w-4 h-4" />
                নতুন ঘোষণা
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "ঘোষণা সম্পাদনা" : "নতুন ঘোষণা"}</DialogTitle>
                <DialogDescription>
                  হোমপেজে প্রদর্শিত ব্যানার ঘোষণা যোগ করুন
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>শিরোনাম *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="ঘোষণার শিরোনাম"
                  />
                </div>
                <div className="space-y-2">
                  <Label>বার্তা *</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="ঘোষণার বিস্তারিত বার্তা"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ধরন</Label>
                    <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <opt.icon className="w-4 h-4" />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>মেয়াদ শেষ তারিখ</Label>
                    <Input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>লিংক URL</Label>
                    <Input
                      value={form.link_url}
                      onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>লিংক টেক্সট</Label>
                    <Input
                      value={form.link_text}
                      onChange={(e) => setForm({ ...form, link_text: e.target.value })}
                      placeholder="বিস্তারিত দেখুন"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                  <Label>সক্রিয়</Label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={!form.title || !form.message || saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  সংরক্ষণ
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : announcements && announcements.length > 0 ? (
          <div className="grid gap-4">
            {announcements.map((announcement) => {
              const typeOpt = typeOptions.find((t) => t.value === announcement.type) || typeOptions[0];
              const TypeIcon = typeOpt.icon;

              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`border-l-4 ${announcement.is_active ? "border-l-primary" : "border-l-muted"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2 rounded-lg ${typeOpt.color}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                              <Badge variant={announcement.is_active ? "default" : "secondary"}>
                                {announcement.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">{announcement.message}</p>
                            {announcement.end_date && (
                              <p className="text-xs text-muted-foreground mt-2">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                মেয়াদ: {format(new Date(announcement.end_date), "d MMMM, yyyy", { locale: bn })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={announcement.is_active}
                            onCheckedChange={(checked) =>
                              toggleMutation.mutate({ id: announcement.id, is_active: checked })
                            }
                          />
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(announcement)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>মুছে ফেলবেন?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  এই ঘোষণাটি স্থায়ীভাবে মুছে ফেলা হবে।
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(announcement.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  মুছে ফেলুন
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">কোনো ঘোষণা নেই</h3>
              <p className="text-muted-foreground mb-4">হোমপেজে প্রদর্শনের জন্য নতুন ঘোষণা যোগ করুন</p>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="w-4 h-4" />
                নতুন ঘোষণা
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
