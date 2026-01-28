import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail, Calendar, User, Building, Info } from "lucide-react";

export function AboutMadrasa() {
  const { data: institution } = useQuery({
    queryKey: ["public-institution-info"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institution_settings")
        .select("*")
        .limit(1)
        .single();
      return data;
    },
  });

  const infoItems = [
    {
      icon: Building,
      label: "প্রতিষ্ঠানের নাম",
      value: institution?.name || "আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      icon: Calendar,
      label: "প্রতিষ্ঠাকাল",
      value: institution?.established_year ? `${institution.established_year} খ্রিস্টাব্দ` : "১৯৯০ খ্রিস্টাব্দ",
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      icon: User,
      label: "মুহতামিম/পরিচালক",
      value: institution?.principal_name || "মাওলানা মোহাম্মদ আবদুল্লাহ",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
    },
    {
      icon: MapPin,
      label: "ঠিকানা",
      value: institution?.address || "শাসন সিংগাতী, জেলা",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      icon: Phone,
      label: "যোগাযোগ",
      value: institution?.phone || "+৮৮০ ১৭XX-XXXXXX",
      color: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
    },
    {
      icon: Mail,
      label: "ইমেইল",
      value: institution?.email || "info@madrasa.com",
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-950/40",
    },
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-background to-secondary/30 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: About Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Info className="w-4 h-4" />
              আমাদের সম্পর্কে
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              ইসলামী শিক্ষার <br className="hidden md:block" />
              <span className="text-gradient">আলোকবর্তিকা</span>
            </h2>
            <div className="space-y-5 text-muted-foreground text-lg leading-relaxed">
              {(institution as any)?.description ? (
                <p>{(institution as any).description}</p>
              ) : (
                <>
                  <p>
                    <strong className="text-foreground">{institution?.name || "আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা"}</strong> দীর্ঘ 
                    সময় ধরে ইসলামী শিক্ষার আলো ছড়িয়ে যাচ্ছে। আমাদের লক্ষ্য হলো 
                    প্রতিটি ছাত্রকে দ্বীনি ইলম ও আধুনিক জ্ঞানে সুশিক্ষিত করে গড়ে তোলা।
                  </p>
                  <p>
                    এতিম ও অসহায় ছাত্রদের জন্য আমাদের বিশেষ <strong className="text-foreground">লিল্লাহ বোর্ডিং</strong> ব্যবস্থা 
                    রয়েছে, যেখানে তাদের সম্পূর্ণ বিনা খরচে থাকা, খাওয়া ও শিক্ষার ব্যবস্থা করা হয়।
                  </p>
                </>
              )}
            </div>
          </motion.div>

          {/* Right: Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-primary/20 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  প্রতিষ্ঠানের তথ্য
                </h3>
                <div className="space-y-4">
                  {infoItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 * index }}
                        viewport={{ once: true }}
                        className={`flex items-start gap-4 p-4 rounded-xl ${item.bgColor} border border-transparent hover:border-primary/20 transition-all`}
                      >
                        <div className={`w-11 h-11 rounded-xl bg-white dark:bg-background flex items-center justify-center shrink-0 shadow-sm`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                          <p className="font-semibold text-foreground">{item.value}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
