import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "মাওলানা আব্দুল কাদের",
    role: "অধ্যক্ষ, দারুল উলুম মাদ্রাসা",
    location: "সিলেট",
    content: "এই সফটওয়্যার আমাদের মাদ্রাসার কাজকে অনেক সহজ করে দিয়েছে। আগে যে কাজে ঘণ্টার পর ঘণ্টা লাগত, এখন মিনিটে হয়ে যায়।",
    rating: 5,
    avatar: "আক"
  },
  {
    name: "হাফেজ মোহাম্মদ ইউসুফ",
    role: "সুপারিনটেনডেন্ট, জামিয়া ইসলামিয়া",
    location: "চট্টগ্রাম",
    content: "লিল্লাহ বোর্ডিং মডিউল আমাদের জন্য গেম চেঞ্জার। এতিম ছাত্রদের স্পন্সর ম্যানেজমেন্ট এখন অনেক সহজ।",
    rating: 5,
    avatar: "ময়"
  },
  {
    name: "মুফতি আহমদ আলী",
    role: "পরিচালক, মাদ্রাসাতুল হুদা",
    location: "ঢাকা",
    content: "অনলাইন পেমেন্ট সিস্টেম চালু করার পর ফি কালেকশন ৪০% বেড়েছে। অভিভাবকরা বিকাশ দিয়ে সহজে ফি দিতে পারছেন।",
    rating: 5,
    avatar: "আআ"
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            গ্রাহকদের মতামত
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            আমাদের গ্রাহকরা কি বলছেন
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            সারা বাংলাদেশের মাদ্রাসা থেকে আসা প্রকৃত অভিজ্ঞতা
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
