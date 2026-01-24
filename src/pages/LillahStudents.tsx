import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Users, Baby, Home, ArrowLeft, Search, Phone, MapPin, BookOpen } from "lucide-react";
import { useState } from "react";

export default function LillahStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Fetch all lillah students
  const { data: lillahStudents = [], isLoading } = useQuery({
    queryKey: ["all-lillah-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          student_id,
          full_name,
          father_name,
          photo_url,
          address,
          guardian_phone,
          is_orphan,
          lillah_reason,
          sponsor_id,
          classes(name, department),
          sponsors(full_name)
        `)
        .eq("is_lillah", true)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Filter students
  const filteredStudents = lillahStudents.filter((student: any) => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.student_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "orphan") return matchesSearch && student.is_orphan;
    if (filterType === "sponsored") return matchesSearch && student.sponsor_id;
    if (filterType === "needs_sponsor") return matchesSearch && !student.sponsor_id;
    
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: lillahStudents.length,
    orphans: lillahStudents.filter((s: any) => s.is_orphan).length,
    sponsored: lillahStudents.filter((s: any) => s.sponsor_id).length,
    needsSponsorship: lillahStudents.filter((s: any) => !s.sponsor_id).length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>হোম</span>
            </Link>
            <h1 className="font-bold text-foreground">লিল্লাহ বোর্ডিং</h1>
            <a href="/#donate">
              <Button size="sm" className="gap-2">
                <Heart className="w-4 h-4" />
                দান করুন
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-rose-50 to-background dark:from-rose-950/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-semibold mb-4">
              <Heart className="w-4 h-4" />
              এতিম ও গরীব ছাত্র
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              লিল্লাহ বোর্ডিং ছাত্র তালিকা
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              যে সকল ছাত্র এতিম বা গরীব এবং মাদ্রাসায় বিনামূল্যে পড়াশোনা ও থাকা-খাওয়ার সুবিধা পাচ্ছে
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: "মোট লিল্লাহ ছাত্র", value: stats.total, icon: Home, color: "text-rose-600" },
              { label: "এতিম ছাত্র", value: stats.orphans, icon: Baby, color: "text-purple-600" },
              { label: "স্পন্সরড", value: stats.sponsored, icon: Heart, color: "text-emerald-600" },
              { label: "স্পন্সরশীপ প্রয়োজন", value: stats.needsSponsorship, icon: Users, color: "text-amber-600" },
            ].map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="p-4">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString('bn-BD')}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="নাম বা আইডি দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="ফিল্টার করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সকল ছাত্র</SelectItem>
                <SelectItem value="orphan">শুধু এতিম</SelectItem>
                <SelectItem value="sponsored">স্পন্সরড</SelectItem>
                <SelectItem value="needs_sponsor">স্পন্সরশীপ প্রয়োজন</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Students Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">লোড হচ্ছে...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">কোন ছাত্র পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStudents.map((student: any, index: number) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * (index % 8) }}
                >
                  <Link to={`/student/${student.student_id}`}>
                    <Card className="h-full hover:shadow-lg transition-all group cursor-pointer overflow-hidden border-rose-200/50 dark:border-rose-800/50">
                      <div className="h-1.5 bg-gradient-to-r from-rose-400 to-purple-400" />
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Photo */}
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-rose-100 to-purple-100 dark:from-rose-900/30 dark:to-purple-900/30 border-2 border-rose-300 dark:border-rose-700">
                              {student.photo_url ? (
                                <img 
                                  src={student.photo_url} 
                                  alt={student.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-rose-600 dark:text-rose-400 text-xl font-bold">
                                  {student.full_name.charAt(0)}
                                </div>
                              )}
                            </div>
                            {student.is_orphan && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-sm" title="এতিম">
                                <Baby className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground group-hover:text-rose-600 transition-colors truncate">
                              {student.full_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {student.father_name && `পিতা: ${student.father_name}`}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {student.is_orphan && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                                  <Baby className="w-3 h-3" />
                                  এতিম
                                </span>
                              )}
                              {student.sponsor_id ? (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                                  <Heart className="w-3 h-3" />
                                  স্পন্সরড
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                                  স্পন্সরশীপ প্রয়োজন
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
                          {student.classes?.name && (
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{student.classes.name}</span>
                            </div>
                          )}
                          {student.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{student.address}</span>
                            </div>
                          )}
                          {student.lillah_reason && (
                            <p className="text-xs italic text-rose-600 dark:text-rose-400 line-clamp-2">
                              "{student.lillah_reason}"
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-rose-500 to-purple-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            একজন এতিমের স্পন্সর হোন
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            মাসিক মাত্র ৩,০০০ টাকায় একজন এতিম ছাত্রের শিক্ষা ও থাকা-খাওয়ার ব্যয় বহন করুন।
            আখিরাতের অফুরন্ত সওয়াব অর্জন করুন।
          </p>
          <a href="/#donate">
            <Button size="lg" variant="secondary" className="gap-2 px-10">
              <Heart className="w-5 h-5" />
              এখনই স্পন্সর করুন
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </footer>
    </div>
  );
}
