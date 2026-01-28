import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
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
  Mail,
  Download,
  Database,
  Languages,
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
  const { language, setLanguage, t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [languageSaving, setLanguageSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    password: "",
  });
  const [emailSaving, setEmailSaving] = useState(false);

  const handleLanguageChange = async (newLanguage: "bn" | "en") => {
    setLanguageSaving(true);
    try {
      await setLanguage(newLanguage);
      toast({
        title: t("languageChanged"),
        description: t("languageChangedDesc"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to update language",
        variant: "destructive",
      });
    } finally {
      setLanguageSaving(false);
    }
  };

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
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "পাসওয়ার্ড পরিবর্তিত",
        description: "আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে",
      });
    } catch (error: any) {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message || "পাসওয়ার্ড পরিবর্তন করা যায়নি",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async () => {
    if (!emailForm.newEmail || !emailForm.password) {
      toast({
        title: "তথ্য পূরণ করুন",
        description: "নতুন ইমেইল এবং বর্তমান পাসওয়ার্ড দিন",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      toast({
        title: "অবৈধ ইমেইল",
        description: "অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন",
        variant: "destructive",
      });
      return;
    }

    setEmailSaving(true);

    try {
      // Update email in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        email: emailForm.newEmail,
      });

      if (error) throw error;

      setEmailForm({ newEmail: "", password: "" });
      toast({
        title: "ইমেইল আপডেট হয়েছে",
        description: "নতুন ইমেইলে একটি কনফার্মেশন লিংক পাঠানো হয়েছে। অনুগ্রহ করে ভেরিফাই করুন।",
      });
    } catch (error: any) {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message || "ইমেইল পরিবর্তন করা যায়নি",
        variant: "destructive",
      });
    } finally {
      setEmailSaving(false);
    }
  };

  // Data Export Function
  const handleDataExport = async (tableName: string, title: string, fileName: string) => {
    try {
      const { data, error } = await supabase.from(tableName as any).select("*");
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast({
          title: "কোনো ডাটা নেই",
          description: `${title}তে কোনো তথ্য পাওয়া যায়নি`,
          variant: "destructive",
        });
        return;
      }

      // Convert to CSV
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(","),
        ...data.map(row => 
          headers.map(h => {
            const val = (row as any)[h];
            if (val === null || val === undefined) return "";
            if (typeof val === "string" && (val.includes(",") || val.includes("\n"))) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          }).join(",")
        )
      ];
      const csvString = csvRows.join("\n");

      // Download
      const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${fileName}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "এক্সপোর্ট সফল",
        description: `${data.length}টি রেকর্ড ডাউনলোড হয়েছে`,
      });
    } catch (error: any) {
      toast({
        title: "এক্সপোর্ট ব্যর্থ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("settingsTitle")}</h1>
            <p className="text-muted-foreground">{t("settingsDesc")}</p>
          </div>
          {user && (
            <div className="text-right text-sm bg-secondary/50 p-3 rounded-lg">
              <p className="text-muted-foreground">{t("loggedIn")}:</p>
              <p className="font-medium">{user.email}</p>
            </div>
          )}
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger value="general" className="gap-2 text-xs sm:text-sm">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t("general")}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 text-xs sm:text-sm">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">{t("notifications")}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 text-xs sm:text-sm">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{t("security")}</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 text-xs sm:text-sm">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">{t("theme")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid gap-6">
              {/* Language Settings Card */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="w-5 h-5 text-primary" />
                    {t("systemLanguage")}
                  </CardTitle>
                  <CardDescription>{t("selectLanguage")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Select
                      value={language}
                      onValueChange={(value: "bn" | "en") => handleLanguageChange(value)}
                      disabled={languageSaving}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder={t("selectLanguage")} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="bn">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🇧🇩</span>
                            <span>{t("bengali")} (বাংলা)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="en">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🇬🇧</span>
                            <span>{t("english")} (English)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {languageSaving && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {language === "bn" 
                      ? "বর্তমানে সিস্টেম বাংলায় দেখানো হচ্ছে" 
                      : "System is currently displayed in English"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {t("generalSettings")}
                  </CardTitle>
                  <CardDescription>{t("generalSettingsDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>{t("timezone")}</Label>
                      <Input value="Asia/Dhaka (GMT+6)" disabled />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">{t("autoBackup")}</p>
                      <p className="text-sm text-muted-foreground">{t("autoBackupDesc")}</p>
                    </div>
                    <Switch
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Export Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    ডাটা এক্সপোর্ট
                  </CardTitle>
                  <CardDescription>মাদ্রাসার সম্পূর্ণ ডাটা ডাউনলোড করুন</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">ছাত্র তালিকা</p>
                        <p className="text-sm text-muted-foreground">সকল ছাত্রের তথ্য</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDataExport("students", "ছাত্র তালিকা", "students_export")} className="gap-2">
                        <Download className="w-4 h-4" />CSV
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">শিক্ষক তালিকা</p>
                        <p className="text-sm text-muted-foreground">সকল শিক্ষকের তথ্য</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDataExport("teachers", "শিক্ষক তালিকা", "teachers_export")} className="gap-2">
                        <Download className="w-4 h-4" />CSV
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">ফি রেকর্ড</p>
                        <p className="text-sm text-muted-foreground">সকল ফি লেনদেন</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDataExport("student_fees", "ফি রেকর্ড", "fees_export")} className="gap-2">
                        <Download className="w-4 h-4" />CSV
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">দান রেকর্ড</p>
                        <p className="text-sm text-muted-foreground">সকল দান লেনদেন</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDataExport("donations", "দান রেকর্ড", "donations_export")} className="gap-2">
                        <Download className="w-4 h-4" />CSV
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">খরচ রেকর্ড</p>
                        <p className="text-sm text-muted-foreground">সকল খরচের হিসাব</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDataExport("expenses", "খরচ রেকর্ড", "expenses_export")} className="gap-2">
                        <Download className="w-4 h-4" />CSV
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">বেতন রেকর্ড</p>
                        <p className="text-sm text-muted-foreground">সকল বেতনের তথ্য</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDataExport("teacher_salaries", "বেতন রেকর্ড", "salaries_export")} className="gap-2">
                        <Download className="w-4 h-4" />CSV
                      </Button>
                    </div>
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

              {/* Email Change Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    ইমেইল পরিবর্তন
                  </CardTitle>
                  <CardDescription>আপনার লগইন ইমেইল আপডেট করুন</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <p className="text-sm text-warning-foreground">
                      ইমেইল পরিবর্তন করলে নতুন ইমেইলে একটি কনফার্মেশন লিংক যাবে।
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="newEmail">নতুন ইমেইল</Label>
                    <Input 
                      id="newEmail"
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                      placeholder="newemail@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailPassword">বর্তমান পাসওয়ার্ড</Label>
                    <Input 
                      id="emailPassword"
                      type="password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                      placeholder="নিশ্চিত করতে পাসওয়ার্ড দিন"
                    />
                  </div>
                  <Button 
                    onClick={handleEmailChange} 
                    disabled={emailSaving || !emailForm.newEmail}
                    className="gap-2"
                  >
                    {emailSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        আপডেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        ইমেইল পরিবর্তন করুন
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Password Change Card */}
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