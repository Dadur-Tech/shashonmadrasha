import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Declare global bKash object
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
  executeRequestOnAuthorization: (request: unknown) => void;
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

interface BkashCreateResponse {
  paymentID: string;
  bkashURL?: string;
  statusCode: string;
  statusMessage?: string;
}

export function useBkashCheckout(options: UseBkashCheckoutOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const scriptLoadedRef = useRef(false);
  const initializingRef = useRef(false);
  const paymentDataRef = useRef<{ paymentID?: string; idToken?: string } | null>(null);

  const { amount, referenceId, referenceType, payerName, payerPhone, isSandbox, onSuccess, onError, onClose } = options;

  // Load bKash script dynamically
  useEffect(() => {
    if (scriptLoadedRef.current) {
      setIsScriptLoaded(true);
      return;
    }

    const scriptUrl = isSandbox
      ? "https://scripts.sandbox.bka.sh/versions/1.2.0-beta/checkout/bKash-checkout-sandbox.js"
      : "https://scripts.pay.bka.sh/versions/1.2.0-beta/checkout/bKash-checkout.js";

    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      scriptLoadedRef.current = true;
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load bKash script");
      onError?.("bKash স্ক্রিপ্ট লোড করতে সমস্যা হয়েছে");
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount - let it persist
    };
  }, [isSandbox, onError]);

  // Initialize bKash checkout
  const initializeCheckout = useCallback(async () => {
    if (!isScriptLoaded || !window.bKash) {
      onError?.("bKash এখনো লোড হয়নি, অনুগ্রহ করে আবার চেষ্টা করুন");
      return;
    }

    if (initializingRef.current) return;
    initializingRef.current = true;
    setIsLoading(true);

    try {
      window.bKash.init({
        paymentMode: "checkout",
        paymentRequest: {
          amount: amount.toString(),
          intent: "sale",
        },
        createRequest: async () => {
          try {
            // Call our edge function to create the payment
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

            if (response.error) {
              throw new Error(response.error.message);
            }

            const data = response.data;
            if (data?.paymentData?.paymentID) {
              paymentDataRef.current = {
                paymentID: data.paymentData.paymentID,
                idToken: data.paymentData.idToken,
              };
              window.paymentID = data.paymentData.paymentID;
            } else {
              throw new Error(data?.paymentData?.statusMessage || "পেমেন্ট তৈরি করতে সমস্যা হয়েছে");
            }
          } catch (error) {
            console.error("bKash createRequest error:", error);
            onError?.(error instanceof Error ? error.message : "পেমেন্ট তৈরি করতে সমস্যা হয়েছে");
          }
        },
        executeRequestOnAuthorization: async () => {
          try {
            if (!paymentDataRef.current?.paymentID || !paymentDataRef.current?.idToken) {
              throw new Error("পেমেন্ট আইডি পাওয়া যায়নি");
            }

            // Call execute endpoint to complete the payment
            const response = await supabase.functions.invoke("payment-callback", {
              body: {
                gateway: "bkash",
                paymentID: paymentDataRef.current.paymentID,
                status: "success",
                idToken: paymentDataRef.current.idToken,
              },
            });

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
                title: "পেমেন্ট সফল!",
                description: "আপনার দান সফলভাবে গৃহীত হয়েছে। জাযাকাল্লাহু খাইরান!",
              });
            } else {
              throw new Error(data?.message || "পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে");
            }
          } catch (error) {
            console.error("bKash execute error:", error);
            onError?.(error instanceof Error ? error.message : "পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে");
          }
        },
        onClose: () => {
          initializingRef.current = false;
          setIsLoading(false);
          onClose?.();
        },
      });

      // Trigger the bKash popup
      window.bKash.execute();
    } catch (error) {
      console.error("bKash init error:", error);
      onError?.(error instanceof Error ? error.message : "bKash ইনিশিয়ালাইজ করতে সমস্যা হয়েছে");
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
