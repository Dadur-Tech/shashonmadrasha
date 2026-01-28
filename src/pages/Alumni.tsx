import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, MapPin, Award, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/shared/PublicHeader";

interface Alumni {
  id: string;
  full_name: string;
  full_name_arabic: string | null;
  photo_url: string | null;
  graduation_year: number | null;
  current_position: string;
  current_institution: string | null;
  location: string | null;
  achievement: string | null;
  is_featured: boolean;
}

export default function AlumniPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: alumni = [], isLoading } = useQuery({
    queryKey: ["notable-alumni-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notable_alumni")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("display_order");
      
      if (error) throw error;
      return data as Alumni[];
    },
  });

  const filteredAlumni = alumni.filter((person) =>
    person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.current_position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.current_institution?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (person.location?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PublicHeader title="প্রাক্তন ছাত্রবৃন্দ" />

      {/* Hero Section */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <GraduationCap className="w-4 h-4" />
              আমাদের গর্ব
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              সফল প্রাক্তন ছাত্রবৃন্দ
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              আল জামিয়াতুল আরাবিয়া শাসন সিংগাতি মাদরাসা থেকে শিক্ষা সম্পন্ন করে যারা আজ দেশে-বিদেশে ইসলামের খেদমতে নিয়োজিত
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="নাম, পদবী বা প্রতিষ্ঠান দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Alumni Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold text-foreground mb-2">কোনো প্রাক্তন ছাত্র পাওয়া যায়নি</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "অন্য শব্দ দিয়ে খুঁজুন" : "শীঘ্রই প্রাক্তন ছাত্রদের তথ্য যোগ করা হবে"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              মোট {filteredAlumni.length} জন প্রাক্তন ছাত্র
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map((person, index) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border hover:border-primary/30">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-20 h-20 border-2 border-primary/20">
                          <AvatarImage src={person.photo_url || undefined} alt={person.full_name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                            {person.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground truncate">
                            {person.full_name}
                          </h3>
                          {person.full_name_arabic && (
                            <p className="text-sm text-muted-foreground font-arabic">
                              {person.full_name_arabic}
                            </p>
                          )}
                          {person.is_featured && (
                            <Badge variant="secondary" className="mt-1">
                              <Award className="w-3 h-3 mr-1" />
                              বিশেষ
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span className="text-foreground font-medium">{person.current_position}</span>
                        </div>
                        
                        {person.current_institution && (
                          <p className="text-sm text-muted-foreground pl-6">
                            {person.current_institution}
                          </p>
                        )}

                        {person.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{person.location}</span>
                          </div>
                        )}

                        {person.graduation_year && (
                          <p className="text-xs text-muted-foreground pl-6">
                            সনদপ্রাপ্তি: {person.graduation_year} সাল
                          </p>
                        )}
                      </div>

                      {person.achievement && (
                        <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
                          {person.achievement}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
