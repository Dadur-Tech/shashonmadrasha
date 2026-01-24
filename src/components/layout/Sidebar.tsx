import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  Heart,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  BarChart3,
  Building2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { title: "ড্যাশবোর্ড", href: "/admin", icon: LayoutDashboard },
  { title: "ছাত্র ব্যবস্থাপনা", href: "/admin/students", icon: Users, badge: 5 },
  { title: "শিক্ষক ব্যবস্থাপনা", href: "/admin/teachers", icon: GraduationCap },
  { title: "ক্লাস ও বিভাগ", href: "/admin/classes", icon: BookOpen },
  { title: "উপস্থিতি", href: "/admin/attendance", icon: Calendar },
  { title: "ফি ব্যবস্থাপনা", href: "/admin/fees", icon: CreditCard },
  { title: "লিল্লাহ বোর্ডিং", href: "/admin/lillah", icon: Heart },
  { title: "পরীক্ষা ও ফলাফল", href: "/admin/exams", icon: FileText },
  { title: "রিপোর্ট", href: "/admin/reports", icon: BarChart3 },
];

const secondaryNavItems: NavItem[] = [
  { title: "নোটিফিকেশন", href: "/admin/notifications", icon: Bell, badge: 12 },
  { title: "মেসেজ", href: "/admin/messages", icon: MessageSquare, badge: 3 },
  { title: "প্রতিষ্ঠান সেটিংস", href: "/admin/institution", icon: Building2 },
  { title: "সেটিংস", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

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
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-lg">م</span>
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground">মাদ্রাসা</h1>
                <p className="text-xs text-sidebar-foreground/60">ম্যানেজমেন্ট সিস্টেম</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="w-10 h-10 mx-auto rounded-xl bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">م</span>
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
            <span className="text-sidebar-foreground font-semibold">অ</span>
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <p className="font-medium text-sidebar-foreground text-sm">অ্যাডমিন</p>
                <p className="text-xs text-sidebar-foreground/60">admin@madrasa.edu</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!collapsed && (
          <Button
            variant="ghost"
            className="w-full mt-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            লগআউট
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
  isActive 
}: { 
  item: NavItem; 
  collapsed: boolean; 
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
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
            {item.title}
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
