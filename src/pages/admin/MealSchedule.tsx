import { useState } from "react";
import { motion } from "framer-motion";
import { Utensils, Save, Edit, Loader2, Coffee, Sun, Moon } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MealScheduleItem {
  id: string;
  day_index: number;
  day_name: string;
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  is_active: boolean;
}

export default function MealSchedulePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<MealScheduleItem[]>([]);

  const { data: mealSchedule, isLoading } = useQuery({
    queryKey: ["meal-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_schedule")
        .select("*")
        .order("day_index");
      
      if (error) throw error;
      return data as MealScheduleItem[];
    },
  });

  const today = new Date().getDay();

  const handleEdit = () => {
    if (mealSchedule) {
      setEditData([...mealSchedule]);
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData([]);
  };

  const updateField = (dayIndex: number, field: "breakfast" | "lunch" | "dinner", value: string) => {
    setEditData(prev => 
      prev.map(item => 
        item.day_index === dayIndex ? { ...item, [field]: value } : item
      )
    );
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const item of editData) {
        const { error } = await supabase
          .from("meal_schedule")
          .update({
            breakfast: item.breakfast,
            lunch: item.lunch,
            dinner: item.dinner,
          })
          .eq("day_index", item.day_index);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-schedule"] });
      toast({
        title: "সংরক্ষিত হয়েছে",
        description: "খাদ্য তালিকা সফলভাবে আপডেট করা হয়েছে।",
      });
      setIsEditing(false);
      setEditData([]);
    },
    onError: (error: Error) => {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const displayData = isEditing ? editData : (mealSchedule || []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Utensils className="w-6 h-6 text-primary" />
              সাপ্তাহিক খাদ্য তালিকা
            </h1>
            <p className="text-muted-foreground">ছাত্রাবাসের খাদ্য তালিকা পরিচালনা করুন</p>
          </div>
          {isEditing ? (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel}>
                বাতিল
              </Button>
              <Button 
                onClick={() => saveMutation.mutate()} 
                className="gap-2"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                সংরক্ষণ করুন
              </Button>
            </div>
          ) : (
            <Button onClick={handleEdit} className="gap-2">
              <Edit className="w-4 h-4" />
              সম্পাদনা করুন
            </Button>
          )}
        </div>

        {/* Meal Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayData.map((meal, index) => (
            <motion.div
              key={meal.day_index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Card className={`h-full ${
                meal.day_index === today 
                  ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                  : 'border-border'
              }`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    {meal.day_name}
                    {meal.day_index === today && (
                      <Badge className="bg-primary text-primary-foreground">আজ</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Breakfast */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-amber-600">
                      <Coffee className="w-4 h-4" />
                      সকাল
                    </Label>
                    {isEditing ? (
                      <Input
                        value={meal.breakfast || ""}
                        onChange={(e) => updateField(meal.day_index, "breakfast", e.target.value)}
                        placeholder="সকালের নাস্তা"
                      />
                    ) : (
                      <p className="text-sm p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                        {meal.breakfast || "-"}
                      </p>
                    )}
                  </div>

                  {/* Lunch */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-emerald-600">
                      <Sun className="w-4 h-4" />
                      দুপুর
                    </Label>
                    {isEditing ? (
                      <Input
                        value={meal.lunch || ""}
                        onChange={(e) => updateField(meal.day_index, "lunch", e.target.value)}
                        placeholder="দুপুরের খাবার"
                      />
                    ) : (
                      <p className="text-sm p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                        {meal.lunch || "-"}
                      </p>
                    )}
                  </div>

                  {/* Dinner */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-blue-600">
                      <Moon className="w-4 h-4" />
                      রাত
                    </Label>
                    {isEditing ? (
                      <Input
                        value={meal.dinner || ""}
                        onChange={(e) => updateField(meal.day_index, "dinner", e.target.value)}
                        placeholder="রাতের খাবার"
                      />
                    ) : (
                      <p className="text-sm p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                        {meal.dinner || "-"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
