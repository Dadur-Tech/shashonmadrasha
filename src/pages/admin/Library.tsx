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
import { Book, Plus, Search, BookOpen, Users, AlertTriangle, RotateCcw } from "lucide-react";
import { format } from "date-fns";

interface BookCategory {
  id: string;
  name: string;
  name_arabic: string | null;
  description: string | null;
}

interface BookData {
  id: string;
  book_id: string;
  title: string;
  title_arabic: string | null;
  author: string | null;
  category_id: string | null;
  total_copies: number;
  available_copies: number;
  shelf_location: string | null;
  is_reference_only: boolean;
  book_categories?: BookCategory | null;
}

interface BookIssue {
  id: string;
  issue_id: string;
  book_id: string;
  borrower_type: string;
  student_id: string | null;
  teacher_id: string | null;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  books?: { title: string } | null;
}

export default function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isIssueBookOpen, setIsIssueBookOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch books
  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*, book_categories(*)")
        .order("title");
      if (error) throw error;
      return data as BookData[];
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["book_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as BookCategory[];
    },
  });

  // Fetch book issues
  const { data: bookIssues = [] } = useQuery({
    queryKey: ["book_issues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_issues")
        .select("*, books(title)")
        .order("issue_date", { ascending: false });
      if (error) throw error;
      return data as BookIssue[];
    },
  });

  // Fetch students for issuing
  const { data: students = [] } = useQuery({
    queryKey: ["students_for_library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, student_id")
        .eq("status", "active")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  // Add book mutation
  const addBookMutation = useMutation({
    mutationFn: async (bookData: { title: string; title_arabic?: string | null; author?: string | null; category_id?: string | null; total_copies: number; shelf_location?: string | null; description?: string | null }) => {
      const bookId = `BK-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("books").insert({
        book_id: bookId,
        title: bookData.title,
        title_arabic: bookData.title_arabic,
        author: bookData.author,
        category_id: bookData.category_id,
        total_copies: bookData.total_copies,
        available_copies: bookData.total_copies,
        shelf_location: bookData.shelf_location,
        description: bookData.description,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setIsAddBookOpen(false);
      toast.success("বই সফলভাবে যোগ করা হয়েছে");
    },
    onError: () => toast.error("বই যোগ করতে সমস্যা হয়েছে"),
  });

  // Issue book mutation
  const issueBookMutation = useMutation({
    mutationFn: async (issueData: { book_id: string; student_id: string; due_date: string }) => {
      const issueId = `ISS-${Date.now().toString(36).toUpperCase()}`;
      
      // Insert issue record
      const { error: issueError } = await supabase.from("book_issues").insert({
        issue_id: issueId,
        book_id: issueData.book_id,
        student_id: issueData.student_id,
        borrower_type: "student",
        due_date: issueData.due_date,
        status: "issued",
      });
      if (issueError) throw issueError;

      // Update available copies
      const book = books.find(b => b.id === issueData.book_id);
      if (book) {
        const { error: updateError } = await supabase
          .from("books")
          .update({ available_copies: book.available_copies - 1 })
          .eq("id", issueData.book_id);
        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["book_issues"] });
      setIsIssueBookOpen(false);
      toast.success("বই ইস্যু করা হয়েছে");
    },
    onError: () => toast.error("বই ইস্যু করতে সমস্যা হয়েছে"),
  });

  // Return book mutation
  const returnBookMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const issue = bookIssues.find(i => i.id === issueId);
      if (!issue) throw new Error("Issue not found");

      // Update issue record
      const { error: issueError } = await supabase
        .from("book_issues")
        .update({ status: "returned", return_date: new Date().toISOString().split("T")[0] })
        .eq("id", issueId);
      if (issueError) throw issueError;

      // Update available copies
      const book = books.find(b => b.id === issue.book_id);
      if (book) {
        const { error: updateError } = await supabase
          .from("books")
          .update({ available_copies: book.available_copies + 1 })
          .eq("id", issue.book_id);
        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["book_issues"] });
      toast.success("বই ফেরত নেওয়া হয়েছে");
    },
    onError: () => toast.error("বই ফেরত নিতে সমস্যা হয়েছে"),
  });

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.book_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeIssues = bookIssues.filter((i) => i.status === "issued");
  const overdueIssues = bookIssues.filter(
    (i) => i.status === "issued" && new Date(i.due_date) < new Date()
  );

  const handleAddBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addBookMutation.mutate({
      title: formData.get("title") as string,
      title_arabic: formData.get("title_arabic") as string || null,
      author: formData.get("author") as string || null,
      category_id: formData.get("category_id") as string || null,
      total_copies: parseInt(formData.get("total_copies") as string) || 1,
      shelf_location: formData.get("shelf_location") as string || null,
      description: formData.get("description") as string || null,
    });
  };

  const handleIssueBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    issueBookMutation.mutate({
      book_id: formData.get("book_id") as string,
      student_id: formData.get("student_id") as string,
      due_date: formData.get("due_date") as string,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Book className="h-6 w-6 text-primary" />
            লাইব্রেরি ম্যানেজমেন্ট
          </h1>
          <p className="text-muted-foreground">বই ও কিতাব ব্যবস্থাপনা</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                নতুন বই যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>নতুন বই যোগ করুন</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddBook} className="space-y-4">
                <div>
                  <Label htmlFor="title">বইয়ের নাম *</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="title_arabic">আরবি নাম</Label>
                  <Input id="title_arabic" name="title_arabic" dir="rtl" />
                </div>
                <div>
                  <Label htmlFor="author">লেখক</Label>
                  <Input id="author" name="author" />
                </div>
                <div>
                  <Label htmlFor="category_id">ক্যাটাগরি</Label>
                  <Select name="category_id">
                    <SelectTrigger>
                      <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_copies">মোট কপি</Label>
                    <Input id="total_copies" name="total_copies" type="number" defaultValue="1" min="1" />
                  </div>
                  <div>
                    <Label htmlFor="shelf_location">শেলফ নম্বর</Label>
                    <Input id="shelf_location" name="shelf_location" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">বর্ণনা</Label>
                  <Textarea id="description" name="description" />
                </div>
                <Button type="submit" className="w-full" disabled={addBookMutation.isPending}>
                  {addBookMutation.isPending ? "যোগ করা হচ্ছে..." : "বই যোগ করুন"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isIssueBookOpen} onOpenChange={setIsIssueBookOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                বই ইস্যু করুন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>বই ইস্যু করুন</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleIssueBook} className="space-y-4">
                <div>
                  <Label htmlFor="book_id">বই নির্বাচন করুন *</Label>
                  <Select name="book_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="বই নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {books
                        .filter((b) => b.available_copies > 0 && !b.is_reference_only)
                        .map((book) => (
                          <SelectItem key={book.id} value={book.id}>
                            {book.title} ({book.available_copies} কপি আছে)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  <Label htmlFor="due_date">ফেরতের তারিখ *</Label>
                  <Input
                    id="due_date"
                    name="due_date"
                    type="date"
                    required
                    defaultValue={
                      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                    }
                  />
                </div>
                <Button type="submit" className="w-full" disabled={issueBookMutation.isPending}>
                  {issueBookMutation.isPending ? "ইস্যু করা হচ্ছে..." : "বই ইস্যু করুন"}
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
                <Book className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{books.length}</p>
                <p className="text-sm text-muted-foreground">মোট বই</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeIssues.length}</p>
                <p className="text-sm text-muted-foreground">ইস্যুকৃত</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueIssues.length}</p>
                <p className="text-sm text-muted-foreground">মেয়াদ উত্তীর্ণ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">ক্যাটাগরি</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="books" className="space-y-4">
        <TabsList>
          <TabsTrigger value="books">বই তালিকা</TabsTrigger>
          <TabsTrigger value="issues">ইস্যু রেকর্ড</TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="বই খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {booksLoading ? (
                <p className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</p>
              ) : filteredBooks.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">কোনো বই পাওয়া যায়নি</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>বই আইডি</TableHead>
                        <TableHead>নাম</TableHead>
                        <TableHead>লেখক</TableHead>
                        <TableHead>ক্যাটাগরি</TableHead>
                        <TableHead>শেলফ</TableHead>
                        <TableHead>কপি</TableHead>
                        <TableHead>স্থিতি</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBooks.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-mono text-sm">{book.book_id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{book.title}</p>
                              {book.title_arabic && (
                                <p className="text-sm text-muted-foreground" dir="rtl">
                                  {book.title_arabic}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{book.author || "-"}</TableCell>
                          <TableCell>{book.book_categories?.name || "-"}</TableCell>
                          <TableCell>{book.shelf_location || "-"}</TableCell>
                          <TableCell>
                            {book.available_copies}/{book.total_copies}
                          </TableCell>
                          <TableCell>
                            {book.is_reference_only ? (
                              <Badge variant="secondary">রেফারেন্স</Badge>
                            ) : book.available_copies > 0 ? (
                              <Badge variant="default">উপলব্ধ</Badge>
                            ) : (
                              <Badge variant="destructive">সব ইস্যুকৃত</Badge>
                            )}
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

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>ইস্যু রেকর্ড</CardTitle>
            </CardHeader>
            <CardContent>
              {bookIssues.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">কোনো ইস্যু রেকর্ড নেই</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ইস্যু আইডি</TableHead>
                        <TableHead>বই</TableHead>
                        <TableHead>ইস্যু তারিখ</TableHead>
                        <TableHead>ফেরতের তারিখ</TableHead>
                        <TableHead>স্থিতি</TableHead>
                        <TableHead>অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookIssues.map((issue) => {
                        const isOverdue =
                          issue.status === "issued" && new Date(issue.due_date) < new Date();
                        return (
                          <TableRow key={issue.id}>
                            <TableCell className="font-mono text-sm">{issue.issue_id}</TableCell>
                            <TableCell>{issue.books?.title || "-"}</TableCell>
                            <TableCell>{format(new Date(issue.issue_date), "dd/MM/yyyy")}</TableCell>
                            <TableCell>{format(new Date(issue.due_date), "dd/MM/yyyy")}</TableCell>
                            <TableCell>
                              {issue.status === "returned" ? (
                                <Badge variant="default">ফেরত দেওয়া হয়েছে</Badge>
                              ) : isOverdue ? (
                                <Badge variant="destructive">মেয়াদ উত্তীর্ণ</Badge>
                              ) : (
                                <Badge variant="secondary">ইস্যুকৃত</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {issue.status === "issued" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => returnBookMutation.mutate(issue.id)}
                                  disabled={returnBookMutation.isPending}
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  ফেরত নিন
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
