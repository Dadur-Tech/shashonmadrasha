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
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

const lillahStudents = [
  { id: "LIL001", name: "আব্দুর রহমান", class: "হিফজ ২য় বর্ষ", orphan: true, sponsor: "হাজী আব্দুল্লাহ", sponsorAmount: 3000, status: "sponsored" },
  { id: "LIL002", name: "মুহাম্মদ ইয়াসিন", class: "কিতাব ১ম বর্ষ", orphan: true, sponsor: null, sponsorAmount: 0, status: "needs_sponsor" },
  { id: "LIL003", name: "হাফেজ কারিম", class: "হিফজ ৩য় বর্ষ", orphan: false, sponsor: "ডা. রহমান", sponsorAmount: 2500, status: "sponsored" },
  { id: "LIL004", name: "ইউসুফ আলী", class: "মক্তব", orphan: true, sponsor: null, sponsorAmount: 0, status: "needs_sponsor" },
  { id: "LIL005", name: "আবু বকর", class: "হিফজ ১ম বর্ষ", orphan: false, sponsor: "জনাব করিম", sponsorAmount: 3500, status: "sponsored" },
];

const sponsors = [
  { name: "হাজী আব্দুল্লাহ", students: 3, totalAmount: 9000, since: "২০২৩" },
  { name: "ডা. রহমান", students: 2, totalAmount: 5000, since: "২০২৪" },
  { name: "জনাব করিম", students: 1, totalAmount: 3500, since: "২০২৪" },
];

export default function LillahPage() {
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
            <Button variant="outline" className="gap-2">
              <Gift className="w-4 h-4" />
              স্পন্সর যোগ করুন
            </Button>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              নতুন ছাত্র যোগ করুন
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="মোট লিল্লাহ ছাত্র"
            value="৪২"
            icon={Heart}
            variant="gold"
          />
          <StatCard
            title="এতিম ছাত্র"
            value="২৮"
            icon={Users}
          />
          <StatCard
            title="স্পন্সরপ্রাপ্ত"
            value="৩৫"
            icon={Gift}
            variant="success"
          />
          <StatCard
            title="মাসিক স্পন্সরশিপ"
            value="৳ ৮৫,০০০"
            icon={Wallet}
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
                  <Input placeholder="খুঁজুন..." className="pl-10 w-48" />
                </div>
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                  {lillahStudents.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell className="font-medium">{student.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                            <Heart className="w-4 h-4 text-accent" />
                          </div>
                          {student.name}
                        </div>
                      </TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={student.orphan ? "bg-destructive/10 text-destructive" : "bg-muted"}>
                          {student.orphan ? "এতিম" : "গরীব"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.sponsor ? (
                          <div>
                            <p className="text-sm font-medium">{student.sponsor}</p>
                            <p className="text-xs text-muted-foreground">৳{student.sponsorAmount}/মাস</p>
                          </div>
                        ) : (
                          <Badge className="bg-warning/10 text-warning">স্পন্সর প্রয়োজন</Badge>
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
                    <span className="font-medium">৮৩%</span>
                  </div>
                  <Progress value={83} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-success/10">
                    <p className="text-xl font-bold text-success">৩৫</p>
                    <p className="text-xs text-muted-foreground">স্পন্সরপ্রাপ্ত</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-warning/10">
                    <p className="text-xl font-bold text-warning">৭</p>
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
                {sponsors.map((sponsor, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div>
                      <p className="font-medium">{sponsor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sponsor.students} জন ছাত্র • {sponsor.since} থেকে
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">৳{sponsor.totalAmount}</p>
                      <p className="text-xs text-muted-foreground">/মাস</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-accent to-gold-dark text-accent-foreground">
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="font-bold text-lg mb-2">একজন এতিমের স্পন্সর হোন</h3>
                <p className="text-sm opacity-80 mb-4">
                  মাত্র ৳৩,০০০/মাসে একজন এতিম ছাত্রের সম্পূর্ণ খরচ বহন করতে পারেন
                </p>
                <Button variant="secondary" className="w-full">
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
