import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Building2, Plus, BedDouble, Users, Home } from "lucide-react";

interface HostelBuilding {
  id: string;
  name: string;
  name_arabic: string | null;
  description: string | null;
  total_rooms: number;
  is_active: boolean;
}

interface HostelRoom {
  id: string;
  room_number: string;
  building_id: string;
  floor_number: number;
  room_type: string;
  capacity: number;
  current_occupancy: number;
  monthly_rent: number;
  hostel_buildings?: HostelBuilding | null;
}

interface RoomAllocation {
  id: string;
  room_id: string;
  student_id: string;
  bed_number: number | null;
  allocation_date: string;
  status: string;
  hostel_rooms?: { room_number: string; hostel_buildings?: { name: string } | null } | null;
  students?: { full_name: string; student_id: string } | null;
}

export default function Hostel() {
  const [isAddBuildingOpen, setIsAddBuildingOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch buildings
  const { data: buildings = [] } = useQuery({
    queryKey: ["hostel_buildings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hostel_buildings")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as HostelBuilding[];
    },
  });

  // Fetch rooms
  const { data: rooms = [] } = useQuery({
    queryKey: ["hostel_rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hostel_rooms")
        .select("*, hostel_buildings(*)")
        .order("room_number");
      if (error) throw error;
      return data as HostelRoom[];
    },
  });

  // Fetch allocations
  const { data: allocations = [] } = useQuery({
    queryKey: ["room_allocations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_allocations")
        .select("*, hostel_rooms(room_number, hostel_buildings(name)), students(full_name, student_id)")
        .eq("status", "active")
        .order("allocation_date", { ascending: false });
      if (error) throw error;
      return data as RoomAllocation[];
    },
  });

  // Fetch students for allocation
  const { data: students = [] } = useQuery({
    queryKey: ["students_for_hostel"],
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

  // Add building mutation
  const addBuildingMutation = useMutation({
    mutationFn: async (data: { name: string; name_arabic?: string | null; description?: string | null }) => {
      const { error } = await supabase.from("hostel_buildings").insert({
        name: data.name,
        name_arabic: data.name_arabic,
        description: data.description,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostel_buildings"] });
      setIsAddBuildingOpen(false);
      toast.success("বিল্ডিং সফলভাবে যোগ করা হয়েছে");
    },
    onError: () => toast.error("বিল্ডিং যোগ করতে সমস্যা হয়েছে"),
  });

  // Add room mutation
  const addRoomMutation = useMutation({
    mutationFn: async (data: { room_number: string; building_id: string; floor_number: number; room_type: string; capacity: number; monthly_rent: number }) => {
      const { error } = await supabase.from("hostel_rooms").insert({
        room_number: data.room_number,
        building_id: data.building_id,
        floor_number: data.floor_number,
        room_type: data.room_type,
        capacity: data.capacity,
        monthly_rent: data.monthly_rent,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostel_rooms"] });
      setIsAddRoomOpen(false);
      toast.success("রুম সফলভাবে যোগ করা হয়েছে");
    },
    onError: () => toast.error("রুম যোগ করতে সমস্যা হয়েছে"),
  });

  // Allocate room mutation
  const allocateRoomMutation = useMutation({
    mutationFn: async (data: { room_id: string; student_id: string; bed_number: number }) => {
      const { error: allocError } = await supabase.from("room_allocations").insert({
        room_id: data.room_id,
        student_id: data.student_id,
        bed_number: data.bed_number,
        status: "active",
      });
      if (allocError) throw allocError;

      // Update room occupancy
      const room = rooms.find(r => r.id === data.room_id);
      if (room) {
        const { error: updateError } = await supabase
          .from("hostel_rooms")
          .update({ current_occupancy: room.current_occupancy + 1 })
          .eq("id", data.room_id);
        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostel_rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room_allocations"] });
      setIsAllocateOpen(false);
      toast.success("রুম বরাদ্দ করা হয়েছে");
    },
    onError: () => toast.error("রুম বরাদ্দ করতে সমস্যা হয়েছে"),
  });

  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalOccupancy = rooms.reduce((sum, r) => sum + r.current_occupancy, 0);

  const handleAddBuilding = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addBuildingMutation.mutate({
      name: formData.get("name") as string,
      name_arabic: formData.get("name_arabic") as string || null,
      description: formData.get("description") as string || null,
    });
  };

  const handleAddRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addRoomMutation.mutate({
      room_number: formData.get("room_number") as string,
      building_id: formData.get("building_id") as string,
      floor_number: parseInt(formData.get("floor_number") as string) || 0,
      room_type: formData.get("room_type") as string,
      capacity: parseInt(formData.get("capacity") as string) || 4,
      monthly_rent: parseFloat(formData.get("monthly_rent") as string) || 0,
    });
  };

  const handleAllocate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    allocateRoomMutation.mutate({
      room_id: formData.get("room_id") as string,
      student_id: formData.get("student_id") as string,
      bed_number: parseInt(formData.get("bed_number") as string) || 1,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            হোস্টেল ম্যানেজমেন্ট
          </h1>
          <p className="text-muted-foreground">বোর্ডিং ও আবাসন ব্যবস্থাপনা</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={isAddBuildingOpen} onOpenChange={setIsAddBuildingOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                বিল্ডিং যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন বিল্ডিং যোগ করুন</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddBuilding} className="space-y-4">
                <div>
                  <Label htmlFor="name">বিল্ডিং নাম *</Label>
                  <Input id="name" name="name" required placeholder="যেমন: পূর্ব হোস্টেল" />
                </div>
                <div>
                  <Label htmlFor="name_arabic">আরবি নাম</Label>
                  <Input id="name_arabic" name="name_arabic" dir="rtl" />
                </div>
                <div>
                  <Label htmlFor="description">বর্ণনা</Label>
                  <Input id="description" name="description" />
                </div>
                <Button type="submit" className="w-full" disabled={addBuildingMutation.isPending}>
                  {addBuildingMutation.isPending ? "যোগ করা হচ্ছে..." : "বিল্ডিং যোগ করুন"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BedDouble className="h-4 w-4 mr-2" />
                রুম যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন রুম যোগ করুন</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddRoom} className="space-y-4">
                <div>
                  <Label htmlFor="building_id">বিল্ডিং *</Label>
                  <Select name="building_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="বিল্ডিং নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="room_number">রুম নম্বর *</Label>
                    <Input id="room_number" name="room_number" required placeholder="101" />
                  </div>
                  <div>
                    <Label htmlFor="floor_number">তলা</Label>
                    <Input id="floor_number" name="floor_number" type="number" defaultValue="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="room_type">রুম টাইপ</Label>
                    <Select name="room_type" defaultValue="dormitory">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dormitory">ডরমিটরি</SelectItem>
                        <SelectItem value="single">সিঙ্গেল</SelectItem>
                        <SelectItem value="double">ডাবল</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacity">ধারণক্ষমতা</Label>
                    <Input id="capacity" name="capacity" type="number" defaultValue="4" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="monthly_rent">মাসিক ভাড়া (টাকা)</Label>
                  <Input id="monthly_rent" name="monthly_rent" type="number" defaultValue="0" />
                </div>
                <Button type="submit" className="w-full" disabled={addRoomMutation.isPending}>
                  {addRoomMutation.isPending ? "যোগ করা হচ্ছে..." : "রুম যোগ করুন"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                রুম বরাদ্দ করুন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>রুম বরাদ্দ করুন</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAllocate} className="space-y-4">
                <div>
                  <Label htmlFor="room_id">রুম নির্বাচন করুন *</Label>
                  <Select name="room_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="রুম নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms
                        .filter(r => r.current_occupancy < r.capacity)
                        .map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.hostel_buildings?.name} - রুম {room.room_number} ({room.current_occupancy}/{room.capacity})
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
                  <Label htmlFor="bed_number">বেড নম্বর</Label>
                  <Input id="bed_number" name="bed_number" type="number" defaultValue="1" min="1" />
                </div>
                <Button type="submit" className="w-full" disabled={allocateRoomMutation.isPending}>
                  {allocateRoomMutation.isPending ? "বরাদ্দ করা হচ্ছে..." : "রুম বরাদ্দ করুন"}
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
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{buildings.length}</p>
                <p className="text-sm text-muted-foreground">বিল্ডিং</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BedDouble className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rooms.length}</p>
                <p className="text-sm text-muted-foreground">মোট রুম</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOccupancy}</p>
                <p className="text-sm text-muted-foreground">বর্তমান বাসিন্দা</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Home className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCapacity - totalOccupancy}</p>
                <p className="text-sm text-muted-foreground">খালি সিট</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rooms">রুম তালিকা</TabsTrigger>
          <TabsTrigger value="allocations">বাসিন্দা তালিকা</TabsTrigger>
          <TabsTrigger value="buildings">বিল্ডিং</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>রুম তালিকা</CardTitle>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">কোনো রুম নেই</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>বিল্ডিং</TableHead>
                        <TableHead>রুম নম্বর</TableHead>
                        <TableHead>তলা</TableHead>
                        <TableHead>টাইপ</TableHead>
                        <TableHead>ধারণক্ষমতা</TableHead>
                        <TableHead>বাসিন্দা</TableHead>
                        <TableHead>স্থিতি</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell>{room.hostel_buildings?.name || "-"}</TableCell>
                          <TableCell className="font-medium">{room.room_number}</TableCell>
                          <TableCell>{room.floor_number}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {room.room_type === "dormitory" ? "ডরমিটরি" : 
                               room.room_type === "single" ? "সিঙ্গেল" : "ডাবল"}
                            </Badge>
                          </TableCell>
                          <TableCell>{room.capacity}</TableCell>
                          <TableCell>{room.current_occupancy}</TableCell>
                          <TableCell>
                            {room.current_occupancy >= room.capacity ? (
                              <Badge variant="destructive">পূর্ণ</Badge>
                            ) : room.current_occupancy > 0 ? (
                              <Badge variant="secondary">আংশিক</Badge>
                            ) : (
                              <Badge variant="default">খালি</Badge>
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

        <TabsContent value="allocations">
          <Card>
            <CardHeader>
              <CardTitle>বাসিন্দা তালিকা</CardTitle>
            </CardHeader>
            <CardContent>
              {allocations.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">কোনো বাসিন্দা নেই</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ছাত্র</TableHead>
                        <TableHead>আইডি</TableHead>
                        <TableHead>বিল্ডিং</TableHead>
                        <TableHead>রুম</TableHead>
                        <TableHead>বেড</TableHead>
                        <TableHead>স্থিতি</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations.map((alloc) => (
                        <TableRow key={alloc.id}>
                          <TableCell className="font-medium">{alloc.students?.full_name || "-"}</TableCell>
                          <TableCell>{alloc.students?.student_id || "-"}</TableCell>
                          <TableCell>{alloc.hostel_rooms?.hostel_buildings?.name || "-"}</TableCell>
                          <TableCell>{alloc.hostel_rooms?.room_number || "-"}</TableCell>
                          <TableCell>{alloc.bed_number || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="default">সক্রিয়</Badge>
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

        <TabsContent value="buildings">
          <Card>
            <CardHeader>
              <CardTitle>বিল্ডিং তালিকা</CardTitle>
            </CardHeader>
            <CardContent>
              {buildings.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">কোনো বিল্ডিং নেই</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {buildings.map((building) => {
                    const buildingRooms = rooms.filter(r => r.building_id === building.id);
                    const totalCap = buildingRooms.reduce((s, r) => s + r.capacity, 0);
                    const totalOcc = buildingRooms.reduce((s, r) => s + r.current_occupancy, 0);
                    return (
                      <Card key={building.id}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg">{building.name}</h3>
                          {building.name_arabic && (
                            <p className="text-sm text-muted-foreground" dir="rtl">{building.name_arabic}</p>
                          )}
                          <div className="mt-3 space-y-1 text-sm">
                            <p>মোট রুম: {buildingRooms.length}</p>
                            <p>ধারণক্ষমতা: {totalCap}</p>
                            <p>বাসিন্দা: {totalOcc}</p>
                            <p>খালি: {totalCap - totalOcc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
