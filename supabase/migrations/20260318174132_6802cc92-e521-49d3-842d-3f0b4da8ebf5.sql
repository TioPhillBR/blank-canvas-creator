
-- Add new roles to the enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'parceiro';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'user';

-- Create resumes table
CREATE TABLE public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  position_interest text NOT NULL,
  experience text,
  education text,
  skills text,
  resume_url text,
  additional_notes text,
  wristband_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Users can insert their own resumes
CREATE POLICY "Users can insert own resumes" ON public.resumes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view their own resumes
CREATE POLICY "Users can view own resumes" ON public.resumes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can view all resumes
CREATE POLICY "Admins can view all resumes" ON public.resumes
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Admins can delete resumes
CREATE POLICY "Admins can delete resumes" ON public.resumes
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
