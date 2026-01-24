import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Heart, 
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Star,
  CreditCard,
  FileText,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DonationSection } from "@/components/donation/DonationCard";
import { OnlineAdmissionSection } from "@/components/admission/OnlineAdmissionForm";

const features = [
  {
    icon: Users,
    title: "ছাত্র ব্যবস্থাপনা",
    description: "সম্পূর্ণ ছাত্র তথ্য, ভর্তি প্রক্রিয়া, আইডি কার্ড এবং উপস্থিতি ব্যবস্থাপনা",
  },
  {
    icon: GraduationCap,
    title: "শিক্ষক ব্যবস্থাপনা",
    description: "শিক্ষক প্রোফাইল, বেতন, ক্লাস রুটিন এবং কর্মক্ষমতা মূল্যায়ন",
  },
  {
    icon: CreditCard,
    title: "ফি ও পেমেন্ট",
    description: "বিকাশ, নগদ, রকেট, SSLCommerz - সকল পেমেন্ট গেটওয়ে সাপোর্ট",
  },
  {
    icon: Heart,
    title: "লিল্লাহ বোর্ডিং",
    description: "এতিম ও গরীব ছাত্রদের জন্য বিশেষ ব্যবস্থাপনা ও স্পন্সর ম্যানেজমেন্ট",
  },
  {
    icon: FileText,
    title: "হিসাব ও রিপোর্ট",
    description: "আয়-ব্যয়, বেতন, PDF রিপোর্ট এবং প্রফেশনাল প্রিন্টিং",
  },
  {
    icon: Video,
    title: "অনলাইন ক্লাস",
    description: "লাইভ ক্লাস, রেকর্ডিং এবং ছাত্রদের সাথে সহজ যোগাযোগ",
  },
];

const stats = [
  { value: "১০০+", label: "ছাত্র" },
  { value: "১৫+", label: "শিক্ষক" },
  { value: "৩৫+", label: "বছরের অভিজ্ঞতা" },
  { value: "১০০%", label: "নিষ্ঠা" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background islamic-pattern">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">ج</span>
              </div>
              <div>
                <h1 className="font-bold text-foreground text-sm leading-tight">আল জামিয়া আরাবিয়া</h1>
                <p className="text-xs text-muted-foreground">শাসন সিংগাতী মাদ্রাসা</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                বৈশিষ্ট্য
              </a>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                আমাদের সম্পর্কে
              </a>
              <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                যোগাযোগ
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost">লগইন</Button>
              </Link>
              <Link to="/admin">
                <Button className="gap-2">
                  ড্যাশবোর্ড
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 hero-gradient opacity-5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6 text-center">
                <Star className="w-4 h-4 shrink-0" />
                Al Jamiya Arabia Shashon Singati Madrasa
              </span>
              
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                আল জামিয়া আরাবিয়া
                <span className="block text-gradient mt-2">শাসন সিংগাতী মাদ্রাসা</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                ছাত্র ভর্তি থেকে শুরু করে ফি ব্যবস্থাপনা, লিল্লাহ বোর্ডিং, পরীক্ষার ফলাফল - 
                সবকিছু এক জায়গায়। AI-ভিত্তিক স্মার্ট রিপোর্টিং ও অটোমেশন।
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/admin">
                  <Button size="lg" className="gap-2 px-8">
                    বিনামূল্যে শুরু করুন
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Phone className="w-4 h-4" />
                  ডেমো দেখুন
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-2xl bg-card border border-border"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Donation Section */}
      <DonationSection />

      {/* Online Admission Section */}
      <OnlineAdmissionSection />

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              সম্পূর্ণ মাদ্রাসা ম্যানেজমেন্ট
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              আপনার মাদ্রাসার সকল কাজ এক প্ল্যাটফর্মে। সময় বাঁচান, দক্ষতা বাড়ান।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-border hover:border-primary/30">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
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

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full islamic-pattern" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              আজই শুরু করুন আপনার মাদ্রাসার ডিজিটাল যাত্রা
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              বিনামূল্যে ট্রায়াল দিয়ে শুরু করুন। কোনো ক্রেডিট কার্ড লাগবে না।
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/admin">
                <Button size="lg" variant="secondary" className="gap-2 px-8">
                  এখনই শুরু করুন
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>১৪ দিন ফ্রি ট্রায়াল</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>২৪/৭ সাপোর্ট</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>সহজ সেটআপ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                যোগাযোগ করুন
              </h2>
              <p className="text-muted-foreground">
                আমাদের সাথে যোগাযোগ করুন যেকোনো প্রশ্ন বা সহায়তার জন্য
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">ফোন</h3>
                  <p className="text-muted-foreground">+৮৮০ ১৭XX-XXXXXX</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">ইমেইল</h3>
                  <p className="text-muted-foreground">info@madrasa-saas.com</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">সময়</h3>
                  <p className="text-muted-foreground">সকাল ৯টা - রাত ৯টা</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">ج</span>
              </div>
              <span className="font-semibold">আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © ২০২৫ আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা। সর্বস্বত্ব সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
