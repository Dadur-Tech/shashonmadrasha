import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const students = [
  { id: "STD001", name: "আহমদ হাসান", father: "মো. হাসান আলী", class: "হিফজ ৩য় বর্ষ", phone: "০১৭১২৩৪৫৬৭৮", status: "active", fee: "paid" },
  { id: "STD002", name: "মুহাম্মদ আলী", father: "আব্দুল করিম", class: "কিতাব ২য় বর্ষ", phone: "০১৮১২৩৪৫৬৭৮", status: "active", fee: "due" },
  { id: "STD003", name: "আব্দুর রহমান", father: "মো. রফিকুল ইসলাম", class: "মক্তব", phone: "০১৯১২৩৪৫৬৭৮", status: "lillah", fee: "exempt" },
  { id: "STD004", name: "ইব্রাহিম খান", father: "খান মো. আকবর", class: "হিফজ ১ম বর্ষ", phone: "০১৫১২৩৪৫৬৭৮", status: "active", fee: "paid" },
  { id: "STD005", name: "ইউসুফ আহমেদ", father: "আহমেদ হোসাইন", class: "তাখাসসুস", phone: "০১৬১২৩৪৫৬৭৮", status: "active", fee: "paid" },
  { id: "STD006", name: "হাফেজ মোস্তফা", father: "মো. কামাল", class: "হিফজ ২য় বর্ষ", phone: "০১৩১২৩৪৫৬৭৮", status: "lillah", fee: "exempt" },
  { id: "STD007", name: "আরিফ হোসেন", father: "হোসেন আলী", class: "কিতাব ১ম বর্ষ", phone: "০১৪১২৩৪৫৬৭৮", status: "active", fee: "due" },
];

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  lillah: "bg-accent/10 text-accent border-accent/20",
  inactive: "bg-muted text-muted-foreground",
};

const feeColors = {
  paid: "bg-success/10 text-success",
  due: "bg-destructive/10 text-destructive",
  exempt: "bg-muted text-muted-foreground",
};

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ছাত্র ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground">সকল ছাত্রের তথ্য দেখুন ও পরিচালনা করুন</p>
          </div>
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            নতুন ছাত্র যোগ করুন
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">৪৫৬</p>
              <p className="text-sm text-muted-foreground">মোট ছাত্র</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-success">৩৯৮</p>
              <p className="text-sm text-muted-foreground">সক্রিয় ছাত্র</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-accent">৪২</p>
              <p className="text-sm text-muted-foreground">লিল্লাহ ছাত্র</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-destructive">১৬</p>
              <p className="text-sm text-muted-foreground">ফি বকেয়া</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="ছাত্রের নাম, আইডি বা ফোন নম্বর দিয়ে খুঁজুন..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="বিভাগ নির্বাচন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল বিভাগ</SelectItem>
                  <SelectItem value="hifz">হিফজ বিভাগ</SelectItem>
                  <SelectItem value="kitab">কিতাব বিভাগ</SelectItem>
                  <SelectItem value="maktab">মক্তব</SelectItem>
                  <SelectItem value="takhassos">তাখাসসুস</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="স্ট্যাটাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল স্ট্যাটাস</SelectItem>
                  <SelectItem value="active">সক্রিয়</SelectItem>
                  <SelectItem value="lillah">লিল্লাহ</SelectItem>
                  <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                এক্সপোর্ট
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>আইডি</TableHead>
                  <TableHead>ছাত্রের নাম</TableHead>
                  <TableHead>অভিভাবক</TableHead>
                  <TableHead>ক্লাস/বিভাগ</TableHead>
                  <TableHead>ফোন</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>ফি</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-sm font-medium">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <span>{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.father}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[student.status as keyof typeof statusColors]}>
                        {student.status === "active" && "সক্রিয়"}
                        {student.status === "lillah" && "লিল্লাহ"}
                        {student.status === "inactive" && "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={feeColors[student.fee as keyof typeof feeColors]}>
                        {student.fee === "paid" && "পরিশোধিত"}
                        {student.fee === "due" && "বকেয়া"}
                        {student.fee === "exempt" && "মওকুফ"}
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
                          <DropdownMenuItem className="gap-2">
                            <Eye className="w-4 h-4" /> বিস্তারিত দেখুন
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" /> সম্পাদনা
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="w-4 h-4" /> মুছে ফেলুন
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
      </div>
    </AdminLayout>
  );
}
