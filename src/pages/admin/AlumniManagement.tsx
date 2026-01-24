import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Search,
  Star,
  MapPin,
  Upload,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PhotoUpload } from "@/components/shared/PhotoUpload";

interface Alumni {
  id: string;
  full_name: string;
  full_name_arabic: string | null;
  photo_url: string | null;
  graduation_year: number | null;
  current_position: string;
  current_institution: string | null;
  location: string | null;
  achievement: string | null;
  phone: string | null;
  email: string | null;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
}

const emptyFormData = {
  full_name: "",
  full_name_arabic: "",
  photo_url: "",
  graduation_year: "",
  current_position: "",
  current_institution: "",
  location: "",
  achievement: "",
  phone: "",
  email: "",
  is_featured: false,
  display_order: 0,
};

export default function AlumniManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(emptyFormData);

  const { data: alumni = [], isLoading } = useQuery({
    queryKey: ["admin-notable-alumni"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notable_alumni")
        .select("*")
        .order("display_order")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Alumni[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        full_name: data.full_name,
        full_name_arabic: data.full_name_arabic || null,
        photo_url: data.photo_url || null,
        graduation_year: data.graduation_year ? parseInt(data.graduation_year) : null,
        current_position: data.current_position,
        current_institution: data.current_institution || null,
        location: data.location || null,
        achievement: data.achievement || null,
        phone: data.phone || null,
        email: data.email || null,
        is_featured: data.is_featured,
        display_order: data.display_order,
      };

      if (data.id) {
        const { error } = await supabase
          .from("notable_alumni")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notable_alumni")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notable-alumni"] });
      setIsDialogOpen(false);
      setEditingAlumni(null);
      setFormData(emptyFormData);
      toast({
        title: "সফল!",
        description: editingAlumni ? "তথ্য আপডেট হয়েছে" : "নতুন প্রাক্তন ছাত্র যোগ হয়েছে",
      });
    },
    onError: (error: any) => {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("notable_alumni")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notable-alumni"] });
      toast({ title: "সফল!", description: "স্ট্যাটাস আপডেট হয়েছে" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notable_alumni")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notable-alumni"] });
      toast({ title: "সফল!", description: "ডিলিট হয়েছে" });
    },
  });

  const handleEdit = (alumni: Alumni) => {
    setEditingAlumni(alumni);
    setFormData({
      full_name: alumni.full_name,
      full_name_arabic: alumni.full_name_arabic || "",
      photo_url: alumni.photo_url || "",
      graduation_year: alumni.graduation_year?.toString() || "",
      current_position: alumni.current_position,
      current_institution: alumni.current_institution || "",
      location: alumni.location || "",
      achievement: alumni.achievement || "",
      phone: alumni.phone || "",
      email: alumni.email || "",
      is_featured: alumni.is_featured,
      display_order: alumni.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingAlumni(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.current_position) {
      toast({
        title: "তথ্য দিন",
        description: "নাম ও বর্তমান পদবী আবশ্যক",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(editingAlumni ? { ...formData, id: editingAlumni.id } : formData);
  };

  const filteredAlumni = alumni.filter((a) =>
    a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.current_position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              প্রাক্তন ছাত্র ব্যবস্থাপনা
            </h1>
            <p className="text-muted-foreground">
              মাদরাসা থেকে বের হওয়া সফল ছাত্রদের তালিকা
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                নতুন যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAlumni ? "প্রাক্তন ছাত্র সম্পাদনা" : "নতুন প্রাক্তন ছাত্র"}
                </DialogTitle>
                <DialogDescription>
                  সফল প্রাক্তন ছাত্রের তথ্য পূরণ করুন
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>পুরো নাম (বাংলা) *</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="মাওলানা আব্দুল্লাহ"
                      required
                    />
                  </div>
                  <div>
                    <Label>নাম (আরবী)</Label>
                    <Input
                      value={formData.full_name_arabic}
                      onChange={(e) => setFormData({ ...formData, full_name_arabic: e.target.value })}
                      placeholder="مولانا عبد الله"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <Label>ছবি</Label>
                  <PhotoUpload
                    value={formData.photo_url}
                    onChange={(url) => setFormData({ ...formData, photo_url: url })}
                    folder="alumni"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>বর্তমান পদবী *</Label>
                    <Input
                      value={formData.current_position}
                      onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
                      placeholder="সিনিয়র মুহাদ্দিস"
                      required
                    />
                  </div>
                  <div>
                    <Label>বর্তমান প্রতিষ্ঠান</Label>
                    <Input
                      value={formData.current_institution}
                      onChange={(e) => setFormData({ ...formData, current_institution: e.target.value })}
                      placeholder="দারুল উলূম দেওবন্দ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>অবস্থান</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="ঢাকা, বাংলাদেশ"
                    />
                  </div>
                  <div>
                    <Label>সনদপ্রাপ্তি সাল</Label>
                    <Input
                      type="number"
                      value={formData.graduation_year}
                      onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                      placeholder="২০১৫"
                    />
                  </div>
                </div>

                <div>
                  <Label>বিশেষ অর্জন/পরিচিতি</Label>
                  <Textarea
                    value={formData.achievement}
                    onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                    placeholder="হাদীস বিষয়ে বিশেষজ্ঞ, একাধিক গ্রন্থ প্রণেতা..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>ফোন</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label>ইমেইল</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label>ফিচার্ড (হোমপেজে আগে দেখাবে)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>ক্রম:</Label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    বাতিল
                  </Button>
                  <Button type="submit" className="flex-1" disabled={saveMutation.isPending}>
                    {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {editingAlumni ? "আপডেট করুন" : "যোগ করুন"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle>প্রাক্তন ছাত্রদের তালিকা ({alumni.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredAlumni.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>কোনো প্রাক্তন ছাত্র নেই</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ছবি</TableHead>
                      <TableHead>নাম</TableHead>
                      <TableHead>পদবী</TableHead>
                      <TableHead>প্রতিষ্ঠান</TableHead>
                      <TableHead>অবস্থান</TableHead>
                      <TableHead>সক্রিয়</TableHead>
                      <TableHead>কার্যক্রম</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlumni.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell>
                          <Avatar>
                            <AvatarImage src={person.photo_url || undefined} />
                            <AvatarFallback>{person.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{person.full_name}</span>
                            {person.is_featured && (
                              <Badge variant="secondary" className="ml-2">
                                <Star className="w-3 h-3" />
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{person.current_position}</TableCell>
                        <TableCell>{person.current_institution || "-"}</TableCell>
                        <TableCell>
                          {person.location && (
                            <span className="flex items-center gap-1 text-sm">
                              <MapPin className="w-3 h-3" />
                              {person.location}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={person.is_active}
                            onCheckedChange={(checked) =>
                              toggleActiveMutation.mutate({ id: person.id, is_active: checked })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(person)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => {
                                if (confirm("নিশ্চিত ডিলিট করতে চান?")) {
                                  deleteMutation.mutate(person.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
