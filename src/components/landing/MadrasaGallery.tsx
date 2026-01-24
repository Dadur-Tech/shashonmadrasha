import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Building2, Users2, BookOpen, Home, Image } from "lucide-react";

const galleryItems = [
  {
    id: 1,
    title: "মাদ্রাসা ভবন",
    icon: Building2,
    placeholder: true,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    id: 2,
    title: "ক্লাসরুম",
    icon: BookOpen,
    placeholder: true,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    id: 3,
    title: "মসজিদ",
    icon: Home,
    placeholder: true,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    id: 4,
    title: "ছাত্রাবাস",
    icon: Users2,
    placeholder: true,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
  },
  {
    id: 5,
    title: "গ্রন্থাগার",
    icon: BookOpen,
    placeholder: true,
    color: "from-rose-500 to-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
  },
  {
    id: 6,
    title: "খেলার মাঠ",
    icon: Users2,
    placeholder: true,
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-950/40",
  },
];

export function MadrasaGallery() {
  return (
    <section className="py-20 bg-gradient-to-b from-secondary/40 to-background relative overflow-hidden">
      {/* Decorative Element */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full -translate-x-1/2 blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
          >
            <Image className="w-4 h-4" />
            ফটো গ্যালারি
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            আমাদের ক্যাম্পাস
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            মাদ্রাসার বিভিন্ন স্থান ও কার্যক্রমের চিত্র
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {galleryItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 * index }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className={index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
              >
                <Card className="overflow-hidden border-2 border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 group h-full">
                  <CardContent className="p-0 relative">
                    {item.placeholder ? (
                      <div className={`aspect-video md:aspect-square bg-gradient-to-br ${item.color} flex flex-col items-center justify-center text-white ${index === 0 ? 'h-full min-h-[250px] md:min-h-[400px]' : 'min-h-[150px]'}`}>
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
                          <Icon className={`${index === 0 ? 'w-10 h-10' : 'w-8 h-8'}`} />
                        </div>
                        <p className={`${index === 0 ? 'text-xl' : 'text-sm'} font-bold mb-1`}>{item.title}</p>
                        <p className="text-xs opacity-80">ছবি যুক্ত করুন</p>
                      </div>
                    ) : (
                      <div className="aspect-video md:aspect-square" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 duration-300">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Camera className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          * এডমিন প্যানেল থেকে প্রকৃত ছবি আপলোড করুন
        </motion.p>
      </div>
    </section>
  );
}
