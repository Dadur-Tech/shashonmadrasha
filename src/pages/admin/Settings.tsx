import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Mail,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">সেটিংস</h1>
          <p className="text-muted-foreground">সিস্টেম সেটিংস পরিচালনা করুন</p>
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
                    <Switch defaultChecked />
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
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">নতুন দান</p>
                    <p className="text-sm text-muted-foreground">কেউ দান করলে</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">ফি বকেয়া</p>
                    <p className="text-sm text-muted-foreground">ফি বকেয়া হলে</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">ইমেইল নোটিফিকেশন</p>
                    <p className="text-sm text-muted-foreground">ইমেইলে নোটিফিকেশন পাঠান</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
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
                    <p className="text-sm text-muted-foreground">অতিরিক্ত নিরাপত্তা স্তর</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">সেশন টাইমআউট</p>
                    <p className="text-sm text-muted-foreground">৩০ মিনিট নিষ্ক্রিয় থাকলে লগআউট</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Button variant="outline">পাসওয়ার্ড পরিবর্তন করুন</Button>
                </div>
              </CardContent>
            </Card>
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
                  <div>
                    <p className="font-medium">ডার্ক মোড</p>
                    <p className="text-sm text-muted-foreground">অন্ধকার থিম ব্যবহার করুন</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">কম্প্যাক্ট মোড</p>
                    <p className="text-sm text-muted-foreground">ছোট স্পেসিং ব্যবহার করুন</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
