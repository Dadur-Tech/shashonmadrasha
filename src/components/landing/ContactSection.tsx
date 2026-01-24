import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function ContactSection() {
  const { data: institution } = useQuery({
    queryKey: ["institution-contact"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institution_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const contactInfo = [
    { 
      icon: Phone, 
      title: "ফোন", 
      lines: institution?.phone ? [institution.phone] : ["+৮৮০ ১৭XX-XXXXXX"], 
      color: "text-blue-600", 
      bgColor: "bg-blue-50 dark:bg-blue-950/40", 
      borderColor: "border-blue-200 dark:border-blue-800",
      link: institution?.phone ? `tel:${institution.phone.replace(/\s/g, '')}` : undefined
    },
    { 
      icon: Mail, 
      title: "ইমেইল", 
      lines: institution?.email ? [institution.email] : ["info@madrasa.com"], 
      color: "text-emerald-600", 
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40", 
      borderColor: "border-emerald-200 dark:border-emerald-800",
      link: institution?.email ? `mailto:${institution.email}` : undefined
    },
    { 
      icon: MapPin, 
      title: "ঠিকানা", 
      lines: institution?.address ? institution.address.split(",").map(s => s.trim()) : ["শাসন সিংগাতী", "বাংলাদেশ"], 
      color: "text-rose-600", 
      bgColor: "bg-rose-50 dark:bg-rose-950/40", 
      borderColor: "border-rose-200 dark:border-rose-800" 
    },
    { 
      icon: Clock, 
      title: "অফিস সময়", 
      lines: ["সকাল ৯টা - বিকাল ৫টা", "শুক্রবার বন্ধ"], 
      color: "text-amber-600", 
      bgColor: "bg-amber-50 dark:bg-amber-950/40", 
      borderColor: "border-amber-200 dark:border-amber-800" 
    },
  ];

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-secondary/50 to-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
            >
              <Phone className="w-4 h-4" />
              যোগাযোগ
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
            >
              আমাদের সাথে যোগাযোগ করুন
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-muted-foreground text-lg"
            >
              ভর্তি, দান বা যেকোনো তথ্যের জন্য যোগাযোগ করুন
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className={`text-center border-2 ${item.borderColor} ${item.bgColor} hover:shadow-xl transition-all duration-300 h-full`}>
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-background flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <item.icon className={`w-7 h-7 ${item.color}`} />
                    </div>
                    <h3 className="font-bold mb-3 text-foreground text-lg">{item.title}</h3>
                    {item.lines.map((line, i) => (
                      item.link ? (
                        <a 
                          key={i} 
                          href={item.link}
                          className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                        >
                          {line}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p key={i} className="text-muted-foreground">{line}</p>
                      )
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Website Link */}
          {institution?.website && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <a 
                href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                {institution.website}
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
