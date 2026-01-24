import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DonationSection } from "@/components/donation/DonationCard";
import { OnlineAdmissionSection } from "@/components/admission/OnlineAdmissionForm";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { PricingSection } from "@/components/landing/PricingSection";
import { DemoPreview } from "@/components/landing/DemoPreview";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";

const stats = [
  { value: "৫০০+", label: "মাদ্রাসা" },
  { value: "৫০,০০০+", label: "ছাত্র" },
  { value: "৫,০০০+", label: "শিক্ষক" },
  { value: "৯৯.৯%", label: "আপটাইম" },
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
              <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                ডেমো
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                মূল্য
              </a>
              <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                FAQ
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
                #১ মাদ্রাসা ম্যানেজমেন্ট সফটওয়্যার বাংলাদেশে
              </span>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                আপনার মাদ্রাসাকে
                <span className="block text-gradient mt-2">ডিজিটাল করুন</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                ছাত্র ভর্তি, ফি ব্যবস্থাপনা, লিল্লাহ বোর্ডিং, পরীক্ষার ফলাফল - 
                সবকিছু এক প্ল্যাটফর্মে। বিকাশ, নগদ পেমেন্ট সাপোর্ট।
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/admin">
                  <Button size="lg" className="gap-2 px-8">
                    ১৪ দিন ফ্রি ট্রায়াল
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => {
                    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Phone className="w-4 h-4" />
                  ডেমো দেখুন
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                ✓ কোনো ক্রেডিট কার্ড লাগবে না &nbsp; ✓ ৫ মিনিটে সেটআপ &nbsp; ✓ ২৪/৭ সাপোর্ট
              </p>
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

      {/* Demo Preview Section */}
      <DemoPreview />

      {/* Features Section */}
      <FeaturesGrid />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Donation Section */}
      <DonationSection />

      {/* Online Admission Section */}
      <OnlineAdmissionSection />

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
              ১৪ দিন বিনামূল্যে ব্যবহার করুন। পছন্দ না হলে কোনো চার্জ নেই।
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/admin">
                <Button size="lg" variant="secondary" className="gap-2 px-8">
                  এখনই শুরু করুন
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="tel:+8801700000000">
                <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Phone className="w-4 h-4" />
                  কল করুন
                </Button>
              </a>
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
              <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                যোগাযোগ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                যোগাযোগ করুন
              </h2>
              <p className="text-muted-foreground">
                আমাদের সাথে যোগাযোগ করুন যেকোনো প্রশ্ন বা ডেমোর জন্য
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">ফোন / WhatsApp</h3>
                  <p className="text-muted-foreground">+৮৮০ ১৭০০-০০০০০০</p>
                  <p className="text-muted-foreground">+৮৮০ ১৮০০-০০০০০০</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">ইমেইল</h3>
                  <p className="text-muted-foreground">info@madrasa-saas.com</p>
                  <p className="text-muted-foreground">support@madrasa-saas.com</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">সাপোর্ট সময়</h3>
                  <p className="text-muted-foreground">সকাল ৯টা - রাত ১০টা</p>
                  <p className="text-muted-foreground">সপ্তাহে ৭ দিন</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">ج</span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">আল জামিয়া আরাবিয়া</h3>
                  <p className="text-xs text-muted-foreground">শাসন সিংগাতী মাদ্রাসা</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                বাংলাদেশের সবচেয়ে বিশ্বস্ত মাদ্রাসা ম্যানেজমেন্ট সফটওয়্যার। 
                আমরা ৫০০+ মাদ্রাসাকে ডিজিটাল করতে সাহায্য করেছি।
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">দ্রুত লিংক</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">বৈশিষ্ট্য</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">মূল্য তালিকা</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">সচরাচর জিজ্ঞাসা</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">যোগাযোগ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">আইনি</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">প্রাইভেসি পলিসি</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">টার্মস অব সার্ভিস</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">রিফান্ড পলিসি</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © ২০২৫ আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Made with ❤️ in Bangladesh</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
