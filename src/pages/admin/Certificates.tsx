import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Award, Plus, FileText, Printer, Search } from "lucide-react";
import { format } from "date-fns";

interface CertificateTemplate {
  id: string;
  name: string;
  template_type: string;
  content_template: string;
  header_text: string | null;
  footer_text: string | null;
  is_active: boolean;
}

interface IssuedCertificate {
  id: string;
  certificate_number: string;
  template_id: string | null;
  student_id: string;
  certificate_type: string;
  issue_date: string;
  is_revoked: boolean;
  remarks: string | null;
  students?: { full_name: string; student_id: string } | null;
  certificate_templates?: { name: string } | null;
}

const CERTIFICATE_TYPES = [
  { value: "completion", label: "সনদপত্র (Completion)" },
  { value: "character", label: "চরিত্র সনদ (Character)" },
  { value: "attendance", label: "উপস্থিতি সনদ (Attendance)" },
  { value: "merit", label: "মেধা সনদ (Merit)" },
  { value: "transfer", label: "বদলি সনদ (Transfer)" },
];

export default function Certificates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [isIssueCertOpen, setIsIssueCertOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<IssuedCertificate | null>(null);
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ["certificate_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificate_templates")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as CertificateTemplate[];
    },
  });

  // Fetch issued certificates
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["issued_certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("issued_certificates")
        .select("*, students(full_name, student_id), certificate_templates(name)")
        .order("issue_date", { ascending: false });
      if (error) throw error;
      return data as IssuedCertificate[];
    },
  });

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ["students_for_cert"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, student_id")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  // Add template mutation
  const addTemplateMutation = useMutation({
    mutationFn: async (data: { name: string; template_type: string; content_template: string; header_text?: string | null; footer_text?: string | null }) => {
      const { error } = await supabase.from("certificate_templates").insert({
        name: data.name,
        template_type: data.template_type,
        content_template: data.content_template,
        header_text: data.header_text,
        footer_text: data.footer_text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificate_templates"] });
      setIsAddTemplateOpen(false);
      toast.success("টেমপ্লেট সফলভাবে যোগ করা হয়েছে");
    },
    onError: () => toast.error("টেমপ্লেট যোগ করতে সমস্যা হয়েছে"),
  });

  // Issue certificate mutation
  const issueCertMutation = useMutation({
    mutationFn: async (data: { student_id: string; template_id: string; certificate_type: string; remarks: string }) => {
      const certNumber = `CERT-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("issued_certificates").insert({
        certificate_number: certNumber,
        student_id: data.student_id,
        template_id: data.template_id || null,
        certificate_type: data.certificate_type,
        remarks: data.remarks || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issued_certificates"] });
      setIsIssueCertOpen(false);
      toast.success("সনদপত্র ইস্যু করা হয়েছে");
    },
    onError: () => toast.error("সনদপত্র ইস্যু করতে সমস্যা হয়েছে"),
  });

  const filteredCerts = certificates.filter(
    (cert) =>
      cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.students?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.students?.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addTemplateMutation.mutate({
      name: formData.get("name") as string,
      template_type: formData.get("template_type") as string,
      content_template: formData.get("content_template") as string,
      header_text: formData.get("header_text") as string || null,
      footer_text: formData.get("footer_text") as string || null,
    });
  };

  const handleIssueCert = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    issueCertMutation.mutate({
      student_id: formData.get("student_id") as string,
      template_id: formData.get("template_id") as string,
      certificate_type: formData.get("certificate_type") as string,
      remarks: formData.get("remarks") as string,
    });
  };

  const handlePrint = (cert: IssuedCertificate) => {
    const student = cert.students;
    const template = templates.find(t => t.id === cert.template_id);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>সনদপত্র - ${cert.certificate_number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&display=swap');
          body { 
            font-family: 'Noto Sans Bengali', sans-serif; 
            padding: 40px; 
            text-align: center;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          }
          .certificate {
            border: 8px double #0d5c3f;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .header { 
            font-size: 28px; 
            font-weight: 700; 
            color: #0d5c3f;
            margin-bottom: 10px;
          }
          .arabic { 
            font-size: 24px; 
            direction: rtl; 
            color: #c9a227;
            margin-bottom: 20px;
          }
          .title { 
            font-size: 32px; 
            font-weight: 700; 
            color: #0d5c3f;
            margin: 30px 0;
            border-bottom: 2px solid #c9a227;
            padding-bottom: 10px;
          }
          .content { 
            font-size: 18px; 
            line-height: 2;
            text-align: justify;
            margin: 30px 0;
          }
          .student-name {
            font-size: 24px;
            font-weight: 700;
            color: #0d5c3f;
          }
          .footer {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            width: 150px;
            border-top: 1px solid #333;
            margin-top: 50px;
          }
          .cert-number {
            font-size: 12px;
            color: #666;
            margin-top: 30px;
          }
          @media print {
            body { background: white; }
            .certificate { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">${template?.header_text || 'আল জামিয়াতুল আরাবিয়া শাসন সিংগাতি মাদরাসা'}</div>
          <div class="arabic">بسم الله الرحمن الرحيم</div>
          <div class="title">${CERTIFICATE_TYPES.find(t => t.value === cert.certificate_type)?.label || 'সনদপত্র'}</div>
          <div class="content">
            <p>এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,</p>
            <p class="student-name">${student?.full_name || 'নাম'}</p>
            <p>(ছাত্র আইডি: ${student?.student_id || '-'})</p>
            <p>${template?.content_template || 'আমাদের প্রতিষ্ঠানের একজন নিয়মিত ছাত্র এবং তার চরিত্র ও আচরণ সন্তোষজনক।'}</p>
            ${cert.remarks ? `<p>মন্তব্য: ${cert.remarks}</p>` : ''}
          </div>
          <div class="footer">
            <div class="signature">
              <div class="signature-line"></div>
              <p>প্রধান শিক্ষক</p>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <p>মুহতামিম</p>
            </div>
          </div>
          <p class="cert-number">সনদ নম্বর: ${cert.certificate_number} | তারিখ: ${format(new Date(cert.issue_date), 'dd/MM/yyyy')}</p>
          <p class="cert-number">${template?.footer_text || ''}</p>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            সনদপত্র ম্যানেজমেন্ট
          </h1>
          <p className="text-muted-foreground">সনদপত্র ও প্রশংসাপত্র ব্যবস্থাপনা</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddTemplateOpen} onOpenChange={setIsAddTemplateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                টেমপ্লেট যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>নতুন টেমপ্লেট যোগ করুন</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTemplate} className="space-y-4">
                <div>
                  <Label htmlFor="name">টেমপ্লেট নাম *</Label>
                  <Input id="name" name="name" required placeholder="যেমন: সাধারণ সনদপত্র" />
                </div>
                <div>
                  <Label htmlFor="template_type">টাইপ *</Label>
                  <Select name="template_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="টাইপ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {CERTIFICATE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="header_text">হেডার টেক্সট</Label>
                  <Input id="header_text" name="header_text" placeholder="প্রতিষ্ঠানের নাম" />
                </div>
                <div>
                  <Label htmlFor="content_template">মূল বিষয়বস্তু *</Label>
                  <Textarea 
                    id="content_template" 
                    name="content_template" 
                    required 
                    rows={4}
                    placeholder="সনদপত্রের মূল টেক্সট লিখুন..."
                  />
                </div>
                <div>
                  <Label htmlFor="footer_text">ফুটার টেক্সট</Label>
                  <Input id="footer_text" name="footer_text" placeholder="অতিরিক্ত তথ্য" />
                </div>
                <Button type="submit" className="w-full" disabled={addTemplateMutation.isPending}>
                  {addTemplateMutation.isPending ? "যোগ করা হচ্ছে..." : "টেমপ্লেট যোগ করুন"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isIssueCertOpen} onOpenChange={setIsIssueCertOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                সনদপত্র ইস্যু করুন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>সনদপত্র ইস্যু করুন</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleIssueCert} className="space-y-4">
                <div>
                  <Label htmlFor="student_id">ছাত্র নির্বাচন করুন *</Label>
                  <Select name="student_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="ছাত্র নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} ({student.student_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="certificate_type">সনদপত্রের ধরন *</Label>
                  <Select name="certificate_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="ধরন নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {CERTIFICATE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template_id">টেমপ্লেট (ঐচ্ছিক)</Label>
                  <Select name="template_id">
                    <SelectTrigger>
                      <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.is_active).map((template) => (
                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="remarks">মন্তব্য</Label>
                  <Textarea id="remarks" name="remarks" placeholder="অতিরিক্ত মন্তব্য..." />
                </div>
                <Button type="submit" className="w-full" disabled={issueCertMutation.isPending}>
                  {issueCertMutation.isPending ? "ইস্যু করা হচ্ছে..." : "সনদপত্র ইস্যু করুন"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{certificates.length}</p>
                <p className="text-sm text-muted-foreground">মোট ইস্যুকৃত</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{templates.length}</p>
                <p className="text-sm text-muted-foreground">টেমপ্লেট</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Award className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {certificates.filter(c => c.certificate_type === 'completion').length}
                </p>
                <p className="text-sm text-muted-foreground">সনদপত্র</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Award className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {certificates.filter(c => c.certificate_type === 'character').length}
                </p>
                <p className="text-sm text-muted-foreground">চরিত্র সনদ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="certificates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="certificates">ইস্যুকৃত সনদপত্র</TabsTrigger>
          <TabsTrigger value="templates">টেমপ্লেট</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="সনদ নম্বর বা ছাত্রের নাম দিয়ে খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</p>
              ) : filteredCerts.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">কোনো সনদপত্র পাওয়া যায়নি</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>সনদ নম্বর</TableHead>
                        <TableHead>ছাত্রের নাম</TableHead>
                        <TableHead>ধরন</TableHead>
                        <TableHead>তারিখ</TableHead>
                        <TableHead>স্থিতি</TableHead>
                        <TableHead>অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCerts.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-mono text-sm">{cert.certificate_number}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{cert.students?.full_name || "-"}</p>
                              <p className="text-sm text-muted-foreground">{cert.students?.student_id}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {CERTIFICATE_TYPES.find(t => t.value === cert.certificate_type)?.label || cert.certificate_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(cert.issue_date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>
                            {cert.is_revoked ? (
                              <Badge variant="destructive">বাতিল</Badge>
                            ) : (
                              <Badge variant="default">বৈধ</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => handlePrint(cert)}>
                              <Printer className="h-4 w-4 mr-1" />
                              প্রিন্ট
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>সনদপত্র টেমপ্লেট</CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">কোনো টেমপ্লেট নেই</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <Card key={template.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{template.name}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {CERTIFICATE_TYPES.find(t => t.value === template.template_type)?.label || template.template_type}
                            </Badge>
                          </div>
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          {template.content_template}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
