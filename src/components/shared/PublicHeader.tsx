import { Link } from "react-router-dom";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { UserDropdown } from "./UserDropdown";

interface PublicHeaderProps {
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
  backLabel?: string;
}

export function PublicHeader({ 
  title, 
  showBackButton = true, 
  backUrl = "/",
  backLabel = "হোমে ফিরুন"
}: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: institution } = useQuery({
    queryKey: ["institution-header"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institution_settings")
        .select("name, logo_url")
        .maybeSingle();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Use provided title or fall back to institution name
  const displayTitle = title || institution?.name || "মাদ্রাসা";

  return (
    <header className="bg-primary text-primary-foreground py-3 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Left: Back button */}
          {showBackButton ? (
            <Link to={backUrl} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          ) : (
            <div className="w-24" />
          )}
          
          {/* Center: Logo and Title */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            {institution?.logo_url ? (
              <img 
                src={institution.logo_url} 
                alt="Logo" 
                className="w-8 h-8 rounded-lg object-contain bg-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ج</span>
              </div>
            )}
            <div className="hidden md:block">
              <h1 className="text-lg font-bold leading-tight">{displayTitle}</h1>
            </div>
            <h1 className="md:hidden text-lg font-bold truncate max-w-[200px]">{displayTitle}</h1>
          </Link>

          {/* Right: User dropdown */}
          <div className="flex items-center gap-2">
            <UserDropdown variant="header" />
          </div>
        </div>
      </div>
    </header>
  );
}
