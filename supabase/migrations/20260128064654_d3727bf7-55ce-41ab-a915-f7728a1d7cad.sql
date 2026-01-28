-- Create permissions table to store available permissions
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_bengali text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for permissions table
CREATE POLICY "Anyone can view permissions" ON public.permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage permissions" ON public.permissions
  FOR ALL USING (is_admin(auth.uid()));

-- RLS policies for role_permissions table
CREATE POLICY "Anyone can view role permissions" ON public.role_permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (is_admin(auth.uid()));

-- Insert default permissions
INSERT INTO public.permissions (name, name_bengali, description, category) VALUES
-- Student Management
('students.view', 'শিক্ষার্থী দেখা', 'শিক্ষার্থীদের তালিকা দেখতে পারবে', 'students'),
('students.create', 'শিক্ষার্থী যোগ', 'নতুন শিক্ষার্থী যোগ করতে পারবে', 'students'),
('students.edit', 'শিক্ষার্থী সম্পাদনা', 'শিক্ষার্থীর তথ্য সম্পাদনা করতে পারবে', 'students'),
('students.delete', 'শিক্ষার্থী মুছুন', 'শিক্ষার্থী মুছে ফেলতে পারবে', 'students'),

-- Teacher Management
('teachers.view', 'শিক্ষক দেখা', 'শিক্ষকদের তালিকা দেখতে পারবে', 'teachers'),
('teachers.create', 'শিক্ষক যোগ', 'নতুন শিক্ষক যোগ করতে পারবে', 'teachers'),
('teachers.edit', 'শিক্ষক সম্পাদনা', 'শিক্ষকের তথ্য সম্পাদনা করতে পারবে', 'teachers'),
('teachers.delete', 'শিক্ষক মুছুন', 'শিক্ষক মুছে ফেলতে পারবে', 'teachers'),

-- Fee Management
('fees.view', 'ফি দেখা', 'ফি তালিকা দেখতে পারবে', 'fees'),
('fees.create', 'ফি যোগ', 'নতুন ফি যোগ করতে পারবে', 'fees'),
('fees.edit', 'ফি সম্পাদনা', 'ফি সম্পাদনা করতে পারবে', 'fees'),
('fees.collect', 'ফি সংগ্রহ', 'ফি সংগ্রহ করতে পারবে', 'fees'),

-- Salary Management
('salaries.view', 'বেতন দেখা', 'বেতন তালিকা দেখতে পারবে', 'salaries'),
('salaries.create', 'বেতন যোগ', 'নতুন বেতন এন্ট্রি যোগ করতে পারবে', 'salaries'),
('salaries.pay', 'বেতন প্রদান', 'বেতন প্রদান করতে পারবে', 'salaries'),

-- Expense Management
('expenses.view', 'খরচ দেখা', 'খরচ তালিকা দেখতে পারবে', 'expenses'),
('expenses.create', 'খরচ যোগ', 'নতুন খরচ যোগ করতে পারবে', 'expenses'),
('expenses.edit', 'খরচ সম্পাদনা', 'খরচ সম্পাদনা করতে পারবে', 'expenses'),
('expenses.delete', 'খরচ মুছুন', 'খরচ মুছে ফেলতে পারবে', 'expenses'),

-- Donation Management
('donations.view', 'দান দেখা', 'দান তালিকা দেখতে পারবে', 'donations'),
('donations.create', 'দান যোগ', 'নতুন দান রেকর্ড যোগ করতে পারবে', 'donations'),
('donations.edit', 'দান সম্পাদনা', 'দান সম্পাদনা করতে পারবে', 'donations'),

-- Attendance Management
('attendance.view', 'হাজিরা দেখা', 'হাজিরা দেখতে পারবে', 'attendance'),
('attendance.mark', 'হাজিরা দেওয়া', 'হাজিরা দিতে পারবে', 'attendance'),

-- Exam & Results
('exams.view', 'পরীক্ষা দেখা', 'পরীক্ষা তালিকা দেখতে পারবে', 'exams'),
('exams.create', 'পরীক্ষা যোগ', 'নতুন পরীক্ষা তৈরি করতে পারবে', 'exams'),
('results.view', 'ফলাফল দেখা', 'ফলাফল দেখতে পারবে', 'exams'),
('results.enter', 'ফলাফল এন্ট্রি', 'ফলাফল এন্ট্রি করতে পারবে', 'exams'),

-- Reports
('reports.view', 'রিপোর্ট দেখা', 'রিপোর্ট দেখতে পারবে', 'reports'),
('reports.download', 'রিপোর্ট ডাউনলোড', 'রিপোর্ট ডাউনলোড করতে পারবে', 'reports'),

-- Settings
('settings.view', 'সেটিংস দেখা', 'সেটিংস দেখতে পারবে', 'settings'),
('settings.edit', 'সেটিংস সম্পাদনা', 'সেটিংস পরিবর্তন করতে পারবে', 'settings'),

-- User Management
('users.view', 'ইউজার দেখা', 'ইউজারদের তালিকা দেখতে পারবে', 'users'),
('users.create', 'ইউজার তৈরি', 'নতুন ইউজার তৈরি করতে পারবে', 'users'),
('users.roles', 'রোল পরিবর্তন', 'ইউজারদের রোল পরিবর্তন করতে পারবে', 'users');

-- Insert default role permissions (super_admin and admin get all)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin'::app_role, id FROM public.permissions;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::app_role, id FROM public.permissions;

-- Accountant permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'accountant'::app_role, id FROM public.permissions 
WHERE name IN (
  'students.view', 
  'fees.view', 'fees.create', 'fees.edit', 'fees.collect',
  'salaries.view', 'salaries.create', 'salaries.pay',
  'expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete',
  'donations.view', 'donations.create', 'donations.edit',
  'reports.view', 'reports.download'
);

-- Teacher permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'teacher'::app_role, id FROM public.permissions 
WHERE name IN (
  'students.view',
  'attendance.view', 'attendance.mark',
  'exams.view', 'exams.create',
  'results.view', 'results.enter'
);

-- Staff permissions (minimal)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'staff'::app_role, id FROM public.permissions 
WHERE name IN (
  'students.view',
  'attendance.view'
);