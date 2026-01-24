import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Users, Building2, Loader2, Check, HandHeart, Baby, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleDatabaseError, getSecureErrorMessage } from "@/lib/error-handler";
import type { Database } from "@/integrations/supabase/types";

type PaymentGatewayType = Database["public"]["Enums"]["payment_gateway_type"];

interface DonationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const donationCategories: DonationCategory[] = [
  {
    id: "lillah_boarding",
    title: "লিল্লাহ বোর্ডিং",
    description: "গরীব ও এতিম ছাত্রদের থাকা-খাওয়ার ব্যবস্থা",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
  },
  {
    id: "orphan_support",
    title: "এতিম সহায়তা",
    description: "এতিম ছাত্রদের শিক্ষা ও ভরণপোষণ",
    icon: Baby,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "madrasa_development",
    title: "মাদরাসা উন্নয়ন",
    description: "ভবন নির্মাণ, আসবাবপত্র ও শিক্ষা উপকরণ",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "general",
    title: "সাধারণ দান",
    description: "মাদরাসার যেকোনো প্রয়োজনে ব্যবহার",
    icon: HandHeart,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
];

const quickAmounts = [500, 1000, 2000, 5000, 10000, 25000];

const gatewayIcons: Record<string, string> = {
  bkash: "🅱️",
  nagad: "🔶",
  rocket: "🚀",
  upay: "📱",
  sslcommerz: "🔒",
  amarpay: "💳",
  manual: "✋",
};

interface PaymentGateway {
  id: string;
  gateway_type: PaymentGatewayType;
  display_name: string;
  is_enabled: boolean;
  merchant_id: string | null;
  sandbox_mode: boolean;
}

export const DonationSection = () => {
  return (
    <section id="donate" className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              সদকায়ে জারিয়া
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              দান করুন, সওয়াব অর্জন করুন
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              আপনার দান গরীব ও এতিম ছাত্রদের শিক্ষা এবং মাদরাসার উন্নয়নে ব্যয় হবে। 
              এটি আপনার জন্য সদকায়ে জারিয়া হিসেবে কাজ করবে ইনশাআল্লাহ।
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {donationCategories.map((category, index) => (
            <DonationCategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DonationCategoryCard({ category, index }: { category: DonationCategory; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Card className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border hover:border-primary/30 group">
            <CardContent className="p-6 text-center">
              <div className={`w-16 h-16 rounded-2xl ${category.bgColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-8 h-8 ${category.color}`} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {category.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {category.description}
              </p>
              <Button className="w-full gap-2">
                <Heart className="w-4 h-4" />
                দান করুন
              </Button>
            </CardContent>
          </Card>
        </DialogTrigger>
        
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${category.bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${category.color}`} />
              </div>
              {category.title}
            </DialogTitle>
            <DialogDescription>
              {category.description}
            </DialogDescription>
          </DialogHeader>
          
          <DonationForm category={category.id} onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

interface DonationFormProps {
  category: string;
  onSuccess: () => void;
}

function DonationForm({ category, onSuccess }: DonationFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [formData, setFormData] = useState({
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    amount: 0,
    customAmount: "",
    paymentMethod: "",
    isAnonymous: false,
    message: "",
  });

  // Load enabled payment gateways from public view (excludes sensitive API keys)
  useEffect(() => {
    async function loadGateways() {
      try {
        // Use the public view that excludes API credentials
        const { data, error } = await supabase
          .from("payment_gateways_public")
          .select("*")
          .order("display_order");
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setGateways(data);
          setFormData(prev => ({ ...prev, paymentMethod: data[0].gateway_type }));
        }
      } catch (error) {
        console.error("Failed to load gateways:", error);
      } finally {
        setLoadingGateways(false);
      }
    }
    loadGateways();
  }, []);

  const selectedAmount = formData.customAmount ? parseInt(formData.customAmount) : formData.amount;

  const handleSubmit = async () => {
    if (!formData.donorName || !formData.donorPhone || selectedAmount <= 0) {
      toast({
        title: "তথ্য পূরণ করুন",
        description: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create donation via secure edge function (with validation and rate limiting)
      const donationResponse = await supabase.functions.invoke('process-donation', {
        body: {
          donor_name: formData.donorName,
          donor_phone: formData.donorPhone,
          donor_email: formData.donorEmail || null,
          amount: selectedAmount,
          category: category,
          payment_gateway: formData.paymentMethod,
          is_anonymous: formData.isAnonymous,
          notes: formData.message || null,
        },
      });

      if (donationResponse.error) {
        throw new Error(donationResponse.error.message);
      }

      const donationResult = donationResponse.data;
      
      if (!donationResult.success) {
        throw new Error(donationResult.message || "দান তৈরিতে সমস্যা হয়েছে");
      }

      const donationId = donationResult.donation_id;
      const selectedGateway = gateways.find(g => g.gateway_type === formData.paymentMethod);
      
      // For online gateways (SSLCommerz, AmarPay), initiate redirect payment
      if (['sslcommerz', 'amarpay'].includes(formData.paymentMethod)) {
        const response = await supabase.functions.invoke('initiate-payment', {
          body: {
            gateway: formData.paymentMethod,
            amount: selectedAmount,
            reference_id: donationId,
            reference_type: 'donation',
            payer_name: formData.isAnonymous ? "বেনামী দাতা" : formData.donorName,
            payer_phone: formData.donorPhone,
            payer_email: formData.donorEmail || 'donor@example.com',
            return_url: window.location.origin + '/#donate',
          },
        });

        if (response.error) throw new Error(response.error.message);
        
        const result = response.data;
        
        if (result.paymentUrl) {
          // Redirect to payment gateway
          window.location.href = result.paymentUrl;
          return;
        }
      }
      
      // For mobile wallets, show payment instructions
      if (['bkash', 'nagad', 'rocket', 'upay'].includes(formData.paymentMethod)) {
        const response = await supabase.functions.invoke('initiate-payment', {
          body: {
            gateway: formData.paymentMethod,
            amount: selectedAmount,
            reference_id: donationId,
            reference_type: 'donation',
            payer_name: formData.isAnonymous ? "বেনামী দাতা" : formData.donorName,
            payer_phone: formData.donorPhone,
            return_url: window.location.origin + '/#donate',
          },
        });

        if (response.error) throw new Error(response.error.message);
        
        setPaymentData({
          ...response.data.paymentData,
          donationId,
          merchantNumber: selectedGateway?.merchant_id,
        });
        setStep(4);
        return;
      }

      // For manual payment
      toast({
        title: "আলহামদুলিল্লাহ!",
        description: `আপনার দান গৃহীত হয়েছে। দান আইডি: ${donationId}। অনুগ্রহ করে সরাসরি মাদরাসায় যোগাযোগ করুন।`,
      });
      
      onSuccess();
    } catch (error: unknown) {
      handleDatabaseError(error, "donation-processing");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "কপি হয়েছে",
      description: "ক্লিপবোর্ডে কপি করা হয়েছে",
    });
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div>
            <Label className="text-base font-medium mb-3 block">দানের পরিমাণ নির্বাচন করুন</Label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={formData.amount === amount && !formData.customAmount ? "default" : "outline"}
                  onClick={() => {
                    setFormData({ ...formData, amount, customAmount: "" });
                  }}
                  className="text-sm"
                >
                  ৳{amount.toLocaleString('bn-BD')}
                </Button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
              <Input
                type="number"
                placeholder="অন্য পরিমাণ লিখুন"
                value={formData.customAmount}
                onChange={(e) => setFormData({ ...formData, customAmount: e.target.value, amount: 0 })}
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="anonymous" className="text-sm cursor-pointer">
              বেনামী দাতা হিসেবে দান করতে চাই
            </Label>
          </div>

          <Button 
            className="w-full" 
            onClick={() => setStep(2)}
            disabled={selectedAmount <= 0}
          >
            পরবর্তী ধাপ
          </Button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">দানের পরিমাণ</p>
            <p className="text-2xl font-bold text-primary">৳{selectedAmount.toLocaleString('bn-BD')}</p>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="name">আপনার নাম *</Label>
              <Input
                id="name"
                value={formData.donorName}
                onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                placeholder="আপনার পুরো নাম"
                disabled={formData.isAnonymous}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">মোবাইল নম্বর *</Label>
              <Input
                id="phone"
                value={formData.donorPhone}
                onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value })}
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label>
              <Input
                id="email"
                type="email"
                value={formData.donorEmail}
                onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label htmlFor="message">বার্তা (ঐচ্ছিক)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="আপনার দোয়া বা বার্তা..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              পেছনে
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1">
              পরবর্তী
            </Button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">দানের পরিমাণ</p>
                <p className="text-2xl font-bold text-primary">৳{selectedAmount.toLocaleString('bn-BD')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">দাতা</p>
                <p className="font-medium">{formData.isAnonymous ? "বেনামী" : formData.donorName}</p>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">পেমেন্ট মাধ্যম নির্বাচন করুন</Label>
            {loadingGateways ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : gateways.length === 0 ? (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                <p className="text-amber-700 dark:text-amber-400">
                  কোনো পেমেন্ট মাধ্যম সক্রিয় নেই। অনুগ্রহ করে মাদরাসায় সরাসরি যোগাযোগ করুন।
                </p>
              </div>
            ) : (
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                className="grid grid-cols-2 gap-3"
              >
                {gateways.map((gateway) => (
                  <Label
                    key={gateway.id}
                    htmlFor={gateway.gateway_type}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.paymentMethod === gateway.gateway_type 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <RadioGroupItem value={gateway.gateway_type} id={gateway.gateway_type} className="sr-only" />
                    <span className="text-2xl">{gatewayIcons[gateway.gateway_type] || "💰"}</span>
                    <span className="font-medium">{gateway.display_name}</span>
                    {formData.paymentMethod === gateway.gateway_type && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </Label>
                ))}
              </RadioGroup>
            )}
          </div>

          {formData.paymentMethod === "manual" && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>ম্যানুয়াল পেমেন্ট:</strong> দান জমা দেওয়ার পর আমাদের সাথে যোগাযোগ করুন অথবা 
                সরাসরি মাদরাসায় এসে পেমেন্ট করুন।
              </p>
            </div>
          )}

          {['sslcommerz', 'amarpay'].includes(formData.paymentMethod) && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>অনলাইন পেমেন্ট:</strong> আপনাকে নিরাপদ পেমেন্ট পেইজে নিয়ে যাওয়া হবে। 
                সেখানে আপনি কার্ড/মোবাইল ব্যাংকিং/নেট ব্যাংকিং যেকোনো মাধ্যমে পেমেন্ট করতে পারবেন।
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
              পেছনে
            </Button>
            <Button onClick={handleSubmit} className="flex-1 gap-2" disabled={loading || !formData.paymentMethod}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  প্রক্রিয়াকরণ...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  দান সম্পন্ন করুন
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Mobile Payment Instructions */}
      {step === 4 && paymentData && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-lg font-mono font-bold text-primary">
                {paymentData.transactionId}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(paymentData.transactionId)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-secondary border">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span className="text-2xl">{gatewayIcons[paymentData.gateway]}</span>
              পেমেন্ট নির্দেশনা
            </h4>
            <div className="whitespace-pre-line text-sm text-muted-foreground">
              {paymentData.instructions}
            </div>
          </div>

          {paymentData.merchantNumber && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-green-700 dark:text-green-400">
                <strong>মার্চেন্ট নম্বর:</strong> {paymentData.merchantNumber}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6"
                  onClick={() => copyToClipboard(paymentData.merchantNumber)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </p>
            </div>
          )}

          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>গুরুত্বপূর্ণ:</strong> পেমেন্ট করার সময় রেফারেন্স/নোট এ উপরের Transaction ID দিন। 
              পেমেন্ট সম্পন্ন হলে আমরা যাচাই করে আপনাকে জানাবো।
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
              পেছনে
            </Button>
            <Button onClick={onSuccess} className="flex-1 gap-2">
              <Check className="w-4 h-4" />
              বুঝেছি, বন্ধ করুন
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
