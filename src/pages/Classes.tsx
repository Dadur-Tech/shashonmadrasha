import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Video, 
  Play, 
  Clock, 
  Users, 
  Calendar,
  ArrowLeft,
  Search,
  Filter,
  BookOpen,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  live: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 animate-pulse",
  completed: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const statusLabels: Record<string, string> = {
  scheduled: "আসন্ন",
  live: "🔴 লাইভ",
  completed: "সম্পন্ন",
};

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Fetch all online classes
  const { data: allClasses = [], isLoading } = useQuery({
    queryKey: ["all-online-classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("online_classes")
        .select(`
          *,
          class:classes(id, name, department),
          teacher:teachers(full_name, photo_url)
        `)
        .order("scheduled_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ["public-departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch classes
  const { data: classOptions = [] } = useQuery({
    queryKey: ["public-classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, department")
        .eq("is_active", true);
      
      if (error) throw error;
      return data;
    },
  });

  // Filter classes
  const filteredClasses = allClasses.filter(cls => {
    const matchesSearch = cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacher?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === "all" || 
      cls.class?.department === selectedDepartment;
    
    const matchesClass = selectedClass === "all" || 
      cls.class?.id === selectedClass;
    
    return matchesSearch && matchesDepartment && matchesClass;
  });

  const upcomingClasses = filteredClasses.filter(c => c.status === "scheduled" || c.status === "live");
  const recordedClasses = filteredClasses.filter(c => c.status === "completed" && c.is_recorded && c.recording_url);
  const allCompletedClasses = filteredClasses.filter(c => c.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                হোমপেজে ফিরুন
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">
                অ্যাডমিন লগইন
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                অনলাইন ক্লাস ও রেকর্ডিং
              </h1>
              <p className="text-muted-foreground">
                ই-লার্নিং প্ল্যাটফর্ম | আল জামিয়া আরাবিয়া শাসন সিংগাতী
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allClasses.length}</p>
                  <p className="text-xs text-muted-foreground">মোট ক্লাস</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingClasses.length}</p>
                  <p className="text-xs text-muted-foreground">আসন্ন ক্লাস</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{recordedClasses.length}</p>
                  <p className="text-xs text-muted-foreground">রেকর্ডিং</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{departments.length}</p>
                  <p className="text-xs text-muted-foreground">বিভাগ</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ক্লাস বা শিক্ষকের নাম খুঁজুন..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="বিভাগ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল বিভাগ</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name_bengali}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[160px]">
                  <Users className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="ক্লাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল ক্লাস</SelectItem>
                  {classOptions.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="upcoming" className="gap-2">
                <Calendar className="w-4 h-4" />
                আসন্ন ({upcomingClasses.length})
              </TabsTrigger>
              <TabsTrigger value="recordings" className="gap-2">
                <Play className="w-4 h-4" />
                রেকর্ডিং ({recordedClasses.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <BookOpen className="w-4 h-4" />
                সকল ({filteredClasses.length})
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Classes Tab */}
            <TabsContent value="upcoming">
              {upcomingClasses.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">কোনো আসন্ন ক্লাস নেই</h3>
                  <p className="text-muted-foreground">শীঘ্রই নতুন ক্লাস যোগ হবে।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingClasses.map((cls, index) => (
                    <ClassCard key={cls.id} cls={cls} index={index} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Recordings Tab */}
            <TabsContent value="recordings">
              {recordedClasses.length === 0 ? (
                <div className="text-center py-16">
                  <Play className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">কোনো রেকর্ডিং নেই</h3>
                  <p className="text-muted-foreground">রেকর্ডিং শীঘ্রই যোগ হবে।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recordedClasses.map((cls, index) => (
                    <RecordingCard key={cls.id} cls={cls} index={index} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* All Classes Tab */}
            <TabsContent value="all">
              {filteredClasses.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">কোনো ক্লাস পাওয়া যায়নি</h3>
                  <p className="text-muted-foreground">অন্য ফিল্টার দিয়ে চেষ্টা করুন।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClasses.map((cls, index) => (
                    <ClassCard key={cls.id} cls={cls} index={index} showRecording />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা
          </p>
        </div>
      </footer>
    </div>
  );
}

function ClassCard({ cls, index, showRecording = false }: { cls: any; index: number; showRecording?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <Badge className={statusColors[cls.status || "scheduled"]}>
              {statusLabels[cls.status || "scheduled"]}
            </Badge>
            {cls.duration_minutes && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {cls.duration_minutes} মি.
              </span>
            )}
          </div>
          
          <h4 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-lg">
            {cls.title}
          </h4>
          
          {cls.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {cls.description}
            </p>
          )}

          <div className="space-y-2 text-sm">
            {cls.class?.name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{cls.class.name}</span>
                {cls.class.department && (
                  <Badge variant="outline" className="text-xs">
                    {cls.class.department}
                  </Badge>
                )}
              </div>
            )}
            
            {cls.teacher?.full_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="w-4 h-4" />
                <span>{cls.teacher.full_name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(cls.scheduled_at).toLocaleDateString('bn-BD', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-primary font-medium">
              <Clock className="w-4 h-4" />
              <span>
                {new Date(cls.scheduled_at).toLocaleTimeString('bn-BD', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {cls.meeting_link && (cls.status === "live" || cls.status === "scheduled") && (
              <Button 
                className="flex-1 gap-2"
                variant={cls.status === "live" ? "default" : "outline"}
                onClick={() => window.open(cls.meeting_link, "_blank")}
              >
                <Video className="w-4 h-4" />
                {cls.status === "live" ? "এখনই যোগ দিন" : "মিটিং লিংক"}
              </Button>
            )}
            
            {showRecording && cls.recording_url && (
              <Button 
                variant="secondary"
                className="flex-1 gap-2"
                onClick={() => window.open(cls.recording_url, "_blank")}
              >
                <Play className="w-4 h-4" />
                রেকর্ডিং
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RecordingCard({ cls, index }: { cls: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
    >
      <Card 
        className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden"
        onClick={() => cls.recording_url && window.open(cls.recording_url, "_blank")}
      >
        <div className="relative h-40 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-indigo-500/20 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-10 h-10 text-purple-600 ml-1" />
          </div>
          {cls.duration_minutes && (
            <Badge className="absolute bottom-3 right-3 bg-black/70 text-white">
              {cls.duration_minutes} মিনিট
            </Badge>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-purple-500/90 text-white">
              <Play className="w-3 h-3 mr-1" />
              রেকর্ডিং
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h4 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {cls.title}
          </h4>
          
          <div className="space-y-1 text-sm text-muted-foreground">
            {cls.teacher?.full_name && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>{cls.teacher.full_name}</span>
              </div>
            )}
            {cls.class?.name && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{cls.class.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(cls.scheduled_at).toLocaleDateString('bn-BD')}</span>
            </div>
          </div>

          <Button 
            variant="outline"
            className="w-full mt-4 gap-2 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            রেকর্ডিং দেখুন
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
