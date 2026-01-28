-- ==========================================
-- 1. LIBRARY MANAGEMENT SYSTEM
-- ==========================================

-- Books/Kitab Categories
CREATE TABLE public.book_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_arabic TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Books/Kitab Table
CREATE TABLE public.books (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    title_arabic TEXT,
    author TEXT,
    author_arabic TEXT,
    publisher TEXT,
    category_id UUID REFERENCES public.book_categories(id),
    isbn TEXT,
    edition TEXT,
    language TEXT DEFAULT 'বাংলা',
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    shelf_location TEXT,
    cover_image_url TEXT,
    description TEXT,
    is_reference_only BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Book Issues/Borrowing
CREATE TABLE public.book_issues (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    issue_id TEXT NOT NULL UNIQUE,
    book_id UUID NOT NULL REFERENCES public.books(id),
    borrower_type TEXT NOT NULL DEFAULT 'student', -- student, teacher
    student_id UUID REFERENCES public.students(id),
    teacher_id UUID REFERENCES public.teachers(id),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status TEXT NOT NULL DEFAULT 'issued', -- issued, returned, overdue, lost
    fine_amount NUMERIC DEFAULT 0,
    fine_paid BOOLEAN DEFAULT false,
    issued_by UUID,
    returned_to UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 2. HOSTEL/DORMITORY MANAGEMENT
-- ==========================================

-- Hostel Buildings
CREATE TABLE public.hostel_buildings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_arabic TEXT,
    description TEXT,
    total_rooms INTEGER DEFAULT 0,
    warden_id UUID REFERENCES public.teachers(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Hostel Rooms
CREATE TABLE public.hostel_rooms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_number TEXT NOT NULL,
    building_id UUID NOT NULL REFERENCES public.hostel_buildings(id),
    floor_number INTEGER DEFAULT 0,
    room_type TEXT DEFAULT 'dormitory', -- dormitory, single, double
    capacity INTEGER NOT NULL DEFAULT 4,
    current_occupancy INTEGER DEFAULT 0,
    monthly_rent NUMERIC DEFAULT 0,
    amenities TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Room Allocations
CREATE TABLE public.room_allocations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.hostel_rooms(id),
    student_id UUID NOT NULL REFERENCES public.students(id),
    bed_number INTEGER,
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active', -- active, vacated, transferred
    notes TEXT,
    allocated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. CERTIFICATE TEMPLATES
-- ==========================================

CREATE TABLE public.certificate_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    template_type TEXT NOT NULL, -- completion, character, attendance, merit
    content_template TEXT NOT NULL,
    header_text TEXT,
    footer_text TEXT,
    background_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Issued Certificates
CREATE TABLE public.issued_certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_number TEXT NOT NULL UNIQUE,
    template_id UUID REFERENCES public.certificate_templates(id),
    student_id UUID NOT NULL REFERENCES public.students(id),
    certificate_type TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    issued_by UUID,
    remarks TEXT,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 4. ACADEMIC CALENDAR
-- ==========================================

CREATE TABLE public.academic_calendar (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    title_arabic TEXT,
    event_type TEXT NOT NULL DEFAULT 'holiday', -- holiday, exam, event, class
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    is_holiday BOOLEAN DEFAULT false,
    affects_all_classes BOOLEAN DEFAULT true,
    specific_class_ids UUID[],
    created_by UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 5. SYLLABUS MANAGEMENT
-- ==========================================

CREATE TABLE public.subjects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_arabic TEXT,
    code TEXT,
    department TEXT DEFAULT 'kitab',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.class_subjects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES public.classes(id),
    subject_id UUID NOT NULL REFERENCES public.subjects(id),
    teacher_id UUID REFERENCES public.teachers(id),
    syllabus_content TEXT,
    books_required TEXT[],
    weekly_periods INTEGER DEFAULT 1,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(class_id, subject_id)
);

-- ==========================================
-- 6. LEAVE MANAGEMENT
-- ==========================================

CREATE TABLE public.leave_types (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    max_days_per_year INTEGER DEFAULT 10,
    is_paid BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.leave_applications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    applicant_type TEXT NOT NULL DEFAULT 'teacher', -- teacher, staff
    teacher_id UUID REFERENCES public.teachers(id),
    leave_type_id UUID REFERENCES public.leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 7. DAILY ROUTINE/SCHEDULE
-- ==========================================

CREATE TABLE public.class_schedule (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES public.classes(id),
    subject_id UUID REFERENCES public.subjects(id),
    teacher_id UUID REFERENCES public.teachers(id),
    day_of_week INTEGER NOT NULL, -- 0=Saturday, 6=Friday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- ENABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedule ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Book Categories
CREATE POLICY "Anyone can view book categories" ON public.book_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage book categories" ON public.book_categories FOR ALL USING (is_admin(auth.uid()));

-- Books
CREATE POLICY "Anyone can view books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Admins can manage books" ON public.books FOR ALL USING (is_admin(auth.uid()));

-- Book Issues
CREATE POLICY "Authenticated can view book issues" ON public.book_issues FOR SELECT USING (true);
CREATE POLICY "Admins can manage book issues" ON public.book_issues FOR ALL USING (is_admin(auth.uid()));

-- Hostel Buildings
CREATE POLICY "Anyone can view hostel buildings" ON public.hostel_buildings FOR SELECT USING (true);
CREATE POLICY "Admins can manage hostel buildings" ON public.hostel_buildings FOR ALL USING (is_admin(auth.uid()));

-- Hostel Rooms
CREATE POLICY "Anyone can view hostel rooms" ON public.hostel_rooms FOR SELECT USING (true);
CREATE POLICY "Admins can manage hostel rooms" ON public.hostel_rooms FOR ALL USING (is_admin(auth.uid()));

-- Room Allocations
CREATE POLICY "Authenticated can view room allocations" ON public.room_allocations FOR SELECT USING (true);
CREATE POLICY "Admins can manage room allocations" ON public.room_allocations FOR ALL USING (is_admin(auth.uid()));

-- Certificate Templates
CREATE POLICY "Authenticated can view templates" ON public.certificate_templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage templates" ON public.certificate_templates FOR ALL USING (is_admin(auth.uid()));

-- Issued Certificates
CREATE POLICY "Authenticated can view issued certificates" ON public.issued_certificates FOR SELECT USING (true);
CREATE POLICY "Admins can manage issued certificates" ON public.issued_certificates FOR ALL USING (is_admin(auth.uid()));

-- Academic Calendar
CREATE POLICY "Anyone can view academic calendar" ON public.academic_calendar FOR SELECT USING (true);
CREATE POLICY "Admins can manage academic calendar" ON public.academic_calendar FOR ALL USING (is_admin(auth.uid()));

-- Subjects
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL USING (is_admin(auth.uid()));

-- Class Subjects
CREATE POLICY "Anyone can view class subjects" ON public.class_subjects FOR SELECT USING (true);
CREATE POLICY "Admins can manage class subjects" ON public.class_subjects FOR ALL USING (is_admin(auth.uid()));

-- Leave Types
CREATE POLICY "Anyone can view leave types" ON public.leave_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage leave types" ON public.leave_types FOR ALL USING (is_admin(auth.uid()));

-- Leave Applications
CREATE POLICY "Authenticated can view leave applications" ON public.leave_applications FOR SELECT USING (true);
CREATE POLICY "Admins can manage leave applications" ON public.leave_applications FOR ALL USING (is_admin(auth.uid()));

-- Class Schedule
CREATE POLICY "Anyone can view class schedule" ON public.class_schedule FOR SELECT USING (true);
CREATE POLICY "Admins can manage class schedule" ON public.class_schedule FOR ALL USING (is_admin(auth.uid()));

-- ==========================================
-- TRIGGERS FOR updated_at
-- ==========================================

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certificate_templates_updated_at BEFORE UPDATE ON public.certificate_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();