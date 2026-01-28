import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { 
  Search, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Download,
  Loader2,
  Banknote,
  TrendingUp,
  Plus,
  MoreHorizontal,
  Receipt,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/ui/stat-card";
import { toast } from "@/hooks/use-toast";
import { handleDatabaseError } from "@/lib/error-handler";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  partial: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  waived: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  overdue: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "বকেয়া",
  partial: "আংশিক",
  paid: "পরিশোধিত",
  waived: "মওকুফ",
  overdue: "অতিরিক্ত বকেয়া",
};

const monthNames = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export default function FeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["student-fees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_fees")
        .select(`
          *,
          student:students(full_name, student_id, guardian_phone, class_id, classes(name)),
          fee_type:fee_types(name)
        `)
        .order("created_at", { ascending: false })
        .limit(200);
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (feeId: string) => {
      const { error } = await supabase
        .from("student_fees")
        .delete()
        .eq("id", feeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-fees"] });
      toast({ title: "সফল!", description: "ফি রেকর্ড মুছে ফেলা হয়েছে" });
    },
    onError: (error: Error) => {
      handleDatabaseError(error, "fee-delete");
    },
  });

  const totalAmount = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const paidAmount = fees.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0);
  const dueAmount = fees.reduce((sum, f) => sum + Number(f.due_amount || 0), 0);
  const paidCount = fees.filter(f => f.status === "paid").length;

  const filteredFees = fees.filter(fee =>
    fee.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.student?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.fee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingFees = filteredFees.filter(f => f.status === "pending" || f.status === "overdue" || f.status === "partial");
  const paidFees = filteredFees.filter(f => f.status === "paid" || f.status === "waived");

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ফি ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground">ছাত্রদের ফি সংগ্রহ ও ট্র্যাকিং</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => {
                // Generate fee report
                const reportData = fees.map(f => ({
                  "ফি আইডি": f.fee_id,
                  "ছাত্র": f.student?.full_name || "-",
                  "ছাত্র আইডি": f.student?.student_id || "-",
                  "ক্লাস": f.student?.classes?.name || "-",
                  "ফি টাইপ": f.fee_type?.name || "মাসিক ফি",
                  "মাস": f.month ? monthNames[f.month - 1] : "-",
                  "বছর": f.year,
                  "পরিমাণ": f.amount,
                  "পরিশোধিত": f.paid_amount || 0,
                  "বকেয়া": f.due_amount || 0,
                  "স্ট্যাটাস": statusLabels[f.status] || f.status,
                }));
                
                // Create CSV
                const headers = Object.keys(reportData[0] || {});
                const csvContent = [
                  headers.join(","),
                  ...reportData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(","))
                ].join("\n");
                
                // Download
                const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `fee-report-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                URL.revokeObjectURL(url);
                
                toast({ title: "রিপোর্ট ডাউনলোড হচ্ছে!" });
              }}
            >
              <Download className="w-4 h-4" />
              রিপোর্ট
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  নতুন ফি যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>নতুন ফি যোগ করুন</DialogTitle>
                </DialogHeader>
                <AddFeeForm onSuccess={() => {
                  setIsAddOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["student-fees"] });
                }} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="মোট ফি"
            value={`৳${totalAmount.toLocaleString('bn-BD')}`}
            icon={<Banknote className="w-5 h-5" />}
          />
          <StatCard
            title="আদায়কৃত"
            value={`৳${paidAmount.toLocaleString('bn-BD')}`}
            icon={<CheckCircle2 className="w-5 h-5" />}
            trend={{ value: Math.round((paidAmount / totalAmount) * 100) || 0, label: "%" }}
          />
          <StatCard
            title="বকেয়া"
            value={`৳${dueAmount.toLocaleString('bn-BD')}`}
            icon={<AlertTriangle className="w-5 h-5" />}
          />
          <StatCard
            title="পরিশোধিত"
            value={`${paidCount} জন`}
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ছাত্রের নাম বা আইডি দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              বকেয়া ({pendingFees.length})
            </TabsTrigger>
            <TabsTrigger value="paid" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              পরিশোধিত ({paidFees.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <FeeTable 
              fees={pendingFees} 
              isLoading={isLoading}
              onCollect={(fee) => {
                setSelectedFee(fee);
                setIsCollectOpen(true);
              }}
              onDelete={(id) => {
                if (confirm("আপনি কি এই ফি রেকর্ড মুছে ফেলতে চান?")) {
                  deleteMutation.mutate(id);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="paid">
            <FeeTable 
              fees={paidFees} 
              isLoading={isLoading}
              onCollect={(fee) => {
                setSelectedFee(fee);
                setIsCollectOpen(true);
              }}
              onDelete={(id) => {
                if (confirm("আপনি কি এই ফি রেকর্ড মুছে ফেলতে চান?")) {
                  deleteMutation.mutate(id);
                }
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Collect Fee Dialog */}
        <Dialog open={isCollectOpen} onOpenChange={setIsCollectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ফি আদায় করুন</DialogTitle>
            </DialogHeader>
            {selectedFee && (
              <CollectFeeForm 
                fee={selectedFee}
                onSuccess={() => {
                  setIsCollectOpen(false);
                  setSelectedFee(null);
                  queryClient.invalidateQueries({ queryKey: ["student-fees"] });
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function FeeTable({ 
  fees, 
  isLoading,
  onCollect,
  onDelete,
}: { 
  fees: any[]; 
  isLoading: boolean;
  onCollect: (fee: any) => void;
  onDelete: (id: string) => void;
}) {
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
              <TableHead>ফি আইডি</TableHead>
              <TableHead>ছাত্র</TableHead>
              <TableHead>ক্লাস</TableHead>
              <TableHead>ফি টাইপ</TableHead>
              <TableHead>মাস/বছর</TableHead>
              <TableHead className="text-right">পরিমাণ</TableHead>
              <TableHead className="text-right">পরিশোধিত</TableHead>
              <TableHead className="text-right">বকেয়া</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map((fee, index) => (
              <motion.tr
                key={fee.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <TableCell className="font-mono text-xs">{fee.fee_id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{fee.student?.full_name || "-"}</p>
                    <p className="text-xs text-muted-foreground">{fee.student?.student_id}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{fee.student?.classes?.name || "-"}</TableCell>
                <TableCell>{fee.fee_type?.name || "মাসিক ফি"}</TableCell>
                <TableCell>
                  {fee.month && fee.year ? `${monthNames[fee.month - 1]} ${fee.year}` : fee.year || "-"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ৳{Number(fee.amount).toLocaleString('bn-BD')}
                </TableCell>
                <TableCell className="text-right text-emerald-600">
                  ৳{Number(fee.paid_amount).toLocaleString('bn-BD')}
                </TableCell>
                <TableCell className="text-right text-amber-600">
                  ৳{Number(fee.due_amount).toLocaleString('bn-BD')}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[fee.status]}>
                    {statusLabels[fee.status] || fee.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {fee.status !== "paid" && fee.status !== "waived" && (
                        <DropdownMenuItem onClick={() => onCollect(fee)} className="gap-2">
                          <Receipt className="w-4 h-4" />
                          ফি আদায় করুন
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onDelete(fee.id)} 
                        className="gap-2 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        মুছে ফেলুন
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
            {fees.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                  কোনো ফি রেকর্ড পাওয়া যায়নি
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AddFeeForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    dueDate: "",
    notes: "",
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-for-fee"],
    queryFn: async () => {
      const { data } = await supabase
        .from("students")
        .select("id, student_id, full_name, class_id, classes(name, monthly_fee)")
        .eq("status", "active")
        .eq("is_lillah", false)
        .order("full_name");
      return data || [];
    },
  });

  const selectedStudent = students.find(s => s.id === formData.studentId);
  const suggestedAmount = selectedStudent?.classes?.monthly_fee || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.amount) {
      toast({ title: "ছাত্র এবং টাকার পরিমাণ দিন", variant: "destructive" });
      return;
    }

    setLoading(true);
    const feeId = `FEE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const amount = Number(formData.amount);

    const { error } = await supabase.from("student_fees").insert({
      fee_id: feeId,
      student_id: formData.studentId,
      amount: amount,
      paid_amount: 0,
      month: formData.month,
      year: formData.year,
      due_date: formData.dueDate || null,
      status: "pending",
      notes: formData.notes || null,
    });

    setLoading(false);
    if (error) {
      handleDatabaseError(error, "fee-create");
    } else {
      toast({ title: "সফল!", description: "ফি যোগ হয়েছে" });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>ছাত্র নির্বাচন করুন *</Label>
        <Select value={formData.studentId} onValueChange={(v) => setFormData({ ...formData, studentId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="ছাত্র বাছুন" />
          </SelectTrigger>
          <SelectContent>
            {students.map(s => (
              <SelectItem key={s.id} value={s.id}>
                {s.full_name} ({s.student_id}) - {s.classes?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>মাস</Label>
          <Select 
            value={formData.month.toString()} 
            onValueChange={(v) => setFormData({ ...formData, month: parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((name, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>বছর</Label>
          <Input 
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <Label>টাকার পরিমাণ *</Label>
        <Input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder={suggestedAmount ? `সাজেস্টেড: ৳${suggestedAmount}` : "০"}
        />
        {suggestedAmount > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            ক্লাসের মাসিক ফি: ৳{suggestedAmount}
          </p>
        )}
      </div>

      <div>
        <Label>শেষ তারিখ (অপশনাল)</Label>
        <Input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        ফি যোগ করুন
      </Button>
    </form>
  );
}

function CollectFeeForm({ fee, onSuccess }: { fee: any; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(fee.due_amount?.toString() || "");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      toast({ title: "সঠিক পরিমাণ দিন", variant: "destructive" });
      return;
    }

    setLoading(true);
    const newPaidAmount = Number(fee.paid_amount) + payAmount;
    const newDueAmount = Number(fee.amount) - newPaidAmount;
    const newStatus = newDueAmount <= 0 ? "paid" : "partial";

    const { error } = await supabase
      .from("student_fees")
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
      })
      .eq("id", fee.id);

    setLoading(false);
    if (error) {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: `৳${payAmount} আদায় হয়েছে` });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="bg-secondary/30">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ছাত্র:</span>
              <span className="font-medium">{fee.student?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">মোট ফি:</span>
              <span className="font-medium">৳{Number(fee.amount).toLocaleString('bn-BD')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">আদায়কৃত:</span>
              <span className="font-medium text-emerald-600">৳{Number(fee.paid_amount).toLocaleString('bn-BD')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">বকেয়া:</span>
              <span className="font-medium text-amber-600">৳{Number(fee.due_amount).toLocaleString('bn-BD')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label>আদায়ের পরিমাণ *</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="০"
          max={fee.due_amount}
        />
      </div>

      <div>
        <Label>পেমেন্ট মাধ্যম</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">নগদ</SelectItem>
            <SelectItem value="bkash">বিকাশ</SelectItem>
            <SelectItem value="nagad">নগদ</SelectItem>
            <SelectItem value="bank">ব্যাংক</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        ফি আদায় করুন
      </Button>
    </form>
  );
}
