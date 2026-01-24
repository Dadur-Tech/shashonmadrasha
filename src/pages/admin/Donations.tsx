import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { 
  Search, 
  Heart, 
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  Baby,
  Building2,
  Printer,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { openPrintWindow, generateReportHeader, generateReportFooter, formatCurrency } from "@/lib/pdf-utils";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/ui/stat-card";

const categoryColors: Record<string, string> = {
  lillah_boarding: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  orphan_support: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  madrasa_development: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  general: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  zakat: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  sadaqah: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  fitra: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
};

const categoryLabels: Record<string, string> = {
  lillah_boarding: "লিল্লাহ বোর্ডিং",
  orphan_support: "এতিম সহায়তা",
  madrasa_development: "মাদরাসা উন্নয়ন",
  general: "সাধারণ দান",
  zakat: "যাকাত",
  sadaqah: "সাদাকা",
  fitra: "ফিতরা",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function DonationsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: donations = [], isLoading } = useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const completedDonations = donations.filter(d => d.payment_status === "completed");
  const completedAmount = completedDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const pendingCount = donations.filter(d => d.payment_status === "pending").length;

  const filteredDonations = donations.filter(donation =>
    donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.donation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (donation.donor_phone && donation.donor_phone.includes(searchTerm))
  );

  const lillahDonations = filteredDonations.filter(d => d.category === "lillah_boarding");
  const orphanDonations = filteredDonations.filter(d => d.category === "orphan_support");
  const developmentDonations = filteredDonations.filter(d => d.category === "madrasa_development");
  const otherDonations = filteredDonations.filter(d => 
    !["lillah_boarding", "orphan_support", "madrasa_development"].includes(d.category)
  );

  const { data: institution } = useQuery({
    queryKey: ["institution"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institution_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const handlePrintReport = () => {
    if (!institution) return;
    const content = `
      ${generateReportHeader({
        title: "দান রিপোর্ট",
        subtitle: "সকল দানের বিস্তারিত তালিকা",
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
      <div class="summary-box">
        <h3 style="margin: 0 0 15px 0; color: #0d5c2e;">সারসংক্ষেপ</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="label">মোট দান</div>
            <div class="value">${formatCurrency(totalAmount)}</div>
          </div>
          <div class="summary-item">
            <div class="label">সম্পন্ন দান</div>
            <div class="value">${formatCurrency(completedAmount)}</div>
          </div>
          <div class="summary-item">
            <div class="label">মোট দাতা</div>
            <div class="value">${donations.length}</div>
          </div>
        </div>
      </div>
      <table class="report-table">
        <thead>
          <tr>
            <th>ক্রম</th>
            <th>দাতা</th>
            <th>ক্যাটাগরি</th>
            <th>পরিমাণ</th>
            <th>স্ট্যাটাস</th>
            <th>তারিখ</th>
          </tr>
        </thead>
        <tbody>
          ${donations.map((d, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${d.is_anonymous ? "বেনামী দাতা" : d.donor_name}</td>
              <td>${categoryLabels[d.category] || d.category}</td>
              <td>${formatCurrency(d.amount)}</td>
              <td>${d.payment_status === "completed" ? "সম্পন্ন" : "পেন্ডিং"}</td>
              <td>${new Date(d.created_at).toLocaleDateString('bn-BD')}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${generateReportFooter({
        title: "দান রিপোর্ট",
        institution: {
          name: institution.name,
          nameEnglish: institution.name_english || "",
          address: institution.address || "",
          phone: institution.phone,
        },
      })}
    `;
    openPrintWindow(content, "দান রিপোর্ট");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">দান ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground">সকল দানের রেকর্ড দেখুন</p>
          </div>
          <Button className="gap-2" onClick={handlePrintReport}>
            <Printer className="w-4 h-4" />
            রিপোর্ট প্রিন্ট
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="মোট দান"
            value={`৳${totalAmount.toLocaleString('bn-BD')}`}
            icon={<Heart className="w-5 h-5" />}
          />
          <StatCard
            title="সম্পন্ন দান"
            value={`৳${completedAmount.toLocaleString('bn-BD')}`}
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
          <StatCard
            title="মোট দাতা"
            value={donations.length.toString()}
            icon={<Baby className="w-5 h-5" />}
          />
          <StatCard
            title="পেন্ডিং"
            value={pendingCount.toString()}
            icon={<Clock className="w-5 h-5" />}
          />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="দাতার নাম, আইডি বা ফোন দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">সকল ({filteredDonations.length})</TabsTrigger>
            <TabsTrigger value="lillah">লিল্লাহ ({lillahDonations.length})</TabsTrigger>
            <TabsTrigger value="orphan">এতিম ({orphanDonations.length})</TabsTrigger>
            <TabsTrigger value="development">উন্নয়ন ({developmentDonations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <DonationTable donations={filteredDonations} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="lillah">
            <DonationTable donations={lillahDonations} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="orphan">
            <DonationTable donations={orphanDonations} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="development">
            <DonationTable donations={developmentDonations} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function DonationTable({ donations, isLoading }: { donations: any[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>আইডি</TableHead>
              <TableHead>দাতা</TableHead>
              <TableHead>ক্যাটাগরি</TableHead>
              <TableHead>পেমেন্ট</TableHead>
              <TableHead className="text-right">পরিমাণ</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead>তারিখ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation, index) => (
              <motion.tr
                key={donation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <TableCell className="font-mono text-xs">{donation.donation_id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {donation.is_anonymous ? "বেনামী দাতা" : donation.donor_name}
                    </p>
                    {donation.donor_phone && !donation.is_anonymous && (
                      <p className="text-xs text-muted-foreground">{donation.donor_phone}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={categoryColors[donation.category]}>
                    {categoryLabels[donation.category] || donation.category}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{donation.payment_gateway || "-"}</TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  ৳{Number(donation.amount).toLocaleString('bn-BD')}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[donation.payment_status]}>
                    {donation.payment_status === "completed" ? "সম্পন্ন" : 
                     donation.payment_status === "pending" ? "পেন্ডিং" : "ব্যর্থ"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(donation.created_at).toLocaleDateString('bn-BD')}
                </TableCell>
              </motion.tr>
            ))}
            {donations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  কোনো দান রেকর্ড পাওয়া যায়নি
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
