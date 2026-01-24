-- =============================================
-- আল জামিয়াতুল আরাবিয়া শাসন সিংগাতি মাদরাসা
-- Complete SaaS Database Schema
-- =============================================

-- 1. User Roles Enum and Table (Security First)
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'accountant', 'teacher', 'staff');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security Definer Function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user has any admin-level role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin')
  )
$$;

-- 2. User Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Institution Settings Table
CREATE TABLE public.institution_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'আল জামিয়াতুল আরাবিয়া শাসন সিংগাতি মাদরাসা',
    name_english TEXT DEFAULT 'Al Jamiyatul Arabia Shashon Singati Madrasa',
    established_year INTEGER DEFAULT 1990,
    registration_number TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    principal_name TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;

-- 4. Payment Gateways Configuration
CREATE TYPE public.payment_gateway_type AS ENUM ('bkash', 'nagad', 'rocket', 'sslcommerz', 'amarpay', 'upay', 'manual');

CREATE TABLE public.payment_gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_type payment_gateway_type NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    merchant_id TEXT,
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    sandbox_mode BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    additional_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- 5. Classes Table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_arabic TEXT,
    department TEXT NOT NULL DEFAULT 'kitab', -- hifz, kitab, nazera
    class_teacher_id UUID,
    monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    admission_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- 6. Students Table
CREATE TYPE public.student_status AS ENUM ('active', 'inactive', 'graduated', 'transferred', 'lillah');

CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL UNIQUE, -- Custom ID like "STU-2024-001"
    full_name TEXT NOT NULL,
    full_name_arabic TEXT,
    father_name TEXT NOT NULL,
    mother_name TEXT,
    guardian_name TEXT,
    guardian_phone TEXT NOT NULL,
    guardian_relation TEXT,
    date_of_birth DATE,
    address TEXT,
    village TEXT,
    post_office TEXT,
    upazila TEXT,
    district TEXT,
    class_id UUID REFERENCES public.classes(id),
    status student_status NOT NULL DEFAULT 'active',
    is_orphan BOOLEAN DEFAULT false,
    is_lillah BOOLEAN DEFAULT false,
    lillah_reason TEXT,
    sponsor_id UUID,
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    photo_url TEXT,
    blood_group TEXT,
    previous_institution TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 7. Teachers Table
CREATE TYPE public.teacher_status AS ENUM ('active', 'inactive', 'on_leave', 'resigned');

CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    full_name_arabic TEXT,
    father_name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    qualification TEXT,
    specialization TEXT,
    date_of_birth DATE,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    monthly_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
    status teacher_status NOT NULL DEFAULT 'active',
    photo_url TEXT,
    nid_number TEXT,
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_name TEXT,
    mobile_banking_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- 8. Sponsors Table (For Lillah/Orphan Support)
CREATE TABLE public.sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    country TEXT DEFAULT 'বাংলাদেশ',
    total_donated DECIMAL(12,2) DEFAULT 0,
    students_sponsored INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- 9. Donation Categories
CREATE TYPE public.donation_category AS ENUM ('lillah_boarding', 'orphan_support', 'madrasa_development', 'general', 'zakat', 'sadaqah', 'fitra');

CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id TEXT NOT NULL UNIQUE, -- DON-2024-001
    donor_name TEXT NOT NULL,
    donor_phone TEXT,
    donor_email TEXT,
    donor_address TEXT,
    amount DECIMAL(12,2) NOT NULL,
    category donation_category NOT NULL DEFAULT 'general',
    payment_gateway payment_gateway_type,
    payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
    transaction_id TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    sponsor_id UUID REFERENCES public.sponsors(id),
    student_id UUID REFERENCES public.students(id), -- If donating for specific student
    notes TEXT,
    receipt_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- 10. Fee Types
CREATE TABLE public.fee_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    default_amount DECIMAL(10,2) DEFAULT 0,
    is_monthly BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fee_types ENABLE ROW LEVEL SECURITY;

-- 11. Student Fees
CREATE TYPE public.fee_status AS ENUM ('pending', 'partial', 'paid', 'waived', 'overdue');

CREATE TABLE public.student_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_id TEXT NOT NULL UNIQUE, -- FEE-2024-001
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    fee_type_id UUID REFERENCES public.fee_types(id),
    amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    due_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount - discount - paid_amount) STORED,
    month INTEGER, -- 1-12
    year INTEGER NOT NULL,
    due_date DATE,
    status fee_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;

-- 12. Payment Transactions
CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id TEXT NOT NULL UNIQUE, -- TXN-2024-001
    payment_type TEXT NOT NULL, -- fee, donation, salary, expense
    reference_id UUID, -- ID of fee, donation, etc.
    amount DECIMAL(12,2) NOT NULL,
    payment_gateway payment_gateway_type,
    gateway_transaction_id TEXT,
    payer_name TEXT,
    payer_phone TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    verified_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- 13. Expense Categories
CREATE TABLE public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- 14. Expenses
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id TEXT NOT NULL UNIQUE, -- EXP-2024-001
    category_id UUID REFERENCES public.expense_categories(id),
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT, -- cash, bank, mobile
    receipt_url TEXT,
    approved_by UUID,
    recorded_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 15. Teacher Salaries
CREATE TYPE public.salary_status AS ENUM ('pending', 'paid', 'partial', 'hold');

CREATE TABLE public.teacher_salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salary_id TEXT NOT NULL UNIQUE, -- SAL-2024-001
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    bonus DECIMAL(10,2) DEFAULT 0,
    deduction DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) GENERATED ALWAYS AS (base_salary + bonus - deduction) STORED,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status salary_status NOT NULL DEFAULT 'pending',
    payment_date DATE,
    payment_method TEXT,
    paid_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(teacher_id, month, year)
);

ALTER TABLE public.teacher_salaries ENABLE ROW LEVEL SECURITY;

-- 16. Attendance (Students)
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'leave', 'holiday');

CREATE TABLE public.student_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id),
    date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    marked_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(student_id, date)
);

ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;

-- 17. Teacher Attendance
CREATE TABLE public.teacher_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    check_in TIME,
    check_out TIME,
    marked_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(teacher_id, date)
);

ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;

-- 18. Academic Years
CREATE TABLE public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- "২০২৪-২০২৫"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

-- 19. Exams
CREATE TABLE public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    exam_type TEXT NOT NULL, -- monthly, quarterly, half_yearly, annual
    academic_year_id UUID REFERENCES public.academic_years(id),
    start_date DATE,
    end_date DATE,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- 20. Exam Results
CREATE TABLE public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    full_marks INTEGER NOT NULL DEFAULT 100,
    obtained_marks INTEGER NOT NULL DEFAULT 0,
    grade TEXT,
    remarks TEXT,
    entered_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(exam_id, student_id, subject)
);

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- 21. Online Classes
CREATE TABLE public.online_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    class_id UUID REFERENCES public.classes(id),
    teacher_id UUID REFERENCES public.teachers(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link TEXT,
    meeting_platform TEXT, -- zoom, google_meet, youtube_live
    is_recorded BOOLEAN DEFAULT false,
    recording_url TEXT,
    status TEXT DEFAULT 'scheduled', -- scheduled, live, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.online_classes ENABLE ROW LEVEL SECURITY;

-- 22. Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, warning, success, error
    target_type TEXT DEFAULT 'all', -- all, teachers, students, parents
    is_read BOOLEAN DEFAULT false,
    user_id UUID,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- User Roles Policies
CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Profiles Policies
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Institution Settings Policies
CREATE POLICY "Anyone can view institution settings" ON public.institution_settings
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify institution settings" ON public.institution_settings
    FOR ALL USING (public.is_admin(auth.uid()));

-- Payment Gateways Policies (Admins only)
CREATE POLICY "Anyone can view enabled gateways" ON public.payment_gateways
    FOR SELECT USING (is_enabled = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage gateways" ON public.payment_gateways
    FOR ALL USING (public.is_admin(auth.uid()));

-- Classes Policies
CREATE POLICY "Anyone can view classes" ON public.classes
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage classes" ON public.classes
    FOR ALL USING (public.is_admin(auth.uid()));

-- Students Policies
CREATE POLICY "Authenticated users can view students" ON public.students
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage students" ON public.students
    FOR ALL USING (public.is_admin(auth.uid()));

-- Teachers Policies
CREATE POLICY "Authenticated users can view teachers" ON public.teachers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage teachers" ON public.teachers
    FOR ALL USING (public.is_admin(auth.uid()));

-- Sponsors Policies
CREATE POLICY "Authenticated users can view sponsors" ON public.sponsors
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can create sponsor" ON public.sponsors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage sponsors" ON public.sponsors
    FOR ALL USING (public.is_admin(auth.uid()));

-- Donations Policies
CREATE POLICY "Anyone can create donation" ON public.donations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view donations" ON public.donations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage donations" ON public.donations
    FOR ALL USING (public.is_admin(auth.uid()));

-- Fee Types Policies
CREATE POLICY "Anyone can view fee types" ON public.fee_types
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage fee types" ON public.fee_types
    FOR ALL USING (public.is_admin(auth.uid()));

-- Student Fees Policies
CREATE POLICY "Authenticated users can view fees" ON public.student_fees
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and accountants can manage fees" ON public.student_fees
    FOR ALL USING (
        public.is_admin(auth.uid()) OR 
        public.has_role(auth.uid(), 'accountant')
    );

-- Payment Transactions Policies
CREATE POLICY "Anyone can create payment transaction" ON public.payment_transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view transactions" ON public.payment_transactions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and accountants can manage transactions" ON public.payment_transactions
    FOR ALL USING (
        public.is_admin(auth.uid()) OR 
        public.has_role(auth.uid(), 'accountant')
    );

-- Expense Categories Policies
CREATE POLICY "Anyone can view expense categories" ON public.expense_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage expense categories" ON public.expense_categories
    FOR ALL USING (public.is_admin(auth.uid()));

-- Expenses Policies
CREATE POLICY "Authenticated users can view expenses" ON public.expenses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and accountants can manage expenses" ON public.expenses
    FOR ALL USING (
        public.is_admin(auth.uid()) OR 
        public.has_role(auth.uid(), 'accountant')
    );

-- Teacher Salaries Policies
CREATE POLICY "Teachers can view own salary" ON public.teacher_salaries
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and accountants can manage salaries" ON public.teacher_salaries
    FOR ALL USING (
        public.is_admin(auth.uid()) OR 
        public.has_role(auth.uid(), 'accountant')
    );

-- Student Attendance Policies
CREATE POLICY "Authenticated users can view attendance" ON public.student_attendance
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and teachers can manage attendance" ON public.student_attendance
    FOR ALL USING (
        public.is_admin(auth.uid()) OR 
        public.has_role(auth.uid(), 'teacher')
    );

-- Teacher Attendance Policies
CREATE POLICY "Authenticated users can view teacher attendance" ON public.teacher_attendance
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage teacher attendance" ON public.teacher_attendance
    FOR ALL USING (public.is_admin(auth.uid()));

-- Academic Years Policies
CREATE POLICY "Anyone can view academic years" ON public.academic_years
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage academic years" ON public.academic_years
    FOR ALL USING (public.is_admin(auth.uid()));

-- Exams Policies
CREATE POLICY "Authenticated users can view exams" ON public.exams
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage exams" ON public.exams
    FOR ALL USING (public.is_admin(auth.uid()));

-- Exam Results Policies
CREATE POLICY "Authenticated users can view results" ON public.exam_results
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and teachers can manage results" ON public.exam_results
    FOR ALL USING (
        public.is_admin(auth.uid()) OR 
        public.has_role(auth.uid(), 'teacher')
    );

-- Online Classes Policies
CREATE POLICY "Anyone can view online classes" ON public.online_classes
    FOR SELECT USING (true);

CREATE POLICY "Admins and teachers can manage online classes" ON public.online_classes
    FOR ALL USING (
        public.is_admin(auth.uid()) OR 
        public.has_role(auth.uid(), 'teacher')
    );

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT TO authenticated USING (
        user_id IS NULL OR user_id = auth.uid()
    );

CREATE POLICY "Admins can manage notifications" ON public.notifications
    FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_teachers_updated_at
    BEFORE UPDATE ON public.teachers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_sponsors_updated_at
    BEFORE UPDATE ON public.sponsors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_institution_updated_at
    BEFORE UPDATE ON public.institution_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_payment_gateways_updated_at
    BEFORE UPDATE ON public.payment_gateways
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_student_fees_updated_at
    BEFORE UPDATE ON public.student_fees
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Insert institution settings
INSERT INTO public.institution_settings (name, name_english, established_year, address)
VALUES (
    'আল জামিয়াতুল আরাবিয়া শাসন সিংগাতি মাদরাসা',
    'Al Jamiyatul Arabia Shashon Singati Madrasa',
    1990,
    'শাসন সিংগাতি, বাংলাদেশ'
);

-- Insert default payment gateways
INSERT INTO public.payment_gateways (gateway_type, display_name, display_order, is_enabled) VALUES
    ('bkash', 'বিকাশ', 1, false),
    ('nagad', 'নগদ', 2, false),
    ('rocket', 'রকেট', 3, false),
    ('upay', 'উপায়', 4, false),
    ('sslcommerz', 'SSLCommerz', 5, false),
    ('amarpay', 'AmarPay', 6, false),
    ('manual', 'ম্যানুয়াল পেমেন্ট', 7, true);

-- Insert default fee types
INSERT INTO public.fee_types (name, description, default_amount, is_monthly) VALUES
    ('মাসিক বেতন', 'নিয়মিত মাসিক টিউশন ফি', 500, true),
    ('ভর্তি ফি', 'নতুন ভর্তির জন্য এককালীন ফি', 1000, false),
    ('পরীক্ষা ফি', 'পরীক্ষার জন্য ফি', 200, false),
    ('বই/খাতা', 'শিক্ষা উপকরণ', 500, false),
    ('ইউনিফর্ম', 'পোশাক খরচ', 1500, false);

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description) VALUES
    ('বেতন', 'শিক্ষক ও কর্মচারী বেতন'),
    ('বিদ্যুৎ', 'বিদ্যুৎ বিল'),
    ('পানি', 'পানির বিল'),
    ('রক্ষণাবেক্ষণ', 'ভবন ও আসবাবপত্র মেরামত'),
    ('শিক্ষা উপকরণ', 'বই, খাতা, চক ইত্যাদি'),
    ('অফিস সরঞ্জাম', 'অফিস খরচ'),
    ('খাবার', 'বোর্ডিং খাবার খরচ'),
    ('যাতায়াত', 'পরিবহন খরচ'),
    ('অন্যান্য', 'বিবিধ খরচ');

-- Insert default classes
INSERT INTO public.classes (name, name_arabic, department, monthly_fee, admission_fee) VALUES
    ('নাযেরা - ১ম বর্ষ', 'الناظرة - السنة الأولى', 'nazera', 400, 800),
    ('নাযেরা - ২য় বর্ষ', 'الناظرة - السنة الثانية', 'nazera', 400, 800),
    ('হিফজ - ১ম বর্ষ', 'الحفظ - السنة الأولى', 'hifz', 500, 1000),
    ('হিফজ - ২য় বর্ষ', 'الحفظ - السنة الثانية', 'hifz', 500, 1000),
    ('হিফজ - ৩য় বর্ষ', 'الحفظ - السنة الثالثة', 'hifz', 500, 1000),
    ('কিতাব - ১ম বর্ষ', 'الكتاب - السنة الأولى', 'kitab', 600, 1200),
    ('কিতাব - ২য় বর্ষ', 'الكتاب - السنة الثانية', 'kitab', 600, 1200),
    ('কিতাব - ৩য় বর্ষ', 'الكتاب - السنة الثالثة', 'kitab', 600, 1200),
    ('কিতাব - ৪র্থ বর্ষ', 'الكتاب - السنة الرابعة', 'kitab', 700, 1200),
    ('কিতাব - ৫ম বর্ষ', 'الكتاب - السنة الخامسة', 'kitab', 700, 1200),
    ('দাওরায়ে হাদীস', 'الدورة الحديث', 'kitab', 800, 1500);