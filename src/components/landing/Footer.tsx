import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserDropdown } from "@/components/shared/UserDropdown";

export function Footer() {
  const { data: institution } = useQuery({
    queryKey: ["institution-footer"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institution_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const institutionName = institution?.name || "আল জামিয়াতুল আরাবিয়া শাসন সিংগাতি মাদরাসা";
  const nameParts = institutionName.split(" ");
  const shortName = nameParts.slice(0, 3).join(" ");
  const subName = nameParts.slice(3).join(" ") || "শাসন সিংগাতী মাদ্রাসা";

  return (
    <footer className="py-12 border-t border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {institution?.logo_url ? (
                <img 
                  src={institution.logo_url} 
                  alt={institutionName}
                  className="w-10 h-10 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-lg">ج</span>
                </div>
              )}
              <div>
                <h3 className="font-bold text-foreground">{shortName}</h3>
                <p className="text-xs text-muted-foreground">{subName}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              ইসলামী শিক্ষার আলোকবর্তিকা। কুরআন, হাদীস ও দ্বীনি ইলমের পাশাপাশি 
              চরিত্র গঠন ও নৈতিক শিক্ষায় আলোকিত প্রতিষ্ঠান।
            </p>
            {institution?.principal_name && (
              <p className="text-sm text-muted-foreground mt-2">
                <strong>প্রিন্সিপাল:</strong> {institution.principal_name}
              </p>
            )}
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
                <Phone className="w-4 h-4 flex-shrink-0" />
                {institution?.phone || "+৮৮০ ১৭XX-XXXXXX"}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                {institution?.email || "info@madrasa.com"}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{institution?.address || "শাসন সিংগাতী, বাংলাদেশ"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {institutionName}। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-2">
            <UserDropdown variant="ghost" />
          </div>
        </div>
      </div>
    </footer>
  );
}
