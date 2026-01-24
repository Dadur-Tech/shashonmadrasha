import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, User, Phone, MapPin, BookOpen, Loader2, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface ClassOption {
  id: string;
  name: string;
  department: string;
  admission_fee: number;
}

export const OnlineAdmissionSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="admission" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <GraduationCap className="w-4 h-4" />
                অনলাইন ভর্তি
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                অনলাইনে ভর্তি আবেদন করুন
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                ঘরে বসেই আপনার সন্তানের ভর্তি আবেদন করুন। সহজ ও দ্রুত প্রক্রিয়া।
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">ভর্তি আবেদন ফর্ম</CardTitle>
                <CardDescription>
                  নিচের বাটনে ক্লিক করে আবেদন ফর্ম পূরণ করুন
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-primary">১</p>
                    <p className="text-sm text-muted-foreground">তথ্য পূরণ</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-primary">২</p>
                    <p className="text-sm text-muted-foreground">যাচাই</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-primary">৩</p>
                    <p className="text-sm text-muted-foreground">নিশ্চিতকরণ</p>
                  </div>
                </div>
                
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="gap-2 px-8">
                      <GraduationCap className="w-5 h-5" />
                      ভর্তি আবেদন করুন
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        ভর্তি আবেদন ফর্ম
                      </DialogTitle>
                      <DialogDescription>
                        সকল তথ্য সঠিকভাবে পূরণ করুন
                      </DialogDescription>
                    </DialogHeader>
                    
                    <AdmissionForm onSuccess={() => setIsOpen(false)} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AdmissionForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    motherName: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelation: "",
    dateOfBirth: "",
    address: "",
    village: "",
    postOffice: "",
    upazila: "",
    district: "",
    classId: "",
    previousInstitution: "",
    isOrphan: false,
    isLillah: false,
    lillahReason: "",
    bloodGroup: "",
  });

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, department, admission_fee")
        .eq("is_active", true)
        .order("department")
        .order("name");
      
      if (error) throw error;
      return data as ClassOption[];
    },
  });

  const generateStudentId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `STU-${year}-${random}`;
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.fatherName || !formData.guardianPhone || !formData.classId) {
      toast({
        title: "তথ্য পূরণ করুন",
        description: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const studentId = generateStudentId();
      
      const { error } = await supabase.from("students").insert({
        student_id: studentId,
        full_name: formData.fullName,
        father_name: formData.fatherName,
        mother_name: formData.motherName || null,
        guardian_name: formData.guardianName || null,
        guardian_phone: formData.guardianPhone,
        guardian_relation: formData.guardianRelation || null,
        date_of_birth: formData.dateOfBirth || null,
        address: formData.address || null,
        village: formData.village || null,
        post_office: formData.postOffice || null,
        upazila: formData.upazila || null,
        district: formData.district || null,
        class_id: formData.classId,
        previous_institution: formData.previousInstitution || null,
        is_orphan: formData.isOrphan,
        is_lillah: formData.isLillah,
        lillah_reason: formData.lillahReason || null,
        blood_group: formData.bloodGroup || null,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "আলহামদুলিল্লাহ!",
        description: `ভর্তি আবেদন সফল হয়েছে। ছাত্র আইডি: ${studentId}`,
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message || "আবেদন প্রক্রিয়ায় সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const departmentLabels: Record<string, string> = {
    nazera: "নাযেরা বিভাগ",
    hifz: "হিফজ বিভাগ",
    kitab: "কিতাব বিভাগ",
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-1 mx-1 ${step > s ? "bg-primary" : "bg-secondary"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <User className="w-5 h-5" />
            <h3 className="font-semibold">ছাত্রের তথ্য</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">ছাত্রের নাম *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="পুরো নাম বাংলায়"
              />
            </div>
            
            <div>
              <Label htmlFor="dateOfBirth">জন্ম তারিখ</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="fatherName">পিতার নাম *</Label>
              <Input
                id="fatherName"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="পিতার পুরো নাম"
              />
            </div>

            <div>
              <Label htmlFor="motherName">মাতার নাম</Label>
              <Input
                id="motherName"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                placeholder="মাতার পুরো নাম"
              />
            </div>

            <div>
              <Label htmlFor="bloodGroup">রক্তের গ্রুপ</Label>
              <Select
                value={formData.bloodGroup}
                onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="previousInstitution">পূর্ববর্তী প্রতিষ্ঠান</Label>
              <Input
                id="previousInstitution"
                value={formData.previousInstitution}
                onChange={(e) => setFormData({ ...formData, previousInstitution: e.target.value })}
                placeholder="আগের শিক্ষা প্রতিষ্ঠান"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isOrphan"
                checked={formData.isOrphan}
                onChange={(e) => setFormData({ ...formData, isOrphan: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isOrphan" className="text-sm cursor-pointer">এতিম</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isLillah"
                checked={formData.isLillah}
                onChange={(e) => setFormData({ ...formData, isLillah: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isLillah" className="text-sm cursor-pointer">লিল্লাহ বোর্ডিং প্রয়োজন</Label>
            </div>
          </div>

          {formData.isLillah && (
            <div>
              <Label htmlFor="lillahReason">লিল্লাহ বোর্ডিং এর কারণ</Label>
              <Textarea
                id="lillahReason"
                value={formData.lillahReason}
                onChange={(e) => setFormData({ ...formData, lillahReason: e.target.value })}
                placeholder="কেন লিল্লাহ বোর্ডিং প্রয়োজন?"
                rows={2}
              />
            </div>
          )}

          <Button onClick={() => setStep(2)} className="w-full gap-2">
            পরবর্তী ধাপ
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <Phone className="w-5 h-5" />
            <h3 className="font-semibold">অভিভাবকের তথ্য ও ঠিকানা</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guardianName">অভিভাবকের নাম</Label>
              <Input
                id="guardianName"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="অভিভাবকের নাম"
              />
            </div>

            <div>
              <Label htmlFor="guardianPhone">মোবাইল নম্বর *</Label>
              <Input
                id="guardianPhone"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <Label htmlFor="guardianRelation">সম্পর্ক</Label>
              <Select
                value={formData.guardianRelation}
                onValueChange={(value) => setFormData({ ...formData, guardianRelation: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {["পিতা", "মাতা", "চাচা", "মামা", "দাদা", "নানা", "অন্যান্য"].map((rel) => (
                    <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="village">গ্রাম</Label>
              <Input
                id="village"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="গ্রামের নাম"
              />
            </div>

            <div>
              <Label htmlFor="postOffice">ডাকঘর</Label>
              <Input
                id="postOffice"
                value={formData.postOffice}
                onChange={(e) => setFormData({ ...formData, postOffice: e.target.value })}
                placeholder="ডাকঘরের নাম"
              />
            </div>

            <div>
              <Label htmlFor="upazila">উপজেলা</Label>
              <Input
                id="upazila"
                value={formData.upazila}
                onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                placeholder="উপজেলার নাম"
              />
            </div>

            <div>
              <Label htmlFor="district">জেলা</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="জেলার নাম"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">পূর্ণ ঠিকানা</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="বিস্তারিত ঠিকানা"
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 gap-2">
              <ArrowLeft className="w-4 h-4" />
              পেছনে
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1 gap-2">
              পরবর্তী
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-semibold">ক্লাস নির্বাচন</h3>
          </div>

          <div>
            <Label htmlFor="class">ক্লাস নির্বাচন করুন *</Label>
            <Select
              value={formData.classId}
              onValueChange={(value) => setFormData({ ...formData, classId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="ক্লাস নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(
                  classes.reduce((acc, cls) => {
                    if (!acc[cls.department]) acc[cls.department] = [];
                    acc[cls.department].push(cls);
                    return acc;
                  }, {} as Record<string, ClassOption[]>)
                ).map(([dept, deptClasses]) => (
                  <div key={dept}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      {departmentLabels[dept] || dept}
                    </div>
                    {deptClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - ভর্তি ফি: ৳{cls.admission_fee}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
            <h4 className="font-semibold text-foreground">আবেদনের সারসংক্ষেপ</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-muted-foreground">ছাত্রের নাম:</p>
              <p className="font-medium">{formData.fullName || "-"}</p>
              <p className="text-muted-foreground">পিতার নাম:</p>
              <p className="font-medium">{formData.fatherName || "-"}</p>
              <p className="text-muted-foreground">মোবাইল:</p>
              <p className="font-medium">{formData.guardianPhone || "-"}</p>
              <p className="text-muted-foreground">ক্লাস:</p>
              <p className="font-medium">
                {classes.find(c => c.id === formData.classId)?.name || "-"}
              </p>
              {formData.isOrphan && (
                <>
                  <p className="text-muted-foreground">স্ট্যাটাস:</p>
                  <p className="font-medium text-rose-600">এতিম</p>
                </>
              )}
              {formData.isLillah && (
                <>
                  <p className="text-muted-foreground">বোর্ডিং:</p>
                  <p className="font-medium text-purple-600">লিল্লাহ বোর্ডিং</p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1 gap-2">
              <ArrowLeft className="w-4 h-4" />
              পেছনে
            </Button>
            <Button onClick={handleSubmit} className="flex-1 gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  প্রক্রিয়াকরণ...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  আবেদন জমা দিন
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
