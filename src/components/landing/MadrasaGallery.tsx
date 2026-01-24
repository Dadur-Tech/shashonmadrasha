import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Building2, Users2, BookOpen, Home } from "lucide-react";

// Placeholder images - these can be replaced with actual madrasa images
const galleryItems = [
  {
    id: 1,
    title: "মাদ্রাসা ভবন",
    icon: Building2,
    placeholder: true,
    color: "from-emerald-500 to-emerald-700",
  },
  {
    id: 2,
    title: "ক্লাসরুম",
    icon: BookOpen,
    placeholder: true,
    color: "from-blue-500 to-blue-700",
  },
  {
    id: 3,
    title: "মসজিদ",
    icon: Home,
    placeholder: true,
    color: "from-amber-500 to-amber-700",
  },
  {
    id: 4,
    title: "ছাত্রাবাস",
    icon: Users2,
    placeholder: true,
    color: "from-purple-500 to-purple-700",
  },
  {
    id: 5,
    title: "গ্রন্থাগার",
    icon: BookOpen,
    placeholder: true,
    color: "from-rose-500 to-rose-700",
  },
  {
    id: 6,
    title: "খেলার মাঠ",
    icon: Users2,
    placeholder: true,
    color: "from-teal-500 to-teal-700",
  },
];

export function MadrasaGallery() {
  return (
    <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Camera className="w-4 h-4 inline-block mr-2" />
            ফটো গ্যালারি
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            আমাদের ক্যাম্পাস
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            মাদ্রাসার বিভিন্ন স্থান ও কার্যক্রমের চিত্র
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                viewport={{ once: true }}
                className={index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
              >
                <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300 group h-full">
                  <CardContent className="p-0 relative">
                    {item.placeholder ? (
                      <div className={`aspect-video md:aspect-square bg-gradient-to-br ${item.color} flex flex-col items-center justify-center text-white ${index === 0 ? 'h-full min-h-[300px] md:min-h-[400px]' : ''}`}>
                        <Icon className={`${index === 0 ? 'w-16 h-16' : 'w-10 h-10'} mb-3 opacity-80`} />
                        <p className={`${index === 0 ? 'text-xl' : 'text-sm'} font-medium`}>{item.title}</p>
                        <p className="text-xs opacity-70 mt-1">ছবি যুক্ত করুন</p>
                      </div>
                    ) : (
                      <div className="aspect-video md:aspect-square">
                        {/* Real image would go here */}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-all">
                        <Camera className="w-8 h-8 text-white" />
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
          className="text-center text-sm text-muted-foreground mt-6"
        >
          * এডমিন প্যানেল থেকে প্রকৃত ছবি আপলোড করুন
        </motion.p>
      </div>
    </section>
  );
}
