import { useState, useEffect, useRef } from "react";
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
  Loader2,
  Camera,
  Trash2,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function InstitutionPage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    nameEnglish: "",
    established: "",
    registrationNo: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    principal: "",
  });

  const { data: institution, isLoading } = useQuery({
    queryKey: ["institution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institution_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["institution-stats"],
    queryFn: async () => {
      const { count: studentCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: teacherCount } = await supabase
        .from("teachers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      return {
        studentCount: studentCount || 0,
        teacherCount: teacherCount || 0,
      };
    },
  });

  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name || "",
        nameEnglish: institution.name_english || "",
        established: institution.established_year?.toString() || "",
        registrationNo: institution.registration_number || "",
        address: institution.address || "",
        phone: institution.phone || "",
        email: institution.email || "",
        website: institution.website || "",
        principal: institution.principal_name || "",
      });
      setLogoUrl(institution.logo_url || null);
    }
  }, [institution]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "শুধুমাত্র ছবি আপলোড করুন", variant: "destructive" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "ছবি ২MB এর কম হতে হবে", variant: "destructive" });
      return;
    }

    setUploadingLogo(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `institution/logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      setLogoUrl(publicUrl);
      toast({ title: "লোগো আপলোড হয়েছে" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ 
        title: "আপলোড সমস্যা", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: formData.name,
        name_english: formData.nameEnglish || null,
        established_year: formData.established ? parseInt(formData.established) : null,
        registration_number: formData.registrationNo || null,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        principal_name: formData.principal || null,
        logo_url: logoUrl,
      };

      if (institution?.id) {
        const { error } = await supabase
          .from("institution_settings")
          .update(payload)
          .eq("id", institution.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("institution_settings")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution"] });
      toast({
        title: "সংরক্ষিত হয়েছে",
        description: "প্রতিষ্ঠানের তথ্য সফলভাবে আপডেট করা হয়েছে।",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

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
              <Button 
                onClick={() => saveMutation.mutate()} 
                className="gap-2"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
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
                      placeholder="আল জামিয়াতুল আরাবিয়া..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>মাদরাসার নাম (ইংরেজি)</Label>
                    <Input
                      value={formData.nameEnglish}
                      onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Al Jamiyatul Arabia..."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>প্রতিষ্ঠাকাল (সন)</Label>
                    <Input
                      type="number"
                      value={formData.established}
                      onChange={(e) => setFormData({ ...formData, established: e.target.value })}
                      disabled={!isEditing}
                      placeholder="১৯৯০"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>রেজিস্ট্রেশন নম্বর</Label>
                    <Input
                      value={formData.registrationNo}
                      onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                      disabled={!isEditing}
                      placeholder="১২৩৪৫৬"
                    />
                  </div>
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
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    placeholder="গ্রাম, উপজেলা, জেলা"
                    rows={2}
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
                      placeholder="+৮৮০ ১৭XX-XXXXXX"
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
                      placeholder="info@example.com"
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
                    placeholder="www.example.com"
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
                    placeholder="মাওলানা মুহাম্মদ..."
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
                <div className="w-32 h-32 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 overflow-hidden border-2 border-dashed border-border relative">
                  {uploadingLogo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-bold text-5xl">ج</span>
                  )}
                </div>

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    disabled={!isEditing || uploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                    {logoUrl ? "পরিবর্তন" : "আপলোড"}
                  </Button>
                  {logoUrl && isEditing && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="text-destructive"
                      onClick={handleRemoveLogo}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
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
                  <span className="font-bold">{formData.established || "-"}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span>মোট ছাত্র</span>
                  </div>
                  <span className="font-bold">{stats?.studentCount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-accent" />
                    <span>মোট শিক্ষক</span>
                  </div>
                  <span className="font-bold">{stats?.teacherCount || 0}</span>
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
                  {["হিফজ বিভাগ", "কিতাব বিভাগ", "নাযেরা বিভাগ", "তাখাসসুস বিভাগ"].map((dept) => (
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
