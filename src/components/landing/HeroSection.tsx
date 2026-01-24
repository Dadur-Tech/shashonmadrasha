import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Book, PlayCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 hero-gradient opacity-5" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      {/* Decorative floating elements */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 left-[15%] hidden lg:block"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
          <Book className="w-8 h-8 text-primary" />
        </div>
      </motion.div>
      
      <motion.div 
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-60 right-[10%] hidden lg:block"
      >
        <div className="w-14 h-14 rounded-xl bg-accent/10 backdrop-blur-sm border border-accent/20 flex items-center justify-center">
          <Heart className="w-6 h-6 text-accent" />
        </div>
      </motion.div>
      
      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 left-[20%] hidden lg:block"
      >
        <div className="w-12 h-12 rounded-lg bg-success/10 backdrop-blur-sm border border-success/20 flex items-center justify-center">
          <PlayCircle className="w-5 h-5 text-success" />
        </div>
      </motion.div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary text-sm font-semibold mb-8 shadow-lg backdrop-blur-sm border border-primary/20"
            >
              <Sparkles className="w-4 h-4" />
              بسم الله الرحمن الرحيم
              <Sparkles className="w-4 h-4" />
            </motion.span>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="block"
              >
                আল জামিয়া আরাবিয়া
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="block text-gradient mt-3"
              >
                শাসন সিংগাতী মাদ্রাসা
              </motion.span>
            </h1>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              ইসলামী শিক্ষার আলোকবর্তিকা। কুরআন, হাদীস ও দ্বীনি ইলমের পাশাপাশি 
              আধুনিক শিক্ষায় সুদক্ষ আলেম-উলামা তৈরির প্রতিষ্ঠান।
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a href="#admission">
                <Button size="lg" className="gap-2 px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all group">
                  <Book className="w-5 h-5" />
                  ভর্তি তথ্য
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <Link to="/courses">
                <Button size="lg" variant="outline" className="gap-2 px-10 py-7 text-lg border-2 hover:bg-primary/5 group">
                  <PlayCircle className="w-5 h-5" />
                  অনলাইন ক্লাস
                </Button>
              </Link>
              <a href="#donate">
                <Button size="lg" variant="ghost" className="gap-2 px-10 py-7 text-lg hover:bg-accent/10">
                  <Heart className="w-5 h-5 text-accent" />
                  দান করুন
                </Button>
              </a>
            </motion.div>
            
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
            >
              {[
                { value: "৩০+", label: "বছরের অভিজ্ঞতা" },
                { value: "৫০০+", label: "ছাত্র সংখ্যা" },
                { value: "৫০+", label: "অভিজ্ঞ শিক্ষক" },
                { value: "৪টি", label: "বিভাগ" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50"
                >
                  <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
