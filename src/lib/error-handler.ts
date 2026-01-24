import { toast } from "@/hooks/use-toast";

/**
 * Centralized error handler for database operations.
 * Maps technical error messages to user-friendly Bengali messages
 * while logging full details for debugging.
 */
export function handleDatabaseError(error: unknown, context?: string): void {
  // Log full error for debugging (dev only)
  if (import.meta.env.DEV) {
    console.error(`Database error${context ? ` in ${context}` : ''}:`, error);
  }

  const userMessage = mapErrorToUserMessage(error);
  
  toast({
    title: "সমস্যা হয়েছে",
    description: userMessage,
    variant: "destructive",
  });
}

/**
 * Maps Supabase/database errors to user-friendly Bengali messages.
 * Prevents leaking database schema, table names, and internal details.
 */
function mapErrorToUserMessage(error: unknown): string {
  const message = getErrorMessage(error).toLowerCase();

  // RLS Policy Violations
  if (message.includes("row-level security") || message.includes("rls")) {
    return "আপনার এই কাজ করার অনুমতি নেই।";
  }

  // Duplicate Key / Unique Constraint
  if (message.includes("duplicate key") || message.includes("unique constraint") || message.includes("already exists")) {
    return "এই তথ্য ইতিমধ্যে বিদ্যমান।";
  }

  // Foreign Key Violations
  if (message.includes("foreign key") || message.includes("violates foreign key")) {
    return "সংশ্লিষ্ট তথ্য খুঁজে পাওয়া যায়নি।";
  }

  // Not Null Violations
  if (message.includes("null value") || message.includes("not-null") || message.includes("violates not-null")) {
    return "প্রয়োজনীয় তথ্য খালি রয়েছে।";
  }

  // Check Constraint Violations
  if (message.includes("check constraint") || message.includes("violates check")) {
    return "অবৈধ তথ্য প্রদান করা হয়েছে।";
  }

  // Invalid Input Syntax
  if (message.includes("invalid input") || message.includes("invalid syntax")) {
    return "ভুল ফরম্যাটে তথ্য দেওয়া হয়েছে।";
  }

  // Connection/Network Errors
  if (message.includes("network") || message.includes("connection") || message.includes("fetch") || message.includes("failed to fetch")) {
    return "ইন্টারনেট সংযোগে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।";
  }

  // Timeout Errors
  if (message.includes("timeout") || message.includes("timed out")) {
    return "সার্ভার সাড়া দিতে দেরি করছে। পুনরায় চেষ্টা করুন।";
  }

  // Authentication Errors
  if (message.includes("jwt") || message.includes("auth") || message.includes("unauthorized") || message.includes("not authenticated")) {
    return "সেশনের মেয়াদ শেষ হয়েছে। পুনরায় লগইন করুন।";
  }

  // Permission Errors
  if (message.includes("permission denied") || message.includes("access denied") || message.includes("forbidden")) {
    return "আপনার এই কাজ করার অনুমতি নেই।";
  }

  // Rate Limiting
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "অনেক বেশি অনুরোধ করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।";
  }

  // Storage Errors
  if (message.includes("storage") || message.includes("bucket") || message.includes("file")) {
    return "ফাইল আপলোডে সমস্যা হয়েছে।";
  }

  // Default generic message
  return "একটি সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।";
}

/**
 * Extracts error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === "string") {
      return obj.message;
    }
    if (typeof obj.error === "string") {
      return obj.error;
    }
    if (typeof obj.error_description === "string") {
      return obj.error_description;
    }
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error";
}

/**
 * Returns a user-friendly error message without showing the toast.
 * Useful when you need the message but want to handle display yourself.
 */
export function getSecureErrorMessage(error: unknown): string {
  return mapErrorToUserMessage(error);
}

/**
 * Wrapper for async operations that handles errors automatically.
 * Returns [data, null] on success, [null, error] on failure.
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<[T, null] | [null, Error]> {
  try {
    const result = await operation();
    return [result, null];
  } catch (error) {
    handleDatabaseError(error, context);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
