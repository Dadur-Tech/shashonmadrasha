import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Save,
  Loader2,
  Moon,
  Sun,
} from "lucide-react";

interface SettingsState {
  autoBackup: boolean;
  newAdmissionNotif: boolean;
  newDonationNotif: boolean;
  feeDueNotif: boolean;
  emailNotif: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: boolean;
  darkMode: boolean;
  compactMode: boolean;
}

const defaultSettings: SettingsState = {
  autoBackup: true,
  newAdmissionNotif: true,
  newDonationNotif: true,
  feeDueNotif: true,
  emailNotif: false,
  twoFactorAuth: false,
  sessionTimeout: true,
  darkMode: false,
  compactMode: false,
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("madrasa_settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Apply dark mode
    const isDark = localStorage.getItem("madrasa_dark_mode") === "true";
    if (isDark) {
      document.documentElement.classList.add("dark");
      setSettings(prev => ({ ...prev, darkMode: true }));
    }
  }, []);

  const handleSettingChange = (key: keyof SettingsState, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Special handling for dark mode
    if (key === "darkMode") {
      if (value) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("madrasa_dark_mode", "true");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("madrasa_dark_mode", "false");
      }
    }
    
    // Save to localStorage
    localStorage.setItem("madrasa_settings", JSON.stringify(newSettings));
    
    toast({
      title: "সেটিংস সংরক্ষিত",
      description: "আপনার সেটিংস সফলভাবে আপডেট হয়েছে",
    });
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "পাসওয়ার্ড মিলছে না",
        description: "নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড একই হতে হবে",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "পাসওয়ার্ড ছোট",
        description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    // Simulate password change (would be actual Supabase call)
    setTimeout(() => {
      setSaving(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "পাসওয়ার্ড পরিবর্তিত",
        description: "আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে",
      });
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">সেটিংস</h1>
            <p className="text-muted-foreground">সিস্টেম সেটিংস পরিচালনা করুন</p>
          </div>
          {user && (
            <div className="text-right text-sm">
              <p className="text-muted-foreground">লগইনকৃত:</p>
              <p className="font-medium">{user.email}</p>
            </div>
          )}
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="w-4 h-4" />
              সাধারণ
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              নোটিফিকেশন
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              নিরাপত্তা
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              থিম
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    সাধারণ সেটিংস
                  </CardTitle>
                  <CardDescription>সিস্টেমের মৌলিক সেটিংস</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>সিস্টেম ভাষা</Label>
                      <Input value="বাংলা" disabled />
                    </div>
                    <div>
                      <Label>টাইমজোন</Label>
                      <Input value="Asia/Dhaka (GMT+6)" disabled />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">অটো ব্যাকআপ</p>
                      <p className="text-sm text-muted-foreground">প্রতিদিন স্বয়ংক্রিয়ভাবে ডাটা ব্যাকআপ</p>
                    </div>
                    <Switch 
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  নোটিফিকেশন সেটিংস
                </CardTitle>
                <CardDescription>কোন কোন বিষয়ে নোটিফিকেশন পাবেন</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">নতুন ভর্তি আবেদন</p>
                    <p className="text-sm text-muted-foreground">নতুন ছাত্র ভর্তি হলে</p>
                  </div>
                  <Switch 
                    checked={settings.newAdmissionNotif}
                    onCheckedChange={(checked) => handleSettingChange("newAdmissionNotif", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">নতুন দান</p>
                    <p className="text-sm text-muted-foreground">কেউ দান করলে</p>
                  </div>
                  <Switch 
                    checked={settings.newDonationNotif}
                    onCheckedChange={(checked) => handleSettingChange("newDonationNotif", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">ফি বকেয়া</p>
                    <p className="text-sm text-muted-foreground">ফি বকেয়া হলে</p>
                  </div>
                  <Switch 
                    checked={settings.feeDueNotif}
                    onCheckedChange={(checked) => handleSettingChange("feeDueNotif", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">ইমেইল নোটিফিকেশন</p>
                    <p className="text-sm text-muted-foreground">ইমেইলে নোটিফিকেশন পাঠান</p>
                  </div>
                  <Switch 
                    checked={settings.emailNotif}
                    onCheckedChange={(checked) => handleSettingChange("emailNotif", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    নিরাপত্তা সেটিংস
                  </CardTitle>
                  <CardDescription>অ্যাকাউন্ট নিরাপত্তা</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">টু-ফ্যাক্টর অথেন্টিকেশন</p>
                      <p className="text-sm text-muted-foreground">অতিরিক্ত নিরাপত্তা স্তর (শীঘ্রই আসছে)</p>
                    </div>
                    <Switch 
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                      disabled
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">সেশন টাইমআউট</p>
                      <p className="text-sm text-muted-foreground">৩০ মিনিট নিষ্ক্রিয় থাকলে লগআউট</p>
                    </div>
                    <Switch 
                      checked={settings.sessionTimeout}
                      onCheckedChange={(checked) => handleSettingChange("sessionTimeout", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>পাসওয়ার্ড পরিবর্তন</CardTitle>
                  <CardDescription>আপনার পাসওয়ার্ড আপডেট করুন</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">বর্তমান পাসওয়ার্ড</Label>
                    <Input 
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
                    <Input 
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
                    <Input 
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="নতুন পাসওয়ার্ড আবার লিখুন"
                    />
                  </div>
                  <Button 
                    onClick={handlePasswordChange} 
                    disabled={saving || !passwordForm.newPassword}
                    className="gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        সংরক্ষণ হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        পাসওয়ার্ড পরিবর্তন করুন
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  থিম সেটিংস
                </CardTitle>
                <CardDescription>ইন্টারফেসের রং ও স্টাইল</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <div>
                      <p className="font-medium">ডার্ক মোড</p>
                      <p className="text-sm text-muted-foreground">অন্ধকার থিম ব্যবহার করুন</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">কম্প্যাক্ট মোড</p>
                    <p className="text-sm text-muted-foreground">ছোট স্পেসিং ব্যবহার করুন</p>
                  </div>
                  <Switch 
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => handleSettingChange("compactMode", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}