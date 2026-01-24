import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="ছাত্র, শিক্ষক বা ক্লাস খুঁজুন..." 
            className="pl-10 bg-secondary/50 border-transparent focus:bg-background focus:border-border"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            নতুন ভর্তি
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-medium rounded-full bg-destructive text-destructive-foreground">
                  5
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>নোটিফিকেশন</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">নতুন ভর্তি আবেদন</span>
                <span className="text-xs text-muted-foreground">
                  আহমদ হাসান ক্লাস ৫-এ ভর্তির আবেদন করেছে
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">ফি বকেয়া</span>
                <span className="text-xs text-muted-foreground">
                  ১৫ জন ছাত্রের এই মাসের ফি বকেয়া আছে
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">পরীক্ষার ফলাফল</span>
                <span className="text-xs text-muted-foreground">
                  প্রথম সাময়িক পরীক্ষার ফলাফল প্রস্তুত
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-8 bg-border" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">আজ</p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('bn-BD', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
