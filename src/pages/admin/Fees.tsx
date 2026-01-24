import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Download,
  Loader2,
  Banknote,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/ui/stat-card";

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

export default function FeesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["student-fees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_fees")
        .select(`
          *,
          student:students(full_name, student_id, guardian_phone),
          fee_type:fee_types(name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
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

  const pendingFees = filteredFees.filter(f => f.status === "pending" || f.status === "overdue");
  const paidFees = filteredFees.filter(f => f.status === "paid");

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ফি ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground">ছাত্রদের ফি সংগ্রহ ও ট্র্যাকিং</p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            রিপোর্ট ডাউনলোড
          </Button>
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
            <FeeTable fees={pendingFees} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="paid">
            <FeeTable fees={paidFees} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function FeeTable({ fees, isLoading }: { fees: any[]; isLoading: boolean }) {
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
              <TableHead>ফি টাইপ</TableHead>
              <TableHead>মাস/বছর</TableHead>
              <TableHead className="text-right">পরিমাণ</TableHead>
              <TableHead className="text-right">পরিশোধিত</TableHead>
              <TableHead className="text-right">বকেয়া</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
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
                <TableCell>{fee.fee_type?.name || "-"}</TableCell>
                <TableCell>
                  {fee.month && fee.year ? `${fee.month}/${fee.year}` : fee.year || "-"}
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
              </motion.tr>
            ))}
            {fees.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
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
