import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export default function BootstrapAdminPage() {
  const navigate = useNavigate();
  const { refreshRoles } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleBootstrap = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bootstrap-admin");
      if (error) throw error;

      if (data?.status === "already_initialized") {
        toast({
          title: "ইতিমধ্যে সেটআপ আছে",
          description: "সিস্টেমে আগে থেকেই admin আছে। বর্তমান admin কে বলে আপনার রোল দিন।",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "সফল!",
        description: "আপনার অ্যাকাউন্ট এখন Super Admin হয়েছে।",
      });

      await refreshRoles();
      navigate("/admin/payment-gateways");
    } catch (e: any) {
      toast({
        title: "সমস্যা হয়েছে",
        description: e?.message || "বুটস্ট্র্যাপ করা যায়নি",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Admin Role সেটআপ
            </CardTitle>
            <CardDescription>
              প্রথমবার সেটআপের জন্য এই বাটনে ক্লিক করলে (যদি সিস্টেমে এখনো কেউ admin না থাকে) আপনার অ্যাকাউন্টকে Super Admin করা হবে।
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                • এখন আপনার <b>user_roles</b> টেবিলে কোনো রোল নেই, তাই পেমেন্ট গেটওয়ে/ইনস্টিটিউশন সেটিংস-এর অনেক অপশন RLS কারণে দেখা যাচ্ছে না।
              </p>
              <p>
                • একবার Super Admin সেট হলে আপনি অন্যদের রোল দিতে পারবেন।
              </p>
            </div>

            <Button onClick={handleBootstrap} className="gap-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Super Admin বানান
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
