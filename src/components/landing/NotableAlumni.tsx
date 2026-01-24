import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, MapPin, Award, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

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

export function NotableAlumni() {
  const { data: alumni = [], isLoading } = useQuery({
    queryKey: ["notable-alumni-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notable_alumni")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("display_order")
        .limit(6);
      
      if (error) throw error;
      return data as Alumni[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (alumni.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <GraduationCap className="w-4 h-4" />
              আমাদের গর্ব
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              সফল প্রাক্তন ছাত্রবৃন্দ
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              মাদরাসা থেকে শিক্ষা সম্পন্ন করে যারা আজ দেশে-বিদেশে ইসলামের খেদমতে নিয়োজিত
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((person, index) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
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
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2 border-t pt-3">
                      {person.achievement}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/alumni">
              <Users className="w-4 h-4" />
              সব প্রাক্তন ছাত্র দেখুন
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
