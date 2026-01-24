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
  PlayCircle,
  FileText,
  Users,
  Award,
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
import { TeacherHighlights } from "@/components/landing/TeacherHighlights";
import { NotableAlumni } from "@/components/landing/NotableAlumni";
import { WeeklyJamiyat } from "@/components/landing/WeeklyJamiyat";
import { OnlineClassesPreview } from "@/components/landing/OnlineClassesPreview";
import { HeroSection } from "@/components/landing/HeroSection";
import { LillahBoardingSection } from "@/components/landing/LillahBoardingSection";

const navLinks = [
  { href: "#about", label: "পরিচিতি" },
  { href: "#departments", label: "বিভাগ" },
  { href: "/courses", label: "অনলাইন ক্লাস", isRoute: true },
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
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
                link.isRoute ? (
                  <Link 
                    key={link.href}
                    to={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a 
                    key={link.href}
                    href={link.href} 
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/results" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <GraduationCap className="w-4 h-4" />
                  ফলাফল দেখুন
                </Button>
              </Link>
              <Link to="/login" className="hidden sm:block">
                <Button size="sm" className="shadow-lg">
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
                link.isRoute ? (
                  <Link 
                    key={link.href}
                    to={link.href}
                    className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a 
                    key={link.href}
                    href={link.href} 
                    className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                )
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
      <HeroSection />

      {/* Quick Links Section */}
      <section className="py-12 -mt-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {[
              { icon: PlayCircle, label: "অনলাইন ক্লাস", href: "/courses", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/40" },
              { icon: FileText, label: "পরীক্ষার ফলাফল", href: "/results", color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/40" },
              { icon: Users, label: "ছাত্র তালিকা", href: "/students", color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/40" },
              { icon: Heart, label: "লিল্লাহ বোর্ডিং", href: "/lillah-students", color: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-950/40" },
              { icon: Award, label: "প্রাক্তন ছাত্র", href: "/alumni", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/40" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={item.href}>
                  <Card className={`${item.bgColor} border-transparent hover:shadow-lg transition-all group cursor-pointer`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white dark:bg-background shadow-sm`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="font-medium text-sm">{item.label}</span>
                      <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <MadrasaStats />

      {/* About Section */}
      <AboutMadrasa />

      {/* Teacher Highlights Section */}
      <TeacherHighlights />

      {/* Department Students Section */}
      <div id="departments">
        <DepartmentStudents />
      </div>

      {/* Weekly Meal Schedule */}
      <WeeklyMealSchedule />

      {/* Weekly Jamiyat */}
      <WeeklyJamiyat />

      {/* Online Classes Preview */}
      <div id="online-classes">
        <OnlineClassesPreview />
      </div>

      {/* Notable Alumni */}
      <NotableAlumni />

      {/* Lillah Boarding Section */}
      <LillahBoardingSection />

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
              {[
                { icon: Phone, title: "ফোন", lines: ["+৮৮০ ১৭XX-XXXXXX", "+৮৮০ ১৮XX-XXXXXX"], color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/40", borderColor: "border-blue-200 dark:border-blue-800" },
                { icon: Mail, title: "ইমেইল", lines: ["info@madrasa.com"], color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/40", borderColor: "border-emerald-200 dark:border-emerald-800" },
                { icon: MapPin, title: "ঠিকানা", lines: ["শাসন সিংগাতী", "বাংলাদেশ"], color: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-950/40", borderColor: "border-rose-200 dark:border-rose-800" },
                { icon: Clock, title: "অফিস সময়", lines: ["সকাল ৯টা - বিকাল ৫টা", "শুক্রবার বন্ধ"], color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/40", borderColor: "border-amber-200 dark:border-amber-800" },
              ].map((item, index) => (
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
                        <p key={i} className="text-muted-foreground">{line}</p>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
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
                <li><Link to="/courses" className="hover:text-foreground transition-colors">কোর্স ও ক্লাস</Link></li>
                <li><Link to="/results" className="hover:text-foreground transition-colors">ফলাফল</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">পরিষেবা</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#donate" className="hover:text-foreground transition-colors">দান করুন</a></li>
                <li><a href="#admission" className="hover:text-foreground transition-colors">ভর্তি তথ্য</a></li>
                <li><Link to="/students" className="hover:text-foreground transition-colors">ছাত্র তালিকা</Link></li>
                <li><Link to="/lillah-students" className="hover:text-foreground transition-colors">লিল্লাহ বোর্ডিং</Link></li>
                <li><Link to="/alumni" className="hover:text-foreground transition-colors">প্রাক্তন ছাত্র</Link></li>
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
