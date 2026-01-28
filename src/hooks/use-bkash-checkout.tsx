import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Declare global bKash object for embedded checkout
declare global {
  interface Window {
    bKash?: {
      init: (config: BkashInitConfig) => void;
      execute: () => void;
      reconfigure: (config: { paymentRequest: { amount: string; intent: string } }) => void;
    };
    paymentID?: string;
  }
}

interface BkashInitConfig {
  paymentMode: string;
  paymentRequest: {
    amount: string;
    intent: string;
  };
  createRequest: (request: unknown) => void;
  executeRequestOnAuthorization: () => void;
  onClose: () => void;
}

interface UseBkashCheckoutOptions {
  amount: number;
  referenceId: string;
  referenceType: "donation" | "fee";
  payerName: string;
  payerPhone: string;
  isSandbox: boolean;
  onSuccess?: (data: BkashSuccessData) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

interface BkashSuccessData {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
}

export function useBkashCheckout(options: UseBkashCheckoutOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const scriptLoadedRef = useRef(false);
  const initializingRef = useRef(false);
  const paymentDataRef = useRef<{ paymentID?: string; idToken?: string; transactionId?: string } | null>(null);

  const { amount, referenceId, referenceType, payerName, payerPhone, isSandbox, onSuccess, onError, onClose } = options;

  // Load bKash embedded checkout script
  useEffect(() => {
    if (scriptLoadedRef.current) {
      setIsScriptLoaded(true);
      return;
    }

    // Use the proper embedded checkout script URLs
    const scriptUrl = isSandbox
      ? "https://scripts.sandbox.bka.sh/versions/1.2.0-beta/checkout/bKash-checkout-sandbox.js"
      : "https://scripts.pay.bka.sh/versions/1.2.0-beta/checkout/bKash-checkout.js";

    // Remove any existing bKash scripts first
    const existingScripts = document.querySelectorAll('script[src*="bKash-checkout"]');
    existingScripts.forEach(script => script.remove());

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    
    script.onload = () => {
      console.log("bKash SDK loaded successfully");
      scriptLoadedRef.current = true;
      setIsScriptLoaded(true);
    };
    
    script.onerror = (e) => {
      console.error("Failed to load bKash script:", e);
      onError?.("bKash স্ক্রিপ্ট লোড করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।");
    };
    
    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount - let it persist
    };
  }, [isSandbox, onError]);

  // Initialize and trigger bKash embedded checkout popup
  const initializeCheckout = useCallback(async () => {
    if (!isScriptLoaded) {
      toast({
        title: "অপেক্ষা করুন",
        description: "bKash লোড হচ্ছে...",
      });
      onError?.("bKash এখনো লোড হয়নি। কয়েক সেকেন্ড পর আবার চেষ্টা করুন।");
      return;
    }

    if (!window.bKash) {
      console.error("bKash object not found on window");
      onError?.("bKash SDK পাওয়া যায়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।");
      return;
    }

    if (initializingRef.current) {
      console.log("Already initializing...");
      return;
    }
    
    initializingRef.current = true;
    setIsLoading(true);

    console.log("Initializing bKash checkout with amount:", amount);

    try {
      // Configure bKash checkout
      window.bKash.init({
        paymentMode: "checkout",
        paymentRequest: {
          amount: amount.toString(),
          intent: "sale",
        },
        
        // Called when bKash popup needs to create a payment
        createRequest: async () => {
          console.log("bKash createRequest called");
          
          try {
            // Call our edge function to initiate payment with bKash API
            const response = await supabase.functions.invoke("initiate-payment", {
              body: {
                gateway: "bkash",
                amount,
                reference_id: referenceId,
                reference_type: referenceType,
                payer_name: payerName,
                payer_phone: payerPhone,
                return_url: window.location.origin + "/#donate",
              },
            });

            console.log("initiate-payment response:", response);

            if (response.error) {
              console.error("Initiate payment error:", response.error);
              window.bKash?.execute(); // This will close with error
              return;
            }

            const data = response.data;
            
            // Check if we got paymentID from bKash API
            if (data?.paymentData?.paymentID) {
              console.log("Got paymentID:", data.paymentData.paymentID);
              
              paymentDataRef.current = {
                paymentID: data.paymentData.paymentID,
                idToken: data.paymentData.idToken,
                transactionId: data.transactionId,
              };
              
              // Set the paymentID on window for bKash SDK
              window.paymentID = data.paymentData.paymentID;
              
            } else {
              // API mode failed - show error
              const errorMsg = data?.paymentData?.statusMessage || data?.paymentData?.apiError || "bKash API সমস্যা";
              console.error("No paymentID returned:", errorMsg);
              onError?.(errorMsg);
            }
          } catch (error) {
            console.error("createRequest error:", error);
            onError?.(error instanceof Error ? error.message : "পেমেন্ট তৈরি করতে সমস্যা হয়েছে");
          }
        },
        
        // Called when user authorizes the payment in bKash popup
        executeRequestOnAuthorization: async () => {
          console.log("bKash executeRequestOnAuthorization called");
          
          try {
            if (!paymentDataRef.current?.paymentID) {
              throw new Error("পেমেন্ট আইডি পাওয়া যায়নি");
            }

            // Call our callback function to execute/verify payment
            const response = await supabase.functions.invoke("payment-callback", {
              body: {
                gateway: "bkash",
                paymentID: paymentDataRef.current.paymentID,
                status: "success",
                idToken: paymentDataRef.current.idToken,
              },
            });

            console.log("payment-callback response:", response);

            if (response.error) {
              throw new Error(response.error.message);
            }

            const data = response.data;
            
            if (data?.success) {
              onSuccess?.({
                paymentID: paymentDataRef.current.paymentID,
                trxID: data.trxID || "",
                transactionStatus: "Completed",
                amount: amount.toString(),
              });
              
              toast({
                title: "পেমেন্ট সফল! ✓",
                description: "আপনার দান সফলভাবে গৃহীত হয়েছে। জাযাকাল্লাহু খাইরান!",
              });
            } else {
              throw new Error(data?.message || "পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে");
            }
          } catch (error) {
            console.error("executeRequestOnAuthorization error:", error);
            onError?.(error instanceof Error ? error.message : "পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে");
          }
        },
        
        // Called when user closes the popup
        onClose: () => {
          console.log("bKash popup closed");
          initializingRef.current = false;
          setIsLoading(false);
          paymentDataRef.current = null;
          window.paymentID = undefined;
          onClose?.();
        },
      });

      // Trigger the bKash embedded popup to appear
      console.log("Calling bKash.execute()...");
      window.bKash.execute();
      
    } catch (error) {
      console.error("bKash init error:", error);
      onError?.(error instanceof Error ? error.message : "bKash শুরু করতে সমস্যা হয়েছে");
      initializingRef.current = false;
      setIsLoading(false);
    }
  }, [isScriptLoaded, amount, referenceId, referenceType, payerName, payerPhone, onSuccess, onError, onClose]);

  return {
    isLoading,
    isScriptLoaded,
    initializeCheckout,
  };
}
