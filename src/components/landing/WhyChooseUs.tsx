import { motion } from "framer-motion";
import { 
  Zap, 
  Shield, 
  Headphones, 
  RefreshCw,
  Globe,
  Lock
} from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "দ্রুত সেটআপ",
    description: "মাত্র ১০ মিনিটে আপনার মাদ্রাসার সম্পূর্ণ সিস্টেম চালু করুন। কোনো টেকনিক্যাল জ্ঞান লাগবে না।"
  },
  {
    icon: Shield,
    title: "১০০% নিরাপদ",
    description: "Bank-level encryption ও সিকিউরিটি। আপনার ডেটা সম্পূর্ণ সুরক্ষিত।"
  },
  {
    icon: Headphones,
    title: "২৪/৭ সাপোর্ট",
    description: "যেকোনো সমস্যায় আমাদের টিম সবসময় আপনার পাশে। ফোন, ইমেইল বা চ্যাট।"
  },
  {
    icon: RefreshCw,
    title: "নিয়মিত আপডেট",
    description: "প্রতি মাসে নতুন ফিচার ও উন্নতি। কোনো অতিরিক্ত খরচ ছাড়াই।"
  },
  {
    icon: Globe,
    title: "বাংলা ইন্টারফেস",
    description: "সম্পূর্ণ বাংলায় ইন্টারফেস। আরবি ও ইংরেজি সাপোর্টও আছে।"
  },
  {
    icon: Lock,
    title: "ডেটা মালিকানা",
    description: "আপনার ডেটা শুধুমাত্র আপনার। যেকোনো সময় এক্সপোর্ট করতে পারবেন।"
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            কেন আমরা?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ৫০০+ মাদ্রাসা কেন আমাদের বিশ্বাস করে
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            আমরা শুধু সফটওয়্যার বিক্রি করি না, আমরা আপনার মাদ্রাসার ডিজিটাল পার্টনার হতে চাই
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {reason.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
