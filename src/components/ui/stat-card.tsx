import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "gold" | "success" | "info";
  className?: string;
}

const variants = {
  default: "bg-card border border-border",
  primary: "bg-primary text-primary-foreground",
  gold: "bg-gradient-to-br from-gold to-gold-dark text-accent-foreground",
  success: "bg-success text-success-foreground",
  info: "bg-info text-info-foreground",
};

const iconVariants = {
  default: "bg-primary/10 text-primary",
  primary: "bg-primary-foreground/20 text-primary-foreground",
  gold: "bg-accent-foreground/20 text-accent-foreground",
  success: "bg-success-foreground/20 text-success-foreground",
  info: "bg-info-foreground/20 text-info-foreground",
};

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = "default",
  className 
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:shadow-lg",
        variants[variant],
        className
      )}
    >
      {/* Decorative Element */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <div className="w-full h-full bg-gradient-to-bl from-current to-transparent rounded-bl-full" />
      </div>
      
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === "default" ? "text-muted-foreground" : "opacity-80"
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <span className={trend.isPositive ? "text-success" : "text-destructive"}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="opacity-60">গত মাসের তুলনায়</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "p-3 rounded-xl",
          iconVariants[variant]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
