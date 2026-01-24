import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Calendar,
  Users,
  Save,
  Upload,
  Edit,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function InstitutionPage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "আল জামিয়াতুল আরাবিয়া শাসন সিংগাতি মাদরাসা",
    nameEn: "Al Jamiyatul Arabia Shashon Singati Madrasa",
    established: "১৯৯০",
    registrationNo: "১২৩৪৫৬",
    address: "শাসন সিংগাতি, উপজেলা, জেলা",
    phone: "+৮৮০ ১৭XX-XXXXXX",
    email: "info@aljamiyatul.edu.bd",
    website: "www.aljamiyatul.edu.bd",
    principal: "মাওলানা মুহাম্মদ আব্দুল্লাহ",
    totalStudents: "৪৫৬",
    totalTeachers: "২৮",
    description: "আল জামিয়াতুল আরাবিয়া শাসন সিংগাতি মাদরাসা একটি ঐতিহ্যবাহী ইসলামী শিক্ষা প্রতিষ্ঠান। এখানে হিফজ, কিতাব, মক্তব এবং তাখাসসুস বিভাগে শিক্ষা প্রদান করা হয়।",
  });

  const handleSave = () => {
    toast({
      title: "সংরক্ষিত হয়েছে",
      description: "প্রতিষ্ঠানের তথ্য সফলভাবে আপডেট করা হয়েছে।",
    });
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">প্রতিষ্ঠান সেটিংস</h1>
            <p className="text-muted-foreground">মাদরাসার মৌলিক তথ্য ও সেটিংস পরিচালনা করুন</p>
          </div>
          {isEditing ? (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                বাতিল
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                সংরক্ষণ করুন
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit className="w-4 h-4" />
              সম্পাদনা করুন
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  মৌলিক তথ্য
                </CardTitle>
                <CardDescription>মাদরাসার নাম ও পরিচিতি</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>মাদরাসার নাম (বাংলা)</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>মাদরাসার নাম (ইংরেজি)</Label>
                    <Input
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>প্রতিষ্ঠাকাল</Label>
                    <Input
                      value={formData.established}
                      onChange={(e) => setFormData({ ...formData, established: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>রেজিস্ট্রেশন নম্বর</Label>
                    <Input
                      value={formData.registrationNo}
                      onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>প্রতিষ্ঠান সম্পর্কে</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  যোগাযোগের তথ্য
                </CardTitle>
                <CardDescription>ঠিকানা ও যোগাযোগ মাধ্যম</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> ঠিকানা
                  </Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> ফোন
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> ইমেইল
                    </Label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> ওয়েবসাইট
                  </Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Administration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  প্রশাসন
                </CardTitle>
                <CardDescription>মাদরাসা প্রশাসনের তথ্য</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>প্রিন্সিপাল/মুহতামিম</Label>
                  <Input
                    value={formData.principal}
                    onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">মাদরাসার লোগো</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-32 h-32 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold text-5xl">ج</span>
                </div>
                <Button variant="outline" className="gap-2" disabled={!isEditing}>
                  <Upload className="w-4 h-4" />
                  লোগো আপলোড করুন
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG (সর্বোচ্চ ২MB)
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">সংক্ষিপ্ত পরিসংখ্যান</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>প্রতিষ্ঠাকাল</span>
                  </div>
                  <span className="font-bold">{formData.established}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span>মোট ছাত্র</span>
                  </div>
                  <span className="font-bold">{formData.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-accent" />
                    <span>মোট শিক্ষক</span>
                  </div>
                  <span className="font-bold">{formData.totalTeachers}</span>
                </div>
              </CardContent>
            </Card>

            {/* Departments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">শিক্ষা বিভাগসমূহ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["হিফজ বিভাগ", "কিতাব বিভাগ", "মক্তব বিভাগ", "তাখাসসুস বিভাগ"].map((dept) => (
                    <div 
                      key={dept}
                      className="flex items-center gap-2 p-2 rounded-lg bg-success/10 text-success"
                    >
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-sm font-medium">{dept}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
