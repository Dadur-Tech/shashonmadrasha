import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Mic2, 
  Plus, 
  Trash2, 
  Loader2, 
  Search,
  Calendar,
  Settings,
  Check,
  ChevronsUpDown,
  RefreshCw,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, startOfWeek, addDays } from "date-fns";
import { bn } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface JamiyatCategory {
  id: string;
  name: string;
  name_arabic: string | null;
  icon: string | null;
  display_order: number;
}

interface Student {
  id: string;
  full_name: string;
  student_id: string;
  photo_url: string | null;
}

interface JamiyatEntry {
  id: string;
  week_start_date: string;
  category_id: string;
  student_id: string;
  category: JamiyatCategory;
  student: Student;
}

interface JamiyatSettings {
  id: string;
  is_enabled: boolean;
  auto_disable_days: number;
  last_updated_at: string;
}

export default function JamiyatManagement() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [studentSearchOpen, setStudentSearchOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  // Get current week's Saturday (start of Islamic week)
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 6 });
  const thisThursday = addDays(currentWeekStart, 5);

  const { data: categories = [] } = useQuery({
    queryKey: ["jamiyat-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jamiyat_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as JamiyatCategory[];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["all-students-simple"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, student_id, photo_url")
        .eq("status", "active")
        .order("full_name");
      if (error) throw error;
      return data as Student[];
    },
  });

  const { data: currentSchedule = [], isLoading } = useQuery({
    queryKey: ["weekly-jamiyat-admin", currentWeekStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_jamiyat")
        .select(`
          id,
          week_start_date,
          category_id,
          student_id,
          category:jamiyat_categories(id, name, name_arabic, icon, display_order),
          student:students(id, full_name, student_id, photo_url)
        `)
        .eq("week_start_date", currentWeekStart.toISOString().split('T')[0])
        .eq("is_active", true);
      
      if (error) throw error;
      return data as unknown as JamiyatEntry[];
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["jamiyat-settings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jamiyat_settings")
        .select("*")
        .single();
      if (error) throw error;
      return data as JamiyatSettings;
    },
  });

  const addEntryMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCategory || !selectedStudent) {
        throw new Error("ক্যাটাগরি ও ছাত্র নির্বাচন করুন");
      }

      const { error } = await supabase
        .from("weekly_jamiyat")
        .insert({
          week_start_date: currentWeekStart.toISOString().split('T')[0],
          category_id: selectedCategory,
          student_id: selectedStudent,
        });
      
      if (error) throw error;

      // Update last_updated_at in settings
      await supabase
        .from("jamiyat_settings")
        .update({ last_updated_at: new Date().toISOString() })
        .eq("id", settings?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-jamiyat-admin"] });
      queryClient.invalidateQueries({ queryKey: ["jamiyat-settings-admin"] });
      setSelectedCategory("");
      setSelectedStudent("");
      toast({ title: "সফল!", description: "জমিয়াত তালিকায় যোগ হয়েছে" });
    },
    onError: (error: any) => {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message.includes("duplicate") ? "এই ছাত্র ইতিমধ্যে এই ক্যাটাগরিতে আছে" : error.message,
        variant: "destructive",
      });
    },
  });

  const removeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("weekly_jamiyat")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-jamiyat-admin"] });
      toast({ title: "সফল!", description: "তালিকা থেকে সরানো হয়েছে" });
    },
  });

  const toggleSettingsMutation = useMutation({
    mutationFn: async (is_enabled: boolean) => {
      const { error } = await supabase
        .from("jamiyat_settings")
        .update({ is_enabled, last_updated_at: new Date().toISOString() })
        .eq("id", settings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jamiyat-settings-admin"] });
      toast({ title: "সফল!", description: "সেটিংস আপডেট হয়েছে" });
    },
  });

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students.slice(0, 50);
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.student_id.toLowerCase().includes(studentSearch.toLowerCase())
    ).slice(0, 50);
  }, [students, studentSearch]);

  // Group schedule by category
  const groupedSchedule = useMemo(() => {
    return currentSchedule.reduce((acc, entry) => {
      const categoryId = entry.category_id;
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: entry.category,
          entries: [],
        };
      }
      acc[categoryId].entries.push(entry);
      return acc;
    }, {} as Record<string, { category: JamiyatCategory; entries: JamiyatEntry[] }>);
  }, [currentSchedule]);

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Mic2 className="w-6 h-6" />
              সাপ্তাহিক জমিয়াত ব্যবস্থাপনা
            </h1>
            <p className="text-muted-foreground">
              প্রতি বৃহস্পতিবার জোহরের পর গজল, কিরাত, ওয়াজ ইত্যাদির তালিকা
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label>জমিয়াত সেকশন:</Label>
              <Switch
                checked={settings?.is_enabled ?? true}
                onCheckedChange={(checked) => toggleSettingsMutation.mutate(checked)}
              />
              <Badge variant={settings?.is_enabled ? "default" : "secondary"}>
                {settings?.is_enabled ? "চালু" : "বন্ধ"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Current Week Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              এই সপ্তাহের জমিয়াত
            </CardTitle>
            <CardDescription>
              বৃহস্পতিবার, {format(thisThursday, "d MMMM yyyy", { locale: bn })} — জোহরের নামাজের পর
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Add Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              নতুন এন্ট্রি যোগ করুন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label>ক্যাটাগরি নির্বাচন করুন</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="ক্যাটাগরি বাছুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon || "🎯"}</span>
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[300px]">
                <Label>ছাত্র খুঁজুন ও নির্বাচন করুন</Label>
                <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={studentSearchOpen}
                      className="w-full justify-between"
                    >
                      {selectedStudentData ? (
                        <span className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={selectedStudentData.photo_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {selectedStudentData.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {selectedStudentData.full_name} ({selectedStudentData.student_id})
                        </span>
                      ) : (
                        "ছাত্র খুঁজুন..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="নাম বা আইডি দিয়ে খুঁজুন..." 
                        value={studentSearch}
                        onValueChange={setStudentSearch}
                      />
                      <CommandList>
                        <CommandEmpty>কোনো ছাত্র পাওয়া যায়নি</CommandEmpty>
                        <CommandGroup>
                          {filteredStudents.map((student) => (
                            <CommandItem
                              key={student.id}
                              value={student.id}
                              onSelect={() => {
                                setSelectedStudent(student.id);
                                setStudentSearchOpen(false);
                              }}
                            >
                              <Avatar className="w-8 h-8 mr-2">
                                <AvatarImage src={student.photo_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {student.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{student.full_name}</p>
                                <p className="text-xs text-muted-foreground">আইডি: {student.student_id}</p>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedStudent === student.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={() => addEntryMutation.mutate()}
                disabled={!selectedCategory || !selectedStudent || addEntryMutation.isPending}
                className="gap-2"
              >
                {addEntryMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                যোগ করুন
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>এই সপ্তাহের তালিকা ({currentSchedule.length} জন)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : currentSchedule.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mic2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>এই সপ্তাহের জন্য কোনো তালিকা নেই</p>
                <p className="text-sm">উপরে থেকে ছাত্র যোগ করুন</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.values(groupedSchedule)
                  .sort((a, b) => a.category.display_order - b.category.display_order)
                  .map((group) => (
                    <div key={group.category.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{group.category.icon || "🎯"}</span>
                        <div>
                          <h3 className="font-bold text-foreground">{group.category.name}</h3>
                          {group.category.name_arabic && (
                            <p className="text-sm text-muted-foreground font-arabic">
                              {group.category.name_arabic}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="ml-auto">
                          {group.entries.length} জন
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 group"
                          >
                            <Avatar className="w-10 h-10 border">
                              <AvatarImage src={entry.student.photo_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {entry.student.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {entry.student.full_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                আইডি: {entry.student.student_id}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 text-destructive"
                              onClick={() => removeEntryMutation.mutate(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
