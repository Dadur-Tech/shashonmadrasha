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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Search, 
  Heart, 
  Loader2,
  CheckCircle2,
  Clock,
  Baby,
  Printer,
  MoreVertical,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { openPrintWindow, generateReportHeader, generateReportFooter, formatCurrency } from "@/lib/pdf-utils";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/ui/stat-card";
import { useToast } from "@/hooks/use-toast";

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
  processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "পেন্ডিং",
  processing: "প্রসেসিং",
  completed: "সম্পন্ন",
  failed: "ব্যর্থ",
};

export default function DonationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, txnId }: { id: string; status: string; txnId?: string }) => {
      const updateData: any = { payment_status: status };
      if (txnId) updateData.transaction_id = txnId;
      
      const { error } = await supabase
        .from("donations")
        .update(updateData)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      setStatusDialogOpen(false);
      setSelectedDonation(null);
      setNewStatus("");
      setTransactionId("");
      toast({
        title: "সফল!",
        description: "পেমেন্ট স্ট্যাটাস আপডেট হয়েছে",
      });
    },
    onError: (error: any) => {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message || "স্ট্যাটাস আপডেট করা যায়নি",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("donations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast({
        title: "মুছে ফেলা হয়েছে",
        description: "দান রেকর্ড মুছে ফেলা হয়েছে",
      });
    },
    onError: (error: any) => {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message || "মুছে ফেলা যায়নি",
        variant: "destructive",
      });
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

  const handleStatusUpdate = (donation: any) => {
    setSelectedDonation(donation);
    setNewStatus(donation.payment_status);
    setTransactionId(donation.transaction_id || "");
    setStatusDialogOpen(true);
  };

  const handleSaveStatus = () => {
    if (!selectedDonation || !newStatus) return;
    updateStatusMutation.mutate({
      id: selectedDonation.id,
      status: newStatus,
      txnId: transactionId || undefined,
    });
  };

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
              <td>${statusLabels[d.payment_status] || d.payment_status}</td>
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">দান ব্যবস্থাপনা</h1>
            <p className="text-sm text-muted-foreground">সকল দানের রেকর্ড দেখুন ও স্ট্যাটাস পরিচালনা করুন</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={handlePrintReport}>
            <Printer className="w-4 h-4" />
            রিপোর্ট প্রিন্ট
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="মোট দান"
            value={`৳${totalAmount.toLocaleString('bn-BD')}`}
            icon={<Heart className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
          <StatCard
            title="সম্পন্ন দান"
            value={`৳${completedAmount.toLocaleString('bn-BD')}`}
            icon={<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
          <StatCard
            title="মোট দাতা"
            value={donations.length.toString()}
            icon={<Baby className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
          <StatCard
            title="পেন্ডিং"
            value={pendingCount.toString()}
            icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-3 sm:p-4">
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
          <TabsList className="w-full sm:w-auto flex-wrap">
            <TabsTrigger value="all" className="text-xs sm:text-sm">সকল ({filteredDonations.length})</TabsTrigger>
            <TabsTrigger value="lillah" className="text-xs sm:text-sm">লিল্লাহ ({lillahDonations.length})</TabsTrigger>
            <TabsTrigger value="orphan" className="text-xs sm:text-sm">এতিম ({orphanDonations.length})</TabsTrigger>
            <TabsTrigger value="development" className="text-xs sm:text-sm">উন্নয়ন ({developmentDonations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <DonationTable 
              donations={filteredDonations} 
              isLoading={isLoading}
              onStatusUpdate={handleStatusUpdate}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          </TabsContent>
          <TabsContent value="lillah">
            <DonationTable 
              donations={lillahDonations} 
              isLoading={isLoading}
              onStatusUpdate={handleStatusUpdate}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          </TabsContent>
          <TabsContent value="orphan">
            <DonationTable 
              donations={orphanDonations} 
              isLoading={isLoading}
              onStatusUpdate={handleStatusUpdate}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          </TabsContent>
          <TabsContent value="development">
            <DonationTable 
              donations={developmentDonations} 
              isLoading={isLoading}
              onStatusUpdate={handleStatusUpdate}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          </TabsContent>
        </Tabs>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>পেমেন্ট স্ট্যাটাস আপডেট</DialogTitle>
              <DialogDescription>
                {selectedDonation && (
                  <>দান আইডি: {selectedDonation.donation_id} - ৳{Number(selectedDonation.amount).toLocaleString('bn-BD')}</>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium">বর্তমান স্ট্যাটাস: <Badge className={statusColors[selectedDonation?.payment_status]}>{statusLabels[selectedDonation?.payment_status]}</Badge></p>
              </div>
              
              <div className="space-y-2">
                <Label>নতুন স্ট্যাটাস</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">পেন্ডিং</SelectItem>
                    <SelectItem value="processing">প্রসেসিং</SelectItem>
                    <SelectItem value="completed">সম্পন্ন</SelectItem>
                    <SelectItem value="failed">ব্যর্থ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newStatus === "completed" && (
                <div className="space-y-2">
                  <Label>ট্রানজেকশন আইডি (ঐচ্ছিক)</Label>
                  <Input
                    placeholder="পেমেন্ট গেটওয়ে ট্রানজেকশন আইডি"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              )}

              {newStatus === "completed" && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 inline mr-2" />
                  সম্পন্ন করলে দান গৃহীত হিসেবে চিহ্নিত হবে
                </div>
              )}

              {newStatus === "failed" && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  ব্যর্থ চিহ্নিত করলে দান বাতিল হবে
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                বাতিল
              </Button>
              <Button 
                onClick={handleSaveStatus} 
                disabled={updateStatusMutation.isPending || !newStatus}
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                আপডেট করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

interface DonationTableProps {
  donations: any[];
  isLoading: boolean;
  onStatusUpdate: (donation: any) => void;
  onDelete: (id: string) => void;
}

function DonationTable({ donations, isLoading, onStatusUpdate, onDelete }: DonationTableProps) {
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
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">আইডি</TableHead>
              <TableHead className="min-w-[150px]">দাতা</TableHead>
              <TableHead>ক্যাটাগরি</TableHead>
              <TableHead>পেমেন্ট</TableHead>
              <TableHead className="text-right">পরিমাণ</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead>তারিখ</TableHead>
              <TableHead className="w-[50px]">অ্যাকশন</TableHead>
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
                    <p className="font-medium text-sm">
                      {donation.is_anonymous ? "বেনামী দাতা" : donation.donor_name}
                    </p>
                    {donation.donor_phone && !donation.is_anonymous && (
                      <p className="text-xs text-muted-foreground">{donation.donor_phone}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${categoryColors[donation.category]} text-xs`}>
                    {categoryLabels[donation.category] || donation.category}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize text-xs">{donation.payment_gateway || "-"}</TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  ৳{Number(donation.amount).toLocaleString('bn-BD')}
                </TableCell>
                <TableCell>
                  <Badge className={`${statusColors[donation.payment_status]} text-xs cursor-pointer`} onClick={() => onStatusUpdate(donation)}>
                    {statusLabels[donation.payment_status] || donation.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(donation.created_at).toLocaleDateString('bn-BD')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                      <DropdownMenuItem onClick={() => onStatusUpdate(donation)}>
                        <Edit className="w-4 h-4 mr-2" />
                        স্ট্যাটাস পরিবর্তন
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(donation.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        মুছে ফেলুন
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
            {donations.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
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