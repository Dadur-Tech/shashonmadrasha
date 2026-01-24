import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mic, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Clock,
  Users,
  Loader2,
  Save,
  Star,
  Image,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

const eventTypeOptions = [
  { value: "mahfil", label: "ওয়াজ মাহফিল" },
  { value: "program", label: "অনুষ্ঠান" },
  { value: "meeting", label: "সভা" },
  { value: "other", label: "অন্যান্য" },
];

interface EventForm {
  title: string;
  title_arabic: string;
  description: string;
  event_type: string;
  event_date: string;
  event_time: string;
  end_date: string;
  location: string;
  chief_guest: string;
  registration_link: string;
  is_featured: boolean;
  is_active: boolean;
}

const defaultForm: EventForm = {
  title: "",
  title_arabic: "",
  description: "",
  event_type: "mahfil",
  event_date: "",
  event_time: "",
  end_date: "",
  location: "",
  chief_guest: "",
  registration_link: "",
  is_featured: false,
  is_active: true,
};

export default function EventsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(defaultForm);

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        title_arabic: form.title_arabic || null,
        description: form.description || null,
        event_type: form.event_type,
        event_date: form.event_date,
        event_time: form.event_time || null,
        end_date: form.end_date || null,
        location: form.location || null,
        chief_guest: form.chief_guest || null,
        registration_link: form.registration_link || null,
        is_featured: form.is_featured,
        is_active: form.is_active,
      };

      if (editingId) {
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("events")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
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
        .from("events")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({ title: "মুছে ফেলা হয়েছে" });
    },
  });

  const handleEdit = (event: any) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      title_arabic: event.title_arabic || "",
      description: event.description || "",
      event_type: event.event_type,
      event_date: event.event_date,
      event_time: event.event_time || "",
      end_date: event.end_date || "",
      location: event.location || "",
      chief_guest: event.chief_guest || "",
      registration_link: event.registration_link || "",
      is_featured: event.is_featured,
      is_active: event.is_active,
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const isPastEvent = (date: string) => new Date(date) < new Date();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">অনুষ্ঠান ও মাহফিল</h1>
            <p className="text-muted-foreground">বার্ষিক ওয়াজ মাহফিল ও অন্যান্য অনুষ্ঠান পরিচালনা করুন</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="w-4 h-4" />
                নতুন অনুষ্ঠান
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "অনুষ্ঠান সম্পাদনা" : "নতুন অনুষ্ঠান"}</DialogTitle>
                <DialogDescription>
                  বার্ষিক ওয়াজ মাহফিল বা অন্যান্য অনুষ্ঠানের তথ্য যোগ করুন
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>শিরোনাম (বাংলা) *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="বার্ষিক ওয়াজ মাহফিল ২০২৬"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>শিরোনাম (আরবি)</Label>
                    <Input
                      value={form.title_arabic}
                      onChange={(e) => setForm({ ...form, title_arabic: e.target.value })}
                      placeholder="المحفل السنوي"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>বিবরণ</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="অনুষ্ঠানের বিস্তারিত বিবরণ..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>ধরন *</Label>
                    <Select value={form.event_type} onValueChange={(val) => setForm({ ...form, event_type: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>তারিখ *</Label>
                    <Input
                      type="date"
                      value={form.event_date}
                      onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>সময়</Label>
                    <Input
                      type="time"
                      value={form.event_time}
                      onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>স্থান</Label>
                    <Input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="মাদরাসা প্রাঙ্গণ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>প্রধান অতিথি</Label>
                    <Input
                      value={form.chief_guest}
                      onChange={(e) => setForm({ ...form, chief_guest: e.target.value })}
                      placeholder="মাওলানা..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>রেজিস্ট্রেশন লিংক</Label>
                  <Input
                    value={form.registration_link}
                    onChange={(e) => setForm({ ...form, registration_link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={form.is_featured}
                      onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })}
                    />
                    <Label>ফিচার্ড (বড় করে দেখাবে)</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                    />
                    <Label>সক্রিয়</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={!form.title || !form.event_date || saveMutation.isPending}
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
        ) : events && events.length > 0 ? (
          <div className="grid gap-4">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`${isPastEvent(event.event_date) ? "opacity-60" : ""} ${event.is_featured ? "border-2 border-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${event.event_type === "mahfil" ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-blue-100 dark:bg-blue-900/40"}`}>
                          <Mic className={`w-6 h-6 ${event.event_type === "mahfil" ? "text-emerald-600" : "text-blue-600"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-foreground">{event.title}</h3>
                            {event.is_featured && (
                              <Badge className="bg-primary">
                                <Star className="w-3 h-3 mr-1" />
                                ফিচার্ড
                              </Badge>
                            )}
                            <Badge variant={event.is_active ? "secondary" : "outline"}>
                              {eventTypeOptions.find(t => t.value === event.event_type)?.label}
                            </Badge>
                            {isPastEvent(event.event_date) && (
                              <Badge variant="outline">শেষ হয়েছে</Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{event.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(event.event_date), "d MMMM, yyyy", { locale: bn })}
                            </span>
                            {event.event_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {event.event_time}
                              </span>
                            )}
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                            )}
                            {event.chief_guest && (
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {event.chief_guest}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
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
                                এই অনুষ্ঠানটি স্থায়ীভাবে মুছে ফেলা হবে।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(event.id)}
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
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Mic className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">কোনো অনুষ্ঠান নেই</h3>
              <p className="text-muted-foreground mb-4">বার্ষিক ওয়াজ মাহফিল বা অন্যান্য অনুষ্ঠান যোগ করুন</p>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="w-4 h-4" />
                নতুন অনুষ্ঠান
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
