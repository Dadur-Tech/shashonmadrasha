import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Settings, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  Save,
  Loader2,
  Smartphone,
  Globe,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PaymentGateway {
  id: string;
  gateway_type: string;
  display_name: string;
  is_enabled: boolean;
  merchant_id: string | null;
  api_key_encrypted: string | null;
  api_secret_encrypted: string | null;
  sandbox_mode: boolean;
  display_order: number;
}

const gatewayIcons: Record<string, string> = {
  bkash: "🅱️",
  nagad: "🔶",
  rocket: "🚀",
  upay: "📱",
  sslcommerz: "🔒",
  amarpay: "💳",
  manual: "✋",
};

const gatewayDescriptions: Record<string, string> = {
  bkash: "বাংলাদেশের সবচেয়ে জনপ্রিয় মোবাইল ব্যাংকিং সেবা",
  nagad: "ডাক বিভাগের ডিজিটাল পেমেন্ট সেবা",
  rocket: "ডাচ-বাংলা ব্যাংকের মোবাইল ব্যাংকিং",
  upay: "ইউনাইটেড কমার্শিয়াল ব্যাংকের মোবাইল ব্যাংকিং",
  sslcommerz: "বাংলাদেশের শীর্ষস্থানীয় পেমেন্ট গেটওয়ে",
  amarpay: "সাশ্রয়ী এবং নির্ভরযোগ্য পেমেন্ট গেটওয়ে",
  manual: "সরাসরি মাদরাসায় পেমেন্ট",
};

export default function PaymentGatewaysPage() {
  const queryClient = useQueryClient();
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [editingGateway, setEditingGateway] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, { merchantId: string; apiKey: string; apiSecret: string }>>({});

  const { data: gateways = [], isLoading } = useQuery({
    queryKey: ["payment-gateways"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_gateways")
        .select("*")
        .order("display_order");
      
      if (error) throw error;
      return data as PaymentGateway[];
    },
  });

  const toggleGateway = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const { error } = await supabase
        .from("payment_gateways")
        .update({ is_enabled: isEnabled })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-gateways"] });
      toast({
        title: "সফল!",
        description: "পেমেন্ট গেটওয়ে আপডেট হয়েছে",
      });
    },
    onError: (error) => {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCredentials = useMutation({
    mutationFn: async ({ id, merchantId, apiKey, apiSecret }: { 
      id: string; 
      merchantId: string; 
      apiKey: string; 
      apiSecret: string;
    }) => {
      const { error } = await supabase
        .from("payment_gateways")
        .update({ 
          merchant_id: merchantId || null,
          api_key_encrypted: apiKey || null,
          api_secret_encrypted: apiSecret || null,
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-gateways"] });
      setEditingGateway(null);
      toast({
        title: "সফল!",
        description: "ক্রেডেনশিয়াল সেভ হয়েছে",
      });
    },
    onError: (error) => {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSandboxMode = useMutation({
    mutationFn: async ({ id, sandboxMode }: { id: string; sandboxMode: boolean }) => {
      const { error } = await supabase
        .from("payment_gateways")
        .update({ sandbox_mode: sandboxMode })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-gateways"] });
      toast({
        title: "সফল!",
        description: "মোড পরিবর্তন হয়েছে",
      });
    },
  });

  const startEditing = (gateway: PaymentGateway) => {
    setEditingGateway(gateway.id);
    setFormData({
      ...formData,
      [gateway.id]: {
        merchantId: gateway.merchant_id || "",
        apiKey: gateway.api_key_encrypted || "",
        apiSecret: gateway.api_secret_encrypted || "",
      },
    });
  };

  const handleSave = (gateway: PaymentGateway) => {
    const data = formData[gateway.id];
    if (data) {
      updateCredentials.mutate({
        id: gateway.id,
        merchantId: data.merchantId,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
      });
    }
  };

  const mobileGateways = gateways.filter(g => 
    ["bkash", "nagad", "rocket", "upay"].includes(g.gateway_type)
  );
  const onlineGateways = gateways.filter(g => 
    ["sslcommerz", "amarpay"].includes(g.gateway_type)
  );
  const manualGateway = gateways.find(g => g.gateway_type === "manual");

  const enabledCount = gateways.filter(g => g.is_enabled).length;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">পেমেন্ট গেটওয়ে সেটিংস</h1>
            <p className="text-muted-foreground">
              সকল পেমেন্ট মাধ্যম কনফিগার করুন এবং অন/অফ করুন
            </p>
          </div>
          <Badge variant="secondary" className="text-base px-4 py-2">
            <Check className="w-4 h-4 mr-2" />
            {enabledCount} টি সক্রিয়
          </Badge>
        </div>

        {/* Alert */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-start gap-4 p-4">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">গুরুত্বপূর্ণ নোট</p>
              <p className="text-sm text-muted-foreground">
                পেমেন্ট গেটওয়ে সক্রিয় করার আগে সংশ্লিষ্ট প্রতিষ্ঠান থেকে মার্চেন্ট অ্যাকাউন্ট নিন। 
                প্রথমে স্যান্ডবক্স মোডে টেস্ট করুন, তারপর লাইভ করুন।
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="mobile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="mobile" className="gap-2">
              <Smartphone className="w-4 h-4" />
              মোবাইল
            </TabsTrigger>
            <TabsTrigger value="online" className="gap-2">
              <Globe className="w-4 h-4" />
              অনলাইন
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <CreditCard className="w-4 h-4" />
              ম্যানুয়াল
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mobile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mobileGateways.map((gateway, index) => (
                <GatewayCard
                  key={gateway.id}
                  gateway={gateway}
                  index={index}
                  isEditing={editingGateway === gateway.id}
                  formData={formData[gateway.id]}
                  showSecrets={showSecrets[gateway.id]}
                  onToggle={(enabled) => toggleGateway.mutate({ id: gateway.id, isEnabled: enabled })}
                  onToggleSandbox={(sandbox) => toggleSandboxMode.mutate({ id: gateway.id, sandboxMode: sandbox })}
                  onStartEditing={() => startEditing(gateway)}
                  onCancelEditing={() => setEditingGateway(null)}
                  onSave={() => handleSave(gateway)}
                  onToggleSecrets={() => setShowSecrets({ ...showSecrets, [gateway.id]: !showSecrets[gateway.id] })}
                  onFormChange={(data) => setFormData({ ...formData, [gateway.id]: data })}
                  isSaving={updateCredentials.isPending}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="online" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {onlineGateways.map((gateway, index) => (
                <GatewayCard
                  key={gateway.id}
                  gateway={gateway}
                  index={index}
                  isEditing={editingGateway === gateway.id}
                  formData={formData[gateway.id]}
                  showSecrets={showSecrets[gateway.id]}
                  onToggle={(enabled) => toggleGateway.mutate({ id: gateway.id, isEnabled: enabled })}
                  onToggleSandbox={(sandbox) => toggleSandboxMode.mutate({ id: gateway.id, sandboxMode: sandbox })}
                  onStartEditing={() => startEditing(gateway)}
                  onCancelEditing={() => setEditingGateway(null)}
                  onSave={() => handleSave(gateway)}
                  onToggleSecrets={() => setShowSecrets({ ...showSecrets, [gateway.id]: !showSecrets[gateway.id] })}
                  onFormChange={(data) => setFormData({ ...formData, [gateway.id]: data })}
                  isSaving={updateCredentials.isPending}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            {manualGateway && (
              <Card className="max-w-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                        {gatewayIcons[manualGateway.gateway_type]}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{manualGateway.display_name}</CardTitle>
                        <CardDescription>{gatewayDescriptions[manualGateway.gateway_type]}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={manualGateway.is_enabled}
                      onCheckedChange={(checked) => toggleGateway.mutate({ id: manualGateway.id, isEnabled: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    এই অপশন সক্রিয় থাকলে দাতারা সরাসরি মাদরাসায় এসে বা ব্যাংক ট্রান্সফারের মাধ্যমে দান করতে পারবেন। 
                    অ্যাডমিন ম্যানুয়ালি পেমেন্ট কনফার্ম করবেন।
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

interface GatewayCardProps {
  gateway: PaymentGateway;
  index: number;
  isEditing: boolean;
  formData?: { merchantId: string; apiKey: string; apiSecret: string };
  showSecrets: boolean;
  onToggle: (enabled: boolean) => void;
  onToggleSandbox: (sandbox: boolean) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: () => void;
  onToggleSecrets: () => void;
  onFormChange: (data: { merchantId: string; apiKey: string; apiSecret: string }) => void;
  isSaving: boolean;
}

function GatewayCard({
  gateway,
  index,
  isEditing,
  formData,
  showSecrets,
  onToggle,
  onToggleSandbox,
  onStartEditing,
  onCancelEditing,
  onSave,
  onToggleSecrets,
  onFormChange,
  isSaving,
}: GatewayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`transition-all ${gateway.is_enabled ? "border-primary/30" : ""}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                gateway.is_enabled ? "bg-primary/10" : "bg-secondary"
              }`}>
                {gatewayIcons[gateway.gateway_type]}
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {gateway.display_name}
                  {gateway.is_enabled && <Check className="w-4 h-4 text-primary" />}
                </CardTitle>
                <CardDescription>{gatewayDescriptions[gateway.gateway_type]}</CardDescription>
              </div>
            </div>
            <Switch
              checked={gateway.is_enabled}
              onCheckedChange={onToggle}
            />
          </div>
        </CardHeader>
        
        {gateway.is_enabled && (
          <CardContent className="space-y-4">
            {/* Sandbox Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-sm">স্যান্ডবক্স মোড</p>
                <p className="text-xs text-muted-foreground">টেস্ট পেমেন্ট চালু করুন</p>
              </div>
              <Switch
                checked={gateway.sandbox_mode}
                onCheckedChange={onToggleSandbox}
              />
            </div>

            {/* Credentials */}
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`${gateway.id}-merchant`}>মার্চেন্ট আইডি</Label>
                  <Input
                    id={`${gateway.id}-merchant`}
                    value={formData?.merchantId || ""}
                    onChange={(e) => onFormChange({ ...formData!, merchantId: e.target.value })}
                    placeholder="আপনার মার্চেন্ট আইডি"
                  />
                </div>
                <div>
                  <Label htmlFor={`${gateway.id}-key`}>API Key</Label>
                  <div className="relative">
                    <Input
                      id={`${gateway.id}-key`}
                      type={showSecrets ? "text" : "password"}
                      value={formData?.apiKey || ""}
                      onChange={(e) => onFormChange({ ...formData!, apiKey: e.target.value })}
                      placeholder="API Key"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={onToggleSecrets}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor={`${gateway.id}-secret`}>API Secret</Label>
                  <Input
                    id={`${gateway.id}-secret`}
                    type={showSecrets ? "text" : "password"}
                    value={formData?.apiSecret || ""}
                    onChange={(e) => onFormChange({ ...formData!, apiSecret: e.target.value })}
                    placeholder="API Secret"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={onSave} className="flex-1 gap-2" disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    সেভ করুন
                  </Button>
                  <Button variant="outline" onClick={onCancelEditing}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">মার্চেন্ট আইডি:</span>
                  <span className={gateway.merchant_id ? "font-mono" : "text-muted-foreground"}>
                    {gateway.merchant_id || "সেট করা হয়নি"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API Key:</span>
                  <span className={gateway.api_key_encrypted ? "font-mono" : "text-muted-foreground"}>
                    {gateway.api_key_encrypted ? "••••••••" : "সেট করা হয়নি"}
                  </span>
                </div>
                <Button variant="outline" onClick={onStartEditing} className="w-full mt-2 gap-2">
                  <Settings className="w-4 h-4" />
                  ক্রেডেনশিয়াল সেট করুন
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
