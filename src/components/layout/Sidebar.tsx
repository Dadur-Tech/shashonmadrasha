import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CalendarDays,
  CreditCard,
  Heart,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Building2,
  Wallet,
  Video,
  HandHeart,
  DollarSign,
  HelpCircle,
  Mic2,
  Award,
  ShieldCheck,
  Bell,
  Book,
  Home,
  CloudDownload,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { titleKey: "dashboard", href: "/admin", icon: LayoutDashboard },
  { titleKey: "students", href: "/admin/students", icon: Users },
  { titleKey: "teachers", href: "/admin/teachers", icon: GraduationCap },
  { titleKey: "classes", href: "/admin/classes", icon: BookOpen },
  { titleKey: "attendance", href: "/admin/attendance", icon: Calendar },
  { titleKey: "fees", href: "/admin/fees", icon: CreditCard },
  { titleKey: "expenses", href: "/admin/expenses", icon: Wallet },
  { titleKey: "salaries", href: "/admin/salaries", icon: DollarSign },
  { titleKey: "lillah", href: "/admin/lillah", icon: Heart },
  { titleKey: "donations", href: "/admin/donations", icon: HandHeart },
  { titleKey: "exams", href: "/admin/exams", icon: FileText },
  { titleKey: "onlineClasses", href: "/admin/online-classes", icon: Video },
  { titleKey: "library", href: "/admin/library", icon: Book },
  { titleKey: "hostel", href: "/admin/hostel", icon: Home },
  { titleKey: "certificates", href: "/admin/certificates", icon: Award },
  { titleKey: "alumni", href: "/admin/alumni", icon: Award },
  { titleKey: "jamiyat", href: "/admin/jamiyat", icon: Mic2 },
  { titleKey: "announcements", href: "/admin/announcements", icon: Bell },
  { titleKey: "events", href: "/admin/events", icon: CalendarDays },
  { titleKey: "reports", href: "/admin/reports", icon: BarChart3 },
];

const secondaryNavItems: NavItem[] = [
  { titleKey: "userManagement", href: "/admin/users", icon: ShieldCheck },
  { titleKey: "paymentGateways", href: "/admin/payment-gateways", icon: CreditCard },
  { titleKey: "institution", href: "/admin/institution", icon: Building2 },
  { titleKey: "mealSchedule", href: "/admin/meal-schedule", icon: Utensils },
  { titleKey: "backup", href: "/admin/backup", icon: CloudDownload },
  { titleKey: "settings", href: "/admin/settings", icon: Settings },
  { titleKey: "help", href: "/admin/help", icon: HelpCircle },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleNavClick = () => {
    onNavigate?.();
  };

  // Fetch institution settings for logo
  const { data: institution } = useQuery({
    queryKey: ["institution-settings-sidebar"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institution_settings")
        .select("name, name_english, logo_url")
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Parse institution name
  const institutionName = institution?.name || "আল জামিয়াতুল আরাবিয়া";
  const nameParts = institutionName.split(" ");
  const shortName = nameParts.slice(0, 3).join(" ");
  const subName = nameParts.length > 3 ? nameParts.slice(3).join(" ") : "শাসন সিংগাতি";

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center overflow-hidden">
                {institution?.logo_url ? (
                  <img 
                    src={institution.logo_url} 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sidebar-primary-foreground font-bold text-lg">ج</span>
                )}
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground text-sm leading-tight">{shortName}</h1>
                <p className="text-xs text-sidebar-foreground/60">{subName}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="w-10 h-10 mx-auto rounded-xl bg-sidebar-primary flex items-center justify-center overflow-hidden">
            {institution?.logo_url ? (
              <img 
                src={institution.logo_url} 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sidebar-primary-foreground font-bold text-lg">ج</span>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={location.pathname === item.href}
              onClick={handleNavClick}
              title={t(item.titleKey)}
            />
          ))}
        </nav>

        <Separator className="my-4 bg-sidebar-border" />

        <nav className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={location.pathname === item.href}
              onClick={handleNavClick}
              title={t(item.titleKey)}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sidebar-foreground font-semibold">
              {user?.email?.charAt(0).toUpperCase() || "অ"}
            </span>
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <p className="font-medium text-sidebar-foreground text-sm">
                  {user ? t("admin") : t("guest")}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate max-w-[150px]">
                  {user?.email || t("loginPrompt")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!collapsed && (
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full mt-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("logout")}
          </Button>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border shadow-md hover:bg-sidebar-accent"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-sidebar-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-sidebar-foreground" />
        )}
      </Button>
    </motion.aside>
  );
}

function NavLink({ 
  item, 
  collapsed, 
  isActive,
  onClick,
  title,
}: { 
  item: NavItem; 
  collapsed: boolean; 
  isActive: boolean;
  onClick?: () => void;
  title: string;
}) {
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-current")} />
      
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm font-medium"
          >
            {title}
          </motion.span>
        )}
      </AnimatePresence>

      {item.badge && !collapsed && (
        <span className={cn(
          "ml-auto px-2 py-0.5 text-xs font-medium rounded-full",
          isActive 
            ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground" 
            : "bg-sidebar-primary text-sidebar-primary-foreground"
        )}>
          {item.badge}
        </span>
      )}

      {item.badge && collapsed && (
        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-medium rounded-full bg-destructive text-destructive-foreground">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
