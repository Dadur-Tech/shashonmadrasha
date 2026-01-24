import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

interface UserDropdownProps {
  variant?: "default" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function UserDropdown({ variant = "default", size = "sm", className }: UserDropdownProps) {
  const { user, isAdmin, signOut, session } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // If not logged in, show login button
  if (!user) {
    return (
      <Link to="/login" className={className}>
        <Button variant={variant} size={size} className="shadow-lg">
          লগইন
        </Button>
      </Link>
    );
  }

  // Get display name
  const displayName = isAdmin 
    ? "অ্যাডমিন" 
    : (session?.user?.user_metadata?.full_name || user.email?.split("@")[0] || "ইউজার");

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`}>
          <User className="w-4 h-4" />
          {displayName}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-background border border-border shadow-lg z-[100]"
      >
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to={isAdmin ? "/admin" : "/login"} className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            ড্যাশবোর্ড
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          লগআউট
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
