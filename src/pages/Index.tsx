import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  GraduationCap,
  Heart,
  Book,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { DonationSection } from "@/components/donation/DonationCard";
import { OnlineAdmissionSection } from "@/components/admission/OnlineAdmissionForm";
import { MadrasaStats } from "@/components/landing/MadrasaStats";
import { DepartmentStudents } from "@/components/landing/DepartmentStudents";
import { WeeklyMealSchedule } from "@/components/landing/WeeklyMealSchedule";
import { RecentResults } from "@/components/landing/RecentResults";
import { MadrasaGallery } from "@/components/landing/MadrasaGallery";
import { AboutMadrasa } from "@/components/landing/AboutMadrasa";

const navLinks = [
  { href: "#about", label: "পরিচিতি" },
  { href: "#departments", label: "বিভাগ" },
  { href: "#results", label: "ফলাফল" },
  { href: "#gallery", label: "গ্যালারি" },
  { href: "#donate", label: "দান" },
  { href: "#admission", label: "ভর্তি" },
  { href: "#contact", label: "যোগাযোগ" },
];

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background islamic-pattern">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
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
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/results" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  ফলাফল দেখুন
                </Button>
              </Link>
              <Link to="/login" className="hidden sm:block">
                <Button size="sm">
                  অ্যাডমিন লগইন
                </Button>
              </Link>
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-background border-b border-border py-4"
          >
            <div className="container mx-auto px-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Link to="/results" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    ফলাফল
                  </Button>
                </Link>
                <Link to="/login" className="flex-1">
                  <Button size="sm" className="w-full">
                    লগইন
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                بسم الله الرحمن الرحيم
              </span>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
                আল জামিয়া আরাবিয়া
                <span className="block text-gradient mt-2">শাসন সিংগাতী মাদ্রাসা</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                ইসলামী শিক্ষার আলোকবর্তিকা। কুরআন, হাদীস ও দ্বীনি ইলমের পাশাপাশি 
                আধুনিক শিক্ষায় সুদক্ষ আলেম-উলামা তৈরির প্রতিষ্ঠান।
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#admission">
                  <Button size="lg" className="gap-2 px-8">
                    <Book className="w-4 h-4" />
                    ভর্তি তথ্য
                  </Button>
                </a>
                <a href="#donate">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Heart className="w-4 h-4" />
                    দান করুন
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <MadrasaStats />

      {/* About Section */}
      <AboutMadrasa />

      {/* Department Students Section */}
      <div id="departments">
        <DepartmentStudents />
      </div>

      {/* Weekly Meal Schedule */}
      <WeeklyMealSchedule />

      {/* Recent Results Section */}
      <div id="results">
        <RecentResults />
      </div>

      {/* Gallery Section */}
      <div id="gallery">
        <MadrasaGallery />
      </div>

      {/* Donation Section */}
      <div id="donate">
        <DonationSection />
      </div>

      {/* Online Admission Section */}
      <div id="admission">
        <OnlineAdmissionSection />
      </div>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              >
                যোগাযোগ
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              >
                আমাদের সাথে যোগাযোগ করুন
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="text-muted-foreground"
              >
                ভর্তি, দান বা যেকোনো তথ্যের জন্য যোগাযোগ করুন
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">ফোন</h3>
                    <p className="text-muted-foreground text-sm">+৮৮০ ১৭XX-XXXXXX</p>
                    <p className="text-muted-foreground text-sm">+৮৮০ ১৮XX-XXXXXX</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">ইমেইল</h3>
                    <p className="text-muted-foreground text-sm">info@madrasa.com</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">ঠিকানা</h3>
                    <p className="text-muted-foreground text-sm">শাসন সিংগাতী</p>
                    <p className="text-muted-foreground text-sm">বাংলাদেশ</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">অফিস সময়</h3>
                    <p className="text-muted-foreground text-sm">সকাল ৯টা - বিকাল ৫টা</p>
                    <p className="text-muted-foreground text-sm">শুক্রবার বন্ধ</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">ج</span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">আল জামিয়া আরাবিয়া</h3>
                  <p className="text-xs text-muted-foreground">শাসন সিংগাতী মাদ্রাসা</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                ইসলামী শিক্ষার আলোকবর্তিকা। কুরআন, হাদীস ও দ্বীনি ইলমের পাশাপাশি 
                চরিত্র গঠন ও নৈতিক শিক্ষায় আলোকিত প্রতিষ্ঠান।
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">দ্রুত লিংক</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-foreground transition-colors">পরিচিতি</a></li>
                <li><a href="#departments" className="hover:text-foreground transition-colors">বিভাগ সমূহ</a></li>
                <li><Link to="/results" className="hover:text-foreground transition-colors">ফলাফল</Link></li>
                <li><a href="#donate" className="hover:text-foreground transition-colors">দান করুন</a></li>
                <li><a href="#admission" className="hover:text-foreground transition-colors">ভর্তি তথ্য</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">যোগাযোগ</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +৮৮০ ১৭XX-XXXXXX
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  info@madrasa.com
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  শাসন সিংগাতী, বাংলাদেশ
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  অ্যাডমিন
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
