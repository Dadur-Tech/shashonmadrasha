import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Language = "bn" | "en";

interface Translations {
  [key: string]: {
    bn: string;
    en: string;
  };
}

// Core translations for the entire application
export const translations: Translations = {
  // Navigation
  dashboard: { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  students: { bn: "ছাত্র ব্যবস্থাপনা", en: "Student Management" },
  teachers: { bn: "শিক্ষক ব্যবস্থাপনা", en: "Teacher Management" },
  classes: { bn: "ক্লাস ও বিভাগ", en: "Classes & Sections" },
  attendance: { bn: "উপস্থিতি", en: "Attendance" },
  fees: { bn: "ফি ব্যবস্থাপনা", en: "Fee Management" },
  expenses: { bn: "খরচ ব্যবস্থাপনা", en: "Expense Management" },
  salaries: { bn: "বেতন ব্যবস্থাপনা", en: "Salary Management" },
  lillah: { bn: "লিল্লাহ বোর্ডিং", en: "Lillah Boarding" },
  donations: { bn: "দান ব্যবস্থাপনা", en: "Donation Management" },
  exams: { bn: "পরীক্ষা ও ফলাফল", en: "Exams & Results" },
  onlineClasses: { bn: "অনলাইন ক্লাস", en: "Online Classes" },
  library: { bn: "লাইব্রেরি", en: "Library" },
  hostel: { bn: "হোস্টেল", en: "Hostel" },
  certificates: { bn: "সনদপত্র", en: "Certificates" },
  alumni: { bn: "প্রাক্তন ছাত্র", en: "Alumni" },
  jamiyat: { bn: "জমিয়াত", en: "Jamiyat" },
  announcements: { bn: "নোটিশ বোর্ড", en: "Notice Board" },
  events: { bn: "ইভেন্ট ব্যবস্থাপনা", en: "Event Management" },
  reports: { bn: "রিপোর্ট", en: "Reports" },
  userManagement: { bn: "ইউজার ম্যানেজমেন্ট", en: "User Management" },
  paymentGateways: { bn: "পেমেন্ট গেটওয়ে", en: "Payment Gateways" },
  institution: { bn: "প্রতিষ্ঠান সেটিংস", en: "Institution Settings" },
  mealSchedule: { bn: "খাদ্য তালিকা", en: "Meal Schedule" },
  backup: { bn: "ব্যাকআপ ডাউনলোড", en: "Backup Download" },
  settings: { bn: "সেটিংস", en: "Settings" },
  help: { bn: "সাহায্য", en: "Help" },
  logout: { bn: "লগআউট", en: "Logout" },

  // Common Actions
  save: { bn: "সংরক্ষণ করুন", en: "Save" },
  cancel: { bn: "বাতিল", en: "Cancel" },
  delete: { bn: "মুছুন", en: "Delete" },
  edit: { bn: "সম্পাদনা", en: "Edit" },
  add: { bn: "যোগ করুন", en: "Add" },
  search: { bn: "খুঁজুন", en: "Search" },
  filter: { bn: "ফিল্টার", en: "Filter" },
  export: { bn: "এক্সপোর্ট", en: "Export" },
  import: { bn: "ইমপোর্ট", en: "Import" },
  view: { bn: "দেখুন", en: "View" },
  download: { bn: "ডাউনলোড", en: "Download" },
  print: { bn: "প্রিন্ট", en: "Print" },
  submit: { bn: "জমা দিন", en: "Submit" },
  update: { bn: "আপডেট", en: "Update" },
  close: { bn: "বন্ধ করুন", en: "Close" },
  confirm: { bn: "নিশ্চিত করুন", en: "Confirm" },
  back: { bn: "পেছনে", en: "Back" },
  next: { bn: "পরবর্তী", en: "Next" },
  previous: { bn: "পূর্ববর্তী", en: "Previous" },

  // Settings Page
  settingsTitle: { bn: "সেটিংস", en: "Settings" },
  settingsDesc: { bn: "সিস্টেম সেটিংস পরিচালনা করুন", en: "Manage system settings" },
  generalSettings: { bn: "সাধারণ সেটিংস", en: "General Settings" },
  generalSettingsDesc: { bn: "সিস্টেমের মৌলিক সেটিংস", en: "Basic system settings" },
  systemLanguage: { bn: "সিস্টেম ভাষা", en: "System Language" },
  selectLanguage: { bn: "ভাষা নির্বাচন করুন", en: "Select Language" },
  bengali: { bn: "বাংলা", en: "Bengali" },
  english: { bn: "ইংরেজি", en: "English" },
  timezone: { bn: "টাইমজোন", en: "Timezone" },
  autoBackup: { bn: "অটো ব্যাকআপ", en: "Auto Backup" },
  autoBackupDesc: { bn: "প্রতিদিন স্বয়ংক্রিয়ভাবে ডাটা ব্যাকআপ", en: "Daily automatic data backup" },
  dataExport: { bn: "ডাটা এক্সপোর্ট", en: "Data Export" },
  dataExportDesc: { bn: "মাদ্রাসার সম্পূর্ণ ডাটা ডাউনলোড করুন", en: "Download complete madrasa data" },
  notifications: { bn: "নোটিফিকেশন", en: "Notifications" },
  notificationSettings: { bn: "নোটিফিকেশন সেটিংস", en: "Notification Settings" },
  notificationSettingsDesc: { bn: "কোন কোন বিষয়ে নোটিফিকেশন পাবেন", en: "What notifications you will receive" },
  security: { bn: "নিরাপত্তা", en: "Security" },
  theme: { bn: "থিম", en: "Theme" },
  general: { bn: "সাধারণ", en: "General" },
  appearance: { bn: "অ্যাপিয়ারেন্স", en: "Appearance" },
  darkMode: { bn: "ডার্ক মোড", en: "Dark Mode" },
  darkModeDesc: { bn: "রাতে ব্যবহারের জন্য ডার্ক থিম", en: "Dark theme for night use" },
  languageChanged: { bn: "ভাষা পরিবর্তিত হয়েছে", en: "Language changed" },
  languageChangedDesc: { bn: "সিস্টেম ভাষা সফলভাবে পরিবর্তন হয়েছে", en: "System language changed successfully" },
  settingsSaved: { bn: "সেটিংস সংরক্ষিত", en: "Settings saved" },
  settingsSavedDesc: { bn: "আপনার সেটিংস সফলভাবে আপডেট হয়েছে", en: "Your settings have been updated successfully" },

  // Student List
  studentList: { bn: "ছাত্র তালিকা", en: "Student List" },
  allStudents: { bn: "সকল ছাত্রের তথ্য", en: "All student information" },
  teacherList: { bn: "শিক্ষক তালিকা", en: "Teacher List" },
  allTeachers: { bn: "সকল শিক্ষকের তথ্য", en: "All teacher information" },
  feeRecords: { bn: "ফি রেকর্ড", en: "Fee Records" },
  allFees: { bn: "সকল ফি লেনদেন", en: "All fee transactions" },
  donationRecords: { bn: "দান রেকর্ড", en: "Donation Records" },
  allDonations: { bn: "সকল দান লেনদেন", en: "All donation transactions" },
  expenseRecords: { bn: "খরচ রেকর্ড", en: "Expense Records" },
  allExpenses: { bn: "সকল খরচের হিসাব", en: "All expense records" },
  salaryRecords: { bn: "বেতন রেকর্ড", en: "Salary Records" },
  allSalaries: { bn: "সকল বেতনের তথ্য", en: "All salary information" },

  // Notifications
  newAdmission: { bn: "নতুন ভর্তি আবেদন", en: "New Admission Application" },
  newAdmissionDesc: { bn: "নতুন ছাত্র ভর্তি হলে", en: "When new student is admitted" },
  newDonation: { bn: "নতুন দান", en: "New Donation" },
  newDonationDesc: { bn: "কেউ দান করলে", en: "When someone donates" },
  feeDue: { bn: "ফি বকেয়া", en: "Fee Due" },
  feeDueDesc: { bn: "ফি বকেয়া হলে", en: "When fee is due" },
  emailNotifications: { bn: "ইমেইল নোটিফিকেশন", en: "Email Notifications" },
  emailNotificationsDesc: { bn: "ইমেইলে নোটিফিকেশন পাঠানো হবে", en: "Notifications will be sent via email" },

  // Security
  securitySettings: { bn: "নিরাপত্তা সেটিংস", en: "Security Settings" },
  securitySettingsDesc: { bn: "অ্যাকাউন্ট নিরাপত্তা পরিচালনা করুন", en: "Manage account security" },
  changePassword: { bn: "পাসওয়ার্ড পরিবর্তন", en: "Change Password" },
  currentPassword: { bn: "বর্তমান পাসওয়ার্ড", en: "Current Password" },
  newPassword: { bn: "নতুন পাসওয়ার্ড", en: "New Password" },
  confirmPassword: { bn: "পাসওয়ার্ড নিশ্চিত করুন", en: "Confirm Password" },
  changeEmail: { bn: "ইমেইল পরিবর্তন", en: "Change Email" },
  newEmail: { bn: "নতুন ইমেইল", en: "New Email" },
  password: { bn: "পাসওয়ার্ড", en: "Password" },
  twoFactorAuth: { bn: "টু-ফ্যাক্টর অথেনটিকেশন", en: "Two-Factor Authentication" },
  twoFactorAuthDesc: { bn: "অতিরিক্ত সুরক্ষার জন্য", en: "For extra security" },
  sessionTimeout: { bn: "সেশন টাইমআউট", en: "Session Timeout" },
  sessionTimeoutDesc: { bn: "৩০ মিনিট নিষ্ক্রিয়তায় লগআউট", en: "Logout after 30 minutes of inactivity" },

  // Dashboard
  totalStudents: { bn: "মোট ছাত্র", en: "Total Students" },
  totalTeachers: { bn: "মোট শিক্ষক", en: "Total Teachers" },
  totalClasses: { bn: "মোট ক্লাস", en: "Total Classes" },
  monthlyIncome: { bn: "মাসিক আয়", en: "Monthly Income" },
  monthlyExpense: { bn: "মাসিক খরচ", en: "Monthly Expense" },
  pendingFees: { bn: "বকেয়া ফি", en: "Pending Fees" },
  recentActivities: { bn: "সাম্প্রতিক কার্যক্রম", en: "Recent Activities" },

  // Common Labels
  name: { bn: "নাম", en: "Name" },
  email: { bn: "ইমেইল", en: "Email" },
  phone: { bn: "ফোন", en: "Phone" },
  address: { bn: "ঠিকানা", en: "Address" },
  date: { bn: "তারিখ", en: "Date" },
  status: { bn: "স্ট্যাটাস", en: "Status" },
  amount: { bn: "পরিমাণ", en: "Amount" },
  actions: { bn: "অ্যাকশন", en: "Actions" },
  total: { bn: "মোট", en: "Total" },
  admin: { bn: "অ্যাডমিন", en: "Admin" },
  guest: { bn: "গেস্ট", en: "Guest" },
  loggedIn: { bn: "লগইনকৃত", en: "Logged in" },
  loginPrompt: { bn: "লগইন করুন", en: "Login" },

  // Messages
  loading: { bn: "লোড হচ্ছে...", en: "Loading..." },
  noData: { bn: "কোনো ডাটা নেই", en: "No data found" },
  error: { bn: "সমস্যা হয়েছে", en: "An error occurred" },
  success: { bn: "সফল", en: "Success" },
  warning: { bn: "সতর্কতা", en: "Warning" },
  info: { bn: "তথ্য", en: "Information" },
  pleaseWait: { bn: "অনুগ্রহ করে অপেক্ষা করুন", en: "Please wait" },
  
  // Homepage
  homeReturn: { bn: "হোমে ফিরুন", en: "Return Home" },
  madrasa: { bn: "মাদ্রাসা", en: "Madrasa" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [language, setLanguageState] = useState<Language>("bn");

  // Fetch language setting from database
  const { data: institutionSettings, isLoading } = useQuery({
    queryKey: ["institution-language"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institution_settings")
        .select("system_language")
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Update language state when data is fetched
  useEffect(() => {
    if (institutionSettings?.system_language) {
      setLanguageState(institutionSettings.system_language as Language);
    }
  }, [institutionSettings]);

  // Mutation to update language
  const updateLanguageMutation = useMutation({
    mutationFn: async (newLanguage: Language) => {
      const { data: existing } = await supabase
        .from("institution_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase
          .from("institution_settings")
          .update({ system_language: newLanguage })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("institution_settings")
          .insert({ system_language: newLanguage });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution-language"] });
    },
  });

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await updateLanguageMutation.mutateAsync(lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
