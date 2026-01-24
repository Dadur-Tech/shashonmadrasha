import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Heart,
  Building,
  Users,
  IdCard,
  BookOpen,
  Printer
} from "lucide-react";

const statusLabels: Record<string, string> = {
  active: "সক্রিয়",
  lillah: "লিল্লাহ বোর্ডিং",
  inactive: "নিষ্ক্রিয়",
  graduated: "পাস",
  transferred: "বদলি",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  lillah: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  inactive: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  graduated: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  transferred: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const departmentLabels: Record<string, string> = {
  hifz: "হিফজ বিভাগ",
  kitab: "কিতাব বিভাগ",
  nurani: "নূরানী বিভাগ",
  tajweed: "তাজবীদ বিভাগ",
  nazera: "নাযেরা বিভাগ",
};

export default function StudentProfile() {
  const { studentId } = useParams();
  
  const { data: student, isLoading, error } = useQuery({
    queryKey: ["public-student", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID required");
      
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          classes(id, name, department)
        `)
        .eq("student_id", studentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });

  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/student/${studentId}` 
    : '';

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">ছাত্র পাওয়া যায়নি</h2>
            <p className="text-muted-foreground mb-6">
              এই আইডি দিয়ে কোনো ছাত্র খুঁজে পাওয়া যায়নি।
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                হোমে ফিরুন
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Header - Hidden in print */}
      <header className="bg-primary text-primary-foreground py-4 shadow-lg print:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span>হোমে ফিরুন</span>
            </Link>
            <h1 className="text-xl font-bold">ছাত্র প্রোফাইল</h1>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 print:py-4">
        {/* Print Header - Only shown in print */}
        <div className="hidden print:block text-center mb-6 print:text-foreground">
          <h1 className="text-2xl font-bold text-foreground">আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা</h1>
          <p className="text-muted-foreground">ছাত্র প্রোফাইল</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main Profile Card */}
          <Card className="border-2 border-primary/20 shadow-xl overflow-hidden print:shadow-none print:border">
            {/* Header with Photo and QR */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 md:p-8 print:p-4">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                {/* Photo */}
                <div className="relative">
                  <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-4 border-white dark:border-background shadow-xl print:w-32 print:h-32">
                    {student.photo_url ? (
                      <img 
                        src={student.photo_url} 
                        alt={student.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-5xl font-bold">
                        {student.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <Badge 
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${statusColors[student.status] || statusColors.active}`}
                  >
                    {statusLabels[student.status] || student.status}
                  </Badge>
                </div>

                {/* Basic Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 print:text-2xl">
                    {student.full_name}
                  </h2>
                  {student.full_name_arabic && (
                    <p className="text-xl text-muted-foreground mb-3" dir="rtl">
                      {student.full_name_arabic}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                    <Badge variant="outline" className="gap-1">
                      <IdCard className="w-3 h-3" />
                      {student.student_id}
                    </Badge>
                    {student.classes && (
                      <>
                        <Badge variant="secondary" className="gap-1">
                          <BookOpen className="w-3 h-3" />
                          {student.classes.name}
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {departmentLabels[student.classes.department] || student.classes.department}
                        </Badge>
                      </>
                    )}
                  </div>

                  {student.is_lillah && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Heart className="w-4 h-4 fill-current" />
                      <span className="font-medium">লিল্লাহ বোর্ডিং ছাত্র</span>
                    </div>
                  )}
                </div>

                {/* QR Code */}
                <div className="bg-white dark:bg-background p-4 rounded-xl shadow-lg border border-border print:shadow-none">
                  <QRCodeSVG 
                    value={profileUrl}
                    size={120}
                    level="H"
                    includeMargin={false}
                    className="print:w-24 print:h-24"
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    স্ক্যান করুন
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <CardContent className="p-6 md:p-8 print:p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                {/* Personal Information */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      ব্যক্তিগত তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoRow label="পিতার নাম" value={student.father_name} />
                    <InfoRow label="মাতার নাম" value={student.mother_name} />
                    <InfoRow label="অভিভাবক" value={student.guardian_name} />
                    <InfoRow 
                      label="জন্ম তারিখ" 
                      value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('bn-BD') : undefined} 
                    />
                    {student.blood_group && (
                      <InfoRow label="রক্তের গ্রুপ" value={student.blood_group} />
                    )}
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      যোগাযোগ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoRow label="অভিভাবক ফোন" value={student.guardian_phone} />
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      ঠিকানা
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoRow label="গ্রাম" value={student.village} />
                    <InfoRow label="ডাকঘর" value={student.post_office} />
                    <InfoRow label="উপজেলা" value={student.upazila} />
                    <InfoRow label="জেলা" value={student.district} />
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="w-5 h-5 text-primary" />
                      শিক্ষা তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoRow label="ক্লাস" value={student.classes?.name} />
                    <InfoRow 
                      label="বিভাগ" 
                      value={student.classes?.department ? departmentLabels[student.classes.department] || student.classes.department : undefined} 
                    />
                    <InfoRow label="পূর্ব প্রতিষ্ঠান" value={student.previous_institution} />
                    <InfoRow 
                      label="ভর্তির তারিখ" 
                      value={student.admission_date ? new Date(student.admission_date).toLocaleDateString('bn-BD') : undefined} 
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Notes Section */}
              {student.notes && (
                <Card className="border-border mt-6 print:mt-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      বিশেষ তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{student.notes}</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Footer - Hidden in print */}
          <div className="mt-8 text-center print:hidden">
            <p className="text-sm text-muted-foreground mb-4">
              এই প্রোফাইল QR কোড স্ক্যান করে দেখা যাবে
            </p>
            <Link to="/students">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                সকল ছাত্র দেখুন
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Print Footer */}
      <div className="hidden print:block text-center mt-8 pt-4 border-t">
        <p className="text-sm text-gray-500">
          আল জামিয়া আরাবিয়া শাসন সিংগাতী মাদ্রাসা © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
