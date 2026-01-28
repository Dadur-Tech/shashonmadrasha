import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight,
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
import { useAuth } from "@/hooks/use-auth";
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
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";
import { AnnouncementBanner } from "@/components/landing/AnnouncementBanner";
import { UpcomingEvents } from "@/components/landing/UpcomingEvents";
import { UserDropdown } from "@/components/shared/UserDropdown";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { FAQSection } from "@/components/landing/FAQSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";

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
  const { user, isAdmin, signOut } = useAuth();

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
              
              {/* User Dropdown or Login Button */}
              <div className="hidden sm:block">
                <UserDropdown />
              </div>
              
              
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
                {user ? (
                  <>
                    <Link to={isAdmin ? "/admin" : "/"} className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">
                        ড্যাশবোর্ড
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await signOut();
                      }}
                    >
                      লগআউট
                    </Button>
                  </>
                ) : (
                  <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      লগইন
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Announcement Banner */}
      <AnnouncementBanner />

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

      {/* Upcoming Events / Waz Mahfil */}
      <div id="events">
        <UpcomingEvents />
      </div>

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

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Donation Section */}
      <div id="donate">
        <DonationSection />
      </div>

      {/* Online Admission Section */}
      <div id="admission">
        <OnlineAdmissionSection />
      </div>

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
