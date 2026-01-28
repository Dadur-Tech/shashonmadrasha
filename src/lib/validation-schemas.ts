import { z } from "zod";

/**
 * Bangladesh phone number validation
 * Supports formats: 01712345678, +8801712345678, 8801712345678
 */
const bangladeshPhoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;

/**
 * Common validation schemas for form inputs
 */
export const validationSchemas = {
  // Phone number validation
  phone: z
    .string()
    .trim()
    .regex(bangladeshPhoneRegex, "সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)")
    .or(z.literal("")),

  phoneRequired: z
    .string()
    .trim()
    .min(1, "মোবাইল নম্বর প্রয়োজন")
    .regex(bangladeshPhoneRegex, "সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)"),

  // Email validation
  email: z
    .string()
    .trim()
    .email("সঠিক ইমেইল দিন")
    .max(255, "ইমেইল ২৫৫ অক্ষরের মধ্যে হতে হবে")
    .or(z.literal("")),

  emailRequired: z
    .string()
    .trim()
    .min(1, "ইমেইল প্রয়োজন")
    .email("সঠিক ইমেইল দিন")
    .max(255, "ইমেইল ২৫৫ অক্ষরের মধ্যে হতে হবে"),

  // Name validation (Bengali + English + common characters)
  name: z
    .string()
    .trim()
    .min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে")
    .max(100, "নাম ১০০ অক্ষরের মধ্যে হতে হবে"),

  nameOptional: z
    .string()
    .trim()
    .max(100, "নাম ১০০ অক্ষরের মধ্যে হতে হবে")
    .or(z.literal("")),

  // Address validation
  address: z
    .string()
    .trim()
    .max(500, "ঠিকানা ৫০০ অক্ষরের মধ্যে হতে হবে")
    .or(z.literal("")),

  // Amount validation (min 10 BDT for payment gateways)
  amount: z
    .number()
    .min(10, "পরিমাণ কমপক্ষে ১০ টাকা হতে হবে")
    .max(100000000, "পরিমাণ অনেক বেশি"),

  amountOptional: z
    .number()
    .min(0, "পরিমাণ শূন্য বা তার বেশি হতে হবে")
    .max(100000000, "পরিমাণ অনেক বেশি")
    .optional(),

  // Text fields with length limits
  shortText: z
    .string()
    .trim()
    .max(100, "১০০ অক্ষরের মধ্যে হতে হবে")
    .or(z.literal("")),

  mediumText: z
    .string()
    .trim()
    .max(500, "৫০০ অক্ষরের মধ্যে হতে হবে")
    .or(z.literal("")),

  longText: z
    .string()
    .trim()
    .max(2000, "২০০০ অক্ষরের মধ্যে হতে হবে")
    .or(z.literal("")),

  // Notes field
  notes: z
    .string()
    .trim()
    .max(1000, "নোট ১০০০ অক্ষরের মধ্যে হতে হবে")
    .or(z.literal("")),

  // Date validation
  date: z.date().or(z.string().transform((val) => new Date(val))),

  // UUID validation
  uuid: z.string().uuid("অবৈধ আইডি"),
};

/**
 * Student form validation schema
 */
export const studentSchema = z.object({
  fullName: validationSchemas.name,
  fullNameArabic: validationSchemas.nameOptional,
  fatherName: validationSchemas.name,
  motherName: validationSchemas.nameOptional,
  guardianName: validationSchemas.nameOptional,
  guardianPhone: validationSchemas.phoneRequired,
  guardianRelation: validationSchemas.shortText,
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().max(5).optional(),
  address: validationSchemas.address,
  village: validationSchemas.shortText,
  postOffice: validationSchemas.shortText,
  upazila: validationSchemas.shortText,
  district: validationSchemas.shortText,
  previousInstitution: validationSchemas.shortText,
  notes: validationSchemas.notes,
});

/**
 * Teacher form validation schema
 */
export const teacherSchema = z.object({
  fullName: validationSchemas.name,
  fullNameArabic: validationSchemas.nameOptional,
  fatherName: validationSchemas.nameOptional,
  phone: validationSchemas.phoneRequired,
  email: validationSchemas.email,
  dateOfBirth: z.string().optional(),
  address: validationSchemas.address,
  nidNumber: z.string().max(20).optional(),
  qualification: validationSchemas.shortText,
  specialization: validationSchemas.shortText,
  monthlySalary: validationSchemas.amount,
  notes: validationSchemas.notes,
});

/**
 * Donation form validation schema
 */
export const donationSchema = z.object({
  donorName: validationSchemas.name,
  donorPhone: validationSchemas.phoneRequired,
  donorEmail: validationSchemas.email,
  donorAddress: validationSchemas.address,
  amount: validationSchemas.amount,
  category: z.string().min(1, "ক্যাটাগরি নির্বাচন করুন"),
  notes: validationSchemas.notes,
  isAnonymous: z.boolean().optional(),
});

/**
 * Fee form validation schema
 */
export const feeSchema = z.object({
  studentId: validationSchemas.uuid,
  feeTypeId: validationSchemas.uuid.optional(),
  amount: validationSchemas.amount,
  discount: validationSchemas.amountOptional,
  dueDate: z.string().optional(),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2000).max(2100),
  notes: validationSchemas.notes,
});

/**
 * Expense form validation schema
 */
export const expenseSchema = z.object({
  title: z.string().trim().min(1, "শিরোনাম প্রয়োজন").max(200),
  description: validationSchemas.mediumText,
  amount: validationSchemas.amount,
  categoryId: validationSchemas.uuid.optional(),
  expenseDate: z.string(),
  paymentMethod: validationSchemas.shortText,
  notes: validationSchemas.notes,
});

/**
 * Salary form validation schema
 */
export const salarySchema = z.object({
  teacherId: validationSchemas.uuid,
  baseSalary: validationSchemas.amount,
  bonus: validationSchemas.amountOptional,
  deduction: validationSchemas.amountOptional,
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  notes: validationSchemas.notes,
});

/**
 * Helper function to validate form data and return errors
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  
  return { success: false, errors };
}

/**
 * Type-safe helper to get validation error message
 */
export function getValidationError(
  errors: Record<string, string> | undefined,
  field: string
): string | undefined {
  return errors?.[field];
}
