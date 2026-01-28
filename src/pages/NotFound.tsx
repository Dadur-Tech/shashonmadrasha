import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 80px)" }}>
        <div className="text-center px-4">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Search className="w-12 h-12 text-primary/60" />
          </div>
          <h1 className="mb-4 text-6xl font-bold text-primary">৪০৪</h1>
          <h2 className="mb-2 text-2xl font-semibold text-foreground">পেজ পাওয়া যায়নি</h2>
          <p className="mb-8 text-lg text-muted-foreground max-w-md mx-auto">
            দুঃখিত! আপনি যে পেজটি খুঁজছেন সেটি পাওয়া যায়নি। পেজটি মুছে ফেলা হয়েছে বা ঠিকানা ভুল হতে পারে।
          </p>
          <Link to="/">
            <Button size="lg" className="gap-2">
              <Home className="w-5 h-5" />
              হোমপেজে ফিরুন
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
