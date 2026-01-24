-- Create teacher_titles table for managing teacher specializations
CREATE TABLE public.teacher_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_arabic TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create departments table for managing departments
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_bengali TEXT NOT NULL,
  name_arabic TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add title_id to teachers table
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS title_id UUID REFERENCES public.teacher_titles(id);
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add photo_url to students table if not exists
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Enable RLS on new tables
ALTER TABLE public.teacher_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policies for teacher_titles (public read, admin write)
CREATE POLICY "Anyone can view teacher titles" 
ON public.teacher_titles 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage teacher titles" 
ON public.teacher_titles 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create policies for departments (public read, admin write)
CREATE POLICY "Anyone can view departments" 
ON public.departments 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage departments" 
ON public.departments 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Insert default teacher titles
INSERT INTO public.teacher_titles (name, name_arabic, description, display_order) VALUES
('মুফতী', 'مفتي', 'ইসলামী আইন বিশেষজ্ঞ', 1),
('মুহাদ্দিস', 'محدث', 'হাদীস বিশেষজ্ঞ', 2),
('মাওলানা', 'مولانا', 'ইসলামী শিক্ষক', 3),
('ক্বারী', 'قاري', 'কুরআন তিলাওয়াত বিশেষজ্ঞ', 4),
('হাফেজ', 'حافظ', 'কুরআন হাফেজ', 5),
('উস্তাদ', 'أستاذ', 'সাধারণ শিক্ষক', 6);

-- Insert default departments
INSERT INTO public.departments (name, name_bengali, name_arabic, display_order) VALUES
('hifz', 'হিফজ বিভাগ', 'قسم الحفظ', 1),
('kitab', 'কিতাব বিভাগ', 'قسم الكتب', 2),
('nurani', 'নূরানী বিভাগ', 'قسم النوراني', 3),
('najera', 'নাজেরা বিভাগ', 'قسم الناظرة', 4),
('ifta', 'ইফতা বিভাগ', 'قسم الإفتاء', 5),
('takhassos', 'তাখাস্সুস বিভাগ', 'قسم التخصص', 6);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for photos bucket
CREATE POLICY "Anyone can view photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Add triggers for updated_at
CREATE TRIGGER update_teacher_titles_updated_at
BEFORE UPDATE ON public.teacher_titles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();