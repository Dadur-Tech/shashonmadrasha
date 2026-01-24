-- Notable Alumni table (সফল প্রাক্তন ছাত্র)
CREATE TABLE public.notable_alumni (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    full_name_arabic TEXT,
    photo_url TEXT,
    graduation_year INTEGER,
    current_position TEXT NOT NULL,
    current_institution TEXT,
    location TEXT,
    achievement TEXT,
    phone TEXT,
    email TEXT,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notable_alumni ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active alumni"
ON public.notable_alumni FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage alumni"
ON public.notable_alumni FOR ALL
USING (is_admin(auth.uid()));

-- Jamiyat Categories
CREATE TABLE public.jamiyat_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_arabic TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jamiyat_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
ON public.jamiyat_categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.jamiyat_categories FOR ALL
USING (is_admin(auth.uid()));

-- Insert default categories
INSERT INTO public.jamiyat_categories (name, name_arabic, icon, display_order) VALUES
('গজল', 'نشيد', '🎤', 1),
('কিরাত', 'قراءة', '📖', 2),
('ওয়াজ', 'وعظ', '🎙️', 3),
('বয়ান ও তাফসীর', 'بيان و تفسير', '📚', 4),
('হামদ ও নাত', 'حمد و نعت', '🌙', 5);

-- Weekly Jamiyat Schedule
CREATE TABLE public.weekly_jamiyat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start_date DATE NOT NULL,
    category_id UUID REFERENCES public.jamiyat_categories(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(week_start_date, category_id, student_id)
);

-- Enable RLS
ALTER TABLE public.weekly_jamiyat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active schedules"
ON public.weekly_jamiyat FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage schedules"
ON public.weekly_jamiyat FOR ALL
USING (is_admin(auth.uid()));

-- Jamiyat settings (for on/off toggle)
CREATE TABLE public.jamiyat_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_enabled BOOLEAN DEFAULT true,
    auto_disable_days INTEGER DEFAULT 7,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by UUID
);

-- Enable RLS
ALTER TABLE public.jamiyat_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
ON public.jamiyat_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.jamiyat_settings FOR ALL
USING (is_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.jamiyat_settings (is_enabled, auto_disable_days) VALUES (true, 7);

-- Add triggers for updated_at
CREATE TRIGGER update_notable_alumni_updated_at
BEFORE UPDATE ON public.notable_alumni
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_weekly_jamiyat_updated_at
BEFORE UPDATE ON public.weekly_jamiyat
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();