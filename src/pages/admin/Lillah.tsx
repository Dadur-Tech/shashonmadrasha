import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Heart, 
  Users, 
  Wallet,
  UserPlus,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Gift,
  Loader2,
  Trash2,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function LillahPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSponsorOpen, setIsAddSponsorOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch lillah students from database
  const { data: lillahStudents = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["lillah-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          classes(name, department),
          sponsors(id, full_name, phone)
        `)
        .eq("is_lillah", true)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch sponsors
  const { data: sponsors = [], isLoading: sponsorsLoading } = useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("total_donated", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch donation stats for lillah
  const { data: donationStats } = useQuery({
    queryKey: ["lillah-donation-stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("donations")
        .select("amount")
        .eq("category", "lillah_boarding")
        .eq("payment_status", "completed");
      
      const total = data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      return { monthlyTotal: total };
    },
  });

  // Computed stats
  const totalLillah = lillahStudents.length;
  const orphanCount = lillahStudents.filter(s => s.is_orphan).length;
  const sponsoredCount = lillahStudents.filter(s => s.sponsor_id).length;
  const needsSponsor = totalLillah - sponsoredCount;
  const sponsorPercentage = totalLillah > 0 ? Math.round((sponsoredCount / totalLillah) * 100) : 0;

  // Filter students
  const filteredStudents = lillahStudents.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">লিল্লাহ বোর্ডিং</h1>
            <p className="text-muted-foreground">এতিম ও গরীব ছাত্রদের তথ্য ও স্পন্সর ব্যবস্থাপনা</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isAddSponsorOpen} onOpenChange={setIsAddSponsorOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Gift className="w-4 h-4" />
                  স্পন্সর যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন স্পন্সর যোগ করুন</DialogTitle>
                </DialogHeader>
                <AddSponsorForm onSuccess={() => {
                  setIsAddSponsorOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["sponsors"] });
                }} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="মোট লিল্লাহ ছাত্র"
            value={totalLillah.toLocaleString('bn-BD')}
            icon={<Heart className="w-6 h-6" />}
            variant="gold"
          />
          <StatCard
            title="এতিম ছাত্র"
            value={orphanCount.toLocaleString('bn-BD')}
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            title="স্পন্সরপ্রাপ্ত"
            value={sponsoredCount.toLocaleString('bn-BD')}
            icon={<Gift className="w-6 h-6" />}
            variant="success"
          />
          <StatCard
            title="মোট স্পন্সর দান"
            value={`৳ ${(donationStats?.monthlyTotal || 0).toLocaleString('bn-BD')}`}
            icon={<Wallet className="w-6 h-6" />}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>লিল্লাহ ছাত্র তালিকা</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="খুঁজুন..." 
                    className="pl-10 w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  {searchQuery ? "কোনো ছাত্র পাওয়া যায়নি" : "কোনো লিল্লাহ ছাত্র নেই। Students পেজ থেকে লিল্লাহ হিসেবে মার্ক করুন।"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>আইডি</TableHead>
                      <TableHead>নাম</TableHead>
                      <TableHead>ক্লাস</TableHead>
                      <TableHead>ধরন</TableHead>
                      <TableHead>স্পন্সর</TableHead>
                      <TableHead className="text-right">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <TableCell className="font-medium">{student.student_id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
                              {student.photo_url ? (
                                <img src={student.photo_url} alt={student.full_name} className="w-full h-full object-cover" />
                              ) : (
                                <Heart className="w-4 h-4 text-accent" />
                              )}
                            </div>
                            {student.full_name}
                          </div>
                        </TableCell>
                        <TableCell>{student.classes?.name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={student.is_orphan ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted"}>
                            {student.is_orphan ? "এতিম" : "গরীব"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {student.sponsor_id && (student as any).sponsors && !Array.isArray((student as any).sponsors) ? (
                            <div>
                              <p className="text-sm font-medium">{(student as any).sponsors.full_name}</p>
                              <p className="text-xs text-muted-foreground">{(student as any).sponsors.phone}</p>
                            </div>
                          ) : (
                            <Badge className="bg-warning/10 text-warning border-warning/20">স্পন্সর প্রয়োজন</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="w-4 h-4" /> বিস্তারিত
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Edit className="w-4 h-4" /> সম্পাদনা
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Gift className="w-4 h-4" /> স্পন্সর যোগ করুন
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Sponsors Sidebar */}
          <div className="space-y-6">
            {/* Sponsorship Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">স্পন্সরশিপ অগ্রগতি</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>স্পন্সরপ্রাপ্ত ছাত্র</span>
                    <span className="font-medium">{sponsorPercentage}%</span>
                  </div>
                  <Progress value={sponsorPercentage} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                    <p className="text-xl font-bold text-emerald-600">{sponsoredCount.toLocaleString('bn-BD')}</p>
                    <p className="text-xs text-muted-foreground">স্পন্সরপ্রাপ্ত</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-amber-500/10">
                    <p className="text-xl font-bold text-amber-600">{needsSponsor.toLocaleString('bn-BD')}</p>
                    <p className="text-xs text-muted-foreground">প্রয়োজন</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Sponsors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">শীর্ষ স্পন্সর</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sponsorsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : sponsors.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    কোনো স্পন্সর নেই
                  </p>
                ) : (
                  sponsors.slice(0, 5).map((sponsor, index) => (
                    <div 
                      key={sponsor.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                    >
                      <div>
                        <p className="font-medium">{sponsor.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sponsor.students_sponsored || 0} জন ছাত্র
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">৳{(sponsor.total_donated || 0).toLocaleString('bn-BD')}</p>
                        <p className="text-xs text-muted-foreground">মোট দান</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground">
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="font-bold text-lg mb-2">একজন এতিমের স্পন্সর হোন</h3>
                <p className="text-sm opacity-80 mb-4">
                  মাত্র ৳৩,০০০/মাসে একজন এতিম ছাত্রের সম্পূর্ণ খরচ বহন করতে পারেন
                </p>
                <Button variant="secondary" className="w-full" onClick={() => setIsAddSponsorOpen(true)}>
                  স্পন্সর হোন
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Add Sponsor Form Component
function AddSponsorForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    isAnonymous: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone) {
      toast({ title: "নাম ও ফোন নম্বর আবশ্যক", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("sponsors").insert({
      full_name: formData.fullName,
      phone: formData.phone,
      email: formData.email || null,
      address: formData.address || null,
      notes: formData.notes || null,
      is_anonymous: formData.isAnonymous,
    });

    setLoading(false);
    if (error) {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: "স্পন্সর যোগ হয়েছে" });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>নাম *</Label>
        <Input
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="স্পন্সরের পূর্ণ নাম"
        />
      </div>
      <div>
        <Label>ফোন নম্বর *</Label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="০১৭XXXXXXXX"
        />
      </div>
      <div>
        <Label>ইমেইল</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="sponsor@email.com"
        />
      </div>
      <div>
        <Label>ঠিকানা</Label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="সম্পূর্ণ ঠিকানা"
        />
      </div>
      <div>
        <Label>নোট</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="অতিরিক্ত তথ্য..."
          rows={2}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        স্পন্সর যোগ করুন
      </Button>
    </form>
  );
}
