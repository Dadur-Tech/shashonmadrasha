import { motion } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  Heart, 
  FileText, 
  Video,
  BarChart3,
  Shield,
  Bell,
  Calendar,
  Smartphone,
  Cloud
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "ছাত্র ব্যবস্থাপনা",
    description: "সম্পূর্ণ ছাত্র তথ্য, ভর্তি, আইডি কার্ড, ডকুমেন্ট ও প্রোফাইল ম্যানেজমেন্ট",
    badge: "Core"
  },
  {
    icon: GraduationCap,
    title: "শিক্ষক ব্যবস্থাপনা",
    description: "শিক্ষক প্রোফাইল, যোগ্যতা, বেতন স্ট্রাকচার ও পারফরম্যান্স ট্র্যাকিং",
    badge: "Core"
  },
  {
    icon: CreditCard,
    title: "ফি ও পেমেন্ট",
    description: "বিকাশ, নগদ, রকেট, SSLCommerz - অটোমেটিক রিমাইন্ডার সহ",
    badge: "Premium"
  },
  {
    icon: Heart,
    title: "লিল্লাহ বোর্ডিং",
    description: "এতিম ও গরীব ছাত্রদের স্পন্সর ম্যানেজমেন্ট ও ট্র্যাকিং",
    badge: "Unique"
  },
  {
    icon: FileText,
    title: "রিপোর্ট ও এনালিটিক্স",
    description: "PDF রিপোর্ট, চার্ট, ডেটা এক্সপোর্ট ও বিস্তারিত বিশ্লেষণ",
    badge: "Pro"
  },
  {
    icon: Video,
    title: "অনলাইন ক্লাস",
    description: "লাইভ ক্লাস, রেকর্ডিং, শিডিউলিং ও স্টুডেন্ট এনগেজমেন্ট",
    badge: "Premium"
  },
  {
    icon: Calendar,
    title: "উপস্থিতি ব্যবস্থাপনা",
    description: "ছাত্র ও শিক্ষক উপস্থিতি, রিপোর্ট ও SMS নোটিফিকেশন",
    badge: "Core"
  },
  {
    icon: BarChart3,
    title: "পরীক্ষা ও ফলাফল",
    description: "পরীক্ষার সময়সূচি, মার্কশিট, গ্রেডিং ও রেজাল্ট পাবলিশ",
    badge: "Core"
  },
  {
    icon: Shield,
    title: "রোল ভিত্তিক অ্যাক্সেস",
    description: "Admin, Teacher, Accountant - প্রতিটি রোলের জন্য আলাদা পারমিশন",
    badge: "Security"
  },
  {
    icon: Bell,
    title: "স্মার্ট নোটিফিকেশন",
    description: "ফি রিমাইন্ডার, উপস্থিতি এলার্ট ও ইভেন্ট নোটিফিকেশন",
    badge: "Pro"
  },
  {
    icon: Smartphone,
    title: "মোবাইল রেসপন্সিভ",
    description: "যেকোনো ডিভাইসে সমানভাবে কাজ করে - ফোন, ট্যাবলেট, ডেস্কটপ",
    badge: "Core"
  },
  {
    icon: Cloud,
    title: "ক্লাউড ব্যাকআপ",
    description: "অটোমেটিক ডেটা ব্যাকআপ, সিকিউর স্টোরেজ ও ডেটা রিকভারি",
    badge: "Security"
  },
];

const badgeColors: Record<string, string> = {
  Core: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Premium: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Pro: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Unique: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Security: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ফিচার সমূহ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            সম্পূর্ণ মাদ্রাসা ম্যানেজমেন্ট সল্যুশন
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            একটি প্ল্যাটফর্মে আপনার মাদ্রাসার সব কাজ। সময় বাঁচান, দক্ষতা বাড়ান, 
            এবং আধুনিক প্রযুক্তির সুবিধা নিন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30 group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${badgeColors[feature.badge]}`}>
                        {feature.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
