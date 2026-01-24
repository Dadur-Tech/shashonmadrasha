import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const plans = [
  {
    name: "বেসিক",
    nameEn: "Basic",
    price: "৫,০০০",
    period: "/মাস",
    description: "ছোট মাদ্রাসার জন্য উপযুক্ত",
    features: [
      "১০০ ছাত্র পর্যন্ত",
      "১০ শিক্ষক পর্যন্ত",
      "ছাত্র ও শিক্ষক ব্যবস্থাপনা",
      "উপস্থিতি ট্র্যাকিং",
      "বেসিক রিপোর্ট",
      "ইমেইল সাপোর্ট",
    ],
    notIncluded: [
      "পেমেন্ট গেটওয়ে",
      "অনলাইন ক্লাস",
      "SMS নোটিফিকেশন",
    ],
    popular: false,
    cta: "শুরু করুন",
  },
  {
    name: "প্রফেশনাল",
    nameEn: "Professional",
    price: "১০,০০০",
    period: "/মাস",
    description: "মাঝারি থেকে বড় মাদ্রাসার জন্য",
    features: [
      "৫০০ ছাত্র পর্যন্ত",
      "৫০ শিক্ষক পর্যন্ত",
      "সকল বেসিক ফিচার",
      "পেমেন্ট গেটওয়ে ইন্টিগ্রেশন",
      "অনলাইন ক্লাস সাপোর্ট",
      "SMS নোটিফিকেশন",
      "এডভান্সড রিপোর্ট ও এনালিটিক্স",
      "লিল্লাহ বোর্ডিং মডিউল",
      "প্রায়োরিটি সাপোর্ট",
    ],
    notIncluded: [],
    popular: true,
    cta: "সবচেয়ে জনপ্রিয়",
  },
  {
    name: "এন্টারপ্রাইজ",
    nameEn: "Enterprise",
    price: "কাস্টম",
    period: "",
    description: "বড় প্রতিষ্ঠান ও মাল্টি-ব্রাঞ্চের জন্য",
    features: [
      "আনলিমিটেড ছাত্র ও শিক্ষক",
      "মাল্টি-ব্রাঞ্চ সাপোর্ট",
      "সকল প্রফেশনাল ফিচার",
      "কাস্টম ইন্টিগ্রেশন",
      "ডেডিকেটেড সার্ভার",
      "২৪/৭ ফোন সাপোর্ট",
      "অন-সাইট ট্রেনিং",
      "কাস্টম ডেভেলপমেন্ট",
    ],
    notIncluded: [],
    popular: false,
    cta: "যোগাযোগ করুন",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            মূল্য তালিকা
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            আপনার প্রতিষ্ঠানের জন্য সঠিক প্ল্যান বেছে নিন
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            সকল প্ল্যানে ১৪ দিনের ফ্রি ট্রায়াল। কোনো ক্রেডিট কার্ড লাগবে না।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    <Star className="w-4 h-4" />
                    সবচেয়ে জনপ্রিয়
                  </span>
                </div>
              )}
              <Card className={`h-full ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-border'}`}>
                <CardHeader className="text-center pb-4">
                  <p className="text-sm text-muted-foreground">{plan.nameEn}</p>
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">৳{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 opacity-50">
                        <span className="w-5 h-5 flex items-center justify-center text-muted-foreground">✕</span>
                        <span className="text-sm text-muted-foreground line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          * সকল মূল্য বাংলাদেশি টাকায়। বার্ষিক সাবস্ক্রিপশনে ২০% ছাড়।
        </p>
      </div>
    </section>
  );
}
